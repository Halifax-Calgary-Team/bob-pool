# Bob-Pool Setup Guide

This guide will help you get the Bob-Pool carpooling application running on your local machine using Podman.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Podman** (version 4.0 or higher)
  - Download from: https://podman.io/getting-started/installation
- **Podman Compose**
  - Install from: https://github.com/containers/podman-compose#installation
- **Git** (for cloning the repository)

## Quick Start

### 1. Navigate to the Project Directory

```bash
cd bob-pool
```

### 2. Start the Application

Run the following command to build and start all services (database, backend, and frontend):

```bash
podman-compose up
```

**Note:** The first time you run this command, it will take a few minutes to download images and build the containers.

To run in detached mode (background):

```bash
podman-compose up -d
```

### 3. Access the Application

Once all services are running, you can access:

- **Frontend (React)**: http://localhost:3000
- **Backend API (Express)**: http://localhost:3001
- **Database (PostgreSQL)**: localhost:5432

### 4. Stop the Application

To stop all running containers:

```bash
podman-compose down
```

To stop and remove all data (including database):

```bash
podman-compose down -v
```

## Development Workflow

### Hot Reloading

Both frontend and backend support hot-reloading:

- **Frontend**: Changes to files in `frontend/src` will automatically refresh the browser
- **Backend**: Changes to files in `backend/` will automatically restart the server (using nodemon)

### Viewing Logs

To view logs from all services:

```bash
podman-compose logs -f
```

To view logs from a specific service:

```bash
podman-compose logs -f backend
podman-compose logs -f frontend
podman-compose logs -f db
```

### Rebuilding Containers

If you make changes to Containerfiles or package.json files, rebuild the containers:

```bash
podman-compose up --build
```

## Database Connection

The PostgreSQL database is configured with the following credentials:

- **Host**: db (or localhost from your machine)
- **Port**: 5432
- **Database**: bobpool
- **Username**: bobpool
- **Password**: bobpool_dev

**Note:** These are development credentials. Use different credentials in production.

## Troubleshooting

### Port Already in Use

If you see an error about ports already being in use:

1. Check what's using the port:
   ```bash
   # Windows (PowerShell)
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   netstat -ano | findstr :5432
   ```

2. Stop the conflicting service or change the port mapping in `podman-compose.yml`

### Containers Won't Start

1. Make sure Podman is installed and running
2. Try removing all containers and volumes:
   ```bash
   podman-compose down -v
   podman-compose up --build
   ```

### Database Connection Issues

If the backend can't connect to the database:

1. Wait a few seconds for the database to fully initialize
2. Check database logs: `podman-compose logs db`
3. Restart the backend: `podman-compose restart backend`

## Next Steps

After the initial setup is complete, you'll need to:

1. Create the backend package.json and source files
2. Create the frontend package.json and source files
3. Initialize the database schema

These will be handled in subsequent setup tasks.