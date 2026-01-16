#!/bin/bash
echo "Stopping KMITL-NetLab..."

echo "Stopping Frontend (Docker)..."
docker compose stop frontend

echo "Stopping Backend (PM2)..."
pm2 delete netlab-backend 2>/dev/null || true

echo "Application Stopped."
