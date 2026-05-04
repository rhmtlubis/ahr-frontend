param(
    [string]$Branch = 'main',
    [string]$Server = 'ahrcorporation@103.150.194.183',
    [string]$KeyPath = "$HOME/.ssh/id_ed25519",
    [string]$DeployDir = '/opt/ahrcorporation/deploy',
    [string]$RemoteRepo = '/opt/ahrcorporation/frontend'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $repoRoot

try {
    $currentBranch = (git branch --show-current).Trim()
    if ($currentBranch -ne $Branch) {
        throw "Expected branch '$Branch', got '$currentBranch'."
    }

    $status = git status --short
    if ($status) {
        throw "Local working tree is dirty. Commit or stash local changes before deploying."
    }

    git push origin $Branch
}
finally {
    Pop-Location
}

$remoteScript = @'
set -euo pipefail
cd __REMOTE_REPO__

stash_created=false
if [ -n "$(git status --porcelain)" ]; then
  git stash push -m "auto-deploy backup $(date -u +%Y%m%dT%H%M%SZ)" >/dev/null
  stash_created=true
fi

git pull --ff-only origin __BRANCH__
cd __DEPLOY_DIR__
docker compose up -d --build frontend

if [ "$stash_created" = true ]; then
  git stash pop --index
fi
'@

$remoteScript = $remoteScript.Replace('__REMOTE_REPO__', $RemoteRepo).Replace('__DEPLOY_DIR__', $DeployDir).Replace('__BRANCH__', $Branch)
$remoteScript | ssh -i $KeyPath $Server 'bash -s'
