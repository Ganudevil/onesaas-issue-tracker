@echo off
echo Starting OneSAAS Issue Tracker - STABLE MODE
echo.

echo [1/3] Cleaning up any stuck processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Starting Backend on port 3002...
start "Backend API" cmd /k "cd /d %~dp0 && node node_modules\ts-node\dist\bin.js apps\backend\src\main.ts"
timeout /t 5 /nobreak

echo [3/3] Starting Frontend on port 3000 (Webpack mode)...
start "Frontend App" cmd /k "cd /d %~dp0\apps\frontend && set TURBOPACK=0 && node ..\..\node_modules\next\dist\bin\next dev -p 3000"

echo.
echo ============================================
echo Services are starting up...
echo Please wait 30-60 seconds for initialization
echo ============================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3002
echo Swagger Docs: http://localhost:3002/api
echo Keycloak: http://localhost:8080
echo.
pause
