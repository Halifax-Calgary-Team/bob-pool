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

> **Note:** You can use either `podman-compose` (with hyphen) or `podman compose` (with space) interchangeably. The space version is the newer built-in subcommand, while the hyphen version is the older standalone program. Both are functionally equivalent for this project.

**Development Mode (default):**
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

# Run database migrations manually
podman-compose run --rm backend npm run migrate:up
```

**Production Mode (opt-in):**
```bash
# Start with production backend profile
podman-compose --profile prod up

# Or run in background
podman-compose --profile prod up -d
```

**Access:**
- **Development Mode:**
  - Frontend: http://localhost:3000
  - Backend API: http://localhost:3001
  - Health check: http://localhost:3001/health
- **Production Mode:**
  - Backend API: http://localhost:8080
  - Health check: http://localhost:8080/health

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

### Database Migrations

This project uses [node-pg-migrate](https://github.com/salsita/node-pg-migrate) for database schema management with pure SQL migration files.

**Migration Commands:**

```bash
# Check migration status
podman-compose run --rm backend npm run migrate:status

# Run pending migrations (manual)
podman-compose run --rm backend npm run migrate:up

# Rollback last migration
podman-compose run --rm backend npm run migrate:down

# Create new migration
podman-compose run --rm backend npm run migrate:create add_user_phone
```

**Automatic Migrations:**

Migrations run automatically when starting services:
- Development: `podman-compose up` runs migrations before starting the backend
- Production: `podman-compose --profile prod up` runs migrations before starting

**Creating Migrations:**

1. Generate migration file:
   ```bash
   podman-compose run --rm backend npm run migrate:create add_user_phone
   ```

2. Edit the generated SQL file in `backend/migrations/`

3. Write both UP and DOWN sections:
   ```sql
   -- Up Migration
   ALTER TABLE users ADD COLUMN phone VARCHAR(20);
   
   -- Down Migration
   ALTER TABLE users DROP COLUMN phone;
   ```

4. Test the migration:
   ```bash
   podman-compose run --rm backend npm run migrate:up    # Apply
   podman-compose run --rm backend npm run migrate:down  # Rollback
   podman-compose run --rm backend npm run migrate:up    # Re-apply
   ```

5. Commit the migration file with your code changes

**Migration Best Practices:**
- Keep migrations small and focused on a single change
- Always write DOWN migrations for rollback support
- Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- Test both UP and DOWN migrations before committing
- Never modify existing migrations after they're merged to main

### Database Access

The PostgreSQL service is exposed by Compose on `localhost:5432`, so you can access it either directly with any PostgreSQL client using the mapped port, or from inside the Compose-managed container.

```bash
# Open psql through the Compose db service
podman compose exec db psql -U bobpool -d bobpool

# Or connect directly from your host if psql is installed locally
psql -h localhost -p 5432 -U bobpool -d bobpool

# View tables
\dt

# View migration history
SELECT * FROM pgmigrations ORDER BY run_on;

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
- Password: dev_password

### Adding Dependencies

```bash
# Backend
cd backend && npm install <package>
podman-compose up --build backend

# Frontend
cd frontend && npm install <package>
podman-compose up --build frontend
```

## Testing

Bob Pool has comprehensive unit testing for both backend and frontend with coverage reporting and visualization. See [TESTING.md](TESTING.md) for complete documentation.

### Quick Start

```bash
# Backend tests
cd backend && npm test                    # Run all tests
cd backend && npm run test:coverage       # With coverage report
cd backend && npm run test:watch          # Watch mode

# Frontend tests
cd frontend && npm test                   # Run all tests
cd frontend && npm run test:ui            # Interactive UI
cd frontend && npm run test:coverage      # With coverage report
```

### Test Coverage

- **Backend**: 4 test files, 100+ test cases
  - Validation logic (email, ride data)
  - Helper functions
  - Authentication routes
  - Ride management routes
  - Coverage reports: `backend/coverage/index.html`

- **Frontend**: 3 test files, 50+ test cases
  - Component rendering and interaction
  - Authentication context
  - API configuration
  - Coverage reports: `frontend/coverage/index.html`

### Container Build and Health Check

Test the production container build and health check:

```bash
# Build the production container
podman build -f Containerfile -t bob-pool:test .

# Run the container
podman run --rm -d --name bob-pool-test \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=bobpool \
  -e DB_USER=bobpool \
  -e DB_PASSWORD=test_password \
  -e SESSION_SECRET=test_secret \
  -e AUTO_INIT_DB=false \
  -p 8080:8080 \
  bob-pool:test

# Run health check
podman exec bob-pool-test /app/backend/production/healthcheck.sh

# Stop the container
podman stop bob-pool-test
```

**What the health check validates:**
- PostgreSQL is running and accepting connections
- Node.js application is running
- Application is listening on port 8080
- Health endpoint (`/health`) responds with status 200

**Continuous Integration:**

The container test runs automatically in GitHub Actions on:
- Push to `main` branch
- Pull requests targeting `main`

This ensures the production container builds successfully and passes health checks before merging changes.

## Key Implementation Details

### Authentication
- Session-based (not JWT)
- Frontend must include `credentials: 'include'` in fetch requests
- Login does full-page redirect to refresh auth context

### Frontend API Calls
- Always use `buildApiUrl(...)` from `frontend/src/config/api.js`
- Never hardcode API URLs

### Database
- Database schema managed via migrations in `backend/migrations/`
- Migrations run automatically on container startup
- **No .env files used** - all configuration is done via `compose.yml` environment variables
- Docker secrets support via `*_FILE` environment variables (e.g., `DB_PASSWORD_FILE`)
- IBM email restriction enforced in both backend validation AND DB schema (via migrations)

### Configuration
- **Development mode (`backend` service):**
  - Uses direct environment variables in `compose.yml`
  - Port 3001
  - Migrations run automatically on startup
  - Hot reload enabled via nodemon
- **Production mode (`backend-prod` service):**
  - Uses Docker secrets for sensitive data
  - Port 8080
  - Migrations run automatically on startup
  - Opt-in via `--profile prod` flag
  - Serves static frontend files

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
