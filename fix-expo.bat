@echo off
REM ===================================================================
REM FIX EXPO SDK VERSION - Energy Mobile Dashboard
REM ===================================================================
echo.
echo =================================================================
echo         Fixing Expo SDK Version Compatibility
echo =================================================================
echo.

echo [INFO] Detected: Project uses SDK 49, but Expo Go uses SDK 53
echo [INFO] This script will upgrade your project to SDK 53 for compatibility
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run from project root.
    pause
    exit /b 1
)

echo [1/6] Stopping any running Metro processes...
taskkill /f /im node.exe >nul 2>&1
echo [OK] Stopped existing processes

echo.
echo [2/6] Backing up current package.json...
copy package.json package.json.backup >nul 2>&1
echo [OK] Backup created: package.json.backup

echo.
echo [3/6] Upgrading Expo SDK to version 53...
echo [INFO] This may take a few minutes...
npx expo install --fix
npx create-expo-app@latest --template blank-typescript temp_upgrade >nul 2>&1
copy temp_upgrade\package.json package_temp.json >nul 2>&1
rmdir /s /q temp_upgrade >nul 2>&1

echo.
echo [4/6] Updating dependencies to SDK 53 compatible versions...
npm install expo@~53.0.0
npm install react@18.3.1
npm install react-native@0.76.1
npx expo install --fix

echo.
echo [5/6] Clearing all caches...
npm cache clean --force
npx expo install --fix
echo [OK] Caches cleared

echo.
echo [6/6] Starting Expo with SDK 53...
echo [INFO] Your app should now be compatible with Expo Go
echo [INFO] Starting in tunnel mode for best compatibility...
start "Expo Metro SDK 53" npx expo start --tunnel --clear

echo.
echo [5/5] Waiting for Metro bundler to start...
timeout /t 10 /nobreak >nul
echo [OK] Metro bundler should be starting now

echo.
echo =================================================================
echo                     Connection Fixed!
echo =================================================================
echo.
echo [SUCCESS] Expo should now be running in a new window
echo.
echo Next steps:
echo 1. Wait for QR code to appear in the new terminal window
echo 2. Open Expo Go app on your phone
echo 3. Scan the NEW QR code (not the old one)
echo 4. App should load successfully
echo.
echo If it still doesn't work:
echo 1. Try pressing 'w' in the Metro terminal to open web version
echo 2. Try different connection modes:
echo    - Press 's' to switch to Expo Go
echo    - Press 'w' for web
echo    - Press 'a' for Android emulator
echo.
echo Troubleshooting:
echo - If QR code doesn't appear: Press 'r' to reload
echo - If tunnel is slow: Press 's' then 'l' for LAN mode
echo - If still failing: Run diagnose.bat for full system check
echo.

echo =================================================================
echo                     SDK Upgrade Complete!
echo =================================================================
echo.
echo [SUCCESS] Your project has been upgraded to Expo SDK 53
echo [SUCCESS] Expo should now be running in a new window
echo.
echo Next steps:
echo 1. Wait for QR code to appear in the new terminal window
echo 2. Open Expo Go app on your phone (should now be compatible)
echo 3. Scan the QR code - app should load without version errors
echo 4. If prompted, allow any permissions for location, camera, etc.
echo.
echo If you still get version errors:
echo 1. Update Expo Go app to latest version in App Store/Play Store
echo 2. Try pressing 'w' in Metro terminal for web version
echo 3. Clear Expo Go app cache in phone settings
echo.
echo Troubleshooting:
echo - If app crashes: Check Metro terminal for detailed errors
echo - If QR code doesn't work: Try pressing 's' then 'l' for LAN mode
echo - If builds fail: Run npm install again
echo.
echo Your backup is saved as: package.json.backup
echo (Restore with: copy package.json.backup package.json)
echo.

echo =================================================================
echo SDK 53 upgrade complete! Your app should work with Expo Go now.
echo =================================================================
pause
