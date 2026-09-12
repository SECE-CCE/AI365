@echo off
setlocal
title AI365 @ CCE Server Launcher

echo ======================================================
echo           AI365 @ CCE - Server Launcher
echo ======================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js from https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [2/3] Installing dependencies (first run)...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [2/3] Dependencies found.
)

echo [3/3] Building production bundle for network hosting...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed! Check the errors above.
    pause
    exit /b 1
)

echo.
echo Starting AI365 server...
echo.
call npm start

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Server exited with code %ERRORLEVEL%
    pause
)
