# Energy Mobile Dashboard - Development Startup Script
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Energy Mobile Dashboard - Dev Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend'; node server.js" -WindowStyle Normal
}

# Function to start frontend
function Start-Frontend {
    Write-Host "Starting Frontend Web Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run web" -WindowStyle Normal
}

# Start backend first
Start-Backend
Start-Sleep -Seconds 3

# Start frontend
Start-Frontend

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   Both servers are starting..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend API: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend Web: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:19006" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
