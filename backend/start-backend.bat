@echo off
echo ====================================
echo Energy Mobile Dashboard - Backend API
echo ====================================
echo.

cd /d "%~dp0"

echo Installing dependencies...
npm install

echo.
echo Checking database connection...
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
echo Server will be available at: http://localhost:3000
echo API endpoints: http://localhost:3000/api
echo Health check: http://localhost:3000/health
echo.

npm run dev

pause
