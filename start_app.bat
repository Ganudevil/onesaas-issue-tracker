@echo off
echo ==========================================
echo OneSAAS Issue Tracker - STABLE LAUNCH
echo ==========================================
echo.

echo [STEP 1/5] Stopping all Node.js processes...
taskkill /F /IM node.exe /T 2>nul
echo Done. Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo [STEP 2/5] Starting Backend API (Port 3002)...
start "Backend API" cmd /k "cd /d "%~dp0" && node node_modules\ts-node\dist\bin.js apps\backend\src\main.ts"
echo Backend starting... Waiting 8 seconds...
timeout /t 8 /nobreak >nul

echo.
echo [STEP 3/5] Starting Frontend (Port 3000)...
cd "%~dp0\apps\frontend"
start "Frontend App" cmd /k "node ..\..\node_modules\next\dist\bin\next dev -p 3000"
cd "%~dp0"
echo Frontend starting... Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo.
echo [STEP 4/5] Verifying ports are active...
netstat -an | findstr "3000 3002 8080" > nul
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Services are starting up!
) else (
    echo WARNING: Some ports may not be active yet. Please wait 30 seconds.
)

echo.
echo [STEP 5/5] Launch complete!
echo ==========================================
echo.
echo APPLICATION URLS:
echo   Frontend:     http://localhost:3000
echo   Backend API:  http://localhost:3002
echo   Swagger Docs: http://localhost:3002/api
echo   Keycloak:     http://localhost:8080
echo.
echo ==========================================
echo.
echo IMPORTANT: Wait 30-60 seconds for full initialization
echo If you see errors, check the Backend API and Frontend App windows
echo.
pause
