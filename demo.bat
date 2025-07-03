@echo off
REM =====================================================
REM Energy Mobile Dashboard - Demo & Test Script
REM =====================================================

echo ============================================
echo Energy Mobile Dashboard - Demo Mode
echo ============================================

echo.
echo This script will:
echo   1. Check if setup is complete
echo   2. Start the development server
echo   3. Show you testing instructions
echo   4. Open the app for testing
echo.

pause

echo.
echo ==== CHECKING SETUP STATUS ====

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please run: database\complete-setup.bat first
    goto :setup_needed
)
echo ✓ Node.js found

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL not found. Please run: database\complete-setup.bat first
    goto :setup_needed
)
echo ✓ PostgreSQL found

REM Check if database exists
psql -d energy_mobile_dashboard -c "SELECT 1;" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Database not found. Please run: database\complete-setup.bat first
    goto :setup_needed
)
echo ✓ Database found

REM Check if dependencies are installed
if not exist "node_modules" (
    echo ❌ App dependencies not installed. Installing now...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: npm install failed
        goto :setup_needed
    )
)
echo ✓ App dependencies found

echo.
echo ✅ Setup verification passed!

echo.
echo ==== STARTING DEMO ====

echo.
echo 📱 ENERGY MOBILE DASHBOARD - App Demo
echo.
echo 🔑 Test Login Credentials:
echo.
echo   👤 CUSTOMER:
echo      Email: customer@example.com
echo      Password: customer123
echo.
echo   🚛 DRIVER:
echo      Email: driver1@energymobile.com
echo      Password: driver123
echo.
echo   📋 DISPATCHER:
echo      Email: dispatcher@energymobile.com
echo      Password: dispatcher123
echo.
echo   ⚙️ ADMIN:
echo      Email: admin@energymobile.com
echo      Password: admin123
echo.

echo 🎯 What to Test:
echo.
echo   CUSTOMER APP:
echo   • Create new bookings
echo   • Track job status
echo   • View job history
echo   • Use AI chat assistant
echo.
echo   DRIVER APP:
echo   • View assigned jobs
echo   • Update job status
echo   • Track work hours
echo   • GPS simulation
echo.
echo   DISPATCHER APP:
echo   • Manage job queue
echo   • Assign drivers
echo   • Real-time tracking
echo   • Driver availability
echo.
echo   ADMIN APP:
echo   • System dashboard
echo   • User management
echo   • Reports & analytics
echo   • System settings
echo.

echo ============================================
echo 🚀 STARTING EXPO DEVELOPMENT SERVER...
echo ============================================

echo.
echo When the server starts:
echo   📱 Press 'w' to open in web browser
echo   📱 Install 'Expo Go' app and scan QR code for mobile testing
echo   📱 Press 'a' for Android emulator (if installed)
echo.

echo Starting in 3 seconds...
timeout /t 3 >nul

REM Start Expo development server
expo start

goto :end

:setup_needed
echo.
echo ============================================
echo ❌ SETUP REQUIRED
echo ============================================
echo.
echo Please run the complete setup first:
echo.
echo   database\complete-setup.bat
echo.
echo This will:
echo   • Install Node.js, PostgreSQL, Git
echo   • Set up the database
echo   • Install app dependencies
echo   • Configure everything for testing
echo.

:end
pause
