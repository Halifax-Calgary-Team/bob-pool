# Bob Pool Development Guide

A comprehensive guide for developers working on the Bob Pool carpooling application.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [How the Pieces Connect](#how-the-pieces-connect)
- [Code Organization](#code-organization)
- [Database Schema](#database-schema)
- [Adding New Features](#adding-new-features)
- [Common Development Tasks](#common-development-tasks)
- [Debugging](#debugging)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Architecture Overview

Bob Pool follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  - User Interface                                        │
│  - React Components                                      │
│  - Client-side Routing                                   │
│  - Runs on: http://localhost:3000                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Requests (JSON)
                     │ API calls via fetch/axios
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js/Express)                │
│  - REST API                                              │
│  - Business Logic                                        │
│  - Authentication & Sessions                             │
│  - Runs on: http://localhost:3001                        │
└────────────────────┬────────────────────────────────────┘
                     │ SQL Queries
                     │ pg (node-postgres)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                DATABASE (PostgreSQL)                     │
│  - Data Storage                                          │
│  - Tables: users, rides, ride_requests                   │
│  - Runs on: localhost:5432                               │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**:
- **React 18**: UI library for building components
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing

**Backend**:
- **Node.js**: JavaScript runtime
- **Express**: Web framework for building APIs
- **express-session**: Session management
- **bcrypt**: Password hashing
- **pg**: PostgreSQL client

**Database**:
- **PostgreSQL 15**: Relational database

**DevOps**:
- **Podman**: Containerization
- **Podman Compose**: Multi-container orchestration

## How the Pieces Connect

### 1. Frontend → Backend Communication

The frontend makes HTTP requests to the backend API:

```javascript
// Example: Fetching rides from the frontend
fetch('http://localhost:3001/api/rides')
  .then(response => response.json())
  .then(data => console.log(data.rides));
```

**Key Points**:
- Frontend runs on port 3000
- Backend API runs on port 3001
- CORS is enabled to allow cross-origin requests
- Sessions use cookies (automatically sent with requests)

### 2. Backend → Database Communication

The backend uses the `pg` library to query PostgreSQL:

```javascript
// Example: Querying the database
const { pool } = require('./db');
const result = await pool.query('SELECT * FROM rides WHERE status = $1', ['active']);
```

**Key Points**:
- Connection pool manages database connections
- Parameterized queries prevent SQL injection
- Transactions ensure data consistency

### 3. Podman Networking

All services communicate through Podman's internal network:

```yaml
# podman-compose.yml defines the network
services:
  db:        # Accessible as 'db' from other containers
  backend:   # Accessible as 'backend' from other containers
  frontend:  # Accessible as 'frontend' from other containers
```

**Key Points**:
- Services use service names as hostnames (e.g., `db`, `backend`)
- Ports are mapped to localhost for external access
- Internal network is isolated from the host

## Code Organization

### Backend Structure

```
backend/
├── routes/              # API route handlers
│   ├── auth.js         # Authentication endpoints
│   ├── rides.js        # Ride management endpoints
│   └── index.js        # Route aggregator
├── db.js               # Database connection & schema
├── server.js           # Express server setup
├── package.json        # Dependencies
├── Containerfile       # Container configuration
└── .env.example        # Environment variables template
```

**File Purposes**:

- **`server.js`**: Main entry point, sets up Express, middleware, and routes
- **`db.js`**: Database connection pool and schema initialization
- **`routes/auth.js`**: User registration, login, logout, session management
- **`routes/rides.js`**: CRUD operations for rides and ride requests
- **`routes/index.js`**: Combines all route modules

### Frontend Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   │   ├── Navbar.jsx  # Navigation bar
│   │   └── index.js    # Component exports
│   ├── pages/          # Page components (routes)
│   │   ├── Home.jsx    # Home page
│   │   └── index.js    # Page exports
│   ├── styles/         # CSS stylesheets
│   │   └── main.css    # Global styles
│   ├── App.jsx         # Main app component with routing
│   └── main.jsx        # React entry point
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies
└── Containerfile       # Container configuration
```

**File Purposes**:

- **`main.jsx`**: Renders the React app into the DOM
- **`App.jsx`**: Sets up React Router and defines routes
- **`components/`**: Reusable UI components (buttons, forms, etc.)
- **`pages/`**: Full page components mapped to routes
- **`styles/`**: CSS files for styling

## Database Schema

### Tables

#### `users`
Stores user account information.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL CHECK (email LIKE '%@ibm.com'),
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `rides`
Stores ride listings created by drivers.

```sql
CREATE TABLE rides (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pickup_location VARCHAR(500) NOT NULL,
  dropoff_location VARCHAR(500) NOT NULL,
  ride_date DATE NOT NULL,
  ride_time TIME NOT NULL,
  seats_available INTEGER NOT NULL CHECK (seats_available > 0),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `ride_requests`
Stores requests from riders to join rides.

```sql
CREATE TABLE ride_requests (
  id SERIAL PRIMARY KEY,
  ride_id INTEGER NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ride_id, rider_id)
);
```

### Relationships

```
users (1) ──< (many) rides
  └─> A user can create many rides as a driver

rides (1) ──< (many) ride_requests
  └─> A ride can have many requests from different riders

users (1) ──< (many) ride_requests
  └─> A user can make many ride requests as a rider
```

## Adding New Features

### Adding a New API Endpoint

**Example**: Add an endpoint to get a user's ride history.

1. **Create the route handler** in `backend/routes/rides.js`:

```javascript
// GET /api/rides/my-rides - Get current user's rides
router.get('/my-rides', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM rides WHERE driver_id = $1 ORDER BY ride_date DESC`,
      [req.session.userId]
    );
    
    res.json({ rides: result.rows });
  } catch (error) {
    console.error('Get my rides error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to fetch rides'
    });
  }
});
```

2. **Test the endpoint** using cURL:

```bash
curl -X GET http://localhost:3001/api/rides/my-rides -b cookies.txt
```

3. **Update API documentation** in `API.md` with the new endpoint.

### Adding a New React Page/Component

**Example**: Add a "My Rides" page.

1. **Create the page component** in `frontend/src/pages/MyRides.jsx`:

```jsx
import React, { useState, useEffect } from 'react';

function MyRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/rides/my-rides', {
      credentials: 'include' // Include session cookie
    })
      .then(res => res.json())
      .then(data => {
        setRides(data.rides);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching rides:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="my-rides">
      <h1>My Rides</h1>
      {rides.length === 0 ? (
        <p>You haven't created any rides yet.</p>
      ) : (
        <ul>
          {rides.map(ride => (
            <li key={ride.id}>
              {ride.pickup_location} → {ride.dropoff_location}
              <br />
              {ride.ride_date} at {ride.ride_time}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyRides;
```

2. **Export the component** in `frontend/src/pages/index.js`:

```javascript
export { default as Home } from './Home';
export { default as MyRides } from './MyRides';
```

3. **Add the route** in `frontend/src/App.jsx`:

```jsx
import { MyRides } from './pages';

// Inside the Routes component:
<Route path="/my-rides" element={<MyRides />} />
```

4. **Add navigation link** in `frontend/src/components/Navbar.jsx`:

```jsx
<Link to="/my-rides">My Rides</Link>
```

### Adding a New Database Table

**Example**: Add a `reviews` table for ride reviews.

1. **Add table creation** in `backend/db.js` inside `initializeSchema()`:

```javascript
// Create reviews table
await client.query(`
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ride_id, reviewer_id)
  )
`);
console.log('  ✓ Reviews table ready');

// Create index
await client.query(`
  CREATE INDEX IF NOT EXISTS idx_reviews_ride ON reviews(ride_id);
`);
```

2. **Restart containers** to apply schema changes:

```bash
podman-compose down -v  # Remove volumes to reset database
podman-compose up
```

3. **Create API endpoints** for the new table in a new file `backend/routes/reviews.js`.

4. **Register the routes** in `backend/routes/index.js`.

## Common Development Tasks

### Viewing Database Contents

**Option 1: Using psql in Podman**

```bash
# Connect to the database container
podman exec -it bobpool-db psql -U bobpool -d bobpool

# Run SQL queries
SELECT * FROM users;
SELECT * FROM rides;
SELECT * FROM ride_requests;

# Exit psql
\q
```

**Option 2: Using a GUI tool**

Connect using these credentials:
- Host: `localhost`
- Port: `5432`
- Database: `bobpool`
- Username: `bobpool`
- Password: `bobpool_dev`

Recommended tools:
- [pgAdmin](https://www.pgadmin.org/)
- [DBeaver](https://dbeaver.io/)
- [TablePlus](https://tableplus.com/)

### Running Database Migrations

Currently, the schema is initialized automatically. For future migrations:

1. **Create a migration file** in `backend/migrations/`:

```javascript
// backend/migrations/001_add_phone_to_users.js
module.exports = {
  up: async (client) => {
    await client.query(`
      ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    `);
  },
  down: async (client) => {
    await client.query(`
      ALTER TABLE users DROP COLUMN phone;
    `);
  }
};
```

2. **Create a migration runner** (future enhancement).

### Adding Environment Variables

1. **Add to `backend/.env.example`**:

```env
NEW_VARIABLE=default_value
```

2. **Add to `podman-compose.yml`** under backend service:

```yaml
environment:
  NEW_VARIABLE: ${NEW_VARIABLE:-default_value}
```

3. **Use in code**:

```javascript
const newVariable = process.env.NEW_VARIABLE;
```

### Installing New Dependencies

**Backend**:

```bash
# Add to package.json
cd backend
npm install package-name

# Rebuild container
podman-compose up --build backend
```

**Frontend**:

```bash
# Add to package.json
cd frontend
npm install package-name

# Rebuild container
podman-compose up --build frontend
```

## Debugging

### Debugging Backend Issues

**View backend logs**:
```bash
podman-compose logs -f backend
```

**Common issues**:

1. **Database connection errors**:
   - Check if database container is running: `podman ps`
   - Check database logs: `podman-compose logs db`
   - Verify environment variables in `podman-compose.yml`

2. **Route not found (404)**:
   - Check route definition in `routes/` files
   - Verify route is registered in `routes/index.js`
   - Check URL path matches exactly (case-sensitive)

3. **Authentication errors (401)**:
   - Ensure session cookie is being sent with requests
   - Check `credentials: 'include'` in fetch requests
   - Verify CORS configuration in `server.js`

**Add debug logging**:

```javascript
// Add console.log statements
console.log('Request body:', req.body);
console.log('Session:', req.session);
console.log('Query result:', result.rows);
```

### Debugging Frontend Issues

**View frontend logs**:
```bash
podman-compose logs -f frontend
```

**Browser DevTools**:

1. **Console**: View JavaScript errors and console.log output
2. **Network**: Inspect API requests and responses
3. **Application**: View cookies and session storage

**Common issues**:

1. **Component not rendering**:
   - Check browser console for errors
   - Verify component is imported correctly
   - Check route path in `App.jsx`

2. **API calls failing**:
   - Check Network tab in DevTools
   - Verify API URL is correct
   - Check CORS headers in response

3. **State not updating**:
   - Verify useState is called correctly
   - Check useEffect dependencies array
   - Ensure state updates are immutable

**Add debug logging**:

```javascript
// Add console.log statements
console.log('Component mounted');
console.log('State:', state);
console.log('API response:', data);
```

### Using Podman Logs

**View all logs**:
```bash
podman-compose logs -f
```

**View specific service**:
```bash
podman-compose logs -f backend
podman-compose logs -f frontend
podman-compose logs -f db
```

**View last N lines**:
```bash
podman-compose logs --tail=50 backend
```

## Troubleshooting

### Container Won't Start

**Check container status**:
```bash
podman ps -a
```

**View container logs**:
```bash
podman-compose logs backend
```

**Common fixes**:
- Port already in use: Stop other services using ports 3000, 3001, or 5432
- Build failed: Run `podman-compose build --no-cache`
- Volume issues: Run `podman-compose down -v` then `podman-compose up`

### Database Connection Issues

**Symptoms**:
- Backend logs show "Database connection failed"
- API returns 500 errors

**Solutions**:

1. **Check database is running**:
```bash
podman ps | grep bobpool-db
```

2. **Check database logs**:
```bash
podman-compose logs db
```

3. **Verify environment variables**:
```bash
podman-compose config
```

4. **Reset database**:
```bash
podman-compose down -v
podman-compose up
```

### Hot Reload Not Working

**Frontend not reloading**:
- Check Vite logs: `podman-compose logs frontend`
- Verify file is saved
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

**Backend not reloading**:
- Check nodemon logs: `podman-compose logs backend`
- Verify file is saved in `backend/` directory
- Restart backend: `podman-compose restart backend`

### Port Already in Use

**Error**: "Bind for 0.0.0.0:3000 failed: port is already allocated"

**Solution**:

1. **Find process using the port**:
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

2. **Kill the process** or change the port in `podman-compose.yml`.

### Permission Denied Errors

**On Windows**: Ensure Podman has proper permissions and the Podman machine is running.

**On Mac/Linux**: Check file permissions:
```bash
ls -la
```

## Best Practices

### Code Style

**JavaScript/React**:
- Use meaningful variable names: `userData` not `data`
- Use arrow functions for callbacks
- Use async/await instead of .then() chains
- Add comments for complex logic
- Keep functions small and focused

**Example**:
```javascript
// Good
async function getUserRides(userId) {
  const result = await pool.query(
    'SELECT * FROM rides WHERE driver_id = $1',
    [userId]
  );
  return result.rows;
}

// Avoid
function f(x) {
  return pool.query('SELECT * FROM rides WHERE driver_id = $1', [x]).then(r => r.rows);
}
```

### Error Handling

**Always handle errors**:

```javascript
// Backend
try {
  const result = await pool.query('SELECT * FROM users');
  res.json({ users: result.rows });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Failed to fetch users' });
}

// Frontend
fetch('/api/users')
  .then(res => res.json())
  .then(data => setUsers(data.users))
  .catch(err => {
    console.error('Error:', err);
    setError('Failed to load users');
  });
```

### Security

**Never commit sensitive data**:
- Use `.env` files for secrets (already in `.gitignore`)
- Never hardcode passwords or API keys
- Use environment variables

**Validate user input**:
```javascript
// Backend validation
if (!email || !email.includes('@ibm.com')) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

**Use parameterized queries**:
```javascript
// Good - prevents SQL injection
pool.query('SELECT * FROM users WHERE email = $1', [email]);

// Bad - vulnerable to SQL injection
pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### Git Workflow

**Before starting work**:
```bash
git pull origin main
git checkout -b feature/your-feature
```

**Commit often with clear messages**:
```bash
git add .
git commit -m "Add: user profile page"
git commit -m "Fix: ride request validation"
git commit -m "Update: API documentation"
```

**Before pushing**:
```bash
# Test your changes
podman-compose up

# Push to remote
git push origin feature/your-feature
```

### Testing

**Manual testing checklist**:
- [ ] Test happy path (everything works)
- [ ] Test error cases (invalid input, missing data)
- [ ] Test authentication (logged in vs logged out)
- [ ] Test permissions (can only edit own data)
- [ ] Check browser console for errors
- [ ] Check backend logs for errors

**API testing with cURL**:
```bash
# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@ibm.com","name":"Test","password":"test123"}'

# Test creating a ride
curl -X POST http://localhost:3001/api/rides \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"pickup_location":"Toronto","dropoff_location":"Markham","ride_date":"2026-05-20","ride_time":"08:00","seats_available":3}'
```

### Documentation

**Keep documentation updated**:
- Update `API.md` when adding/changing endpoints
- Update `DEVELOPMENT.md` when adding new patterns
- Add comments for complex code
- Update README.md for major changes

**Comment your code**:
```javascript
// Good comments explain WHY, not WHAT
// Check if user has already requested this ride to prevent duplicates
const existingRequest = await pool.query(
  'SELECT id FROM ride_requests WHERE ride_id = $1 AND rider_id = $2',
  [rideId, userId]
);
```

---

## Need Help?

- **API Reference**: See [API.md](./API.md)
- **Project Overview**: See [README.md](./README.md)
- **Podman Issues**: Check [Podman documentation](https://docs.podman.io/)
- **React Issues**: Check [React documentation](https://react.dev/)
- **PostgreSQL Issues**: Check [PostgreSQL documentation](https://www.postgresql.org/docs/)

**Made with Bob** 🚗