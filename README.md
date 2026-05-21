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

## Quick Start

### Prerequisites

- Podman and Podman Compose installed
- Ports 3000, 3001, 5432 available

**Installation:**
- Linux: `sudo dnf install podman podman-compose` (Fedora/RHEL) or `sudo apt-get install podman podman-compose` (Ubuntu/Debian)
- macOS: `brew install podman podman-compose && podman machine init && podman machine start`
- Windows: Install from [Podman releases](https://github.com/containers/podman/releases), then `podman machine init && podman machine start`

### Running the Application

> **Note:** You can use either `podman-compose` (with hyphen) or `podman compose` (without hyphen) interchangeably. Both commands work the same way.

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

## Database Schema

**users:**
- id, email (unique, @ibm.com only), name, password_hash, created_at

**rides:**
- id, driver_id (FK users), pickup_location, dropoff_location, ride_date, ride_time, seats_available, status (active/completed/cancelled), created_at

**ride_requests:**
- id, ride_id (FK rides), rider_id (FK users), status (pending/accepted/rejected), created_at
- Unique constraint: (ride_id, rider_id)

## API Reference

**Base URL:** http://localhost:3001/api

**Authentication:** Session-based (cookies)

### Endpoints

**Auth:**
- `POST /auth/register` - Register user (email, name, password)
- `POST /auth/login` - Login (email, password)
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user (🔒 auth required)

**Rides:**
- `GET /rides` - List rides (query: date, pickup, dropoff, status)
- `POST /rides` - Create ride (🔒)
- `GET /rides/:id` - Get ride details with requests
- `PUT /rides/:id` - Update ride (🔒 owner only)
- `DELETE /rides/:id` - Delete ride (🔒 owner only)

**Ride Requests:**
- `POST /rides/:id/request` - Request to join ride (🔒)
- `PUT /rides/:id/requests/:requestId` - Accept/reject request (🔒 driver only)

**Example:**
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@ibm.com","name":"Test User","password":"password123"}'

# Create ride
curl -X POST http://localhost:3001/api/rides \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"pickup_location":"Toronto","dropoff_location":"Markham","ride_date":"2026-05-20","ride_time":"08:00","seats_available":3}'

# List rides
curl http://localhost:3001/api/rides
```

## Development

### Hot Reloading

Both frontend and backend support hot-reloading:
- Frontend: Edit files in `frontend/src/` - browser auto-refreshes
- Backend: Edit files in `backend/` - server auto-restarts

### Running Frontend Locally (Without Container)

```bash
# Start backend in container
podman-compose -f compose.backend-only.yml up -d

# Run frontend locally
cd frontend
npm install
npm run dev
```

Frontend will be at http://localhost:3000, proxying API calls to http://localhost:3001

### Database Access

```bash
# Connect to PostgreSQL
podman exec -it bobpool-db psql -U bobpool -d bobpool

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
- Hardcoded to localhost:3000
- Changing frontend origin requires backend CORS update

## Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Stop containers
podman-compose down
```

### Database Connection Failed
```bash
# Check status
podman-compose ps

# View logs
podman-compose logs db

# Restart
podman-compose restart db
```

### Build Fails
```bash
# Clear cache and rebuild
podman-compose down
podman system prune -a
podman-compose up --build
```

### Podman Machine Not Starting (Mac/Windows)
```bash
podman machine stop
podman machine rm
podman machine init
podman machine start
```

## Podman vs Docker

**Key Differences:**
- No daemon required (daemonless architecture)
- Rootless by default (better security)
- Drop-in replacement for Docker CLI
- Compatible with Dockerfiles/Containerfiles

**Commands:**
- `docker-compose` → `podman-compose`
- `docker` → `podman`

## Project Notes

- No root `package.json` - run commands from `backend/` or `frontend/` directories
- No test/lint/format configs exist
- Frontend uses `--legacy-peer-deps` for Leaflet compatibility
- Database schema auto-initializes on first run
- Data persists in Podman volumes between restarts

---

**Made with Bob** 🚗
