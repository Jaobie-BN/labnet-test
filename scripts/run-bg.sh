#!/bin/bash
echo "========================================================"
echo "  KMITL-NetLab Background Launcher (Linux/Mac)"
echo "========================================================"
echo ""

if ! command -v pm2 &> /dev/null; then
    echo "Error: PM2 is not installed!"
    echo "Please run: npm install -g pm2"
    exit 1
fi

echo "[1/2] Starting Frontend (Docker)..."
docker compose up -d frontend

echo "[2/2] Starting Backend (PM2)..."
cd Backend
npm run build
pm2 delete netlab-backend 2>/dev/null || true
pm2 start dist/index.js --name netlab-backend
cd ..

echo ""
echo "========================================================"
echo "  Application Started in BACKGROUND!"
echo "  - Frontend: http://localhost"
echo "  - Backend:  Running via PM2"
echo "  Use 'pm2 log' to see logs."
echo "========================================================"
