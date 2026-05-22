# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Structure

- No root `package.json`; run commands from `backend/` or `frontend/` directories
- Backend: `cd backend && npm install && npm start`
- Frontend: `cd frontend && npm install && npm run dev`
- **No .env files used** - all configuration is in `compose.yml`

## Configuration

- **Development mode** (default): `podman-compose up`
  - Backend service on port 3001
  - Uses direct environment variables in `compose.yml`
  - `AUTO_INIT_DB=true` for automatic database initialization
- **Production mode** (opt-in): `podman-compose --profile prod up`
  - Backend-prod service on port 8080
  - Uses Docker secrets for sensitive data
  - `AUTO_INIT_DB=false` for manual initialization
  - Serves static frontend files

## Key Gotchas

- **No test/lint/format configs exist** - single-test execution not supported
- **Frontend container install**: uses `npm install --legacy-peer-deps`
- **Two Vite configs**: `vite.config.js` (container, proxies to `http://backend:3001`) vs `vite.config.local.js` (local dev, proxies to `http://localhost:3001`)
- **Auth is session-based**, not JWT; frontend must include credentials in requests
- **Importing `backend/db.js` has side effects** - connection/schema init behavior controlled by `AUTO_INIT_DB` environment variable:
  - `AUTO_INIT_DB=true` (default for development): Connection and schema init run immediately on import
  - `AUTO_INIT_DB=false` (production): Manual initialization required via `initializeDatabase()` call
- **Docker secrets support** - database credentials can be loaded from `*_FILE` environment variables (e.g., `DB_PASSWORD_FILE`) pointing to secret files
- **Two backend services exist**: `backend` (dev, port 3001) and `backend-prod` (production, port 8080, profile-gated)
- **IBM email restriction** enforced in both backend validation and DB schema
- **CORS hardcoded to localhost:3000** - non-default frontend origins need backend changes
- **Login does full-page redirect** to refresh auth context, not SPA navigation
- **Multi-date ride requests** = multiple client-side POSTs; no batch backend endpoint

## Frontend API Calls

Always use `frontend/src/config/api.js` `buildApiUrl(...)` - avoid hardcoded URLs