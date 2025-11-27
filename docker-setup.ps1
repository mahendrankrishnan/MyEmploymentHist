# Docker Setup Script for Employment History Application (PowerShell)

Write-Host "🚀 Setting up Employment History Application with Docker..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Generate migrations if they don't exist
if (-not (Test-Path "backend\drizzle\meta\_journal.json")) {
    Write-Host "📦 Generating database migrations..." -ForegroundColor Yellow
    Set-Location backend
    if (-not (Test-Path "node_modules")) {
        npm install
    }
    npm run db:generate
    Set-Location ..
    if (Test-Path "backend\drizzle\meta\_journal.json") {
        Write-Host "✅ Migrations generated" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Migrations may not have been generated. The container will start but you may need to generate migrations manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Migrations already exist" -ForegroundColor Green
}

# Build and start containers
Write-Host "🐳 Building and starting Docker containers..." -ForegroundColor Yellow
docker-compose up --build -d

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5003"
Write-Host "   Backend API: http://localhost:5005"
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f"
Write-Host ""
Write-Host "🛑 Stop services:" -ForegroundColor Cyan
Write-Host "   docker-compose down"
Write-Host ""

