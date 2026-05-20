# Podman Setup Guide

## Quick Start

To run the Bob Pool application using Podman:

```bash
podman-compose up --build
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Database:** PostgreSQL on port 5432

## Architecture

The application consists of three services:

1. **Database (PostgreSQL):** Stores all application data
2. **Backend (Node.js/Express):** REST API server
3. **Frontend (React/Vite):** User interface with interactive maps

## Important Notes

### Dependency Management

The frontend container uses an entrypoint script ([`frontend/podman-entrypoint.sh`](frontend/podman-entrypoint.sh)) that automatically installs npm dependencies on container startup. This ensures that:

1. Dependencies are always up-to-date with `package.json`
2. Volume mounts don't override the `node_modules` directory
3. New users don't encounter missing dependency errors

The entrypoint script runs `npm install --legacy-peer-deps` before starting the Vite dev server. The `--legacy-peer-deps` flag is required to handle React version conflicts with the Leaflet mapping library.

### Volume Mounts

The compose file mounts local directories into the containers for development:
- `./frontend:/app` - Frontend source code
- `./backend:/app` - Backend source code

The `node_modules` directories are preserved in the containers through the entrypoint script, ensuring dependencies are always available.

## Troubleshooting

### Missing Dependencies Error

If you see errors like "Failed to resolve import 'leaflet'", the entrypoint script should handle this automatically. If issues persist:

1. Rebuild the containers without cache:
   ```bash
   podman-compose down
   podman-compose build --no-cache
   podman-compose up
   ```

2. Check the frontend logs:
   ```bash
   podman logs bobpool-frontend
   ```

### Port Conflicts

If ports 3000, 3001, or 5432 are already in use, you can modify the port mappings in [`podman-compose.yml`](podman-compose.yml).

### Database Connection Issues

The backend waits for the database to be healthy before starting (see `depends_on` in compose file). If you see connection errors, check the database logs:

```bash
podman logs bobpool-db
```

## Development Workflow

1. Make changes to source files in `frontend/` or `backend/`
2. Changes are automatically reflected in the running containers (hot reload)
3. For dependency changes, restart the affected container:
   ```bash
   podman-compose restart frontend
   # or
   podman-compose restart backend
   ```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in environment variables
2. Use proper secrets for `SESSION_SECRET` and database credentials
3. Enable HTTPS/TLS
4. Use a production-grade database setup
5. Consider using a reverse proxy (nginx, traefik)

## Made with Bob