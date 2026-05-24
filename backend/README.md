# Bob Pool Backend - Development Guide

This guide covers backend-specific development tasks for the Bob Pool carpooling application using Podman.

## 🚀 Quick Start

### Running the Backend Locally

```bash
# Start all services (from project root)
podman-compose up

# Start only backend and database
podman-compose up backend db
```

The backend API will be available at: http://localhost:3001

## 📁 Backend Structure

```
backend/
├── routes/              # API route handlers
│   ├── auth.js         # Authentication endpoints
│   ├── rides.js        # Ride management endpoints
│   └── index.js        # Route aggregator
├── db.js               # Database connection & schema
├── server.js           # Express server setup
├── package.json        # Dependencies
└── Containerfile       # Container configuration
```

## 🛠️ Development Workflow

### Making Changes

1. **Edit backend files** in the `backend/` directory
2. **Nodemon automatically restarts** the server when files change
3. **View logs** to see changes: `podman-compose logs -f backend`

### Adding New Dependencies

```bash
# Navigate to backend directory
cd backend

# Install new package
npm install package-name

# Rebuild the container
cd ..
podman-compose up --build backend
```

### Environment Variables

**Important:** This project does **not** use `.env` files. All configuration is done via `compose.yml`.

**Configuration is managed in `compose.yml`:**

1. **Development mode** (`backend` service):
   - Uses direct environment variables
   - Port 3001
   - `AUTO_INIT_DB=true` for automatic initialization
   ```yaml
   environment:
     DB_HOST: db
     DB_USER: bobpool
     DB_PASSWORD: bobpool_dev
     DB_NAME: bobpool
     DB_PORT: 5432
     SESSION_SECRET: dev-secret-key
     AUTO_INIT_DB: "true"
     NODE_ENV: development
     PORT: 3001
   ```

2. **Production mode** (`backend-prod` service):
   - Uses Docker secrets for sensitive data
   - Port 8080
   - `AUTO_INIT_DB=false` for manual initialization
   - Opt-in via `--profile prod` flag
   ```yaml
   environment:
     DB_HOST: db
     DB_USER: bobpool
     DB_PASSWORD_FILE: /run/secrets/db_password
     DB_NAME: bobpool
     DB_PORT: 5432
     SESSION_SECRET_FILE: /run/secrets/session_secret
     AUTO_INIT_DB: "false"
     NODE_ENV: production
     PORT: 8080
   ```

**Key Environment Variables:**
- `AUTO_INIT_DB`: Controls automatic database initialization
  - `true`: Database connection and schema initialization run automatically on import
  - `false`: Manual initialization required (used in production)
- `DB_PASSWORD_FILE`: Path to Docker secret file for database password (overrides `DB_PASSWORD`)
- `DB_USER_FILE`: Path to Docker secret file for database user (overrides `DB_USER`)
- `DB_NAME_FILE`: Path to Docker secret file for database name (overrides `DB_NAME`)
- `SESSION_SECRET_FILE`: Path to Docker secret file for session secret (overrides `SESSION_SECRET`)

**To modify configuration:**
1. Edit the `environment` section in `compose.yml` for the appropriate service
2. Restart the service: `podman-compose restart backend` (or `backend-prod`)

### Docker Secrets Configuration

The `backend-prod` service uses Docker secrets for sensitive data. To test production mode locally:

1. **Create secrets directory** (already in `.gitignore`):
   ```bash
   mkdir -p secrets
   ```

2. **Create secret files**:
   ```bash
   echo "your_secure_password" > secrets/db_password.txt
   echo "your_session_secret_key" > secrets/session_secret.txt
   ```

3. **Set file permissions** (Linux/macOS):
   ```bash
   chmod 600 secrets/*
   ```

4. **Start production mode**:
   ```bash
   podman-compose --profile prod up
   ```

The `backend-prod` service is already configured in `compose.yml` to use these secrets:
- `DB_PASSWORD_FILE=/run/secrets/db_password`
- `SESSION_SECRET_FILE=/run/secrets/session_secret`
- `AUTO_INIT_DB=false` (manual initialization)
- Port 8080 (instead of 3001)

**Note:** The `secrets/` directory is excluded from version control. Never commit secret files to the repository.

## 🗄️ Database Operations

### Accessing the Database

**Using psql in the container:**
```bash
podman exec -it bobpool-db psql -U bobpool -d bobpool
```

**Common psql commands:**
```sql
-- List all tables
\dt

-- View table structure
\d users
\d rides
\d ride_requests

-- Query data
SELECT * FROM users;
SELECT * FROM rides WHERE status = 'active';

-- Exit psql
\q
```

### Modifying the Schema

1. **Edit `db.js`** to add/modify tables
2. **Reset the database** to apply changes:
   ```bash
   podman-compose down -v
   podman-compose up
   ```

### Database Migrations

For production-ready migrations, consider using a migration tool like:
- [node-pg-migrate](https://github.com/salsita/node-pg-migrate)
- [Knex.js](http://knexjs.org/)
- [Sequelize](https://sequelize.org/)

## 🔍 Debugging

### View Backend Logs

```bash
# Follow logs in real-time
podman-compose logs -f backend

# View last 50 lines
podman-compose logs --tail=50 backend

# View all logs
podman-compose logs backend
```

### Common Issues

**Database connection errors:**
```bash
# Check if database is running
podman ps | grep bobpool-db

# Check database logs
podman-compose logs db

# Restart backend
podman-compose restart backend
```

**Port already in use:**
```bash
# Find what's using port 3001
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Change port in podman-compose.yml if needed
```

**Module not found errors:**
```bash
# Rebuild container with fresh dependencies
podman-compose down
podman-compose up --build backend
```

### Adding Debug Logging

```javascript
// Add console.log statements in your code
console.log('Request body:', req.body);
console.log('User session:', req.session);
console.log('Database result:', result.rows);
```

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:3001/health

# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@ibm.com","name":"Test User","password":"test123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@ibm.com","password":"test123"}'

# Create a ride (requires authentication)
curl -X POST http://localhost:3001/api/rides \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "pickup_location":"Toronto",
    "dropoff_location":"Markham",
    "ride_date":"2026-05-20",
    "ride_time":"08:00",
    "seats_available":3
  }'

# Get all rides
curl http://localhost:3001/api/rides
```

### Using Postman or Thunder Client

1. Import the API endpoints from `API.md`
2. Set base URL to `http://localhost:3001`
3. Enable cookies for authentication
4. Test each endpoint

## 📝 Adding New Features

### Adding a New API Endpoint

1. **Create or edit a route file** in `backend/routes/`:

```javascript
// backend/routes/reviews.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/reviews/:rideId
router.get('/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const result = await pool.query(
      'SELECT * FROM reviews WHERE ride_id = $1',
      [rideId]
    );
    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;
```

2. **Register the route** in `backend/routes/index.js`:

```javascript
const reviewsRouter = require('./reviews');
router.use('/reviews', reviewsRouter);
```

3. **Test the endpoint**:
```bash
curl http://localhost:3001/api/reviews/1
```

### Adding Database Tables

1. **Edit `backend/db.js`** to add table creation:

```javascript
await client.query(`
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);
```

2. **Reset database** to create the table:
```bash
podman-compose down -v
podman-compose up
```

## 🔒 Security Best Practices

- **Never commit `.env` files** (already in `.gitignore`)
- **Use parameterized queries** to prevent SQL injection
- **Validate all user input** before processing
- **Hash passwords** using bcrypt (already implemented)
- **Use HTTPS** in production
- **Implement rate limiting** for API endpoints
- **Sanitize error messages** before sending to clients

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Podman Documentation](https://docs.podman.io/)
- [API Documentation](../API.md)
- [Main Development Guide](../DEVELOPMENT.md)

---

**Made with Bob** 🚗