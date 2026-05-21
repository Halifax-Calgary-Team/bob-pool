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

## Development

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
- Development: Hardcoded to localhost:3000
- Production: Configurable via `FRONTEND_ORIGIN` environment variable (comma-separated list)

## Production Deployment

### Overview

The production deployment uses a distroless container image for enhanced security and a smaller attack surface. The application combines the frontend and backend into a single container that serves both the React SPA and the API endpoints.

**Production Architecture:**
- Single distroless container (Node.js 20 on Debian 12)
- Multi-stage build (frontend builder → backend deps → runtime)
- PostgreSQL database with persistent volume
- Health checks for both services
- Non-root user execution
- Minimal attack surface (no shell, package manager, or unnecessary tools)

### Quick Start (Production)

```bash
# Build and start production services
podman-compose -f compose.prod.yml up -d

# View logs
podman-compose -f compose.prod.yml logs -f

# Stop services
podman-compose -f compose.prod.yml down

# Stop and remove all data
podman-compose -f compose.prod.yml down -v
```

**Access:**
- Application: http://localhost:8080
- Health check: http://localhost:8080/health

### Building the Production Image

```bash
# Build using distroless Containerfile
podman build -f Containerfile.distroless -t bobpool:latest .

# Or let compose build it
podman-compose -f compose.prod.yml build
```

### Environment Variables

The production deployment supports the following environment variables:

**Required:**
- `DB_PASSWORD` - PostgreSQL password (default: bobpool_prod)
- `SESSION_SECRET` - Session encryption key (use strong random value)

**Optional:**
- `DB_HOST` - Database host (default: db)
- `DB_USER` - Database user (default: bobpool)
- `DB_NAME` - Database name (default: bobpool)
- `DB_PORT` - Database port (default: 5432)
- `PORT` - Application port (default: 8080)
- `FRONTEND_ORIGIN` - Comma-separated CORS origins (default: http://localhost:8080)
- `NODE_ENV` - Node environment (default: production)

**Secrets Support:**
- `SESSION_SECRET_FILE` - Path to file containing session secret
- `DB_PASSWORD_FILE` - Path to file containing database password

### Configuration Examples

**Using environment variables:**
```bash
# Create .env file for production
cat > .env.prod << EOF
DB_PASSWORD=your-secure-database-password
SESSION_SECRET=your-very-long-random-secret-key-here
FRONTEND_ORIGIN=https://bobpool.example.com,https://www.bobpool.example.com
EOF

# Start with custom environment
podman-compose -f compose.prod.yml --env-file .env.prod up -d
```

**Using Docker secrets (recommended for production):**
```bash
# Create secrets
echo "your-secure-password" | podman secret create db_password -
echo "your-session-secret" | podman secret create session_secret -

# Update compose.prod.yml to use secrets
# (Add secrets section and mount them in the app service)
```

### Database Persistence

Production data is stored in a named volume:
```bash
# Backup database
podman exec bobpool-db-prod pg_dump -U bobpool bobpool > backup.sql

# Restore database
cat backup.sql | podman exec -i bobpool-db-prod psql -U bobpool bobpool

# Inspect volume
podman volume inspect bobpool_postgres_data
```

### Health Checks

Both services include health checks:

**Database:**
- Command: `pg_isready -U bobpool`
- Interval: 10s
- Timeout: 5s
- Retries: 5

**Application:**
- Endpoint: http://localhost:8080/health
- Interval: 30s
- Timeout: 10s
- Retries: 3

Check health status:
```bash
podman-compose -f compose.prod.yml ps
```

### Security Features

**Distroless Image Benefits:**
- No shell or package manager
- Minimal OS footprint
- Reduced attack surface
- Non-root user execution
- Only runtime dependencies included

**Application Security:**
- Session-based authentication
- Secure cookies in production (HTTPS)
- CORS protection
- IBM email domain restriction
- SQL injection protection (parameterized queries)
- Password hashing (bcrypt)

### Troubleshooting

**Check application logs:**
```bash
podman-compose -f compose.prod.yml logs app
```

**Check database logs:**
```bash
podman-compose -f compose.prod.yml logs db
```

**Verify health status:**
```bash
curl http://localhost:8080/health
```

**Connect to database:**
```bash
podman exec -it bobpool-db-prod psql -U bobpool -d bobpool
```

**Note:** The distroless container does not include a shell, so you cannot exec into the app container for debugging. Use logs and health checks instead.

### Production vs Development

| Feature | Development | Production |
|---------|-------------|------------|
| Base Image | node:18-alpine | distroless/nodejs20-debian12 |
| Services | 3 (frontend, backend, db) | 2 (app, db) |
| Hot Reload | ✅ Enabled | ❌ Disabled |
| Source Mounts | ✅ Volume mounts | ❌ Copied at build |
| Shell Access | ✅ Available | ❌ Not available |
| Image Size | ~500MB | ~200MB |
| Security | Standard | Enhanced (distroless) |
| Port | 3000 (frontend), 3001 (backend) | 8080 (combined) |

---

**Made with Bob** 🚗
