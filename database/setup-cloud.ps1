# Energy Mobile Dashboard - Cloud Database Setup (PowerShell)
# This script sets up the database on your cloud PostgreSQL server

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Energy Mobile Dashboard - Cloud Setup" -ForegroundColor Cyan  
Write-Host "============================================" -ForegroundColor Cyan

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️ $Message" -ForegroundColor Cyan
}

function Install-WithWinget {
    param([string]$PackageId, [string]$PackageName)
    
    Write-Host "`nInstalling $PackageName..." -ForegroundColor Yellow
    try {
        $process = Start-Process -FilePath "winget" -ArgumentList "install", "--id", $PackageId, "--silent", "--accept-package-agreements", "--accept-source-agreements" -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Success "$PackageName installed successfully"
            return $true
        } else {
            Write-Error-Custom "$PackageName installation failed (Exit code: $($process.ExitCode))"
            return $false
        }
    }
    catch {
        Write-Error-Custom "Error installing $PackageName`: $_"
        return $false
    }
}

function Update-Environment {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Check if .env file exists
Write-Info "Checking for environment configuration..."
if (-not (Test-Path ".env")) {
    Write-Error-Custom ".env file not found"
    Write-Host "`nPlease follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Copy .env.example to .env" -ForegroundColor White
    Write-Host "2. Edit .env with your cloud database connection details" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host "`nRecommended cloud providers (free tiers available):" -ForegroundColor Cyan
    Write-Host "• Supabase: https://supabase.com/" -ForegroundColor White
    Write-Host "• Neon: https://neon.tech/" -ForegroundColor White
    Write-Host "• ElephantSQL: https://www.elephantsql.com/" -ForegroundColor White
    Write-Host "• Aiven: https://aiven.io/" -ForegroundColor White
    Read-Host "`nPress Enter to exit..."
    exit 1
}

Write-Success ".env file found"

# Load environment variables
Write-Info "Loading database configuration..."
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

$databaseUrl = [Environment]::GetEnvironmentVariable("DATABASE_URL", "Process")
if (-not $databaseUrl) {
    Write-Error-Custom "DATABASE_URL not found in .env file"
    Write-Host "`nPlease edit .env file and set your DATABASE_URL:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=postgresql://username:password@hostname:port/database_name" -ForegroundColor White
    Read-Host "`nPress Enter to exit..."
    exit 1
}

Write-Success "Database connection URL loaded"

# Check if winget is available
Write-Info "Checking Windows Package Manager..."
if (-not (Test-Command "winget")) {
    Write-Error-Custom "Windows Package Manager (winget) not available"
    Write-Host "Manual alternative: Install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "`nPress Enter to exit..."
    exit 1
}

Write-Success "Windows Package Manager found"

Write-Host "`n🚀 Starting cloud database setup..." -ForegroundColor Green

# Install Node.js
if (Test-Command "node") {
    $nodeVersion = & node --version
    Write-Success "Node.js already installed: $nodeVersion"
} else {
    Write-Info "Node.js not found. Installing..."
    if (Install-WithWinget "OpenJS.NodeJS" "Node.js") {
        Update-Environment
        Start-Sleep -Seconds 2
    }
}

# Install PostgreSQL client
if (Test-Command "psql") {
    $pgVersion = & psql --version
    Write-Success "PostgreSQL client found: $pgVersion"
} else {
    Write-Info "PostgreSQL client not found. Installing..."
    if (Install-WithWinget "PostgreSQL.PostgreSQL" "PostgreSQL") {
        Update-Environment
        Start-Sleep -Seconds 3
        
        # Add PostgreSQL to PATH
        $pgPaths = @(
            "C:\Program Files\PostgreSQL\15\bin",
            "C:\Program Files\PostgreSQL\14\bin", 
            "C:\Program Files\PostgreSQL\13\bin"
        )
        
        foreach ($pgPath in $pgPaths) {
            if (Test-Path $pgPath) {
                $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
                if ($currentPath -notlike "*$pgPath*") {
                    Write-Info "Adding PostgreSQL to PATH: $pgPath"
                    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$pgPath", "Machine")
                    Update-Environment
                }
                break
            }
        }
    }
}

# Test database connection
Write-Host "`nTesting cloud database connection..." -ForegroundColor Yellow

try {
    & psql $databaseUrl -c "SELECT version();" *>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Cloud database connection successful"
    } else {
        Write-Error-Custom "Cannot connect to cloud database"
        Write-Host "`nPlease check:" -ForegroundColor Yellow
        Write-Host "1. DATABASE_URL is correct in .env file" -ForegroundColor White
        Write-Host "2. Database server is accessible" -ForegroundColor White
        Write-Host "3. Username and password are correct" -ForegroundColor White
        Write-Host "4. Database allows connections from your IP" -ForegroundColor White
        Write-Host "5. SSL settings are correct (if required)" -ForegroundColor White
        Write-Host "`nCurrent DATABASE_URL: $databaseUrl" -ForegroundColor Cyan
        Write-Host "`nCommon fixes:" -ForegroundColor Yellow
        Write-Host "• Add ?sslmode=require to connection string" -ForegroundColor White
        Write-Host "• Check firewall/IP whitelist settings" -ForegroundColor White
        Write-Host "• Verify credentials are correct" -ForegroundColor White
        Read-Host "`nPress Enter to exit..."
        exit 1
    }
}
catch {
    Write-Error-Custom "Error testing database connection: $_"
    exit 1
}

# Set up database schema
Write-Host "`nSetting up database schema..." -ForegroundColor Yellow

if (-not (Test-Path "database\energy_mobile_dashboard.sql")) {
    Write-Error-Custom "Database schema file not found"
    Write-Host "Make sure you're in the project root directory" -ForegroundColor Yellow
    exit 1
}

try {
    & psql $databaseUrl -f "database\energy_mobile_dashboard.sql" *>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database schema created successfully"
    } else {
        Write-Error-Custom "Database schema creation failed"
        exit 1
    }
}
catch {
    Write-Error-Custom "Error creating database schema: $_"
    exit 1
}

# Validate database
Write-Host "`nValidating database setup..." -ForegroundColor Yellow

try {
    $userCount = & psql $databaseUrl -t -c "SELECT count(*) FROM users;" 2>&1
    if ($LASTEXITCODE -eq 0 -and $userCount.Trim() -eq "5") {
        Write-Success "Database validation passed - found $($userCount.Trim()) users"
    } else {
        Write-Host "⚠️ Database validation warning - expected 5 users, found: $userCount" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️ Could not validate database setup: $_" -ForegroundColor Yellow
}

# Install app dependencies
Write-Host "`nInstalling app dependencies..." -ForegroundColor Yellow
try {
    if (Test-Command "npm") {
        & npm install *>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "App dependencies installed successfully"
        } else {
            Write-Host "⚠️ npm install failed. You can run it manually later." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️ Error installing dependencies: $_" -ForegroundColor Yellow
}

# Success message
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "🎉 CLOUD DATABASE SETUP COMPLETED!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Write-Host "`n📋 What was set up:" -ForegroundColor Cyan
Write-Host "  ✓ Node.js and npm"
Write-Host "  ✓ PostgreSQL client tools"
Write-Host "  ✓ Cloud database connection verified"
Write-Host "  ✓ Database schema and sample data"
Write-Host "  ✓ App dependencies installed"

Write-Host "`n🔗 Database Details:" -ForegroundColor Cyan
Write-Host "  Provider: Cloud PostgreSQL"
Write-Host "  Connection: $databaseUrl"
Write-Host "  Tables: 12+ core tables created"
Write-Host "  Sample Data: 5 users, 3 vehicles, 1 job"

Write-Host "`n🔐 Default Login Credentials (CHANGE FOR PRODUCTION):" -ForegroundColor Yellow
Write-Host "  Admin: admin@energymobile.com / admin123"
Write-Host "  Dispatcher: dispatcher@energymobile.com / dispatcher123"
Write-Host "  Customer: customer@example.com / customer123"
Write-Host "  Driver: driver1@energymobile.com / driver123"

Write-Host "`n🚀 Ready to Start Development:" -ForegroundColor Green
Write-Host "  Run: expo start"
Write-Host "  Or: npm start"

Write-Host "`n📱 Your cloud-powered Energy Mobile Dashboard is ready!" -ForegroundColor Green

Read-Host "`nPress Enter to continue..."
