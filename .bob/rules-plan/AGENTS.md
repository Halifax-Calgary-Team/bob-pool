# AGENTS.md - Plan Mode

Architectural constraints and hidden coupling for planning changes.

## Architectural Constraints

- **No root package management** - backend and frontend are independent; no shared dependencies or monorepo tooling
- **Session-based auth architecture** - not JWT; changing to token-based auth requires session store removal and credential handling changes
- **No testing infrastructure** - adding tests requires choosing and configuring framework from scratch

## Hidden Coupling

- **`backend/db.js` side effects** - importing triggers connection/schema init; refactoring requires careful import management
- **IBM email restriction dual enforcement** - both backend validation AND DB schema; changing requires coordinating both layers
- **IBM dropoff location client-only** - frontend hardcodes location in multiple places; backend accepts any coordinates; centralizing requires backend changes
- **CORS and frontend origin coupling** - backend hardcoded to localhost:3000; changing frontend port/domain requires backend CORS update

## Business Logic Constraints

- **One ride per driver per date** - enforced in route logic, not DB; adding multi-ride support requires route logic changes, not just schema
- **Seat availability transaction-based** - allows zero seats; changing minimum requires transaction logic updates
- **No batch operations** - multi-date rides handled client-side; adding batch endpoint requires new route and transaction handling

## Environment Coupling

- **Two Vite configs** - container vs local dev with different proxy targets; deployment changes may require both configs
- **Container install flag** - frontend uses `--legacy-peer-deps`; dependency updates may require flag removal or investigation

## API Design

- **`buildApiUrl(...)` abstraction** - centralizes URL construction; changing API base path requires only config update
- **Full-page login redirect** - intentional for auth context refresh; changing to SPA navigation requires auth context refactor