# AGENTS.md - Advanced Mode

Advanced mode can inspect runtime/browser state, but same project rules apply.

## Side Effects & Imports

- **`backend/db.js` import has side effects** - connection and schema initialization run immediately; avoid importing unless needed

## Auth Implementation

- **Session-based auth**, not JWT - `req.session.userId` holds auth state
- **Frontend credentials required** - all API calls must include credentials in fetch options
- **IBM email restriction** enforced in both backend validation logic AND DB schema constraint

## Business Logic Constraints

- **One active ride per driver per date** - enforced in route logic, NOT a DB unique constraint
- **Seat availability uses transactions** - allows zero seats; do not assume minimum 1
- **No batch ride creation endpoint** - multi-date requests handled client-side as multiple POSTs

## Frontend Specifics

- **Always use `buildApiUrl(...)`** from `frontend/src/config/api.js` - never hardcode API URLs
- **IBM dropoff location hardcoded** in multiple frontend places - backend does NOT enforce this invariant
- **Login does full-page redirect** to refresh auth context - intentional, not a bug

## Environment-Specific

- **Two Vite configs exist** - `vite.config.js` for containers, `vite.config.local.js` for local dev
- **CORS hardcoded to localhost:3000** - changing frontend origin requires backend CORS update
- **Container frontend install** uses `--legacy-peer-deps` flag