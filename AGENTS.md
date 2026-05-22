# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Structure

- No root `package.json`; run commands from `backend/` or `frontend/` directories
- **Always use `$(PODMAN_COMPOSE)` (from Makefile) for npm commands** - never run npm directly on host
  - Makefile detects whether to use `podman compose` or `podman-compose`
- Backend: `$(PODMAN_COMPOSE) run --rm backend npm install`
- Frontend: `$(PODMAN_COMPOSE) run --rm frontend npm install`
- **No .env files used** - all configuration is in `compose.yml`

## Configuration

- **Development mode** (default): `podman-compose up`
  - Backend service on port 3001
  - Uses direct environment variables in `compose.yml`
  - Migrations run automatically on startup
- **Production mode** (opt-in): `podman-compose --profile prod up`
  - Backend-prod service on port 8080
  - Uses Docker secrets for sensitive data
  - Migrations run automatically on startup
  - Serves static frontend files

## Key Gotchas

- **No test/lint/format configs exist** - single-test execution not supported
- **Frontend container install**: uses `npm install --legacy-peer-deps`
- **Two Vite configs**: `vite.config.js` (container, proxies to `http://backend:3001`) vs `vite.config.local.js` (local dev, proxies to `http://localhost:3001`)
- **Auth is session-based**, not JWT; frontend must include credentials in requests
- **Importing `backend/db.js` NO LONGER has side effects** - only exports connection pool and testConnection()
- **Docker secrets support** - database credentials can be loaded from `*_FILE` environment variables (e.g., `DB_PASSWORD_FILE`) pointing to secret files
- **Two backend services exist**: `backend` (dev, port 3001) and `backend-prod` (production, port 8080, profile-gated)
- **IBM email restriction** enforced in both backend validation and DB schema (via migrations)
- **CORS hardcoded to localhost:3000** - non-default frontend origins need backend changes
- **Login does full-page redirect** to refresh auth context, not SPA navigation
- **Multi-date ride requests** = multiple client-side POSTs; no batch backend endpoint

## Database Migrations

**System**: node-pg-migrate with pure SQL files in `backend/migrations/`
**Tracking**: `pgmigrations` table tracks applied migrations
**Execution**: Migrations run automatically on container startup (both dev and prod)

### Migration Commands

```bash
# Check migration status
make migrate-status

# Apply pending migrations (manual)
make migrate-up

# Rollback last migration
make migrate-down

# Create new migration
make migrate-create NAME=description
```

### Creating Migrations

1. Generate migration file: `make migrate-create NAME=add_user_phone`
2. Edit `backend/migrations/{timestamp}_add_user_phone.sql`
3. Write both UP and DOWN sections:
   ```sql
   -- Up Migration
   ALTER TABLE users ADD COLUMN phone VARCHAR(20);
   
   -- Down Migration
   ALTER TABLE users DROP COLUMN phone;
   ```
4. Test: `make migrate-up` then `make migrate-down` then `make migrate-up`
5. Commit migration file with code changes

### Migration Rules

- **Never modify existing migrations** after they're merged to main
- **Always write DOWN migrations** for rollback support
- **Use IF NOT EXISTS / IF EXISTS** for idempotency
- **Keep migrations focused** on single logical change
- **Test both directions** before committing
- **Respect foreign key order** when dropping tables
- **Add indexes** for new foreign key columns

### Current Schema (via migrations)

**Tables**:
- `users`: id, email (IBM only), name, password_hash, created_at
- `rides`: id, driver_id (FK), pickup_location_full, pickup_location_name, dropoff_location, ride_date, ride_time, seats_available (>=0), status, created_at
- `ride_requests`: id, ride_id (FK), rider_id (FK), status, created_at, UNIQUE(ride_id, rider_id)

**Indexes**:
- idx_rides_driver, idx_rides_date, idx_rides_status
- idx_requests_ride, idx_requests_rider

**Constraints**:
- Users: email LIKE '%@ibm.com'
- Rides: seats_available >= 0, status IN ('active', 'completed', 'cancelled')
- Ride requests: status IN ('pending', 'accepted', 'rejected')

### Migration Examples

**Add column**:
```sql
-- Up Migration
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Down Migration
DROP INDEX IF EXISTS idx_users_phone;
ALTER TABLE users DROP COLUMN phone;
```

**Add table**:
```sql
-- Up Migration
CREATE SEQUENCE IF NOT EXISTS notifications_id_seq;
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY DEFAULT nextval('notifications_id_seq'),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Down Migration
DROP INDEX IF EXISTS idx_notifications_user;
DROP TABLE IF EXISTS notifications;
DROP SEQUENCE IF EXISTS notifications_id_seq;
```

**Modify constraint**:
```sql
-- Up Migration
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_check;
ALTER TABLE users ADD CONSTRAINT users_email_check
  CHECK (email LIKE '%@ibm.com' OR email LIKE '%@external.com');

-- Down Migration
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_check;
ALTER TABLE users ADD CONSTRAINT users_email_check
  CHECK (email LIKE '%@ibm.com');
```

## Frontend API Calls

Always use `frontend/src/config/api.js` `buildApiUrl(...)` - avoid hardcoded URLs