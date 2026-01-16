@echo off
echo ========================================================
echo   KMITL-NetLab Background Launcher (Windows)
echo ========================================================
echo.

echo [1/3] Checking requirements...
call pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: PM2 is not installed!
    echo Please run: npm install -g pm2
    pause
    exit /b 1
)

echo [2/3] Starting Frontend (Docker)...
docker compose up -d frontend
if %errorlevel% neq 0 (
    echo Error starting Frontend Docker container!
    pause
    exit /b %errorlevel%
)

echo [3/3] Starting Backend (PM2)...
cd Backend
call npm run build
call pm2 delete netlab-backend >nul 2>&1
call pm2 start dist/index.js --name netlab-backend
cd ..

echo.
echo ========================================================
echo   Application Started in BACKGROUND!
echo   - Frontend: http://localhost
echo   - Backend:  Running via PM2
echo.
echo   Use 'pm2 list' to see status.
echo   Use 'pm2 logs' to see logs.
echo   Run 'scripts\stop-app.bat' to stop everything.
echo ========================================================
pause
