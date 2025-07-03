# Energy Mobile Dashboard - Database Setup (PowerShell)
# This PowerShell script automatically installs prerequisites and sets up the database

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Energy Mobile Dashboard - Auto Setup" -ForegroundColor Cyan  
Write-Host "============================================" -ForegroundColor Cyan

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

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

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Install-Chocolatey {
    Write-Host "`nInstalling Chocolatey package manager..." -ForegroundColor Yellow
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Success "Chocolatey installed successfully"
        return $true
    }
    catch {
        Write-Error-Custom "Failed to install Chocolatey: $_"
        return $false
    }
}

function Install-NodeJS {
    Write-Host "`nInstalling Node.js..." -ForegroundColor Yellow
    try {
        if (Test-Command "choco") {
            & choco install nodejs -y
        } else {
            # Alternative: Download and install Node.js directly
            $nodeUrl = "https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi"
            $nodeInstaller = "$env:TEMP\nodejs-installer.msi"
            
            Write-Host "Downloading Node.js..." -ForegroundColor Yellow
            Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
            
            Write-Host "Installing Node.js..." -ForegroundColor Yellow
            Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $nodeInstaller, "/quiet" -Wait
            
            Remove-Item $nodeInstaller -Force
        }
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Success "Node.js installed successfully"
        return $true
    }
    catch {
        Write-Error-Custom "Failed to install Node.js: $_"
        return $false
    }
}

function Install-PostgreSQL {
    Write-Host "`nInstalling PostgreSQL..." -ForegroundColor Yellow
    try {
        if (Test-Command "choco") {
            & choco install postgresql -y --params "/Password:postgres123"
        } else {
            # Alternative: Download and install PostgreSQL directly
            $pgUrl = "https://get.enterprisedb.com/postgresql/postgresql-15.3-1-windows-x64.exe"
            $pgInstaller = "$env:TEMP\postgresql-installer.exe"
            
            Write-Host "Downloading PostgreSQL..." -ForegroundColor Yellow
            Invoke-WebRequest -Uri $pgUrl -OutFile $pgInstaller
            
            Write-Host "Installing PostgreSQL (this may take a few minutes)..." -ForegroundColor Yellow
            Start-Process -FilePath $pgInstaller -ArgumentList "--mode", "unattended", "--superpassword", "postgres123", "--servicename", "postgresql", "--servicepassword", "postgres123" -Wait
            
            Remove-Item $pgInstaller -Force
        }
        
        # Add PostgreSQL to PATH
        $pgPath = "C:\Program Files\PostgreSQL\15\bin"
        if (Test-Path $pgPath) {
            $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
            if ($currentPath -notlike "*$pgPath*") {
                [Environment]::SetEnvironmentVariable("Path", "$currentPath;$pgPath", "Machine")
            }
        }
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Success "PostgreSQL installed successfully"
        return $true
    }
    catch {
        Write-Error-Custom "Failed to install PostgreSQL: $_"
        return $false
    }
}

# Check if running as administrator
if (-not (Test-Administrator)) {
    Write-Warning-Custom "This script requires administrator privileges for automatic installation."
    Write-Host "Please run PowerShell as Administrator, or use manual installation." -ForegroundColor Yellow
    Write-Host "`nTo run as administrator:" -ForegroundColor Cyan
    Write-Host "1. Right-click PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Read-Host "`nPress Enter to exit..."
    exit 1
}

Write-Host "`nChecking and installing prerequisites..." -ForegroundColor Yellow

# Check and install Chocolatey if needed
if (-not (Test-Command "choco")) {
    Write-Host "`nChocolatey package manager not found. Installing..." -ForegroundColor Yellow
    if (-not (Install-Chocolatey)) {
        Write-Warning-Custom "Chocolatey installation failed. Will try direct downloads."
    }
} else {
    Write-Success "Chocolatey found"
}

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = & node --version
    Write-Success "Node.js found: $nodeVersion"
} else {
    Write-Warning-Custom "Node.js not found. Installing automatically..."
    if (Install-NodeJS) {
        # Wait a moment and check again
        Start-Sleep -Seconds 3
        if (Test-Command "node") {
            $nodeVersion = & node --version
            Write-Success "Node.js installed: $nodeVersion"
        } else {
            Write-Error-Custom "Node.js installation verification failed. Please restart PowerShell."
            exit 1
        }
    } else {
        Write-Error-Custom "Failed to install Node.js automatically."
        exit 1
    }
}

# Check npm
if (Test-Command "npm") {
    $npmVersion = & npm --version
    Write-Success "npm found: v$npmVersion"
} else {
    Write-Warning-Custom "npm not found but should come with Node.js. Refreshing environment..."
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (Test-Command "npm") {
        $npmVersion = & npm --version
        Write-Success "npm found: v$npmVersion"
    } else {
        Write-Error-Custom "npm still not found. Node.js installation may be incomplete."
        exit 1
    }
}

# Check PostgreSQL
if (Test-Command "psql") {
    $pgVersion = & psql --version
    Write-Success "PostgreSQL found: $pgVersion"
} else {
    Write-Warning-Custom "PostgreSQL not found. Installing automatically..."
    if (Install-PostgreSQL) {
        # Wait for installation to complete and refresh PATH
        Start-Sleep -Seconds 5
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        if (Test-Command "psql") {
            $pgVersion = & psql --version
            Write-Success "PostgreSQL installed: $pgVersion"
        } else {
            Write-Error-Custom "PostgreSQL installation verification failed. Please restart PowerShell."
            exit 1
        }
    } else {
        Write-Error-Custom "Failed to install PostgreSQL automatically."
        exit 1
    }
}

# Check if createdb exists
if (Test-Command "createdb") {
    Write-Success "createdb command found"
} else {
    Write-Warning-Custom "createdb command not found. Refreshing environment..."
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (Test-Command "createdb") {
        Write-Success "createdb command found"
    } else {
        Write-Error-Custom "createdb command still not found. PostgreSQL installation may be incomplete."
        exit 1
    }
}

# Check project structure
Write-Host "`nChecking project structure..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Success "package.json found"
} else {
    Write-Error-Custom "package.json not found. Are you in the project root directory?"
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

if (Test-Path "database\energy_mobile_dashboard.sql") {
    Write-Success "Database scripts found"
} else {
    Write-Error-Custom "Database scripts not found. Check if database folder exists."
    exit 1
}

# Test PostgreSQL connection
Write-Host "`nTesting PostgreSQL connection..." -ForegroundColor Yellow

try {
    & psql -d postgres -c "SELECT 1;" *>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "PostgreSQL connection successful"
    } else {
        Write-Warning-Custom "Connection issues detected. Attempting to start PostgreSQL service..."
        
        # Try to start PostgreSQL service
        $services = @("postgresql-x64-15", "postgresql-x64-14", "postgresql-x64-13", "PostgreSQL")
        $serviceStarted = $false
        
        foreach ($service in $services) {
            try {
                Start-Service -Name $service -ErrorAction Stop
                Write-Success "Started $service service"
                $serviceStarted = $true
                break
            }
            catch {
                # Service doesn't exist or couldn't start
            }
        }
        
        if (-not $serviceStarted) {
            Write-Warning-Custom "Could not start PostgreSQL service automatically."
            Write-Host "Please start PostgreSQL service manually or check installation." -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Error-Custom "Cannot connect to PostgreSQL: $_"
    Write-Host "Try running: psql -U postgres -d postgres" -ForegroundColor Yellow
    exit 1
}

# Database setup
$dbName = "energy_mobile_dashboard"
Write-Host "`nSetting up database '$dbName'..." -ForegroundColor Yellow

# Create database
try {
    & createdb $dbName *>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database '$dbName' created"
    } else {
        # Check if database already exists
        & psql -d $dbName -c "SELECT 1;" *>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database '$dbName' already exists and is accessible"
        } else {
            Write-Error-Custom "Failed to create database. Check PostgreSQL logs."
            exit 1
        }
    }
}
catch {
    Write-Error-Custom "Error creating database: $_"
    exit 1
}

# Run database scripts
Write-Host "`nRunning database scripts..." -ForegroundColor Yellow

try {
    # Main schema
    & psql -d $dbName -f "database\energy_mobile_dashboard.sql" *>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database schema created successfully"
    } else {
        Write-Error-Custom "Schema creation failed. Check database\energy_mobile_dashboard.sql"
        exit 1
    }
    
    # Environment config (optional)
    if (Test-Path "database\environment-config.sql") {
        & psql -d $dbName -f "database\environment-config.sql" *>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Environment configuration applied"
        } else {
            Write-Warning-Custom "Environment configuration failed, but continuing..."
        }
    }
}
catch {
    Write-Error-Custom "Error running database scripts: $_"
    exit 1
}

# Validation
Write-Host "`nValidating setup..." -ForegroundColor Yellow

try {
    $userCount = & psql -d $dbName -t -c "SELECT count(*) FROM users;" 2>&1
    if ($LASTEXITCODE -eq 0 -and $userCount.Trim() -eq "5") {
        Write-Success "Database validation passed - found $($userCount.Trim()) users"
    } else {
        Write-Warning-Custom "Validation warning - expected 5 users, found: $userCount"
    }
}
catch {
    Write-Warning-Custom "Could not validate database setup: $_"
}

# Success message
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "✅ DATABASE SETUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Write-Host "`nDatabase Details:" -ForegroundColor Cyan
Write-Host "  Name: $dbName"
Write-Host "  Connection: postgresql://app_user:password@localhost:5432/$dbName"

Write-Host "`n🔑 Default Login Credentials (CHANGE FOR PRODUCTION):" -ForegroundColor Yellow
Write-Host "  Admin: admin@energymobile.com / admin123"
Write-Host "  Dispatcher: dispatcher@energymobile.com / dispatcher123"
Write-Host "  Customer: customer@example.com / customer123"
Write-Host "  Driver: driver1@energymobile.com / driver123"

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Install app dependencies: npm install"
Write-Host "  2. Update src/config/config.js with database connection"
Write-Host "  3. Create .env file with DATABASE_URL"
Write-Host "  4. Run your React Native app: expo start"

Write-Host "`n🎉 Your Energy Mobile Dashboard database is ready!" -ForegroundColor Green

Read-Host "`nPress Enter to continue..."
