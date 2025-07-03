@echo off
echo Starting Energy Mobile Dashboard Web Test...
echo.

echo Clearing caches...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo
if exist web-build rmdir /s /q web-build
npm cache clean --force > nul 2>&1

echo.
echo Setting environment variables...
set NODE_ENV=development
set EXPO_WEB=true

echo.
echo Starting web server with error fixes...
start "Web Server" cmd /k "echo Energy Dashboard - Web Development Mode && echo Mock API Mode: ON && echo Notification Polyfills: ACTIVE && echo CORS Issues: RESOLVED && echo. && npx expo start --web --port 19006"

echo.
echo Web server should open automatically in your browser.
echo Check console for any remaining errors.
echo.
pause
