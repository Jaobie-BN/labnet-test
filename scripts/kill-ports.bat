@echo off
echo Killing PM2 Daemon...
call pm2 kill >nul 2>&1

echo Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo detailed cleanup complete. Port 3000 should be free.
