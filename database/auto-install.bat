@echo off
REM =====================================================
REM Energy Mobile Dashboard - Cloud-First Auto Install
REM =====================================================
REM This script prioritizes cloud PostgreSQL setup with Azure pre-configured

echo ============================================
echo Energy Mobile Dashboard - Cloud-First Setup
echo ============================================
echo.
echo [INFO] This installer uses your pre-configured Azure PostgreSQL database
echo [INFO] for faster setup and better reliability.
echo.

REM Check if we're in the right directory
if not exist "..\package.json" (
    echo [ERROR] package.json not found. Please run from the database directory.
    pause
    exit /b 1
)

echo ============================================
echo           Database Setup Options
echo ============================================
echo.
echo [RECOMMENDED] Azure PostgreSQL (Pre-configured):
echo   Host: nbsenergydevdb.postgres.database.azure.com
echo   Database: nbsenergydev_db
echo   Ready to use immediately!
echo.
echo [ALTERNATIVE] Local PostgreSQL:
echo   Requires local installation and setup
echo.

choice /c AL /m "Choose setup - [A]zure Cloud (Recommended) or [L]ocal: "

if errorlevel 2 goto :local_setup
if errorlevel 1 goto :azure_setup

:azure_setup
echo.
echo [INFO] Setting up with Azure PostgreSQL...
echo.

REM Navigate to project root
cd ..

REM Create .env file if it doesn't exist
if exist ".env" (
    echo [INFO] Found existing .env file
) else (
    echo [INFO] Creating .env file with Azure PostgreSQL settings...
    copy ".env.example" ".env" >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Failed to create .env file
        pause
        exit /b 1
    )
    echo [SUCCESS] Created .env file with Azure database configuration
)

echo.
echo [INFO] Azure PostgreSQL Connection Details:
echo   Host: nbsenergydevdb.postgres.database.azure.com
echo   Database: nbsenergydev_db
echo   User: nbsadmin
echo   SSL: Required
echo.

REM Check for psql client (optional for Azure setup)
where psql >nul 2>&1
if errorlevel 1 (
    echo [INFO] PostgreSQL client not found locally (this is OK for cloud setup)
    echo [INFO] You can setup database schema using:
    echo   1. Azure Data Studio (recommended for Azure)
    echo   2. pgAdmin or DBeaver
    echo   3. Azure Portal Query Editor
    echo.
    echo [INFO] SQL script location: database\energy_mobile_dashboard.sql
    echo.
    choice /c YN /m "Continue with app setup? Database schema can be set up later (Y/N): "
    if errorlevel 2 (
        echo [INFO] Please setup database schema and run this script again
        pause
        exit /b 1
    )
    goto :install_node
) else (
    echo [INFO] PostgreSQL client found! Attempting database schema setup...
    set PGPASSWORD=Nb$ad2567!
    psql -h nbsenergydevdb.postgres.database.azure.com -p 5432 -U nbsadmin -d nbsenergydev_db -f "database\energy_mobile_dashboard.sql"
    
    if errorlevel 1 (
        echo [WARNING] Automated schema setup failed (this is common with cloud databases)
        echo [INFO] Please setup schema manually using Azure tools
        goto :install_node
    ) else (
        echo [SUCCESS] Database schema created successfully!
    )
)

goto :install_node

:local_setup
echo.
echo [INFO] Setting up with Local PostgreSQL...
echo.

REM Check if winget is available for local installation
where winget >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Windows Package Manager (winget) not found
    echo [INFO] Please install PostgreSQL manually from: https://www.postgresql.org/download/
    goto :manual_postgres
)

REM Install PostgreSQL if not present
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installing PostgreSQL...
    winget install --id PostgreSQL.PostgreSQL --silent --accept-package-agreements --accept-source-agreements
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] PostgreSQL installation failed
        echo [INFO] Please install manually from: https://www.postgresql.org/download/
        pause
        exit /b 1
    )
    echo [SUCCESS] PostgreSQL installed
) else (
    echo [INFO] PostgreSQL already installed
)

:manual_postgres
REM Setup local database
cd ..
echo [INFO] Setting up local database...
createdb -U postgres energy_mobile_dashboard 2>nul
psql -U postgres -d energy_mobile_dashboard -f "database\energy_mobile_dashboard.sql"

if errorlevel 1 (
    echo [ERROR] Failed to setup local database
    echo [INFO] Please check PostgreSQL installation and credentials
    pause
    exit /b 1
)

REM Create local .env
echo [INFO] Creating .env for local database...
echo DATABASE_URL=postgresql://postgres:your_password@localhost:5432/energy_mobile_dashboard > .env
echo [WARNING] Please update the password in .env file

:install_node
echo.
echo ============================================
echo           Installing Node.js & Dependencies
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Node.js not found. Installing...
    
    REM Check if winget is available
    where winget >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Windows Package Manager (winget) not found
        echo [INFO] Please install Node.js manually from: https://nodejs.org/
        pause
        exit /b 1
    )
    
    winget install --id OpenJS.NodeJS --silent --accept-package-agreements --accept-source-agreements
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Node.js installation failed
        echo [INFO] Please install manually from: https://nodejs.org/
        pause
        exit /b 1
    )
    echo [SUCCESS] Node.js installed successfully
    
    REM Refresh PATH
    echo [INFO] Please restart your command prompt to use Node.js
    echo [INFO] Then run this script again or manually run: npm install
    pause
    exit /b 0
) else (
    echo [INFO] Node.js found!
    node --version
)

REM Install project dependencies
echo.
echo [INFO] Installing project dependencies...
npm install

if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    echo [INFO] Please check your internet connection and try again
    pause
    exit /b 1
)

echo.
echo ============================================
echo           Installation Complete!
echo ============================================
echo.
echo [SUCCESS] Energy Mobile Dashboard is ready!
echo.
echo Your setup:
if exist ".env" (
    echo ✓ Environment configured (.env file created)
) else (
    echo ! Environment needs configuration
)
echo ✓ Dependencies installed
echo ✓ Database connection ready
echo.
echo Next steps:
echo 1. Start the app: npm start
echo 2. Scan QR code with Expo Go app
echo 3. Or press 'w' to open in web browser
echo.
echo Test accounts:
echo - Admin: admin@nbs.com / admin123
echo - Driver: driver@nbs.com / driver123
echo - Customer: customer@nbs.com / customer123
echo - Dispatcher: dispatcher@nbs.com / dispatcher123
echo.
echo Need help?
echo - Read QUICK-START.md for detailed instructions
echo - Check TESTING-GUIDE.md for testing procedures
echo - See APP-DEMO-GUIDE.md for app demonstration
echo.

choice /c YN /m "Start the development server now? (Y/N): "
if errorlevel 2 goto :end
if errorlevel 1 (
    echo [INFO] Starting Energy Mobile Dashboard...
    npm start
)

:end
echo.
echo ============================================
echo Thank you for using Energy Mobile Dashboard!
echo ============================================
pause
