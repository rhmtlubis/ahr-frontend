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

read_env_var() {
  local key="$1"
  local default="${2:-}"
  local file
  for file in .env.google-ads .env.production; do
    if [ -f "$file" ]; then
      local value
      value="$(grep -E "^${key}=" "$file" 2>/dev/null | tail -n 1 | cut -d= -f2- | tr -d '\r' || true)"
      if [ -n "$value" ]; then
        printf '%s' "$value"
        return 0
      fi
    fi
  done
  printf '%s' "$default"
}

VITE_GA_MEASUREMENT_ID="$(read_env_var VITE_GA_MEASUREMENT_ID)"
VITE_GOOGLE_ADS_ID="$(read_env_var VITE_GOOGLE_ADS_ID)"
VITE_GOOGLE_ADS_CONVERSION_CART_CHECKOUT_ORDER_SAVED="$(read_env_var VITE_GOOGLE_ADS_CONVERSION_CART_CHECKOUT_ORDER_SAVED)"
VITE_GOOGLE_ADS_CONVERSION_BEGIN_CHECKOUT="$(read_env_var VITE_GOOGLE_ADS_CONVERSION_BEGIN_CHECKOUT)"
VITE_GOOGLE_ADS_CONVERSION_PURCHASE="$(read_env_var VITE_GOOGLE_ADS_CONVERSION_PURCHASE)"
VITE_GOOGLE_ADS_CONVERSION_PRODUCT_DETAIL_WHATSAPP_CLICK="$(read_env_var VITE_GOOGLE_ADS_CONVERSION_PRODUCT_DETAIL_WHATSAPP_CLICK)"
VITE_GOOGLE_ADS_CONVERSION_B2B_LANDING_LEAD_SUBMITTED="$(read_env_var VITE_GOOGLE_ADS_CONVERSION_B2B_LANDING_LEAD_SUBMITTED)"
VITE_GOOGLE_ADS_CONVERSION_DEFAULT_VALUE_IDR="$(read_env_var VITE_GOOGLE_ADS_CONVERSION_DEFAULT_VALUE_IDR '150000')"
VITE_META_PIXEL_ORIANA_ID="$(read_env_var VITE_META_PIXEL_ORIANA_ID '27046894451626338')"
VITE_META_PIXEL_AHR_ID="$(read_env_var VITE_META_PIXEL_AHR_ID '898546552678930')"

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
VITE_GA_MEASUREMENT_ID=${VITE_GA_MEASUREMENT_ID}
VITE_GOOGLE_ADS_ID=${VITE_GOOGLE_ADS_ID}
VITE_GOOGLE_ADS_CONVERSION_CART_CHECKOUT_ORDER_SAVED=${VITE_GOOGLE_ADS_CONVERSION_CART_CHECKOUT_ORDER_SAVED}
VITE_GOOGLE_ADS_CONVERSION_BEGIN_CHECKOUT=${VITE_GOOGLE_ADS_CONVERSION_BEGIN_CHECKOUT}
VITE_GOOGLE_ADS_CONVERSION_PURCHASE=${VITE_GOOGLE_ADS_CONVERSION_PURCHASE}
VITE_GOOGLE_ADS_CONVERSION_PRODUCT_DETAIL_WHATSAPP_CLICK=${VITE_GOOGLE_ADS_CONVERSION_PRODUCT_DETAIL_WHATSAPP_CLICK}
VITE_GOOGLE_ADS_CONVERSION_B2B_LANDING_LEAD_SUBMITTED=${VITE_GOOGLE_ADS_CONVERSION_B2B_LANDING_LEAD_SUBMITTED}
VITE_GOOGLE_ADS_CONVERSION_DEFAULT_VALUE_IDR=${VITE_GOOGLE_ADS_CONVERSION_DEFAULT_VALUE_IDR}
VITE_META_PIXEL_ORIANA_ID=${VITE_META_PIXEL_ORIANA_ID}
VITE_META_PIXEL_AHR_ID=${VITE_META_PIXEL_AHR_ID}
EOF
cd __DEPLOY_DIR__
docker compose up -d --build frontend
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
