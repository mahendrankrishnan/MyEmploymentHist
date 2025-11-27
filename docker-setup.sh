#!/bin/bash

# Docker Setup Script for Employment History Application

echo "🚀 Setting up Employment History Application with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Generate migrations if they don't exist
if [ ! -f "backend/drizzle/meta/_journal.json" ]; then
    echo "📦 Generating database migrations..."
    cd backend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run db:generate
    cd ..
    if [ -f "backend/drizzle/meta/_journal.json" ]; then
        echo "✅ Migrations generated"
    else
        echo "⚠️  Warning: Migrations may not have been generated. The container will start but you may need to generate migrations manually."
    fi
else
    echo "✅ Migrations already exist"
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose up --build -d

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:5003"
echo "   Backend API: http://localhost:5005"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""

