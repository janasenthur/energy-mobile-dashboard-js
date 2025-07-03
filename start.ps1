# ===================================================================
# START - Energy Mobile Dashboard (Cloud-First)
# ===================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "         Energy Mobile Dashboard - Start App" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json not found. Please run this script from the project root." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[INFO] No .env file found. Creating from Azure template..." -ForegroundColor Yellow
    try {
        Copy-Item ".env.example" ".env" -ErrorAction Stop
        Write-Host "[SUCCESS] Created .env file with Azure PostgreSQL settings" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to create .env file: $($_.Exception.Message)" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Dependencies not installed. Installing now..." -ForegroundColor Yellow
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        Write-Host "[INFO] Please check your internet connection and try again" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[SUCCESS] Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[INFO] Starting Energy Mobile Dashboard..." -ForegroundColor Yellow
Write-Host "[INFO] Connected to Azure PostgreSQL Cloud Database" -ForegroundColor Green
Write-Host ""
Write-Host "Available options after startup:" -ForegroundColor Cyan
Write-Host "- Press 'w' to open in web browser" -ForegroundColor White
Write-Host "- Scan QR code with Expo Go app on mobile" -ForegroundColor White
Write-Host "- Press 'a' for Android emulator" -ForegroundColor White
Write-Host "- Press 'i' for iOS simulator" -ForegroundColor White
Write-Host ""
Write-Host "Default test accounts:" -ForegroundColor Cyan
Write-Host "- Admin: admin@nbs.com / admin123" -ForegroundColor White
Write-Host "- Driver: driver@nbs.com / driver123" -ForegroundColor White
Write-Host "- Customer: customer@nbs.com / customer123" -ForegroundColor White
Write-Host "- Dispatcher: dispatcher@nbs.com / dispatcher123" -ForegroundColor White
Write-Host ""

& npm start
