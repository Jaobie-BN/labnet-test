#!/bin/bash
# KMITL-NetLab Launcher

echo "========================================================"
echo "  KMITL-NetLab Application Launcher (Linux/Mac)"
echo "========================================================"
echo ""

echo "[1/2] Starting Frontend (Docker)..."
docker compose up -d frontend
if [ $? -ne 0 ]; then
    echo "Error starting Frontend Docker container!"
    exit 1
fi
echo "Frontend running at http://localhost"
echo ""

echo "[2/2] Starting Backend (Native)..."

# Try to detect terminal emulator to open new window
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="KMITL-NetLab Backend" -- bash -c "cd Backend && npm run build && npm run start; exec bash"
    echo "Backend started in a new GNOME Terminal window."
elif command -v x-terminal-emulator &> /dev/null; then
    x-terminal-emulator -T "KMITL-NetLab Backend" -e "bash -c 'cd Backend && npm run build && npm run start; exec bash'"
    echo "Backend started in a new terminal window."
else
    echo "No suitable terminal emulator found. Starting Backend in background..."
    cd Backend
    npm run build
    nohup npm run start > ../backend.log 2>&1 &
    echo "Backend running in background (PID: $!). Logs: backend.log"
    echo "Run 'kill $!' to stop it."
    cd ..
fi

echo ""
echo "========================================================"
echo "  Application Started!"
echo "  - Frontend: http://localhost"
echo "  - If Backend window is closed, Backend will stop."
echo "========================================================"
