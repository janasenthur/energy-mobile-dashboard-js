@echo off
REM ===================================================================
REM START - Energy Mobile Dashboard (Cloud-First)
REM ===================================================================
echo.
echo =================================================================
echo         Energy Mobile Dashboard - Start App
echo =================================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo [INFO] No .env file found. Creating from Azure template...
    copy ".env.example" ".env" >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Failed to create .env file
        pause
        exit /b 1
    )
    echo [SUCCESS] Created .env file with Azure PostgreSQL settings
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Dependencies not installed. Installing now...
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        echo [INFO] Please check your internet connection and try again
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed
)

echo.
echo [INFO] Starting Energy Mobile Dashboard...
echo [INFO] Connected to Azure PostgreSQL Cloud Database
echo.
echo Available options after startup:
echo - Press 'w' to open in web browser
echo - Scan QR code with Expo Go app on mobile
echo - Press 'a' for Android emulator
echo - Press 'i' for iOS simulator
echo.
echo Default test accounts:
echo - Admin: admin@nbs.com / admin123
echo - Driver: driver@nbs.com / driver123
echo - Customer: customer@nbs.com / customer123
echo - Dispatcher: dispatcher@nbs.com / dispatcher123
echo.

npm start
