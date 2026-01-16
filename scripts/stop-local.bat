@echo off
echo Stopping Local Test Environment...

echo Killing Backend...
taskkill /FI "WINDOWTITLE eq NetLab-Backend-Local*" /T /F >nul 2>&1

echo Killing Frontend...
taskkill /FI "WINDOWTITLE eq NetLab-Frontend-Local*" /T /F >nul 2>&1

echo.
echo Done. If windows remain, please close them manually.
pause
