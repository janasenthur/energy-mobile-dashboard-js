# Temporary Expo Start Script
# This script temporarily allows script execution for this session only

Write-Host "Setting execution policy for this session..." -ForegroundColor Yellow
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

Write-Host "Starting Expo development server..." -ForegroundColor Green
Write-Host "Location: $PWD" -ForegroundColor Cyan

try {
    npx expo start
} catch {
    Write-Host "Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative approaches..." -ForegroundColor Yellow
    
    # Try with different flags
    Write-Host "Attempting with --clear flag..." -ForegroundColor Cyan
    npx expo start --clear
}

Read-Host "Press Enter to continue..."
