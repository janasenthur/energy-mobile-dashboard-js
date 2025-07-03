# ===================================================================
# FIX EXPO CONNECTION - Energy Mobile Dashboard (PowerShell)
# ===================================================================

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "         Fixing Expo Connection Issues" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] This script will fix the 'Could not connect to server' error" -ForegroundColor Yellow
Write-Host "[INFO] Error: exp://127.0.0.1:8081 connection issues" -ForegroundColor Yellow
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json not found. Please run from project root." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/5] Stopping any running Metro processes..." -ForegroundColor Yellow
try {
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Stopped existing processes" -ForegroundColor Green
} catch {
    Write-Host "[OK] No existing processes to stop" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/5] Clearing Expo and npm caches..." -ForegroundColor Yellow
& npx expo install --fix
& npm cache clean --force
Write-Host "[OK] Caches cleared" -ForegroundColor Green

Write-Host ""
Write-Host "[3/5] Checking network connectivity..." -ForegroundColor Yellow
$connectionTest = Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet -ErrorAction SilentlyContinue
if (-not $connectionTest) {
    Write-Host "[WARNING] No internet connection detected" -ForegroundColor Yellow
    Write-Host "[INFO] Will try localhost mode" -ForegroundColor Yellow
    $connectionMode = "localhost"
} else {
    Write-Host "[OK] Internet connection available" -ForegroundColor Green
    $connectionMode = "tunnel"
}

Write-Host ""
Write-Host "[4/5] Starting Expo with $connectionMode mode..." -ForegroundColor Yellow

if ($connectionMode -eq "tunnel") {
    Write-Host "[INFO] Using tunnel mode for better compatibility..." -ForegroundColor Yellow
    Write-Host "[INFO] This may take a moment to establish tunnel..." -ForegroundColor Yellow
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "npx expo start --tunnel --clear" -WindowStyle Normal
} else {
    Write-Host "[INFO] Using localhost mode..." -ForegroundColor Yellow
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "npx expo start --host localhost --clear" -WindowStyle Normal
}

Write-Host ""
Write-Host "[5/5] Waiting for Metro bundler to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "[OK] Metro bundler should be starting now" -ForegroundColor Green

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                     Connection Fixed!" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[SUCCESS] Expo should now be running in a new window" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Wait for QR code to appear in the new PowerShell window" -ForegroundColor White
Write-Host "2. Open Expo Go app on your phone" -ForegroundColor White
Write-Host "3. Scan the NEW QR code (not the old one)" -ForegroundColor White
Write-Host "4. App should load successfully" -ForegroundColor White
Write-Host ""
Write-Host "If it still doesn't work:" -ForegroundColor Cyan
Write-Host "1. Try pressing 'w' in the Metro terminal to open web version" -ForegroundColor White
Write-Host "2. Try different connection modes:" -ForegroundColor White
Write-Host "   - Press 's' to switch to Expo Go" -ForegroundColor White
Write-Host "   - Press 'w' for web" -ForegroundColor White
Write-Host "   - Press 'a' for Android emulator" -ForegroundColor White
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Cyan
Write-Host "- If QR code doesn't appear: Press 'r' to reload" -ForegroundColor White
Write-Host "- If tunnel is slow: Press 's' then 'l' for LAN mode" -ForegroundColor White
Write-Host "- If still failing: Run .\diagnose.ps1 for full system check" -ForegroundColor White
Write-Host ""

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "The fix is complete! Check the new Expo window." -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit"
