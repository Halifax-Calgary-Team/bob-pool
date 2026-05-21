# Backend-Only Setup

This guide explains how to run only the backend server (without the frontend) for development or testing purposes.

## Prerequisites

- Podman or Docker installed
- Podman Compose or Docker Compose installed

## Quick Start

### Using Podman

```bash
# Start backend and database
podman-compose -f compose.backend-only.yml up

# Or run in detached mode
podman-compose -f compose.backend-only.yml up -d

# View logs
podman-compose -f compose.backend-only.yml logs -f

# Stop services
podman-compose -f compose.backend-only.yml down
```

### Using Docker

```bash
# Start backend and database
docker-compose -f compose.backend-only.yml up

# Or run in detached mode
docker-compose -f compose.backend-only.yml up -d

# View logs
docker-compose -f compose.backend-only.yml logs -f

# Stop services
docker-compose -f compose.backend-only.yml down
```

## What's Included

The backend-only setup includes:

- **PostgreSQL Database** (port 5432)
  - User: `bobpool`
  - Password: `bobpool_dev`
  - Database: `bobpool`

- **Backend API Server** (port 3001)
  - REST API endpoints
  - Hot-reloading with nodemon
  - Session management
  - Database connection

## Testing the API

Once the backend is running, you can test the API endpoints:

```bash
# Health check
curl http://localhost:3001/api/health

# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ibm.com",
    "name": "Test User",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ibm.com",
    "password": "password123"
  }'
```

## API Documentation

For complete API documentation, see [API.md](API.md)

## Development

The backend code is mounted as a volume, so any changes you make to the backend files will automatically trigger a restart thanks to nodemon.

### Environment Variables

You can customize the backend configuration by modifying the environment variables in `compose.backend-only.yml`:

- `DB_HOST`: Database host (default: `db`)
- `DB_USER`: Database user (default: `bobpool`)
- `DB_PASSWORD`: Database password (default: `bobpool_dev`)
- `DB_NAME`: Database name (default: `bobpool`)
- `DB_PORT`: Database port (default: `5432`)
- `NODE_ENV`: Node environment (default: `development`)

## Troubleshooting

### Port Already in Use

If you get an error about ports already being in use:

```bash
# Check what's using the ports
lsof -i :3001  # Backend
lsof -i :5432  # Database

# Stop any existing containers
podman-compose -f compose.backend-only.yml down
```

### Database Connection Issues

If the backend can't connect to the database:

1. Check database health: `podman-compose -f compose.backend-only.yml ps`
2. View database logs: `podman-compose -f compose.backend-only.yml logs db`
3. Ensure the database is healthy before the backend starts (healthcheck is configured)

### Reset Database

To start with a fresh database:

```bash
# Stop services
podman-compose -f compose.backend-only.yml down

# Remove volumes (this deletes all data!)
podman volume rm bobpool_postgres_data

# Start again
podman-compose -f compose.backend-only.yml up
```

## Running Full Stack

To run the complete application (backend + frontend), use the main compose file:

```bash
podman-compose up
```

See [QUICKSTART.md](QUICKSTART.md) for full stack setup instructions.

# Made with Bob