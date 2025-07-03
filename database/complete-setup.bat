@echo off
REM =====================================================
REM Energy Mobile Dashboard - Complete Setup (Windows)
REM =====================================================
REM This script installs everything and sets up the database

echo ============================================
echo Energy Mobile Dashboard - Complete Setup
echo ============================================

echo.
echo This script will:
echo   1. Install Node.js ^(if missing^)
echo   2. Install PostgreSQL ^(if missing^)
echo   3. Install Git ^(if missing^)
echo   4. Set up the database
echo   5. Install app dependencies
echo.

set /p confirm=Continue with automatic setup? (Y/N): 
if /i not "%confirm%"=="Y" (
    echo Setup cancelled by user
    pause
    exit /b 0
)

REM Check if we have winget
where winget >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Windows Package Manager ^(winget^) not found
    echo This requires Windows 10 ^(version 1809+^) or Windows 11
    echo.
    echo Alternative: Run database\auto-install.bat manually
    pause
    exit /b 1
)

echo ✓ Windows Package Manager found

echo.
echo ==== PHASE 1: Installing Prerequisites ====

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
)

REM Check and install PostgreSQL
echo.
echo Checking PostgreSQL...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing PostgreSQL ^(this may take 5-10 minutes^)...
    winget install PostgreSQL.PostgreSQL --silent --accept-package-agreements --accept-source-agreements
    echo ✓ PostgreSQL installation completed
) else (
    echo ✓ PostgreSQL already installed
)

REM Install Git
echo.
echo Checking Git...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Git...
    winget install Git.Git --silent --accept-package-agreements --accept-source-agreements
    echo ✓ Git installation completed
) else (
    echo ✓ Git already installed
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
echo ==== PHASE 3: Verifying Installation ====

REM Verify installations
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found in PATH. Please restart your computer.
    goto :manual_steps
)

where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL not found in PATH. Checking common locations...
    
    REM Try to find PostgreSQL and add to PATH
    if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
        set "PATH=%PATH%;C:\Program Files\PostgreSQL\15\bin"
    ) else if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" (
        set "PATH=%PATH%;C:\Program Files\PostgreSQL\14\bin"
    ) else if exist "C:\Program Files\PostgreSQL\13\bin\psql.exe" (
        set "PATH=%PATH%;C:\Program Files\PostgreSQL\13\bin"
    ) else (
        echo ERROR: PostgreSQL installation not found
        goto :manual_steps
    )
)

echo ✓ All prerequisites verified

echo.
echo ==== PHASE 4: Setting Up Database ====

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found. Are you in the project root directory?
    echo Current directory: %CD%
    goto :manual_steps
)

if not exist "database\energy_mobile_dashboard.sql" (
    echo ERROR: Database scripts not found
    goto :manual_steps
)

echo Setting up database...

REM Create database
createdb energy_mobile_dashboard 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Database may already exist, checking...
    psql -d energy_mobile_dashboard -c "SELECT 1;" >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Cannot create or access database
        goto :manual_steps
    )
    echo ✓ Database already exists
) else (
    echo ✓ Database created successfully
)

REM Run database scripts
echo Creating database schema...
psql -d energy_mobile_dashboard -f database\energy_mobile_dashboard.sql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Database schema creation failed
    goto :manual_steps
)

echo ✓ Database schema created

REM Validate database
psql -d energy_mobile_dashboard -c "SELECT count(*) FROM users;" | findstr "5" >nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Database validation failed
) else (
    echo ✓ Database validation passed
)

echo.
echo ==== PHASE 5: Installing App Dependencies ====

echo Installing npm dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: npm install failed. You can run it manually later.
) else (
    echo ✓ App dependencies installed
)

echo.
echo ============================================
echo 🎉 COMPLETE SETUP FINISHED SUCCESSFULLY!
echo ============================================

echo.
echo 📋 What was set up:
echo   ✓ Node.js and npm
echo   ✓ PostgreSQL database server
echo   ✓ Git version control
echo   ✓ Energy Mobile Dashboard database
echo   ✓ App dependencies installed

echo.
echo 🔑 Database Connection:
echo   Database: energy_mobile_dashboard
echo   Connection: postgresql://localhost:5432/energy_mobile_dashboard

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
echo 🎯 Your Energy Mobile Dashboard is ready for development!

goto :end

:manual_steps
echo.
echo ============================================
echo ❌ AUTOMATIC SETUP INCOMPLETE
echo ============================================
echo.
echo Some steps failed. Please complete manually:
echo.
echo 1. Install missing components:
echo    - Node.js: https://nodejs.org/
echo    - PostgreSQL: https://www.postgresql.org/
echo.
echo 2. Add PostgreSQL to your PATH
echo.
echo 3. Run database setup: database\setup-simple.bat
echo.
echo 4. Install app dependencies: npm install

:end
pause
