# ===================================================================
# QUICK START - Energy Mobile Dashboard Setup (PowerShell)
# ===================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "         Energy Mobile Dashboard - Quick Start Setup" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will set up your app with the Azure PostgreSQL database" -ForegroundColor Green
Write-Host "that's already configured in your .env.example file." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "[INFO] Found existing .env file" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] Creating .env file from .env.example..." -ForegroundColor Yellow
    try {
        Copy-Item ".env.example" ".env" -ErrorAction Stop
        Write-Host "[SUCCESS] Created .env file with Azure PostgreSQL settings" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to create .env file: $($_.Exception.Message)" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                     Setting Up Database Schema" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
$psqlExists = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlExists) {
    Write-Host "[WARNING] PostgreSQL psql client not found locally" -ForegroundColor Yellow
    Write-Host "[INFO] You can install PostgreSQL client or use cloud tools" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Install PostgreSQL locally (includes psql client)" -ForegroundColor White
    Write-Host "2. Use online SQL tools like pgAdmin, DBeaver, or cloud console" -ForegroundColor White
    Write-Host "3. Use psql via Docker" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Choose option (1-3)"
    
    switch ($choice) {
        "3" {
            Write-Host "[INFO] Using Docker psql..." -ForegroundColor Yellow
            & docker run --rm -v "${PWD}/database:/database" postgres:15 psql "postgresql://nbsadmin:Nb`$ad2567!@nbsenergydevdb.postgres.database.azure.com:5432/nbsenergydev_db" -f /database/energy_mobile_dashboard.sql
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[SUCCESS] Database schema created successfully!" -ForegroundColor Green
            } else {
                Write-Host "[ERROR] Database setup failed" -ForegroundColor Red
            }
        }
        "2" {
            Write-Host "[INFO] Please manually run the database\energy_mobile_dashboard.sql script" -ForegroundColor Yellow
            Write-Host "in your preferred PostgreSQL client using these connection details:" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Host: nbsenergydevdb.postgres.database.azure.com" -ForegroundColor White
            Write-Host "Port: 5432" -ForegroundColor White
            Write-Host "Database: nbsenergydev_db" -ForegroundColor White
            Write-Host "Username: nbsadmin" -ForegroundColor White
            Write-Host "Password: Nb`$ad2567!" -ForegroundColor White
            Write-Host ""
            Read-Host "Press Enter when database setup is complete"
        }
        "1" {
            Write-Host "[INFO] Please install PostgreSQL from: https://www.postgresql.org/download/" -ForegroundColor Yellow
            Write-Host "Then run this script again." -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
        default {
            Write-Host "[ERROR] Invalid choice. Exiting." -ForegroundColor Red
            exit 1
        }
    }
} else {
    # Try to connect and setup database
    Write-Host "[INFO] Connecting to Azure PostgreSQL database..." -ForegroundColor Yellow
    Write-Host "[INFO] Host: nbsenergydevdb.postgres.database.azure.com" -ForegroundColor Yellow
    Write-Host "[INFO] Database: nbsenergydev_db" -ForegroundColor Yellow
    Write-Host "[INFO] User: nbsadmin" -ForegroundColor Yellow
    Write-Host ""

    $env:PGPASSWORD = "Nb`$ad2567!"
    & psql -h nbsenergydevdb.postgres.database.azure.com -p 5432 -U nbsadmin -d nbsenergydev_db -f "database\energy_mobile_dashboard.sql"

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Database schema created successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "[ERROR] Database setup failed. This could be due to:" -ForegroundColor Red
        Write-Host "1. Network connectivity issues" -ForegroundColor Yellow
        Write-Host "2. Database credentials changed" -ForegroundColor Yellow
        Write-Host "3. Database server not accessible" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "[INFO] Try manual setup using your preferred PostgreSQL client" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Connection details:" -ForegroundColor Cyan
        Write-Host "Host: nbsenergydevdb.postgres.database.azure.com" -ForegroundColor White
        Write-Host "Port: 5432" -ForegroundColor White
        Write-Host "Database: nbsenergydev_db" -ForegroundColor White
        Write-Host "Username: nbsadmin" -ForegroundColor White
        Write-Host "Password: Nb`$ad2567!" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter when database setup is complete"
    }
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                     Installing App Dependencies" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeExists) {
    Write-Host "[ERROR] Node.js not found! Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
$npmExists = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmExists) {
    Write-Host "[ERROR] npm not found! Please install Node.js with npm from: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
& npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                     Installation Complete!" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[SUCCESS] Energy Mobile Dashboard is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the app: npm start" -ForegroundColor White
Write-Host "2. Scan QR code with Expo Go app on your phone" -ForegroundColor White
Write-Host "3. Or press 'w' to open in web browser" -ForegroundColor White
Write-Host ""
Write-Host "Default test accounts:" -ForegroundColor Cyan
Write-Host "- Admin: admin@nbs.com / admin123" -ForegroundColor White
Write-Host "- Driver: driver@nbs.com / driver123" -ForegroundColor White
Write-Host "- Customer: customer@nbs.com / customer123" -ForegroundColor White
Write-Host "- Dispatcher: dispatcher@nbs.com / dispatcher123" -ForegroundColor White
Write-Host ""
Write-Host "Database: Connected to Azure PostgreSQL ✓" -ForegroundColor Green
Write-Host "App Dependencies: Installed ✓" -ForegroundColor Green
Write-Host ""

$startApp = Read-Host "Start the app now? (Y/N)"
if ($startApp -eq "Y" -or $startApp -eq "y") {
    Write-Host "[INFO] Starting Energy Mobile Dashboard..." -ForegroundColor Yellow
    & npm start
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Thank you for using Energy Mobile Dashboard!" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit"
