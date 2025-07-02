#!/bin/bash

# AutoDQ Development Server Startup Script
# This script starts both frontend (port 3000) and backend (port 3001) servers

echo "🚀 Starting AutoDQ Development Servers..."

# Function to check if a port is in use
check_port() {
    if lsof -ti:$1 >/dev/null 2>&1; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check ports
echo "🔍 Checking ports..."
check_port 3000
check_port 3001

# Kill any existing processes on these ports
echo "🧹 Cleaning up any existing processes..."
lsof -ti:3000,3001 | xargs -r kill -9 2>/dev/null || true

# Start backend server
echo "🔧 Starting backend server on port 3001..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/backend"
source .env 2>/dev/null || true

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/logs"

npm run dev > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🎨 Starting frontend server on port 3000..."
cd "$PROJECT_ROOT/frontend"
npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Save PIDs for later cleanup
echo $BACKEND_PID > "$PROJECT_ROOT/logs/backend.pid"
echo $FRONTEND_PID > "$PROJECT_ROOT/logs/frontend.pid"

echo ""
echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo "📊 Health:   http://localhost:3001/health"
echo ""
echo "📝 Logs are being written to:"
echo "   Backend:  logs/backend.log"
echo "   Frontend: logs/frontend.log"
echo ""
echo "🛑 To stop servers, run: ./scripts/stop-dev.sh"
