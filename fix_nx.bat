@echo off
echo Cleaning up OneSAAS processes...

echo Killing running Node.js processes...
taskkill /F /IM node.exe
echo.

echo Resetting Nx Daemon...
node node_modules\nx\bin\nx.js reset
echo.

echo Cleanup complete!
echo You can now run start_app.bat again.
pause
