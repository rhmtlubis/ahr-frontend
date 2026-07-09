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

MIDTRANS_CLIENT_KEY=""
if docker ps --format '{{.Names}}' | grep -qx 'ahr-backend'; then
  MIDTRANS_CLIENT_KEY="$(docker exec ahr-backend sh -lc 'grep -E "^MIDTRANS_CLIENT_KEY=" /var/www/html/.env 2>/dev/null | tail -n 1 | cut -d= -f2-' || true)"
fi
if [ -z "$MIDTRANS_CLIENT_KEY" ] && [ -r /opt/ahrcorporation/backend/.env ]; then
  MIDTRANS_CLIENT_KEY="$(grep -E '^MIDTRANS_CLIENT_KEY=' /opt/ahrcorporation/backend/.env | tail -n 1 | cut -d= -f2-)"
fi

git fetch origin __BRANCH__
git reset --hard origin/__BRANCH__
cat > .env.production <<EOF
VITE_API_BASE_URL=https://api.ahrcorporation.id
VITE_PRERENDER_API_BASE_URL=https://api.ahrcorporation.id
VITE_SITE_URL=https://ahrcorporation.id
VITE_MIDTRANS_CLIENT_KEY=${MIDTRANS_CLIENT_KEY}
VITE_MIDTRANS_IS_PRODUCTION=true
VITE_MIDTRANS_SNAP_LANGUAGE=id
VITE_GOOGLE_AUTH_ENABLED=true
EOF
cd __DEPLOY_DIR__
docker compose up -d --build frontend
cd __REMOTE_REPO__
git stash pop --index >/dev/null 2>&1 || true
'@

$remoteScript = $remoteScript.Replace('__REMOTE_REPO__', $RemoteRepo).Replace('__DEPLOY_DIR__', $DeployDir).Replace('__BRANCH__', $Branch)
$remoteScript = $remoteScript -replace "`r`n", "`n"

$tempScriptPath = Join-Path ([System.IO.Path]::GetTempPath()) ("ahr-frontend-deploy-{0}.sh" -f ([guid]::NewGuid().ToString('N')))
[System.IO.File]::WriteAllText($tempScriptPath, $remoteScript, [System.Text.UTF8Encoding]::new($false))

try {
    scp -i $KeyPath $tempScriptPath "${Server}:/tmp/ahr-frontend-deploy.sh" | Out-Null
    ssh -i $KeyPath $Server "bash /tmp/ahr-frontend-deploy.sh"
}
finally {
    Remove-Item -LiteralPath $tempScriptPath -ErrorAction SilentlyContinue
}
