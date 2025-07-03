@echo off
REM =====================================================
REM Energy Mobile Dashboard - Troubleshooting Script
REM =====================================================
REM This script helps diagnose common setup issues

echo ============================================
echo Energy Mobile Dashboard - System Check
echo ============================================

echo.
echo === CHECKING SYSTEM REQUIREMENTS ===

REM Check Node.js
echo.
echo [1] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js NOT FOUND
    echo Download from: https://nodejs.org/
    echo Recommended version: 18.x or higher
) else (
    echo ✓ Node.js found
    node --version
)

REM Check npm
echo.
echo [2] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm NOT FOUND
    echo npm should come with Node.js
) else (
    echo ✓ npm found
    npm --version
)

REM Check PostgreSQL
echo.
echo [3] Checking PostgreSQL...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL psql NOT FOUND
    echo Download from: https://www.postgresql.org/download/windows/
    echo Make sure to add bin directory to PATH
    echo Common locations:
    echo   - C:\Program Files\PostgreSQL\15\bin
    echo   - C:\Program Files\PostgreSQL\14\bin
    echo   - C:\Program Files\PostgreSQL\13\bin
) else (
    echo ✓ PostgreSQL psql found
    psql --version
)

REM Check createdb
echo.
echo [4] Checking createdb command...
where createdb >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ createdb command NOT FOUND
    echo Add PostgreSQL bin directory to PATH
) else (
    echo ✓ createdb command found
)

REM Check PostgreSQL service
echo.
echo [5] Checking PostgreSQL service...
sc query postgresql-x64-15 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    sc query postgresql-x64-14 >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        sc query postgresql-x64-13 >nul 2>nul
        if %ERRORLEVEL% NEQ 0 (
            echo ❌ PostgreSQL service not found
            echo Make sure PostgreSQL is installed and service is running
        ) else (
            echo ✓ PostgreSQL 13 service found
        )
    ) else (
        echo ✓ PostgreSQL 14 service found
    )
) else (
    echo ✓ PostgreSQL 15 service found
)

echo.
echo === CHECKING PROJECT STRUCTURE ===

REM Check if in correct directory
echo.
echo [6] Checking current directory...
echo Current directory: %CD%
if not exist "package.json" (
    echo ❌ package.json not found
    echo Make sure you're in the project root directory
) else (
    echo ✓ package.json found
)

if not exist "database" (
    echo ❌ database folder not found
) else (
    echo ✓ database folder found
)

if not exist "database\energy_mobile_dashboard.sql" (
    echo ❌ Main database script not found
) else (
    echo ✓ Main database script found
)

echo.
echo === TESTING DATABASE CONNECTION ===

echo.
echo [7] Testing database connection...
psql -d postgres -c "SELECT version();" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Cannot connect to PostgreSQL
    echo Possible issues:
    echo   - PostgreSQL service not running
    echo   - Authentication problems
    echo   - Default database 'postgres' not accessible
    echo.
    echo Try running: pg_ctl start
    echo Or check Windows Services for PostgreSQL
) else (
    echo ✓ PostgreSQL connection successful
)

echo.
echo === CHECKING PATH ENVIRONMENT ===

echo.
echo [8] Current PATH includes:
echo %PATH% | findstr /i "postgresql"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL not found in PATH
    echo.
    echo To fix this:
    echo 1. Open System Properties ^> Advanced ^> Environment Variables
    echo 2. Edit PATH variable
    echo 3. Add PostgreSQL bin directory (e.g., C:\Program Files\PostgreSQL\15\bin)
    echo 4. Restart command prompt
) else (
    echo ✓ PostgreSQL found in PATH
)

echo.
echo === RECOMMENDATIONS ===

echo.
echo If you're seeing errors:
echo.
echo 1. INSTALL MISSING COMPONENTS:
echo    - Node.js: https://nodejs.org/ (LTS version)
echo    - PostgreSQL: https://www.postgresql.org/download/windows/
echo.
echo 2. ADD TO PATH:
echo    - PostgreSQL bin directory to system PATH
echo    - Restart command prompt after PATH changes
echo.
echo 3. START SERVICES:
echo    - Make sure PostgreSQL service is running
echo    - Use Windows Services or: net start postgresql-x64-15
echo.
echo 4. VERIFY INSTALLATION:
echo    - Open new command prompt
echo    - Run: node --version
echo    - Run: psql --version
echo    - Run: createdb --version
echo.
echo 5. DATABASE SETUP:
echo    - Run from project root directory
echo    - Make sure all database files exist
echo    - Check PostgreSQL is accepting connections
echo.

echo ============================================
echo System check completed!
echo ============================================

pause
