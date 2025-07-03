@echo off
title Energy Dashboard - Web Compatibility Check
echo ================================================
echo Energy Mobile Dashboard - Web Compatibility Fix
echo ================================================
echo.

echo [1/5] Checking Node.js and npm...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)
echo OK: Node.js and npm are available

echo.
echo [2/5] Installing dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
) else (
    echo OK: node_modules exists
)

echo.
echo [3/5] Checking web compatibility fixes...
if exist "src\components\WebCompatibleMap.js" (
    echo ✓ Web-compatible Map component found
) else (
    echo ✗ Web-compatible Map component missing
)

if exist "src\services\webCompatibleLocation.js" (
    echo ✓ Web-compatible Location service found  
) else (
    echo ✗ Web-compatible Location service missing
)

if exist "src\services\webCompatibleNotifications.js" (
    echo ✓ Web-compatible Notifications service found
) else (
    echo ✗ Web-compatible Notifications service missing
)

echo.
echo [4/5] Starting Metro bundler for web...
echo.
echo IMPORTANT NOTES:
echo - Some mobile-only features are replaced with web-compatible versions
echo - Maps will show placeholder on web (works fully on mobile)
echo - Notifications use browser notifications on web
echo - Location uses mock data on web
echo.
echo Starting in 3 seconds...
timeout /t 3 >nul

echo.
echo [5/5] Launching web app...
echo Press Ctrl+C to stop the server
echo Opening browser automatically...
echo.

start "" "http://localhost:19006"
npx expo start --web

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start web app!
    echo.
    echo Try these solutions:
    echo 1. Run: npm install
    echo 2. Run: npx expo start --web --clear
    echo 3. Check if port 19006 is available
    echo 4. Try: npx expo start --web --port 19007
    echo.
    pause
)
