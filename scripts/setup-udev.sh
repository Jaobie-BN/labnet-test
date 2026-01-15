#!/bin/bash
# Setup script for KMITL-NetLab Serial Port persistent naming
# Run on Raspberry Pi with: sudo bash setup-udev.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RULES_FILE="99-serial-devices.rules"

echo "=== KMITL-NetLab Serial Port Setup ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Error: Please run as root (sudo bash setup-udev.sh)"
    exit 1
fi

# Step 1: Detect current USB-to-Serial devices
echo "[1/4] Detecting USB-to-Serial adapters..."
echo ""

if [ -d /sys/class/tty ]; then
    for tty in /sys/class/tty/ttyUSB*; do
        if [ -e "$tty" ]; then
            devname=$(basename "$tty")
            devpath=$(udevadm info -q property -n /dev/$devname 2>/dev/null | grep "ID_PATH=" | cut -d= -f2)
            serial=$(udevadm info -q property -n /dev/$devname 2>/dev/null | grep "ID_SERIAL=" | cut -d= -f2)
            echo "  /dev/$devname"
            echo "    Path: $devpath"
            echo "    Serial: $serial"
            echo ""
        fi
    done
else
    echo "  No USB-to-Serial devices found."
    echo ""
fi

# Step 2: Copy udev rules
echo "[2/4] Installing udev rules..."
if [ -f "$SCRIPT_DIR/$RULES_FILE" ]; then
    cp "$SCRIPT_DIR/$RULES_FILE" /etc/udev/rules.d/
    echo "  Copied $RULES_FILE to /etc/udev/rules.d/"
else
    echo "  Error: $RULES_FILE not found in $SCRIPT_DIR"
    exit 1
fi

# Step 3: Reload udev rules
echo ""
echo "[3/4] Reloading udev rules..."
udevadm control --reload-rules
udevadm trigger
echo "  Done!"

# Step 4: Show created symlinks
echo ""
echo "[4/4] Checking created device symlinks..."
echo ""

sleep 1  # Wait for udev to create symlinks

if ls /dev/netlab_* 1>/dev/null 2>&1; then
    for dev in /dev/netlab_*; do
        target=$(readlink -f "$dev")
        echo "  $dev -> $target"
    done
else
    echo "  No netlab_* symlinks found yet."
    echo "  Make sure USB-to-Serial adapters are connected."
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "You can now use these device paths in your application:"
echo "  /dev/netlab_router1"
echo "  /dev/netlab_router2"
echo "  /dev/netlab_switch1"
echo "  ... etc."
echo ""
echo "To see all serial ports, run:"
echo "  ls -la /dev/ttyUSB* /dev/netlab_*"
