@echo off
title Energy Dashboard - Fixed Web App
echo ==============================================
echo Energy Dashboard - Starting FIXED Web App
echo ==============================================
echo.

echo [1/4] ✅ Applied fixes:
echo     - Fixed expo-status-bar import issue
echo     - Fixed syntax errors in web compatibility files
echo     - Added missing typography to theme
echo     - Fixed DriverJobsScreen export
echo     - Created favicon placeholder
echo     - Updated location accuracy handling
echo.

echo [2/4] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo [3/4] Starting web server with fixes...
echo.
echo ⏳ This may take 30-60 seconds to compile...
echo 🌐 Web app will open at: http://localhost:19006
echo.

echo [4/4] Launching...
start "" "http://localhost:19006"
powershell -ExecutionPolicy Bypass -Command "npx expo start --web --clear"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Still having issues? Try:
    echo 1. npm install --force
    echo 2. npx expo start --web --port 8080
    echo 3. Check browser console for specific errors
    echo.
    pause
)
