@echo off
echo ============================================================
echo  OrbitX - Fix Firewall and Start Backend (Run as Admin!)
echo ============================================================
echo.
echo [1/3] Adding Windows Firewall rule for port 8000...
netsh advfirewall firewall delete rule name="OrbitX Backend Port 8000" >nul 2>&1
netsh advfirewall firewall add rule name="OrbitX Backend Port 8000" dir=in action=allow protocol=TCP localport=8000
if %errorlevel% == 0 (
    echo [OK] Firewall rule added - Android devices can now connect on port 8000
) else (
    echo [ERROR] Failed to add firewall rule. Make sure you ran this as Administrator!
    pause
    exit /b 1
)

echo.
echo [2/3] Detecting Wi-Fi IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "192.168"') do (
    for /f "tokens=1" %%b in ("%%a") do set WIFI_IP=%%b
)
if not defined WIFI_IP set WIFI_IP=10.230.206.98
echo [OK] Wi-Fi IP: %WIFI_IP%

echo.
echo [3/3] Starting OrbitX FastAPI Backend...
echo.
echo  Server URL : http://%WIFI_IP%:8000
echo  API Docs   : http://%WIFI_IP%:8000/docs
echo  Health     : http://%WIFI_IP%:8000/health
echo.
echo  Ensure orbitxApi.js has:  const MACHINE_IP = '%WIFI_IP%';
echo.
echo ============================================================
echo  Press Ctrl+C to stop the server
echo ============================================================
echo.

cd /d "%~dp0backend"
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
