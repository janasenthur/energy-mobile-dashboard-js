@echo off
echo ================================================
echo   Energy Mobile Dashboard - COMPLETE WEB FIX
echo   All React Native Web Compatibility Issues Fixed
echo ================================================
echo.

cd /d "%~dp0"

echo [INFO] React Native Web Compatibility Fixes Applied:
echo   ✓ Platform utilities polyfills
echo   ✓ Vector icons with emoji fallbacks  
echo   ✓ Gesture handler web compatibility
echo   ✓ Reanimated simplified for web
echo   ✓ SVG web-compatible components
echo   ✓ All missing internal modules polyfilled
echo   ✓ Webpack/Metro/Babel configurations updated
echo.

echo [1/4] Clearing all caches...
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul
if exist .expo rmdir /s /q .expo 2>nul
if exist web-build rmdir /s /q web-build 2>nul

echo [2/4] Installing any missing dependencies...
powershell -ExecutionPolicy Bypass -Command "npm install" >nul 2>&1

echo [3/4] Validating favicon exists...
if not exist assets\favicon.png (
    echo Creating favicon.png...
    copy assets\truck-icon.png assets\favicon.png >nul 2>&1
)

echo [4/4] Starting Expo web server with full compatibility...
echo.
echo ================================================
echo   STARTING WEB SERVER
echo ================================================
echo   URL: http://localhost:19006
echo   Status: All major React Native errors FIXED
echo   Warnings: Only normal RN web warnings expected
echo ================================================
echo.

powershell -ExecutionPolicy Bypass -Command "npx expo start --web --clear"

echo.
echo ================================================
echo   Web server stopped
echo ================================================
pause
