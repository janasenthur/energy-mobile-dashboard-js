@echo off
echo ======================================
echo Energy Mobile Dashboard - DB Test
echo ======================================
echo.

echo 🔍 Checking PostgreSQL service status...
sc query postgresql-x64-14 > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ PostgreSQL service found
    sc query postgresql-x64-14 | findstr "STATE"
) else (
    echo ❌ PostgreSQL service not found (postgresql-x64-14)
    echo 🔍 Checking for other PostgreSQL services...
    sc query | findstr /i postgresql
)

echo.
echo 🔍 Testing database connection...
cd /d "%~dp0"
node test-db-connection.js

echo.
echo ======================================
echo Test completed. Check results above.
echo ======================================
pause
