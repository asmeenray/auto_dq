#!/bin/bash

# AutoDQ Development Server Stop Script
# This script stops both frontend and backend servers

echo "🛑 Stopping AutoDQ Development Servers..."

# Kill processes by port
echo "🧹 Killing processes on ports 3000 and 3001..."
lsof -ti:3000,3001 | xargs -r kill -9 2>/dev/null || true

# Kill processes by PID if available
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_ROOT/logs/backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_ROOT/logs/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "🔧 Stopping backend server (PID: $BACKEND_PID)..."
        kill -9 $BACKEND_PID 2>/dev/null || true
    fi
    rm -f "$PROJECT_ROOT/logs/backend.pid"
fi

if [ -f "$PROJECT_ROOT/logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_ROOT/logs/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "🎨 Stopping frontend server (PID: $FRONTEND_PID)..."
        kill -9 $FRONTEND_PID 2>/dev/null || true
    fi
    rm -f "$PROJECT_ROOT/logs/frontend.pid"
fi

# Kill any remaining vite or nodemon processes
pkill -f "vite" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pkill -f "ts-node src/index.ts" 2>/dev/null || true

echo "✅ All development servers stopped!"
echo "🔍 Verifying ports are free..."

# Verify ports are free
if ! lsof -ti:3000 >/dev/null 2>&1; then
    echo "✅ Port 3000 is free"
else
    echo "⚠️  Port 3000 still in use"
fi

if ! lsof -ti:3001 >/dev/null 2>&1; then
    echo "✅ Port 3001 is free"
else
    echo "⚠️  Port 3001 still in use"
fi
