# ===================================================================
# DIAGNOSTIC SCRIPT - Energy Mobile Dashboard (PowerShell)
# ===================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "         Energy Mobile Dashboard - System Diagnostics" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Running comprehensive system check..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json not found!" -ForegroundColor Red
    Write-Host "[INFO] Please run this script from the project root directory" -ForegroundColor Yellow
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[INFO] Project directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                     Environment Check" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Check Node.js
Write-Host "[1/7] Checking Node.js..." -ForegroundColor Yellow
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeExists) {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "[SOLUTION] Install from: https://nodejs.org/" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Node.js found" -ForegroundColor Green
    $nodeVersion = & node --version
    Write-Host "Version: $nodeVersion" -ForegroundColor White
}

# Check npm
Write-Host ""
Write-Host "[2/7] Checking npm..." -ForegroundColor Yellow
$npmExists = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmExists) {
    Write-Host "[ERROR] npm not found!" -ForegroundColor Red
    Write-Host "[SOLUTION] Reinstall Node.js with npm" -ForegroundColor Yellow
} else {
    Write-Host "[OK] npm found" -ForegroundColor Green
    $npmVersion = & npm --version
    Write-Host "Version: $npmVersion" -ForegroundColor White
}

# Check PostgreSQL client
Write-Host ""
Write-Host "[3/7] Checking PostgreSQL client..." -ForegroundColor Yellow
$psqlExists = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlExists) {
    Write-Host "[INFO] psql not found (OK for cloud setup)" -ForegroundColor Yellow
    Write-Host "[INFO] You can use Azure Data Studio or other PostgreSQL clients" -ForegroundColor Yellow
} else {
    Write-Host "[OK] psql found" -ForegroundColor Green
    $psqlVersion = & psql --version
    Write-Host "Version: $psqlVersion" -ForegroundColor White
}

# Check Expo CLI
Write-Host ""
Write-Host "[4/7] Checking Expo CLI..." -ForegroundColor Yellow
$expoExists = Get-Command expo -ErrorAction SilentlyContinue
if (-not $expoExists) {
    Write-Host "[INFO] Expo CLI not found globally" -ForegroundColor Yellow
    Write-Host "[INFO] Will use npx expo (recommended)" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Expo CLI found" -ForegroundColor Green
    try {
        $expoVersion = & expo --version
        Write-Host "Version: $expoVersion" -ForegroundColor White
    } catch {
        Write-Host "Could not get version" -ForegroundColor Yellow
    }
}

# Check project files
Write-Host ""
Write-Host "[5/7] Checking project files..." -ForegroundColor Yellow

$projectFiles = @{
    "package.json" = "Project configuration"
    ".env" = "Environment variables"
    ".env.example" = "Environment template"
    "node_modules" = "Dependencies"
    "database\energy_mobile_dashboard.sql" = "Database schema"
    "App.js" = "Main app file"
    "src" = "Source code directory"
}

foreach ($file in $projectFiles.Keys) {
    if (Test-Path $file) {
        Write-Host "[OK] $file exists - $($projectFiles[$file])" -ForegroundColor Green
    } else {
        if ($file -eq ".env") {
            Write-Host "[INFO] $file missing - will create from .env.example" -ForegroundColor Yellow
        } elseif ($file -eq "node_modules") {
            Write-Host "[INFO] $file missing - run 'npm install'" -ForegroundColor Yellow
        } else {
            Write-Host "[ERROR] $file missing - $($projectFiles[$file])" -ForegroundColor Red
        }
    }
}

# Check network connectivity
Write-Host ""
Write-Host "[6/7] Checking network connectivity..." -ForegroundColor Yellow
Write-Host "[INFO] Testing Azure PostgreSQL server connectivity..." -ForegroundColor Yellow

try {
    $connection = Test-NetConnection -ComputerName "nbsenergydevdb.postgres.database.azure.com" -Port 5432 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "[OK] Azure PostgreSQL server is reachable" -ForegroundColor Green
        Write-Host "Response time: $($connection.PingReplyDetails.RoundtripTime)ms" -ForegroundColor White
    } else {
        Write-Host "[WARNING] Cannot reach Azure PostgreSQL server on port 5432" -ForegroundColor Red
        Write-Host "[INFO] Check your internet connection and firewall settings" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Network connectivity test failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test database connection
Write-Host ""
Write-Host "[7/7] Testing database connection..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "[INFO] Found .env file - checking database connection..." -ForegroundColor Yellow
    
    if ($psqlExists) {
        Write-Host "[INFO] Attempting database connection test..." -ForegroundColor Yellow
        $env:PGPASSWORD = "Nb`$ad2567!"
        
        try {
            $result = & psql -h nbsenergydevdb.postgres.database.azure.com -p 5432 -U nbsadmin -d nbsenergydev_db -c "SELECT version();" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Database connection successful!" -ForegroundColor Green
                Write-Host "PostgreSQL version detected" -ForegroundColor White
            } else {
                Write-Host "[WARNING] Database connection test failed" -ForegroundColor Red
                Write-Host "[INFO] Possible causes:" -ForegroundColor Yellow
                Write-Host "  - Firewall blocking connection" -ForegroundColor Yellow
                Write-Host "  - SSL configuration issue" -ForegroundColor Yellow
                Write-Host "  - Credentials incorrect" -ForegroundColor Yellow
                Write-Host "  - Server maintenance" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "[WARNING] Database connection test error" -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
        } finally {
            Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "[INFO] Cannot test database connection without psql client" -ForegroundColor Yellow
        Write-Host "[INFO] You can test manually using Azure Data Studio" -ForegroundColor Yellow
    }
} else {
    Write-Host "[INFO] No .env file found - database not configured yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                     Diagnostic Summary" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Determine next steps based on findings
$needsNode = -not $nodeExists
$needsNpmInstall = -not (Test-Path "node_modules")
$needsEnv = -not (Test-Path ".env")

if ($needsNode) {
    Write-Host "[NEXT STEP] Install Node.js from: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "[NEXT STEP] Restart PowerShell after installation" -ForegroundColor Cyan
} elseif ($needsEnv) {
    Write-Host "[NEXT STEP] Run: .\quick-start.ps1 (for automated setup)" -ForegroundColor Cyan
    Write-Host "[NEXT STEP] Or manually: Copy-Item '.env.example' '.env'" -ForegroundColor Cyan
} elseif ($needsNpmInstall) {
    Write-Host "[NEXT STEP] Run: npm install" -ForegroundColor Cyan
} else {
    Write-Host "[SUCCESS] Your environment looks good!" -ForegroundColor Green
    Write-Host "[NEXT STEP] Run: npm start" -ForegroundColor Cyan
    Write-Host "[NEXT STEP] Or run: .\quick-start.ps1 (for first-time setup)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                     Recommendations" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For complete setup and testing:" -ForegroundColor Green
Write-Host "1. Run: .\quick-start.ps1 (automated setup)" -ForegroundColor White
Write-Host "2. Read: DEBUG-GUIDE.md (troubleshooting)" -ForegroundColor White
Write-Host "3. Read: QUICK-START.md (detailed instructions)" -ForegroundColor White
Write-Host "4. Read: TESTING-GUIDE.md (testing procedures)" -ForegroundColor White
Write-Host ""
Write-Host "Test accounts (after setup):" -ForegroundColor Green
Write-Host "- Admin: admin@nbs.com / admin123" -ForegroundColor White
Write-Host "- Driver: driver@nbs.com / driver123" -ForegroundColor White
Write-Host "- Customer: customer@nbs.com / customer123" -ForegroundColor White
Write-Host "- Dispatcher: dispatcher@nbs.com / dispatcher123" -ForegroundColor White
Write-Host ""

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Diagnostic complete! Check the results above." -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit"
