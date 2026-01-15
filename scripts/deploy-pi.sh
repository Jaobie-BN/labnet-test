#!/bin/bash
# =====================================================
# KMITL-NetLab Raspberry Pi Deployment Script
# =====================================================
# This script deploys the application on Raspberry Pi:
# - Frontend: Docker container (Nginx)
# - Backend: Native Node.js (for serial port access)
# =====================================================

set -e

echo "🚀 KMITL-NetLab Deployment Script"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Setup udev rules for serial devices
echo -e "\n${YELLOW}[1/5] Setting up udev rules...${NC}"
if [ -f "./scripts/setup-udev.sh" ]; then
    sudo chmod +x ./scripts/setup-udev.sh
    sudo ./scripts/setup-udev.sh
    echo -e "${GREEN}✓ udev rules configured${NC}"
else
    echo "⚠ scripts/setup-udev.sh not found, skipping..."
fi

# Step 2: Build and start Frontend (Docker)
echo -e "\n${YELLOW}[2/5] Building Frontend Docker image...${NC}"
docker compose build frontend
echo -e "${GREEN}✓ Frontend image built${NC}"

echo -e "\n${YELLOW}[3/5] Starting Frontend container...${NC}"
docker compose up -d frontend
echo -e "${GREEN}✓ Frontend running on port 80${NC}"

# Step 3: Setup Backend
echo -e "\n${YELLOW}[4/5] Setting up Backend...${NC}"
cd Backend
npm install --production
npm run build
echo -e "${GREEN}✓ Backend built${NC}"

# Step 4: Start Backend with PM2 (or node)
echo -e "\n${YELLOW}[5/5] Starting Backend...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 delete netlab-backend 2>/dev/null || true
    pm2 start dist/index.js --name netlab-backend
    pm2 save
    echo -e "${GREEN}✓ Backend running with PM2${NC}"
else
    echo "PM2 not found. Starting with node..."
    echo "For production, install PM2: npm install -g pm2"
    nohup node dist/index.js > ../logs/backend.log 2>&1 &
    echo -e "${GREEN}✓ Backend running (PID: $!)${NC}"
fi

cd ..

echo ""
echo "=================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "Frontend: http://localhost (port 80)"
echo "Backend:  http://localhost:3000"
echo ""
echo "To view logs:"
echo "  Frontend: docker compose logs -f frontend"
echo "  Backend:  pm2 logs netlab-backend"
echo ""
