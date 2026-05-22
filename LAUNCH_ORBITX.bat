@echo off
title OrbitX Full Stack Launcher
color 0B

:: 1. Auto-Elevate to Admin
net session >nul 2>&1
if not %errorLevel% == 0 (
    echo Requesting Administrator privileges to configure Windows Firewall...
    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"
    exit /b
)

echo.
echo  =====================================================
echo   ORBITX FULL STACK LAUNCHER
echo  =====================================================
echo.

echo  [1/4] Detecting Wi-Fi IP address...
set WIFI_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127. 169. 192.168.174 192.168.26"') do (
    if not defined WIFI_IP set WIFI_IP=%%a
)
:: Trim whitespace
if defined WIFI_IP set WIFI_IP=%WIFI_IP: =%

if "%WIFI_IP%"=="" (
    set WIFI_IP=10.230.206.98
    echo  [WARN] Could not auto-detect IP, using fallback: %WIFI_IP%
) else (
    echo  [OK] Detected IP: %WIFI_IP%
)

echo.
echo  [2/4] Configuring Windows Firewall for port 8000...
netsh advfirewall firewall delete rule name="OrbitX Backend Port 8000" >nul 2>&1
netsh advfirewall firewall add rule name="OrbitX Backend Port 8000" dir=in action=allow protocol=TCP localport=8000 profile=any >nul 2>&1
echo  [OK] Firewall rule configured for TCP port 8000

echo.
echo  [3/4] Updating orbitxApi.js with LIVE IP...
powershell -Command "$file='%~dp0src\services\api\orbitxApi.js'; $c=Get-Content $file -Raw; $c=$c -replace 'const MACHINE_IP = ''[^'']*'';', 'const MACHINE_IP = ''%WIFI_IP%'';'; Set-Content $file $c -Encoding UTF8"
echo  [OK] Frontend API configured to use %WIFI_IP%

echo.
echo  [4/4] Starting Services...
start "OrbitX Backend" cmd /k "cd /d %~dp0backend && echo Starting OrbitX Backend on 0.0.0.0:8000... && if exist venv\Scripts\python.exe (venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) else (python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload)"

echo  [INFO] Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

start "OrbitX Expo" cmd /k "cd /d %~dp0 && npx expo start --clear"

echo.
echo  =====================================================
echo   ORBITX IS STARTING!
echo  =====================================================
echo   Backend: http://%WIFI_IP%:8000
echo   Docs:    http://%WIFI_IP%:8000/docs  
echo   Ping:    http://%WIFI_IP%:8000/ping
echo.
echo   Scan the QR code in the Expo window to open the app.
echo  =====================================================
pause
