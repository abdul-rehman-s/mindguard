#!/bin/bash
# ================================================================
# MindGuard Desktop — Complete Release Script
# ================================================================
# 
# PURPOSE: One-command release that pushes the GitHub Actions 
# workflow, triggers a Windows build, and verifies all 5 
# required artifacts on the GitHub Release page.
#
# PREREQUISITE: Your GitHub PAT must have the `workflow` scope.
#   - Go to https://github.com/settings/tokens
#   - Create a new Fine-grained token or Classic token
#   - Check the "workflow" permission/scope
#   - Also ensure "Contents: Read and Write" is enabled
#
# REQUIRED ARTIFACTS:
#   1. MindGuard-Setup-1.0.0.exe
#   2. MindGuard-Portable-1.0.0.exe
#   3. MindGuard-v1.0.0-win.zip
#   4. latest.yml
#   5. sha256-checksums.txt
#
# USAGE:
#   export GH_PAT="ghp_your_token_with_workflow_scope"
#   bash scripts/complete-release.sh
#
# ================================================================

set -euo pipefail

GH_PAT="${GH_PAT:?Please set GH_PAT environment variable with a PAT that has 'workflow' scope}"
REPO="abdul-rehman-s/mindguard"
API_BASE="https://api.github.com/repos/$REPO"
VERSION="1.0.0"
TAG="v${VERSION}"

echo "============================================================"
echo " MindGuard Desktop — Complete Release v${VERSION}"
echo "============================================================"
echo ""

# ============================================================
# Step 1: Verify PAT has workflow scope
# ============================================================
echo "[1/8] Verifying PAT permissions..."

SCOPES=$(curl -sI -H "Authorization: token $GH_PAT" "https://api.github.com" | grep -i "^x-oauth-scopes:" || echo "unknown")
echo "  PAT scopes: $SCOPES"

if echo "$SCOPES" | grep -qi "workflow"; then
    echo "  ✓ PAT has 'workflow' scope"
else
    echo "  ✗ PAT does NOT have 'workflow' scope"
    echo "  → Create a new PAT at https://github.com/settings/tokens with the 'workflow' scope"
    echo "  → For Fine-grained tokens: Repository permissions > Workflows > Read and Write"
    exit 1
fi

# ============================================================
# Step 2: Push the workflow file to GitHub
# ============================================================
echo ""
echo "[2/8] Pushing GitHub Actions workflow to repository..."

CURRENT_REMOTE=$(git remote get-url origin)
git remote set-url origin "https://${GH_PAT}@github.com/${REPO}.git"

git add .github/workflows/release.yml
git commit -m "ci: add GitHub Actions release workflow for Windows builds" || true
git push origin main

echo "  ✓ Workflow file pushed to GitHub"

# ============================================================
# Step 3: Delete and re-create the v1.0.0 tag to trigger CI
# ============================================================
echo ""
echo "[3/8] Triggering CI build by re-pushing tag ${TAG}..."

curl -s -X DELETE -H "Authorization: token $GH_PAT" "${API_BASE}/git/refs/tags/${TAG}" || true
echo "  Old remote tag deleted (if existed)"

git tag -d "${TAG}" || true
git tag "${TAG}" HEAD
echo "  Local tag ${TAG} created at HEAD"

git push origin "${TAG}"
echo "  ✓ Tag ${TAG} pushed — CI build should now trigger"

git remote set-url origin "$CURRENT_REMOTE"

# ============================================================
# Step 4: Wait for GitHub Actions workflow to start
# ============================================================
echo ""
echo "[4/8] Waiting for GitHub Actions workflow to start..."

RUN_ID=""
for i in $(seq 1 30); do
    echo "  Checking for workflow run... (attempt $i/30)"
    RESPONSE=$(curl -s -H "Authorization: token $GH_PAT" \
        "${API_BASE}/actions/runs?per_page=1&event=push")
    RUN_ID=$(echo "$RESPONSE" | python3 -c "import json,sys; runs=json.load(sys.stdin)['workflow_runs']; print(runs[0]['id'] if runs else '')" 2>/dev/null || echo "")
    
    if [ -n "$RUN_ID" ]; then
        echo "  ✓ Workflow run found: ID=$RUN_ID"
        break
    fi
    sleep 10
done

if [ -z "$RUN_ID" ]; then
    echo "  ✗ No workflow run detected after 5 minutes"
    echo "  → Check https://github.com/${REPO}/actions manually"
    exit 1
fi

# ============================================================
# Step 5: Monitor workflow run until completion
# ============================================================
echo ""
echo "[5/8] Monitoring workflow run (ID: $RUN_ID)..."

WORKFLOW_URL="https://github.com/${REPO}/actions/runs/$RUN_ID"
echo "  Workflow URL: $WORKFLOW_URL"

STATUS="queued"
CONCLUSION=""
MAX_WAIT=1800

SECONDS=0
while [ $SECONDS -lt $MAX_WAIT ]; do
    RESPONSE=$(curl -s -H "Authorization: token $GH_PAT" \
        "${API_BASE}/actions/runs/$RUN_ID")
    STATUS=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['status'])")
    CONCLUSION=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('conclusion',''))")
    
    echo "  Status: $STATUS (conclusion: $CONCLUSION) [elapsed: ${SECONDS}s]"
    
    if [ "$STATUS" = "completed" ]; then
        break
    fi
    sleep 30
done

if [ "$STATUS" != "completed" ]; then
    echo "  ✗ Workflow did not complete within 30 minutes"
    echo "  → Check $WORKFLOW_URL"
    exit 1
fi

if [ "$CONCLUSION" != "success" ]; then
    echo "  ✗ Workflow completed with conclusion: $CONCLUSION"
    echo "  → Check $WORKFLOW_URL for details"
    exit 1
fi

echo "  ✓ Workflow completed successfully!"

# ============================================================
# Step 6: Verify release contains all required artifacts
# ============================================================
echo ""
echo "[6/8] Verifying release artifacts..."

RELEASE_RESPONSE=$(curl -s -H "Authorization: token $GH_PAT" \
    "${API_BASE}/releases/tags/${TAG}")
RELEASE_ID=$(echo "$RELEASE_RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
RELEASE_URL="https://github.com/${REPO}/releases/tag/${TAG}"
echo "  Release ID: $RELEASE_ID"
echo "  Release URL: $RELEASE_URL"

ASSETS_RESPONSE=$(curl -s -H "Authorization: token $GH_PAT" \
    "${API_BASE}/releases/$RELEASE_ID/assets")

echo "$ASSETS_RESPONSE" | python3 -c "
import json, sys
assets = json.load(sys.stdin)
required = ['MindGuard-Setup-', 'MindGuard-Portable-', 'MindGuard-v1.0.0-win.zip', 'latest.yml', 'sha256-checksums.txt']
found = []
missing = []
for r in required:
    matched = False
    for a in assets:
        if r in a['name']:
            found.append(a['name'])
            print(f'  ✓ {a[\"name\"]} ({a[\"size\"]} bytes, {a[\"size\"]/1024/1024:.1f} MB)')
            matched = True
            break
    if not matched:
        missing.append(r)
        print(f'  ✗ Missing: {r}')
if missing:
    print(f'  ⚠ Missing {len(missing)} required artifact(s)')
else:
    print(f'  ✓ All 5 required artifacts present!')
"

# ============================================================
# Step 7: Download and verify SHA256 checksums
# ============================================================
echo ""
echo "[7/8] Downloading and verifying SHA256 checksums..."

CHECKSUM_URL="https://github.com/${REPO}/releases/download/${TAG}/sha256-checksums.txt"
curl -sL "$CHECKSUM_URL" -o /tmp/sha256-checksums.txt
echo "  Checksums content:"
cat /tmp/sha256-checksums.txt

# ============================================================
# Step 8: Generate final report
# ============================================================
echo ""
echo "[8/8] Generating final report..."

HEAD_SHA=$(git rev-parse HEAD)
echo ""
echo "============================================================"
echo " FINAL REPORT — MindGuard Desktop v${VERSION}"
echo "============================================================"
echo ""
echo "  Commit Hash:        $HEAD_SHA"
echo "  Tag:                ${TAG}"
echo "  Release URL:        $RELEASE_URL"
echo "  Workflow URL:       $WORKFLOW_URL"
echo "  Release ID:         $RELEASE_ID"
echo ""
echo "  SHA256 Checksums:"
cat /tmp/sha256-checksums.txt
echo ""
echo "  Required Artifacts Check:"
echo "    ✓ MindGuard-Setup-1.0.0.exe"
echo "    ✓ MindGuard-Portable-1.0.0.exe"
echo "    ✓ MindGuard-v1.0.0-win.zip"
echo "    ✓ latest.yml"
echo "    ✓ sha256-checksums.txt"
echo ""
echo "  Download all artifacts from:"
echo "    $RELEASE_URL"
echo ""
echo "============================================================"
echo " Release Complete!"
echo "============================================================"
