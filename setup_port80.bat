@echo off
:: Self-elevate to admin
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo Requesting Admin rights...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo.
echo ==========================================
echo  Setting up Port 80 for ai365cce.sece.com
echo ==========================================
echo.

:: Remove old rule if exists
netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0 >nul 2>&1

:: Add port forward: 80 -> 3000
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=3000 connectaddress=127.0.0.1
echo [OK] Port 80 now forwards to port 3000

:: Open Windows Firewall for port 80
netsh advfirewall firewall delete rule name="AI365 Port 80" >nul 2>&1
netsh advfirewall firewall add rule name="AI365 Port 80" protocol=TCP dir=in localport=80 action=allow
echo [OK] Firewall opened for port 80

echo.
echo ==========================================
echo  Current port proxy rules:
netsh interface portproxy show all
echo.
echo  SUCCESS! Now open your browser and go to:
echo  http://ai365cce.sece.com
echo ==========================================
echo.
pause
