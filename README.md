# Bob Pool

Internal IBM carpooling application for coordinating rides to and from work.

## Overview

**Tech Stack:**
- Frontend: React 18 + Vite + React Router
- Backend: Node.js + Express (session-based auth)
- Database: PostgreSQL 15
- Containerization: Podman + Podman Compose

**Core Features:**
- User registration/login (IBM email required: @ibm.com)
- Ride creation with pickup/dropoff locations, date, time, seats
- Ride search and filtering
- Ride request management (accept/reject)
- Hot reload enabled for both frontend and backend in development mode

## Quick Start

### Prerequisites

- Podman and Podman Compose installed
- Ports 3000, 3001, 5432 available

**Installation:**
- Linux: `sudo dnf install podman podman-compose` (Fedora/RHEL) or `sudo apt-get install podman podman-compose` (Ubuntu/Debian)
- macOS: `brew install podman podman-compose && podman machine init && podman machine start`
- Windows: Install from [Podman releases](https://github.com/containers/podman/releases), then `podman machine init && podman machine start`

### Running the Application

> **Note:** You can use either **make commands** (recommended) or **podman-compose commands** directly. Both approaches work the same way.

#### Using Make Commands (Recommended)

The project includes a Makefile with convenient shortcuts for common operations:

```bash
# Show available commands
make help

# Start all services (first run takes 2-3 minutes)
make up

# Stop services
make down

# Rebuild and restart all services
make build

# Run backend tests (includes npm audit)
make test

# Stop services and remove all data (fresh start)
make clean
```

The Makefile automatically detects whether to use `podman compose` or `podman-compose` based on your system.

#### Using Podman Compose Commands Directly

Alternatively, you can use podman-compose commands directly:

> **Note:** You can use either `podman-compose` (with hyphen) or `podman compose` (with space) interchangeably:
> - `podman compose` (with space) is the newer built-in subcommand available in recent Podman versions
> - `podman-compose` (with hyphen) is the older standalone program that needs to be installed separately
> - Both are functionally equivalent for this project
> - The Makefile automatically detects which one is available on your system

```bash
# Start all services (first run takes 2-3 minutes)
podman-compose up

# Or run in background
podman-compose up -d

# View logs
podman-compose logs -f

# Stop services
podman-compose down

# Stop and remove all data (fresh start)
podman-compose down -v
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

## Project Structure

```
bob-pool/
├── backend/                 # Node.js/Express API
│   ├── routes/             # API endpoints
│   │   ├── auth.js        # Authentication
│   │   ├── rides.js       # Ride management
│   │   └── index.js       # Route aggregator
│   ├── db.js              # Database connection & schema
│   ├── server.js          # Express server setup
│   ├── package.json       # Backend dependencies
│   └── Containerfile      # Backend container config
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── config/        # Configuration (api.js)
│   │   ├── styles/        # CSS
│   │   ├── App.jsx        # Main app with routing
│   │   └── main.jsx       # Entry point
│   ├── vite.config.js     # Vite config (container)
│   ├── vite.config.local.js # Vite config (local dev)
│   └── Containerfile      # Frontend container config
└── compose.yml            # Podman Compose orchestration
```

## Development

### Database Access

The PostgreSQL service is exposed by Compose on `localhost:5432`, so you can access it either directly with any PostgreSQL client using the mapped port, or from inside the Compose-managed container.

```bash
# Open psql through the Compose db service
podman compose exec db psql -U bobpool -d bobpool

# Or connect directly from your host if psql is installed locally
psql -h localhost -p 5432 -U bobpool -d bobpool

# View tables
\dt

# Query data
SELECT * FROM users;
SELECT * FROM rides;
SELECT * FROM ride_requests;

# Exit
\q
```

**Credentials:**
- Host: localhost
- Port: 5432
- Database: bobpool
- Username: bobpool
- Password: bobpool_dev

### Adding Dependencies

```bash
# Backend
cd backend && npm install <package>
podman-compose up --build backend

# Frontend
cd frontend && npm install <package>
podman-compose up --build frontend
```

## Key Implementation Details

### Authentication
- Session-based (not JWT)
- Frontend must include `credentials: 'include'` in fetch requests
- Login does full-page redirect to refresh auth context

### Frontend API Calls
- Always use `buildApiUrl(...)` from `frontend/src/config/api.js`
- Never hardcode API URLs

### Database
- Importing `backend/db.js` has side effects (connection/schema init runs immediately)
- IBM email restriction enforced in both backend validation AND DB schema constraint

### Vite Configurations
- `vite.config.js` - Container setup (proxies to `http://backend:3001`)
- `vite.config.local.js` - Local dev (proxies to `http://localhost:3001`)

### Business Logic
- One active ride per driver per date (enforced in route logic, not DB constraint)
- Seat availability uses transactions (allows zero seats)
- No batch ride creation endpoint (multi-date handled client-side)
- Frontend container install uses `npm install --legacy-peer-deps`

### CORS
- Hardcoded to localhost:3000 in development
- Changing frontend origin requires backend CORS update

---

**Made with Bob** 🚗
