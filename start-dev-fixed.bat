@echo off
echo.
echo ========================================
echo   Energy Mobile Dashboard - Dev Setup (Fixed)
echo ========================================
echo.

echo Starting Backend Server...
echo.
start "Backend Server" cmd /c "cd backend && node server.js"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Web Server...
echo.
start "Frontend Web Server" cmd /c "npm run web"

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
