# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Structure

- No root `package.json`; run commands from `backend/` or `frontend/` directories
- Backend: `cd backend && npm install && npm start`
- Frontend: `cd frontend && npm install && npm run dev`

## Key Gotchas

- **No test/lint/format configs exist** - single-test execution not supported
- **Frontend container install**: uses `npm install --legacy-peer-deps`
- **Two Vite configs**: `vite.config.js` (container, proxies to `http://backend:3001`) vs `vite.config.local.js` (local dev, proxies to `http://localhost:3001`)
- **Auth is session-based**, not JWT; frontend must include credentials in requests
- **Importing `backend/db.js` has side effects** - connection/schema init runs immediately
- **IBM email restriction** enforced in both backend validation and DB schema
- **CORS hardcoded to localhost:3000** - non-default frontend origins need backend changes
- **Login does full-page redirect** to refresh auth context, not SPA navigation
- **Multi-date ride requests** = multiple client-side POSTs; no batch backend endpoint

## Frontend API Calls

Always use `frontend/src/config/api.js` `buildApiUrl(...)` - avoid hardcoded URLs