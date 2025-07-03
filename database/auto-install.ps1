# Energy Mobile Dashboard - Auto-Install Setup (PowerShell)
# This script automatically installs all prerequisites using Windows Package Manager (winget)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Energy Mobile Dashboard - Auto Install" -ForegroundColor Cyan  
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
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Check if winget is available
Write-Info "Checking Windows Package Manager (winget)..."
if (-not (Test-Command "winget")) {
    Write-Error-Custom "Windows Package Manager (winget) is not available."
    Write-Host "winget is available on Windows 10 (version 1809+) and Windows 11" -ForegroundColor Yellow
    Write-Host "Please update Windows or install winget manually from Microsoft Store" -ForegroundColor Yellow
    Write-Host "Alternative: Use the other setup scripts for manual installation" -ForegroundColor Yellow
    Read-Host "`nPress Enter to exit..."
    exit 1
} else {
    Write-Success "Windows Package Manager found"
}

Write-Host "`n🚀 Starting automatic installation of prerequisites..." -ForegroundColor Green

# Install Node.js
if (Test-Command "node") {
    $nodeVersion = & node --version
    Write-Success "Node.js already installed: $nodeVersion"
} else {
    Write-Info "Node.js not found. Installing..."
    if (Install-WithWinget "OpenJS.NodeJS" "Node.js") {
        Update-Environment
        Start-Sleep -Seconds 2
        
        if (Test-Command "node") {
            $nodeVersion = & node --version
            Write-Success "Node.js verified: $nodeVersion"
        } else {
            Write-Error-Custom "Node.js installation verification failed. Try restarting PowerShell."
        }
    }
}

# Install PostgreSQL
if (Test-Command "psql") {
    $pgVersion = & psql --version
    Write-Success "PostgreSQL already installed: $pgVersion"
} else {
    Write-Info "PostgreSQL not found. Installing..."
    if (Install-WithWinget "PostgreSQL.PostgreSQL" "PostgreSQL") {
        Update-Environment
        Start-Sleep -Seconds 3
        
        # Add PostgreSQL to PATH manually if needed
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
        
        if (Test-Command "psql") {
            $pgVersion = & psql --version
            Write-Success "PostgreSQL verified: $pgVersion"
        } else {
            Write-Error-Custom "PostgreSQL installation verification failed. Try restarting PowerShell."
        }
    }
}

# Install Git (useful for development)
if (-not (Test-Command "git")) {
    Write-Info "Git not found. Installing for development..."
    Install-WithWinget "Git.Git" "Git"
    Update-Environment
}

# Install Expo CLI
Write-Info "Installing Expo CLI for React Native development..."
try {
    if (Test-Command "npm") {
        & npm install -g @expo/cli
        Write-Success "Expo CLI installed"
    }
} catch {
    Write-Error-Custom "Failed to install Expo CLI: $_"
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "✅ INSTALLATION COMPLETED!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Write-Host "`n📋 Installed Components:" -ForegroundColor Cyan
if (Test-Command "node") {
    $nodeVersion = & node --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
}
if (Test-Command "npm") {
    $npmVersion = & npm --version  
    Write-Host "  ✓ npm: v$npmVersion" -ForegroundColor Green
}
if (Test-Command "psql") {
    $pgVersion = & psql --version
    Write-Host "  ✓ PostgreSQL: $pgVersion" -ForegroundColor Green
}
if (Test-Command "git") {
    $gitVersion = & git --version
    Write-Host "  ✓ Git: $gitVersion" -ForegroundColor Green
}
if (Test-Command "expo") {
    Write-Host "  ✓ Expo CLI: Installed" -ForegroundColor Green
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Restart PowerShell to ensure all PATH changes take effect"
Write-Host "  2. Run database setup: .\database\setup-simple.bat"
Write-Host "  3. Install app dependencies: npm install"
Write-Host "  4. Start your React Native app: expo start"

Write-Host "`n⚠️ Important Notes:" -ForegroundColor Yellow
Write-Host "  • PostgreSQL default password: postgres123"
Write-Host "  • Restart PowerShell if commands are not recognized"
Write-Host "  • Some installations may require system restart"

Write-Host "`n🎉 Your development environment is ready!" -ForegroundColor Green

Read-Host "`nPress Enter to continue..."
