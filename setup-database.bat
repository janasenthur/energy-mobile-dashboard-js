@echo off
echo.
echo ========================================
echo   Database Setup - Energy Dashboard
echo ========================================
echo.

REM Set database connection parameters
set PGHOST=nbsenergydevdb.postgres.database.azure.com
set PGPORT=5432
set PGDATABASE=nbsenergydev_db
set PGUSER=nbsadmin
set PGPASSWORD=Nb$ad2567!

echo Checking PostgreSQL client...
where psql >nul 2>&1
if errorlevel 1 (
    echo [ERROR] psql not found!
    echo [INFO] Please install PostgreSQL client tools
    echo [INFO] Or use Azure Data Studio to run the SQL scripts manually
    pause
    exit /b 1
)

echo [INFO] Connecting to: %PGHOST%:%PGPORT%/%PGDATABASE%
echo [INFO] User: %PGUSER%
echo.

echo Setting up database schema...
psql -c "\i database/energy_mobile_dashboard.sql"
if errorlevel 1 (
    echo [ERROR] Failed to setup database schema
    pause
    exit /b 1
)

echo.
echo Setting up test data...
psql -c "\i database/environment-config.sql"
if errorlevel 1 (
    echo [WARNING] Failed to setup test data (optional)
)

echo.
echo Running validations...
psql -c "\i database/validate-setup.sql"
if errorlevel 1 (
    echo [WARNING] Validation warnings (check output above)
)

echo.
echo ========================================
echo   Database Setup Complete!
echo ========================================
echo.
echo You can now start the backend server.
echo.
pause
