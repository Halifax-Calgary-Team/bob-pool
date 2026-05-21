# AGENTS.md - Ask Mode

Documentation and explanation caveats for misleading structure or hidden behavior.

## Hidden Behavior

- **`backend/db.js` import has side effects** - connection/schema init runs on import, not explicit call
- **Login redirect is intentional** - full-page reload refreshes auth context; not a bug to "fix" with SPA navigation
- **IBM dropoff location only enforced client-side** - backend accepts any coordinates; frontend hardcodes IBM location

## Misleading Structure

- **No root `package.json`** - commands must run from `backend/` or `frontend/` subdirectories
- **Two Vite configs** - `vite.config.js` (container) vs `vite.config.local.js` (local dev) with different proxy targets
- **No test/lint/format configs** - project has no testing or linting infrastructure

## Business Logic Nuances

- **One ride per driver per date** - enforced in application logic, NOT database constraints
- **Seat availability allows zero** - transactions handle booking; no minimum seat requirement
- **Multi-date rides** - no batch endpoint; client makes multiple individual POST requests
- **IBM email restriction** - enforced in BOTH backend validation AND database schema

## Auth & API

- **Session-based auth** - not JWT; `req.session.userId` holds state
- **Frontend must send credentials** - all API calls require credentials in fetch options
- **Use `buildApiUrl(...)`** - from `frontend/src/config/api.js`; avoid hardcoded URLs
- **CORS locked to localhost:3000** - non-default origins need backend changes