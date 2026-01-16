@echo off
echo Stopping KMITL-NetLab...

echo Stopping Frontend (Docker)...
docker compose stop frontend

echo Stopping Backend (PM2)...
call pm2 delete netlab-backend >nul 2>&1

echo.
echo Application Stopped.
echo.
pause
