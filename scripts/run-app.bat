@echo off
echo ========================================================
echo   KMITL-NetLab Application Launcher (Windows)
echo ========================================================
echo.

echo [1/2] Starting Frontend (Docker)...
docker compose up -d frontend
if %errorlevel% neq 0 (
    echo Error starting Frontend Docker container!
    pause
    exit /b %errorlevel%
)
echo Frontend running at http://localhost
echo.

echo [2/2] Starting Backend (Native)...
echo Opening new window for Backend...
start "KMITL-NetLab Backend" cmd /k "cd Backend && echo Building... && npm run build && echo Starting... && npm run start"

echo.
echo ========================================================
echo   Application Started!
echo   - Frontend: http://localhost
echo   - Backend:  Running in the other window
echo.
echo   NOTE: 
echo   - Closing the Backend window WILL STOP the backend.
echo   - To stop Frontend, run 'scripts\stop-app.bat'
echo ========================================================
pause
