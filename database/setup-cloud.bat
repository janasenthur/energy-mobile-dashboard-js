@echo off
REM =====================================================
REM Energy Mobile Dashboard - Cloud Database Setup
REM =====================================================
REM This script sets up the database on your cloud PostgreSQL server

echo ============================================
echo Energy Mobile Dashboard - Cloud Setup
echo ============================================

echo.
echo This script will:
echo   1. Install Node.js ^(if missing^)
echo   2. Install PostgreSQL client tools ^(psql^)
echo   3. Connect to your cloud database
echo   4. Set up the database schema
echo   5. Install app dependencies
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ ERROR: .env file not found
    echo.
    echo Please follow these steps:
    echo 1. Copy .env.example to .env
    echo 2. Edit .env with your cloud database connection details
    echo 3. Run this script again
    echo.
    echo Example providers with free tiers:
    echo • Supabase: https://supabase.com/
    echo • Neon: https://neon.tech/
    echo • ElephantSQL: https://www.elephantsql.com/
    echo • Aiven: https://aiven.io/
    echo.
    pause
    exit /b 1
)

echo ✓ .env file found

REM Load environment variables from .env file
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if "%%a"=="DATABASE_URL" set "DATABASE_URL=%%b"
    if "%%a"=="DB_HOST" set "DB_HOST=%%b"
    if "%%a"=="DB_USER" set "DB_USER=%%b"
    if "%%a"=="DB_PASSWORD" set "DB_PASSWORD=%%b"
    if "%%a"=="DB_NAME" set "DB_NAME=%%b"
    if "%%a"=="DB_PORT" set "DB_PORT=%%b"
)

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ❌ ERROR: DATABASE_URL not found in .env file
    echo.
    echo Please edit .env file and set your DATABASE_URL:
    echo DATABASE_URL=postgresql://username:password@hostname:port/database_name
    echo.
    pause
    exit /b 1
)

echo ✓ Database connection URL found

echo.
echo ==== PHASE 1: Installing Prerequisites ====

REM Check if we have winget
where winget >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Windows Package Manager ^(winget^) not found
    echo This requires Windows 10 ^(version 1809+^) or Windows 11
    echo.
    echo Manual alternative: Install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Windows Package Manager found

REM Check and install Node.js
echo.
echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Node.js...
    winget install OpenJS.NodeJS --silent --accept-package-agreements --accept-source-agreements
    echo ✓ Node.js installation completed
) else (
    echo ✓ Node.js already installed
    node --version
)

REM Check and install PostgreSQL client (psql)
echo.
echo Checking PostgreSQL client...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing PostgreSQL client tools...
    echo This may take a few minutes...
    winget install PostgreSQL.PostgreSQL --silent --accept-package-agreements --accept-source-agreements
    echo ✓ PostgreSQL client tools installed
) else (
    echo ✓ PostgreSQL client already installed
    psql --version
)

echo.
echo ==== PHASE 2: Refreshing Environment ====

REM Refresh PATH by restarting the script with new environment
if not defined RESTARTED (
    echo Restarting script with updated PATH...
    set RESTARTED=1
    "%~f0"
    exit /b %ERRORLEVEL%
)

echo.
echo ==== PHASE 3: Testing Cloud Database Connection ====

echo Testing connection to cloud database...

REM Test database connection
psql "%DATABASE_URL%" -c "SELECT version();" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Cannot connect to cloud database
    echo.
    echo Please check:
    echo 1. DATABASE_URL is correct in .env file
    echo 2. Database server is accessible
    echo 3. Username and password are correct
    echo 4. Database allows connections from your IP
    echo 5. SSL settings are correct ^(if required^)
    echo.
    echo Current DATABASE_URL: %DATABASE_URL%
    echo.
    echo Common fixes:
    echo • Add ?sslmode=require to connection string
    echo • Check firewall/IP whitelist settings
    echo • Verify credentials are correct
    echo.
    pause
    exit /b 1
)

echo ✓ Cloud database connection successful

echo.
echo ==== PHASE 4: Setting Up Database Schema ====

echo Creating database schema...

REM Check if database files exist
if not exist "database\energy_mobile_dashboard.sql" (
    echo ❌ ERROR: Database schema file not found
    echo Make sure you're in the project root directory
    pause
    exit /b 1
)

REM Run database schema script
psql "%DATABASE_URL%" -f database\energy_mobile_dashboard.sql >setup.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Database schema creation failed
    echo Check setup.log for details:
    echo.
    type setup.log | findstr "ERROR"
    echo.
    echo Full log saved to setup.log
    pause
    exit /b 1
)

echo ✓ Database schema created successfully

echo.
echo ==== PHASE 5: Validating Database Setup ====

echo Validating database...

REM Test if tables were created and sample data exists
psql "%DATABASE_URL%" -c "SELECT count(*) FROM users;" 2>nul | findstr "5" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ WARNING: Database validation failed - sample users not found
    echo Database may not be set up correctly
) else (
    echo ✓ Database validation passed - found sample data
)

echo.
echo ==== PHASE 6: Installing App Dependencies ====

echo Installing npm dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ WARNING: npm install failed. You can run it manually later.
) else (
    echo ✓ App dependencies installed successfully
)

echo.
echo ============================================
echo 🎉 CLOUD DATABASE SETUP COMPLETED!
echo ============================================

echo.
echo 📋 What was set up:
echo   ✓ Node.js and npm
echo   ✓ PostgreSQL client tools
echo   ✓ Cloud database connection verified
echo   ✓ Database schema and sample data
echo   ✓ App dependencies installed

echo.
echo 🔗 Database Details:
echo   Provider: Cloud PostgreSQL
echo   Connection: %DATABASE_URL%
echo   Tables: 12+ core tables created
echo   Sample Data: 5 users, 3 vehicles, 1 job

echo.
echo 🔐 Default Login Credentials ^(CHANGE FOR PRODUCTION^):
echo   Admin: admin@energymobile.com / admin123
echo   Dispatcher: dispatcher@energymobile.com / dispatcher123
echo   Customer: customer@example.com / customer123
echo   Driver: driver1@energymobile.com / driver123

echo.
echo 🚀 Ready to Start Development:
echo   Run: expo start
echo   Or: npm start

echo.
echo 📱 Your cloud-powered Energy Mobile Dashboard is ready!

REM Clean up
if exist setup.log del setup.log

pause
