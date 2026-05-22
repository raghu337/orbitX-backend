# ============================================================
# OrbitX ADMIN FIREWALL FIX
# MUST run this script as Administrator:
#   Right-click → "Run with PowerShell" (as Admin)
#   OR in Admin PowerShell:  .\FIX_FIREWALL_ADMIN.ps1
# ============================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  OrbitX Firewall + Backend Fix (Admin Required)" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Detect Wi-Fi IP ───────────────────────────────
Write-Host "[1/5] Detecting Wi-Fi IPv4 address..." -ForegroundColor Yellow
$wifiIP = $null

# Try Wi-Fi first
$wifiAdapter = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -like "Wi-Fi*" -and $_.IPAddress -notlike "169.*"
} | Select-Object -First 1
if ($wifiAdapter) {
    $wifiIP = $wifiAdapter.IPAddress
}

# Fallback: find any private IP that isn't VMware/loopback
if (-not $wifiIP) {
    $wifiIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.IPAddress -notlike "127.*" -and
        $_.IPAddress -notlike "169.*" -and
        $_.IPAddress -notlike "192.168.174.*" -and
        $_.IPAddress -notlike "192.168.26.*" -and
        $_.PrefixLength -lt 32
    } | Select-Object -First 1).IPAddress
}

if (-not $wifiIP) {
    $wifiIP = "10.230.206.98"
    Write-Host "  [WARN] Could not auto-detect IP — using fallback: $wifiIP" -ForegroundColor Yellow
} else {
    Write-Host "  [OK] Detected IP: $wifiIP" -ForegroundColor Green
}

# ── Step 2: Remove old/stale firewall rules ───────────────
Write-Host ""
Write-Host "[2/5] Cleaning up old firewall rules for port 8000..." -ForegroundColor Yellow
Get-NetFirewallRule | Where-Object { $_.DisplayName -like "*OrbitX*" -or $_.DisplayName -like "*8000*" } | ForEach-Object {
    Write-Host "  Removing: $($_.DisplayName)" -ForegroundColor Gray
    $_ | Remove-NetFirewallRule -ErrorAction SilentlyContinue
}

# ── Step 3: Create fresh firewall rule ───────────────────
Write-Host ""
Write-Host "[3/5] Creating Windows Firewall inbound rule for TCP port 8000..." -ForegroundColor Yellow
try {
    New-NetFirewallRule `
        -DisplayName "OrbitX Backend Port 8000" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 8000 `
        -Action Allow `
        -Profile Any `
        -Enabled True `
        -Description "Allows Android/iOS devices to connect to OrbitX FastAPI backend on port 8000" `
        | Out-Null
    Write-Host "  [OK] Firewall rule created — port 8000 is now OPEN" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Failed to create firewall rule: $_" -ForegroundColor Red
}

# Verify the rule
$rule = Get-NetFirewallRule -DisplayName "OrbitX Backend Port 8000" -ErrorAction SilentlyContinue
if ($rule -and $rule.Enabled -eq "True") {
    Write-Host "  [OK] Firewall rule verified: Enabled=$($rule.Enabled) Action=$($rule.Action)" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Rule may not have applied correctly" -ForegroundColor Yellow
}

# ── Step 4: Update orbitxApi.js with correct IP ───────────
Write-Host ""
Write-Host "[4/5] Updating orbitxApi.js with IP: $wifiIP ..." -ForegroundColor Yellow
$apiFile = "$PSScriptRoot\src\services\api\orbitxApi.js"
if (Test-Path $apiFile) {
    $content = Get-Content $apiFile -Raw
    $updated = $content -replace "const MACHINE_IP = '[^']*';", "const MACHINE_IP = '$wifiIP'; // Auto-updated by FIX_FIREWALL_ADMIN.ps1"
    Set-Content $apiFile $updated -Encoding UTF8
    Write-Host "  [OK] orbitxApi.js updated with MACHINE_IP = '$wifiIP'" -ForegroundColor Green
} else {
    Write-Host "  [WARN] orbitxApi.js not found at: $apiFile" -ForegroundColor Yellow
}

# ── Step 5: Start Backend ─────────────────────────────────
Write-Host ""
Write-Host "[5/5] Starting FastAPI backend on 0.0.0.0:8000 ..." -ForegroundColor Yellow
$backendDir = "$PSScriptRoot\backend"
$venvPython = "$backendDir\venv\Scripts\python.exe"

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION COMPLETE!" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Wi-Fi IP    : $wifiIP" -ForegroundColor White
Write-Host "  Backend URL : http://${wifiIP}:8000" -ForegroundColor White
Write-Host "  Docs URL    : http://${wifiIP}:8000/docs" -ForegroundColor White
Write-Host "  Ping URL    : http://${wifiIP}:8000/ping" -ForegroundColor White
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  orbitxApi.js MACHINE_IP = '$wifiIP'" -ForegroundColor White
Write-Host ""
Write-Host "  Starting backend now... (Press Ctrl+C to stop)" -ForegroundColor Yellow
Write-Host ""

Set-Location $backendDir
if (Test-Path $venvPython) {
    Write-Host "  Using venv Python: $venvPython" -ForegroundColor Gray
    & $venvPython -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
} else {
    Write-Host "  Using system Python" -ForegroundColor Gray
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}
