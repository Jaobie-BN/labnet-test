@echo off
title NetLab Local Launcher
echo ========================================================
echo   KMITL-NetLab Local Test Launcher (Windows)
echo ========================================================
echo.

:: Ensure we are in the project root
cd /d "%~dp0.."
set "PROJ_ROOT=%cd%"

echo [1/2] Starting Backend (Dev Mode)...
start "NetLab-Backend-Local" cmd /k "cd /d "%PROJ_ROOT%\Backend" && npm run dev"

echo [2/2] Starting Frontend (Localhost)...
echo Setting VITE_API_URL=http://localhost:3000
start "NetLab-Frontend-Local" cmd /k "cd /d "%PROJ_ROOT%\Frontend" && set VITE_API_URL=http://localhost:3000&& set VITE_WS_URL=ws://localhost:3000/ws/terminal&& npm run dev"

echo.
echo ========================================================
echo   System Running!
echo   - Backend: http://localhost:3000
echo   - Frontend: http://localhost:5173 (Check console for port)
echo.
echo   To stop, run 'scripts\stop-local.bat' or close the windows.
echo ========================================================
pause
