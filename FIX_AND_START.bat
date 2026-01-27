@echo off
echo ================================================================
echo ONESAAS ISSUE TRACKER - COMPLETE FIX
echo ================================================================
echo.
echo This script will:
echo 1. Remove global Next.js 16
echo 2. Reinstall Next.js 14 in the project
echo 3. Start the application
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [STEP 1/6] Stopping all Node processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [STEP 2/6] Uninstalling global Next.js 16...
call npm uninstall -g next 2>nul
echo Done.

echo.
echo [STEP 3/6] Reinstalling Next.js 14.2.3 locally...
cd "%~dp0\apps\frontend"
call npm install next@14.2.3 --legacy-peer-deps
cd "%~dp0"

echo.
echo [STEP 4/6] Clearing build cache...
if exist "apps\frontend\.next" (
    rmdir /s /q "apps\frontend\.next"
)

echo.
echo [STEP 5/6] Starting Backend (Port 3002)...
start "Backend API" cmd /k "cd /d "%~dp0" && node node_modules\ts-node\dist\bin.js apps\backend\src\main.ts"
timeout /t 8 /nobreak >nul

echo.
echo [STEP 6/6] Starting Frontend (Port 3000)...
start "Frontend App" cmd /k "cd /d "%~dp0\apps\frontend" && set NODE_ENV=development && node ..\..\node_modules\next\dist\bin\next dev -p 3000"

echo.
echo ================================================================
echo APPLICATION STARTED!
echo ================================================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3002
echo Swagger:  http://localhost:3002/api
echo Keycloak: http://localhost:8080
echo.
echo Wait 30-60 seconds for complete initialization
echo.
pause
