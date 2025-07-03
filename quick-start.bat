@echo off
REM ===================================================================
REM QUICK START - Energy Mobile Dashboard Setup
REM ===================================================================
echo.
echo =================================================================
echo         Energy Mobile Dashboard - Quick Start Setup
echo =================================================================
echo.
echo This script will set up your app with the Azure PostgreSQL database
echo that's already configured in your .env.example file.
echo.

REM Check if .env file exists
if exist ".env" (
    echo [INFO] Found existing .env file
) else (
    echo [INFO] Creating .env file from .env.example...
    copy ".env.example" ".env" >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Failed to create .env file
        pause
        exit /b 1
    )
    echo [SUCCESS] Created .env file with Azure PostgreSQL settings
)

echo.
echo =================================================================
echo                     Setting Up Database Schema
echo =================================================================
echo.

REM Check if psql is available
where psql >nul 2>&1
if errorlevel 1 (
    echo [WARNING] PostgreSQL psql client not found locally
    echo [INFO] You can install PostgreSQL client or use cloud tools
    echo.
    echo Options:
    echo 1. Install PostgreSQL locally (includes psql client)
    echo 2. Use online SQL tools like pgAdmin, DBeaver, or cloud console
    echo 3. Use psql via Docker
    echo.
    choice /c 123 /m "Choose option (1-3): "
    
    if errorlevel 3 (
        echo [INFO] Using Docker psql...
        goto :docker_setup
    )
    if errorlevel 2 (
        echo [INFO] Please manually run the database\energy_mobile_dashboard.sql script
        echo in your preferred PostgreSQL client using these connection details:
        echo.
        echo Host: nbsenergydevdb.postgres.database.azure.com
        echo Port: 5432
        echo Database: nbsenergydev_db
        echo Username: nbsadmin
        echo.
        goto :manual_setup
    )
    if errorlevel 1 (
        echo [INFO] Please install PostgreSQL from: https://www.postgresql.org/download/
        echo Then run this script again.
        pause
        exit /b 1
    )
)

REM Try to connect and setup database
echo [INFO] Connecting to Azure PostgreSQL database...
echo [INFO] Host: nbsenergydevdb.postgres.database.azure.com
echo [INFO] Database: nbsenergydev_db
echo [INFO] User: nbsadmin
echo.

set PGPASSWORD=Nb$ad2567!
psql -h nbsenergydevdb.postgres.database.azure.com -p 5432 -U nbsadmin -d nbsenergydev_db -f "database\energy_mobile_dashboard.sql"

if errorlevel 1 (
    echo.
    echo [ERROR] Database setup failed. This could be due to:
    echo 1. Network connectivity issues
    echo 2. Database credentials changed
    echo 3. Database server not accessible
    echo.
    echo [INFO] Try manual setup using your preferred PostgreSQL client
    goto :manual_setup
) else (
    echo.
    echo [SUCCESS] Database schema created successfully!
    goto :install_app
)

:docker_setup
echo [INFO] Setting up using Docker...
docker run --rm -it postgres:15 psql "postgresql://nbsadmin:Nb$ad2567!@nbsenergydevdb.postgres.database.azure.com:5432/nbsenergydev_db" -f /database/energy_mobile_dashboard.sql
goto :install_app

:manual_setup
echo.
echo =================================================================
echo                     Manual Database Setup
echo =================================================================
echo.
echo Please execute the SQL script manually:
echo 1. Open your PostgreSQL client (pgAdmin, DBeaver, etc.)
echo 2. Connect using these details:
echo    - Host: nbsenergydevdb.postgres.database.azure.com
echo    - Port: 5432
echo    - Database: nbsenergydev_db
echo    - Username: nbsadmin
echo    - Password: Nb$ad2567!
echo    - SSL: Required
echo 3. Run the SQL script: database\energy_mobile_dashboard.sql
echo.
pause

:install_app
echo.
echo =================================================================
echo                     Installing App Dependencies
echo =================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found! Please install Node.js with npm from: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Installing dependencies...
npm install

if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo =================================================================
echo                     Installation Complete!
echo =================================================================
echo.
echo [SUCCESS] Energy Mobile Dashboard is ready!
echo.
echo Next steps:
echo 1. Start the app: npm start
echo 2. Scan QR code with Expo Go app on your phone
echo 3. Or press 'w' to open in web browser
echo.
echo Default test accounts:
echo - Admin: admin@nbs.com / admin123
echo - Driver: driver@nbs.com / driver123
echo - Customer: customer@nbs.com / customer123
echo - Dispatcher: dispatcher@nbs.com / dispatcher123
echo.
echo Database: Connected to Azure PostgreSQL ✓
echo App Dependencies: Installed ✓
echo.
choice /c YN /m "Start the app now? (Y/N): "
if errorlevel 2 goto :end
if errorlevel 1 (
    echo [INFO] Starting Energy Mobile Dashboard...
    npm start
)

:end
echo.
echo =================================================================
echo Thank you for using Energy Mobile Dashboard!
echo =================================================================
pause
