#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Setting up autoDQ Simplified Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Create .env file for development if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating development .env file..."
    cat > .env << EOL
# Development Environment Variables
NODE_ENV=development

# Database
DATABASE_URL=postgresql://autodq:dev_password@localhost:5432/autodq_dev
POSTGRES_DB=autodq_dev
POSTGRES_USER=autodq
POSTGRES_PASSWORD=dev_password

# JWT
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_EXPIRES_IN=7d

# API Configuration
API_PORT=4000
FRONTEND_URL=http://localhost:3000
EOL
    echo -e "${GREEN}✅ Created .env file${NC}"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

# Build and start the simplified environment
echo "🏗️ Building Docker images..."
if docker-compose -f docker-compose.simple.yml build; then
    echo -e "${GREEN}✅ Docker images built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build Docker images${NC}"
    exit 1
fi

echo "🔧 Starting development environment..."
if docker-compose -f docker-compose.simple.yml up -d; then
    echo -e "${GREEN}✅ Development environment started successfully${NC}"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔗 Backend API: http://localhost:4000/graphql"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "To view logs: docker-compose -f docker-compose.simple.yml logs -f"
    echo "To stop: docker-compose -f docker-compose.simple.yml down"
else
    echo -e "${RED}❌ Failed to start development environment${NC}"
    exit 1
fi
