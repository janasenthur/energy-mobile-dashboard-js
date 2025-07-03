@echo off
REM =====================================================
REM Energy Mobile Dashboard - Simple Database Setup
REM =====================================================
REM This script provides step-by-step database setup with better error handling

echo ============================================
echo Energy Mobile Dashboard - Database Setup
echo ============================================

echo.
echo This script will guide you through setting up the database.
echo If you encounter issues, run: database\troubleshoot-windows.bat
echo.

REM Check prerequisites
echo Step 1: Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install from https://nodejs.org/
    goto :error_exit
)
echo ✓ Node.js found

where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL not found. Please install from https://www.postgresql.org/
    echo After installation, make sure to add PostgreSQL bin directory to PATH
    goto :error_exit
)
echo ✓ PostgreSQL found

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Make sure you're in the project root directory.
    echo Current directory: %CD%
    goto :error_exit
)

if not exist "database\energy_mobile_dashboard.sql" (
    echo ❌ Database files not found. Make sure the database folder exists.
    goto :error_exit
)

echo ✓ Project files found

echo.
echo Step 2: Testing PostgreSQL connection...

REM Test basic connection
psql -d postgres -c "SELECT 1;" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Cannot connect to PostgreSQL.
    echo.
    echo This could be because:
    echo 1. PostgreSQL service is not running
    echo 2. Authentication is required
    echo 3. Default user/password needs to be set
    echo.
    echo Let's try to start PostgreSQL service...
    net start postgresql-x64-15 >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        net start postgresql-x64-14 >nul 2>nul
        if %ERRORLEVEL% NEQ 0 (
            net start postgresql-x64-13 >nul 2>nul
        )
    )
    
    echo Please try connecting manually:
    echo   psql -U postgres -d postgres
    echo.
    echo If that doesn't work, you may need to:
    echo 1. Set a password for postgres user
    echo 2. Check pg_hba.conf configuration
    echo 3. Restart PostgreSQL service
    echo.
    goto :error_exit
)

echo ✓ PostgreSQL connection successful

REM Set database name
set DB_NAME=energy_mobile_dashboard

echo.
echo Step 3: Creating database '%DB_NAME%'...

REM Try to create database
createdb %DB_NAME% 2>temp_error.log
if %ERRORLEVEL% NEQ 0 (
    REM Check if database already exists
    psql -d %DB_NAME% -c "SELECT 1;" >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to create database. Error details:
        type temp_error.log
        del temp_error.log
        goto :error_exit
    ) else (
        echo ✓ Database already exists and is accessible
    )
) else (
    echo ✓ Database created successfully
)

if exist temp_error.log del temp_error.log

echo.
echo Step 4: Setting up database schema...

psql -d %DB_NAME% -f database\energy_mobile_dashboard.sql >setup.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Database setup failed. Check setup.log for details:
    echo.
    type setup.log | findstr "ERROR"
    echo.
    echo Full log saved to setup.log
    goto :error_exit
)

echo ✓ Database schema created successfully

echo.
echo Step 5: Running validation...

psql -d %DB_NAME% -c "SELECT count(*) as user_count FROM users;" 2>nul | findstr /C:"5" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Validation failed - sample users not found
    goto :error_exit
)

echo ✓ Database validation passed

echo.
echo ============================================
echo ✅ DATABASE SETUP COMPLETED SUCCESSFULLY!
echo ============================================
echo.
echo Database: %DB_NAME%
echo Connection: postgresql://localhost:5432/%DB_NAME%
echo.
echo 🔑 Login Credentials (CHANGE FOR PRODUCTION):
echo   Admin: admin@energymobile.com / admin123
echo   Dispatcher: dispatcher@energymobile.com / dispatcher123
echo   Customer: customer@example.com / customer123
echo   Driver: driver1@energymobile.com / driver123
echo.
echo 📋 Next Steps:
echo 1. Install app dependencies: npm install
echo 2. Update src/config/config.js with database connection
echo 3. Create .env file with your database URL
echo 4. Run your React Native app: expo start
echo.
echo 🎉 Your Energy Mobile Dashboard database is ready!
echo ============================================

REM Clean up
if exist setup.log del setup.log
goto :end

:error_exit
echo.
echo ============================================
echo ❌ SETUP FAILED
echo ============================================
echo.
echo For help with common issues, run:
echo   database\troubleshoot-windows.bat
echo.
echo Or check the documentation:
echo   database\README.md
echo   database\DEPLOYMENT.md
echo.
pause
exit /b 1

:end
pause
