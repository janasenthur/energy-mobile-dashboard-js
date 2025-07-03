@echo off
echo ====================================================
echo Energy Mobile Dashboard - Full Stack Application
echo ====================================================
echo.

cd /d "%~dp0"

echo [1/4] Installing backend dependencies...
cd backend
if not exist node_modules (
    npm install
) else (
    echo Backend dependencies already installed.
)

echo.
echo [2/4] Installing frontend dependencies...
cd ..
if not exist node_modules (
    npm install
) else (
    echo Frontend dependencies already installed.
)

echo.
echo [3/4] Starting backend API server...
start cmd /k "cd /d %cd%\backend && echo Starting Backend API on http://localhost:3000... && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting frontend application...
echo Frontend will be available at:
echo - Mobile/Native: http://localhost:8081
echo - Web: http://localhost:19006
echo.

start cmd /k "echo Starting Frontend Application... && expo start"

echo.
echo ====================================================
echo Full Stack Application Started Successfully!
echo ====================================================
echo Backend API: http://localhost:3000
echo Frontend Web: http://localhost:19006
echo Frontend Mobile: http://localhost:8081
echo ====================================================
echo.
echo Press any key to stop all services...
pause >nul

echo Stopping services...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cmd.exe >nul 2>&1

echo All services stopped.
pause
