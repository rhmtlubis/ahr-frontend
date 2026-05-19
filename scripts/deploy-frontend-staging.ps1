param(
    [string]$Branch = 'main',
    [string]$Server = 'ahrcorporation@103.150.194.183',
    [string]$KeyPath = "$HOME/.ssh/id_ed25519",
    [string]$DeployDir = '/opt/ahrcorporation/deploy/staging',
    [string]$RemoteRepo = '/opt/ahrcorporation/frontend-staging',
    [string]$FrontendUrl = 'https://staging.ahrcorporation.id',
    [string]$ApiUrl = 'https://staging-api.ahrcorporation.id'
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
if [ -f /opt/ahrcorporation/backend-staging/.env ]; then
  MIDTRANS_CLIENT_KEY="$(grep -E '^MIDTRANS_CLIENT_KEY=' /opt/ahrcorporation/backend-staging/.env | tail -n 1 | cut -d= -f2-)"
fi

git stash push -m "auto-deploy backup $(date -u +%Y%m%dT%H%M%SZ)" >/dev/null || true
git pull --ff-only origin __BRANCH__

cat > .env.production <<EOF
VITE_API_BASE_URL=__API_URL__
VITE_PRERENDER_API_BASE_URL=__API_URL__
VITE_SITE_URL=__FRONTEND_URL__
VITE_MIDTRANS_CLIENT_KEY=${MIDTRANS_CLIENT_KEY}
VITE_MIDTRANS_IS_PRODUCTION=false
VITE_GOOGLE_AUTH_ENABLED=true
EOF

cd __DEPLOY_DIR__
docker compose -f docker-compose.staging.yml up -d --build frontend-staging

cd __REMOTE_REPO__
git stash pop --index >/dev/null 2>&1 || true
'@

$remoteScript = $remoteScript.Replace('__REMOTE_REPO__', $RemoteRepo).Replace('__DEPLOY_DIR__', $DeployDir).Replace('__BRANCH__', $Branch).Replace('__FRONTEND_URL__', $FrontendUrl).Replace('__API_URL__', $ApiUrl)
$remoteScript = $remoteScript -replace "`r`n", "`n"

$tempScriptPath = Join-Path ([System.IO.Path]::GetTempPath()) ("ahr-frontend-staging-deploy-{0}.sh" -f ([guid]::NewGuid().ToString('N')))
[System.IO.File]::WriteAllText($tempScriptPath, $remoteScript, [System.Text.UTF8Encoding]::new($false))

try {
    scp -i $KeyPath $tempScriptPath "${Server}:/tmp/ahr-frontend-staging-deploy.sh" | Out-Null
    ssh -i $KeyPath $Server "bash /tmp/ahr-frontend-staging-deploy.sh"
}
finally {
    Remove-Item -LiteralPath $tempScriptPath -ErrorAction SilentlyContinue
}
