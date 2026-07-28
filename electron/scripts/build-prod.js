/**
 * MindGuard Desktop — Production Build Wrapper
 *
 * Because @electron/rebuild uses child_process.fork() + IPC for
 * native module rebuilding and that IPC pattern hangs indefinitely
 * in the git-bash / MSYS2 environment, we cannot rely on
 * electron-builder's built-in "install-app-deps" step.
 *
 * This script:
 *   1. Rebuilds native modules via direct node-gyp calls (proven working)
 *   2. Writes .forge-meta cache markers so @electron/rebuild skips them
 *   3. Then invokes electron-builder for the actual packaging
 *
 * Environment: expects to run from the project root.
 * For best results, run in a normal PowerShell/cmd window (not git-bash).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT = path.resolve(__dirname, '..');

// ── helpers ─────────────────────────────────────────────────────────────

function run(label, cmd, cwd = PROJECT) {
  console.log(`\n  › ${label}`);
  const result = execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf-8', timeout: 300_000 });
  for (const line of result.trim().split('\n')) {
    console.log(`    ${line}`);
  }
}

/** Write a .forge-meta marker file so @electron/rebuild skips this module. */
function blessModule(moduleName) {
  // Node-API ABI for Electron 33.4.11 on x64
  const ABI = '130';
  const modPath = path.resolve(PROJECT, 'node_modules', moduleName);
  const metaDir = path.resolve(modPath, 'build', 'Release');
  const metaFile = path.resolve(metaDir, '.forge-meta');
  const metaContent = `${process.arch}--${ABI}`;

  if (!fs.existsSync(metaDir)) {
    fs.mkdirSync(metaDir, { recursive: true });
  }
  fs.writeFileSync(metaFile, metaContent, 'utf-8');
  console.log(`    ✓ ${moduleName}: .forge-meta → ${metaContent}`);
}

/** Check if we are inside git-bash (MSYS2) — where IPC fork hangs. */
function isGitBash() {
  return process.env.MSYSTEM != null || process.env.MINGW_PREFIX != null;
}

// ── main ─────────────────────────────────────────────────────────────────

console.log('╔═══════════════════════════════════════════╗');
console.log('║  MindGuard v1.0.0 — Production Build      ║');
console.log('╚═══════════════════════════════════════════╝');

const start = Date.now();

try {
  // Step 1: Compile TypeScript
  console.log('\n── Step 1: TypeScript compilation ───────────');
  run('tsc', 'node node_modules/typescript/bin/tsc --project tsconfig.json');

  // Step 2: Rebuild native modules (N-API skip logic built in)
  console.log('\n── Step 2: Rebuild native modules ───────────');
  run('node scripts/rebuild-native.js', 'node scripts/rebuild-native.js');

  // Step 3: Write .forge-meta cache markers
  console.log('\n── Step 3: Write @electron/rebuild cache markers ─');
  for (const mod of ['active-win', 'better-sqlite3']) {
    blessModule(mod);
  }

  // Step 4: Run electron-builder
  console.log('\n── Step 4: electron-builder packaging ────────');
  const args = process.argv.slice(2);
  const ebArgs = args.length > 0 ? args.join(' ') : '--win --dir';

  if (isGitBash()) {
    console.log('\n  ⚠  Detected git-bash/MSYS2 environment.');
    console.log('  ⚠  electron-builder\'s winCodeSign 7za extraction');
    console.log('  ⚠  may fail on symlinks without admin privileges.');
    console.log('  ⚠  If it fails, re-run from a normal PowerShell or');
    console.log('  ⚠  cmd.exe window as Administrator.');
  }

  run(`electron-builder ${ebArgs}`, `node node_modules/electron-builder/cli.js ${ebArgs}`);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✓ Build complete (${elapsed}s)`);
} catch (err) {
  const msg = err.message || String(err);
  const stderr = err.stderr?.toString()?.slice(0, 2000) ?? '';

  console.error(`\n✗ Build failed: ${msg}`);
  if (stderr) {
    console.error(stderr);
  }

  // Give actionable guidance for common failure modes
  if (msg.includes('Cannot create symbolic link') || msg.includes('exit status 2')) {
    console.log('\n  💡 7-Zip symbolic link error. Run from an Administrator');
    console.log('  💡 PowerShell window:');
    console.log(`  💡 cd "${PROJECT}"`);
    console.log(`  💡 node scripts\\build-prod.js --win`);
  } else if (msg.includes('fork') || msg.includes('message')) {
    console.log('\n  💡 @electron/rebuild IPC hang. The .forge-meta cache');
    console.log('  💡 markers should have prevented this. If persistent,');
    console.log('  💡 run from cmd.exe (not git-bash).');
  }

  process.exit(1);
}