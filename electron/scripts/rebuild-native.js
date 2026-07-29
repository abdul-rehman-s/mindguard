/**
 * Native module compatibility check for MindGuard Electron.
 * 
 * Ensures active-win and better-sqlite3 have working binaries
 * for the Electron runtime. Uses pre-built N-API binaries when
 * available (they're ABI-stable across Node.js and Electron).
 * 
 * WHY THIS EXISTS: @electron/rebuild (used by electron-builder
 * install-app-deps) forks a worker process that uses
 * process.on('message') IPC. In the git-bash/MSYS2 shell
 * environment (used by Hermes terminal), this IPC pattern
 * hangs indefinitely. This script calls node-gyp directly,
 * bypassing the fork.
 * 
 * WHY NOT JUST UPGRADE: @electron/rebuild v3.x and v4.x both
 * use the same IPC fork pattern. The version of node-gyp
 * doesn't matter for the hang — node-gyp >= 12.4.0 already
 * supports VS 2026 (version 18). We pin node-gyp to 13.0.1
 * via npm overrides, which is a permanent npm-native solution.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_DIR = path.resolve(__dirname, '..');
const ELECTRON_VERSION = '33.4.11';
const ELECTRON_ARCH = process.arch || 'x64';

/**
 * Check if a native module has a working .node binary
 * by probing whether the module can be required.
 */
function hasWorkingBinary(modPath, modName) {
  try {
    // Quick path check: look for .node files in expected locations
    const searchPaths = [
      path.join(modPath, 'build', 'Release'),
      path.join(modPath, 'build', 'Debug'),
      path.join(modPath, 'lib', 'binding'),
      path.join(modPath, 'prebuilds'),
    ];
    
    for (const dir of searchPaths) {
      if (!fs.existsSync(dir)) continue;
      const files = findNodeFiles(dir);
      if (files.length > 0) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

function findNodeFiles(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findNodeFiles(fullPath));
      } else if (entry.name.endsWith('.node')) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

/**
 * Check if a module uses N-API (which is ABI-stable).
 */
function usesNapi(modPath) {
  const pkgPath = path.join(modPath, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.binary && pkg.binary.napi_versions) return true;
    if (pkg.dependencies && pkg.dependencies['node-addon-api']) return true;
  } catch {}
  
  // Check binding.gyp for NAPI dependencies
  const bindingPath = path.join(modPath, 'binding.gyp');
  if (fs.existsSync(bindingPath)) {
    const content = fs.readFileSync(bindingPath, 'utf8');
    if (content.includes('node-addon-api') || content.includes('NAPI_VERSION')) return true;
  }
  
  return false;
}

function findNativeModules() {
  const nodeModules = path.join(PROJECT_DIR, 'node_modules');
  if (!fs.existsSync(nodeModules)) return [];
  
  // Known native modules in this project
  const knownNative = ['active-win', 'better-sqlite3'];
  const modules = [];
  
  for (const name of knownNative) {
    const modPath = path.join(nodeModules, name);
    if (!fs.existsSync(modPath)) continue;
    if (!fs.existsSync(path.join(modPath, 'binding.gyp'))) continue;
    
    modules.push({ name, path: modPath });
  }
  
  return modules;
}

function rebuildModule(mod) {
  const { name, path: modPath } = mod;
  const isNapi = usesNapi(modPath);
  const hasBinary = hasWorkingBinary(modPath, name);
  
  console.log(`\n  • checking  moduleName=${name} arch=${ELECTRON_ARCH}`);
  
  if (hasBinary) {
    console.log(`    ✓ pre-built binary found (N-API: ${isNapi})`);
    if (isNapi) {
      console.log(`    ✓ N-API binary is ABI-stable; skip rebuild`);
      return true;
    }
    // Non-N-API module: need to rebuild for Electron
    console.log(`    ⚠ non-N-API module; rebuilding for Electron...`);
  } else {
    console.log(`    ⚠ no pre-built binary found`);
  }

  const nodeGypBin = path.join(PROJECT_DIR, 'node_modules', 'node-gyp', 'bin', 'node-gyp.js');
  if (!fs.existsSync(nodeGypBin)) {
    console.error(`  ✘ node-gyp not found in node_modules`);
    return false;
  }

  const ngVersion = require(path.join(PROJECT_DIR, 'node_modules', 'node-gyp', 'package.json')).version;
  console.log(`    node-gyp@${ngVersion}`);

  // Run node-gyp rebuild for Electron (without --build-from-source 
  // so it uses pre-built download when available)
  const args = [
    'rebuild',
    `--runtime=electron`,
    `--target=${ELECTRON_VERSION}`,
    `--arch=${ELECTRON_ARCH}`,
    `--dist-url=https://www.electronjs.org/headers`,
  ];

  // Add binary config for node-pre-gyp style modules
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(modPath, 'package.json'), 'utf8'));
    const binary = pkg.binary;
    if (binary) {
      const moduleName = binary.module_name || name;
      let modulePathTmpl = binary.module_path || '';
      
      // Resolve N-API version placeholders
      const napiVersions = binary.napi_versions || [6];
      modulePathTmpl = modulePathTmpl
        .replace('{napi_build_version}', napiVersions[0].toString())
        .replace('{platform}', process.platform)
        .replace('{libc}', 'unknown')
        .replace('{arch}', ELECTRON_ARCH);
      
      const resolvedModulePath = path.resolve(modPath, modulePathTmpl);
      
      args.push(`--module_name=${moduleName}`);
      args.push(`--module_path=${resolvedModulePath}`);
    }
  } catch {}

  // Download Electron headers if needed
  try {
    execSync(
      `node "${nodeGypBin}" install --runtime=electron --target=${ELECTRON_VERSION} --dist-url=https://www.electronjs.org/headers`,
      { cwd: modPath, stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 }
    );
  } catch (e) {
    console.error(`    ⚠ header download issue (non-fatal)`);
  }

  // Run node-gyp rebuild
  try {
    const cmd = `node "${nodeGypBin}" ${args.join(' ')}`;
    execSync(cmd, {
      cwd: modPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 300000,
      maxBuffer: 10 * 1024 * 1024,
    });
    
    // Verify output
    let foundNodeFile = false;
    const searchPaths = [
      path.join(modPath, 'build', 'Release'),
      path.join(modPath, 'build', 'Debug'),
    ];
    for (const dir of searchPaths) {
      if (!fs.existsSync(dir)) continue;
      const files = findNodeFiles(dir);
      if (files.length > 0) {
        const size = fs.statSync(files[0]).size;
        console.log(`  ✓ ${name} rebuilt (${(size / 1024).toFixed(0)} KB)`);
        foundNodeFile = true;
        break;
      }
    }
    if (!foundNodeFile) {
      console.log(`  ✓ ${name} rebuilt`);
    }
    return true;
  } catch (e) {
    const stderr = e.stderr?.toString() || '';
    if (stderr.includes('gyp ERR!')) {
      const gypLines = stderr.split('\n')
        .filter(l => l.includes('gyp ERR!') || l.includes('MSBUILD :'))
        .slice(0, 10)
        .join('\n');
      console.error(`  ✘ node-gyp errors:\n${gypLines}`);
    } else {
      console.error(`  ✘ ${e.message}`);
    }
    return false;
  }
}

console.log(`\n  • verifying native modules for Electron ${ELECTRON_VERSION}\n`);

const modules = findNativeModules();
if (modules.length === 0) {
  console.log('  No native modules to check.\n');
  process.exit(0);
}

modules.forEach(m => {
  const napi = usesNapi(m.path) ? '(N-API)' : '';
  console.log(`    found: ${m.name} ${napi}`);
});

let success = 0;
let skip = 0;
let failure = 0;

for (const mod of modules) {
  if (hasWorkingBinary(mod.path, mod.name) && usesNapi(mod.path)) {
    skip++;
    console.log(`  ✓ ${mod.name} — pre-built N-API binary is Electron-compatible, skipping rebuild`);
    continue;
  }
  const ok = rebuildModule(mod);
  if (ok) success++;
  else failure++;
}

console.log(`\n  • result: ${skip} skipped (N-API), ${success} rebuilt, ${failure} failed\n`);
process.exit(failure > 0 ? 1 : 0);