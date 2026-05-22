# ============================================================
# OrbitX Backend Startup Script
# Run this script ONCE as Administrator to fix port 8000 access
# from Android devices on the same WiFi network.
# ============================================================

# --- Detect the Wi-Fi IPv4 address ---
$wifiIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -like "Wi-Fi*" -and $_.IPAddress -notlike "169.*"
} | Select-Object -First 1).IPAddress

# Fallback: any non-VMware private IP
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
    Write-Host "[OrbitX] Could not auto-detect Wi-Fi IP, using fallback: $wifiIP" -ForegroundColor Yellow
} else {
    Write-Host "[OrbitX] Detected Wi-Fi IP: $wifiIP" -ForegroundColor Cyan
}

# --- Add Windows Firewall inbound rule for port 8000 ---
$ruleName = "OrbitX Backend Port 8000"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "[OrbitX] Firewall rule '$ruleName' already exists. Skipping." -ForegroundColor Green
} else {
    Write-Host "[OrbitX] Creating Windows Firewall inbound rule for TCP port 8000..." -ForegroundColor Yellow
    try {
        New-NetFirewallRule -DisplayName $ruleName `
            -Direction Inbound `
            -Protocol TCP `
            -LocalPort 8000 `
            -Action Allow `
            -Profile Any `
            -Enabled True `
            -Description "Allows Android devices to connect to OrbitX FastAPI backend on port 8000" | Out-Null
        Write-Host "[OrbitX] Firewall rule created successfully." -ForegroundColor Green
    } catch {
        Write-Host "[OrbitX] WARNING: Could not create firewall rule (needs Admin). Run FIX_FIREWALL_ADMIN.ps1 as Admin." -ForegroundColor Red
    }
}

# --- Auto-update orbitxApi.js with correct IP ---
$apiFile = "$PSScriptRoot\src\services\api\orbitxApi.js"
if (Test-Path $apiFile) {
    $content = Get-Content $apiFile -Raw
    $updated = $content -replace "const MACHINE_IP = '[^']*';", "const MACHINE_IP = '$wifiIP'; // Auto-set by start_backend.ps1"
    Set-Content $apiFile $updated -Encoding UTF8
    Write-Host "[OrbitX] Updated orbitxApi.js: MACHINE_IP = '$wifiIP'" -ForegroundColor Green
}

# --- Display network info ---
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  OrbitX Backend Network Configuration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Wi-Fi IP    : $wifiIP" -ForegroundColor White
Write-Host "  Backend URL : http://${wifiIP}:8000" -ForegroundColor White
Write-Host "  Docs URL    : http://${wifiIP}:8000/docs" -ForegroundColor White
Write-Host "  Ping URL    : http://${wifiIP}:8000/ping" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# --- Start the uvicorn server ---
Write-Host "[OrbitX] Starting FastAPI backend on 0.0.0.0:8000..." -ForegroundColor Green
Write-Host "[OrbitX] Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

Set-Location -Path "$PSScriptRoot\backend"

# Try to use venv Python first, fall back to system Python
$venvPython = "$PSScriptRoot\backend\venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    Write-Host "[OrbitX] Using venv Python: $venvPython" -ForegroundColor Cyan
    & $venvPython -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
} else {
    Write-Host "[OrbitX] venv not found, using system Python..." -ForegroundColor Yellow
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}
