# Docker Deployment Guide

This guide explains how to deploy the Employment History application using Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend UI: http://localhost:5003
   - Backend API: http://localhost:5005
   - PostgreSQL: localhost:5435

## Services

The Docker Compose setup includes three services:

### 1. PostgreSQL Database
- **Container**: `employment-history-db`
- **Port**: 5435 (external), 5432 (internal)
- **Database**: `employment_history`
- **Credentials**: 
  - User: `postgres`
  - Password: `postgres`
- **Data Persistence**: Data is stored in a Docker volume `postgres_data`

### 2. Backend API
- **Container**: `employment-history-backend`
- **Port**: 5005
- **Features**:
  - Automatically runs database migrations on startup
  - Connects to PostgreSQL database
  - Exposes REST API endpoints

### 3. Frontend UI
- **Container**: `employment-history-frontend`
- **Port**: 5003
- **Features**:
  - Serves Angular application via Nginx
  - Proxies API requests to backend
  - Optimized production build

## Docker Commands

### Start services
```bash
docker-compose up
```

### Start services in detached mode (background)
```bash
docker-compose up -d
```

### Build and start services
```bash
docker-compose up --build
```

### Stop services
```bash
docker-compose down
```

### Stop services and remove volumes (⚠️ deletes database data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild a specific service
```bash
docker-compose up --build backend
```

### Execute commands in a container
```bash
# Access backend container shell
docker-compose exec backend sh

# Access database
docker-compose exec postgres psql -U postgres -d employment_history
```

## Environment Variables

### Backend Environment Variables
You can override these in `docker-compose.yml` or create a `.env` file:

- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://postgres:postgres@postgres:5432/employment_history`)
- `PORT`: Backend server port (default: `5005`)
- `NODE_ENV`: Node environment (default: `production`)

### Database Environment Variables
- `POSTGRES_USER`: Database user (default: `postgres`)
- `POSTGRES_PASSWORD`: Database password (default: `postgres`)
- `POSTGRES_DB`: Database name (default: `employment_history`)

## Database Migrations

Migrations are automatically run when the backend container starts. The backend waits 5 seconds for the database to be ready, then runs migrations before starting the server.

If you need to run migrations manually:
```bash
docker-compose exec backend npm run db:migrate
```

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`
- Verify network connectivity: `docker-compose exec backend ping postgres`

### Frontend can't connect to backend
- Check if backend is running: `docker-compose ps`
- Verify backend logs: `docker-compose logs backend`
- Check nginx configuration in `frontend/nginx.conf`

### Port conflicts
If ports 5003, 5005, or 5435 are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "5003:5003"  # Change first number to available port
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Clear everything and start fresh
```bash
docker-compose down -v
docker-compose up --build
```

## Production Considerations

For production deployment, consider:

1. **Security**:
   - Change default database credentials
   - Use environment variables for sensitive data
   - Enable HTTPS/TLS
   - Configure proper CORS settings

2. **Performance**:
   - Use production-optimized builds
   - Configure Nginx caching
   - Set up database connection pooling
   - Use a reverse proxy (e.g., Traefik, Nginx)

3. **Monitoring**:
   - Add health checks
   - Set up logging aggregation
   - Monitor resource usage

4. **Backup**:
   - Regular database backups
   - Volume snapshots
   - Backup strategy for persistent data

## Development Mode

For development with hot-reload, use the development override:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This will:
- Enable hot-reload for backend and frontend
- Mount source code as volumes
- Use development configurations

