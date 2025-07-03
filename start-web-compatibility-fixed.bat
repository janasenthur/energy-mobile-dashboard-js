@echo off
echo ============================================
echo   Energy Mobile Dashboard - Web Start
echo   React Native Web Compatibility Fixed
echo ============================================
echo.

cd /d "%~dp0"

echo [1/5] Clearing Metro bundler cache...
powershell -ExecutionPolicy Bypass -Command "npx expo r -c" 2>nul

echo [2/5] Clearing npm cache...
powershell -ExecutionPolicy Bypass -Command "npm cache clean --force" 2>nul

echo [3/5] Clearing Expo cache...
powershell -ExecutionPolicy Bypass -Command "npx expo install --fix" 2>nul

echo [4/5] Clearing all caches...
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul
if exist .expo rmdir /s /q .expo 2>nul
if exist web-build rmdir /s /q web-build 2>nul

echo [5/5] Starting Expo web server...
echo.
echo Starting React Native Web with compatibility fixes...
echo All missing modules have been replaced with web-compatible versions.
echo.
echo Available at: http://localhost:19006
echo.

powershell -ExecutionPolicy Bypass -Command "npx expo start --web --clear"

echo.
echo ============================================
echo   Web server stopped
echo ============================================
pause
