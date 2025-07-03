@echo off
REM ===================================================================
REM DIAGNOSTIC SCRIPT - Energy Mobile Dashboard
REM ===================================================================
echo.
echo =================================================================
echo         Energy Mobile Dashboard - System Diagnostics
echo =================================================================
echo.
echo Running comprehensive system check...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo [INFO] Please run this script from the project root directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo [INFO] Project directory: %CD%
echo.

echo =================================================================
echo                     Environment Check
echo =================================================================

REM Check Node.js
echo [1/6] Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo [SOLUTION] Install from: https://nodejs.org/
) else (
    echo [OK] Node.js found
    node --version
)

REM Check npm
echo.
echo [2/6] Checking npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found!
    echo [SOLUTION] Reinstall Node.js with npm
) else (
    echo [OK] npm found
    npm --version
)

REM Check PostgreSQL client
echo.
echo [3/6] Checking PostgreSQL client...
where psql >nul 2>&1
if errorlevel 1 (
    echo [INFO] psql not found (OK for cloud setup)
    echo [INFO] You can use Azure Data Studio or other PostgreSQL clients
) else (
    echo [OK] psql found
    psql --version
)

REM Check project files
echo.
echo [4/6] Checking project files...
if exist "package.json" (
    echo [OK] package.json exists
) else (
    echo [ERROR] package.json missing!
)

if exist ".env" (
    echo [OK] .env file exists
) else (
    echo [INFO] .env file missing - will create from .env.example
)

if exist ".env.example" (
    echo [OK] .env.example exists
) else (
    echo [ERROR] .env.example missing!
)

if exist "node_modules" (
    echo [OK] node_modules directory exists
) else (
    echo [INFO] node_modules missing - run 'npm install'
)

if exist "database\energy_mobile_dashboard.sql" (
    echo [OK] Database schema file exists
) else (
    echo [ERROR] Database schema missing!
)

REM Check network connectivity
echo.
echo [5/6] Checking network connectivity...
echo [INFO] Testing Azure PostgreSQL server connectivity...
ping -n 1 nbsenergydevdb.postgres.database.azure.com >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Cannot reach Azure PostgreSQL server
    echo [INFO] Check your internet connection and firewall settings
) else (
    echo [OK] Azure PostgreSQL server is reachable
)

REM Test database connection
echo.
echo [6/6] Testing database connection...
if exist ".env" (
    echo [INFO] Found .env file - checking database connection...
    
    REM Try to connect to database if psql is available
    where psql >nul 2>&1
    if not errorlevel 1 (
        echo [INFO] Attempting database connection test...
        set PGPASSWORD=Nb$ad2567!
        psql -h nbsenergydevdb.postgres.database.azure.com -p 5432 -U nbsadmin -d nbsenergydev_db -c "SELECT 1;" >nul 2>&1
        if errorlevel 1 (
            echo [WARNING] Database connection test failed
            echo [INFO] Possible causes:
            echo   - Firewall blocking connection
            echo   - SSL configuration issue
            echo   - Credentials incorrect
            echo   - Server maintenance
        ) else (
            echo [OK] Database connection successful!
        )
    ) else (
        echo [INFO] Cannot test database connection without psql client
        echo [INFO] You can test manually using Azure Data Studio
    )
) else (
    echo [INFO] No .env file found - database not configured yet
)

echo.
echo =================================================================
echo                     Diagnostic Summary
echo =================================================================
echo.

REM Determine next steps based on findings
set NEEDS_NODE=0
set NEEDS_NPM_INSTALL=0
set NEEDS_ENV=0

where node >nul 2>&1
if errorlevel 1 set NEEDS_NODE=1

if not exist "node_modules" set NEEDS_NPM_INSTALL=1
if not exist ".env" set NEEDS_ENV=1

if %NEEDS_NODE%==1 (
    echo [NEXT STEP] Install Node.js from: https://nodejs.org/
    echo [NEXT STEP] Restart command prompt after installation
    goto :recommendations
)

if %NEEDS_ENV%==1 (
    echo [NEXT STEP] Run: quick-start.bat (for automated setup)
    echo [NEXT STEP] Or manually: copy .env.example .env
    goto :recommendations
)

if %NEEDS_NPM_INSTALL%==1 (
    echo [NEXT STEP] Run: npm install
    goto :recommendations
)

echo [SUCCESS] Your environment looks good!
echo [NEXT STEP] Run: npm start
echo [NEXT STEP] Or run: quick-start.bat (for first-time setup)

:recommendations
echo.
echo =================================================================
echo                     Recommendations
echo =================================================================
echo.
echo For complete setup and testing:
echo 1. Run: quick-start.bat (automated setup)
echo 2. Read: DEBUG-GUIDE.md (troubleshooting)
echo 3. Read: QUICK-START.md (detailed instructions)
echo 4. Read: TESTING-GUIDE.md (testing procedures)
echo.
echo Test accounts (after setup):
echo - Admin: admin@nbs.com / admin123
echo - Driver: driver@nbs.com / driver123
echo - Customer: customer@nbs.com / customer123
echo - Dispatcher: dispatcher@nbs.com / dispatcher123
echo.

echo =================================================================
echo Diagnostic complete! Check the results above.
echo =================================================================
pause
