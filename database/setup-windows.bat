@echo off
REM =====================================================
REM Energy Mobile Dashboard - Database Setup (Windows)
REM =====================================================
REM This script sets up the PostgreSQL database for the Energy Mobile Dashboard app

echo ============================================
echo Energy Mobile Dashboard - Database Setup
echo ============================================

REM Check if Node.js is installed
echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo ✓ Node.js found
    node --version
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed or not in PATH
    echo npm should come with Node.js installation
    echo.
    pause
    exit /b 1
) else (
    echo ✓ npm found
    npm --version
)

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    echo Make sure to add PostgreSQL bin directory to your PATH
    echo Common location: C:\Program Files\PostgreSQL\15\bin
    echo.
    pause
    exit /b 1
) else (
    echo ✓ PostgreSQL found
    psql --version
)

REM Check if createdb command is available
where createdb >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: createdb command not found
    echo This means PostgreSQL command line tools are not in PATH
    echo Please add PostgreSQL bin directory to your PATH
    echo.
    pause
    exit /b 1
) else (
    echo ✓ PostgreSQL createdb found
)

echo.
echo All prerequisites found - proceeding with setup...

REM Set database name
set DB_NAME=energy_mobile_dashboard

echo.
echo Creating database: %DB_NAME%
createdb %DB_NAME% 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Database creation failed - checking if it already exists...
    psql -d %DB_NAME% -c "SELECT 'Database exists and is accessible';" >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Cannot create or access database %DB_NAME%
        echo This might be due to:
        echo 1. PostgreSQL service not running
        echo 2. Authentication issues
        echo 3. Insufficient permissions
        echo.
        echo Try running: pg_ctl start
        echo Or check PostgreSQL service in Windows Services
        pause
        exit /b 1
    ) else (
        echo ✓ Database %DB_NAME% already exists and is accessible
    )
) else (
    echo ✓ Database %DB_NAME% created successfully
)

echo.
echo Checking if database files exist...
if not exist "database\setup-database.sql" (
    echo ERROR: database\setup-database.sql not found
    echo Make sure you're running this script from the project root directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

if not exist "database\energy_mobile_dashboard.sql" (
    echo ERROR: database\energy_mobile_dashboard.sql not found
    echo Make sure you're running this script from the project root directory
    pause
    exit /b 1
)

echo.
echo Setting up database schema...
psql -d %DB_NAME% -f database\setup-database.sql 2>error.log
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Setup script failed
    echo Check error.log for details
    type error.log
    pause
    exit /b 1
) else (
    echo ✓ Database schema setup completed
)

echo.
echo Creating tables and inserting sample data...
psql -d %DB_NAME% -f database\energy_mobile_dashboard.sql 2>>error.log
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Main schema script failed
    echo Check error.log for details
    type error.log
    pause
    exit /b 1
) else (
    echo ✓ Tables created and sample data inserted
)

echo.
echo Configuring environment settings...
psql -d %DB_NAME% -f database\environment-config.sql 2>>error.log
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Environment config failed - continuing...
    echo Check error.log for details
) else (
    echo ✓ Environment settings configured
)

echo.
echo Validating database setup...
psql -d %DB_NAME% -f database\validate-setup.sql 2>>error.log
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Validation script had issues
    echo Check error.log for details
) else (
    echo ✓ Database validation completed successfully
)

echo.
echo ============================================
echo Database setup completed successfully! ✓
echo ============================================
echo.
echo Database Name: %DB_NAME%
echo Connection: postgresql://app_user:password@localhost:5432/%DB_NAME%
echo.
echo Default Login Credentials:
echo - Admin: admin@energymobile.com / admin123
echo - Dispatcher: dispatcher@energymobile.com / dispatcher123
echo - Customer: customer@example.com / customer123
echo - Driver 1: driver1@energymobile.com / driver123
echo - Driver 2: driver2@energymobile.com / driver123
echo.
echo IMPORTANT: Change these passwords before production deployment!
echo.
echo Next steps:
echo 1. Update your mobile app configuration with database details
echo 2. Install app dependencies: npm install
echo 3. Configure environment variables in .env file
echo 4. Test the API connection
echo 5. Change default passwords for production
echo ============================================
echo.
echo Cleaning up temporary files...
if exist error.log del error.log
echo Setup completed! You can now run your React Native app.
echo.

pause
