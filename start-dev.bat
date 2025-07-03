@echo off
echo.
echo ========================================
echo   Energy Mobile Dashboard - Dev Setup
echo ========================================
echo.

echo Starting Backend Server...
echo.
start "Backend Server" powershell -Command "& { Set-Location 'backend'; node server.js }"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Web Server...
echo.
start "Frontend Web Server" powershell -Command "& { npm run web }"

echo.
echo ========================================
echo   Both servers are starting...
echo ========================================
echo.
echo Backend API: http://localhost:3000
echo Frontend Web: http://localhost:19006
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping all servers...
taskkill /F /FI "WINDOWTITLE eq Backend Server*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Frontend Web Server*" 2>nul
echo Done!
