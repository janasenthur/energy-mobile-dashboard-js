@echo off
title Expo Diagnostic and Start Script
echo ==========================================
echo Energy Mobile Dashboard - Expo Diagnostic
echo ==========================================
echo.

echo [1/6] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/6] Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)

echo.
echo [3/6] Checking if node_modules exists...
if not exist "node_modules" (
    echo WARNING: node_modules not found. Running npm install...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
) else (
    echo OK: node_modules exists
)

echo.
echo [4/6] Checking Expo CLI...
npx expo --version 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Expo CLI not accessible. This is normal for first run.
)

echo.
echo [5/6] Checking project files...
if not exist "package.json" (
    echo ERROR: package.json not found!
    pause
    exit /b 1
)
if not exist "App.js" (
    echo ERROR: App.js not found!
    pause
    exit /b 1
)
echo OK: Essential project files found

echo.
echo [6/6] Starting Expo development server...
echo.
echo NOTE: If this is your first time running Expo in this project,
echo it may take a few minutes to download dependencies.
echo.
echo Press Ctrl+C to stop the server when done.
echo.
npx expo start

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Expo failed to start!
    echo.
    echo Common solutions:
    echo 1. Make sure you have a stable internet connection
    echo 2. Try running: npm install
    echo 3. Try clearing the cache: npx expo start --clear
    echo 4. Check if port 19000 is available
    echo.
    pause
)
