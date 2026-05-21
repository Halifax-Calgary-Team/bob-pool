# Multi-stage Dockerfile for Bob Pool Application
# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Setup backend and serve the application
FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies (production only)
RUN npm install --production

# Copy backend source code
COPY backend/ ./

# Copy built frontend from the builder stage
COPY --from=frontend-builder /frontend/dist ./public

# Create a simple server configuration to serve static files
# We'll modify the server to serve static files from /public
RUN echo 'const path = require("path");' > serve-static.js && \
    echo 'const express = require("express");' >> serve-static.js && \
    echo 'module.exports = function(app) {' >> serve-static.js && \
    echo '  app.use(express.static(path.join(__dirname, "public")));' >> serve-static.js && \
    echo '  app.get("*", (req, res, next) => {' >> serve-static.js && \
    echo '    if (req.path.startsWith("/api") || req.path === "/health") {' >> serve-static.js && \
    echo '      return next();' >> serve-static.js && \
    echo '    }' >> serve-static.js && \
    echo '    res.sendFile(path.join(__dirname, "public", "index.html"));' >> serve-static.js && \
    echo '  });' >> serve-static.js && \
    echo '};' >> serve-static.js

# Create a stub db.js that prevents the IIFE from crashing when no database is available
RUN mv db.js db-original.js && \
    echo 'const { Pool } = require("pg");' > db.js && \
    echo '' >> db.js && \
    echo 'const pool = new Pool({' >> db.js && \
    echo '  host: process.env.DB_HOST || "localhost",' >> db.js && \
    echo '  user: process.env.DB_USER || "bobpool",' >> db.js && \
    echo '  password: process.env.DB_PASSWORD || "bobpool_dev",' >> db.js && \
    echo '  database: process.env.DB_NAME || "bobpool",' >> db.js && \
    echo '  port: process.env.DB_PORT || 5432,' >> db.js && \
    echo '  max: 20,' >> db.js && \
    echo '  idleTimeoutMillis: 30000,' >> db.js && \
    echo '  connectionTimeoutMillis: 2000,' >> db.js && \
    echo '});' >> db.js && \
    echo '' >> db.js && \
    echo 'async function testConnection() {' >> db.js && \
    echo '  try {' >> db.js && \
    echo '    const client = await pool.connect();' >> db.js && \
    echo '    const result = await client.query("SELECT NOW()");' >> db.js && \
    echo '    console.log("✅ Database connected successfully at:", result.rows[0].now);' >> db.js && \
    echo '    client.release();' >> db.js && \
    echo '    return true;' >> db.js && \
    echo '  } catch (error) {' >> db.js && \
    echo '    console.error("❌ Database connection failed:", error.message);' >> db.js && \
    echo '    return false;' >> db.js && \
    echo '  }' >> db.js && \
    echo '}' >> db.js && \
    echo '' >> db.js && \
    echo 'async function initializeSchema() {' >> db.js && \
    echo '  const client = await pool.connect();' >> db.js && \
    echo '  try {' >> db.js && \
    echo '    console.log("🔧 Initializing database schema...");' >> db.js && \
    echo '    await client.query("BEGIN");' >> db.js && \
    echo '    await client.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL CHECK (email LIKE '"'"'%@ibm.com'"'"'), name VARCHAR(255) NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);' >> db.js && \
    echo '    console.log("  ✓ Users table ready");' >> db.js && \
    echo '    await client.query(`CREATE TABLE IF NOT EXISTS rides (id SERIAL PRIMARY KEY, driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, pickup_location VARCHAR(500) NOT NULL, dropoff_location VARCHAR(500) NOT NULL, ride_date DATE NOT NULL, ride_time TIME NOT NULL, seats_available INTEGER NOT NULL CHECK (seats_available > 0), status VARCHAR(50) DEFAULT '"'"'active'"'"' CHECK (status IN ('"'"'active'"'"', '"'"'completed'"'"', '"'"'cancelled'"'"')), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);' >> db.js && \
    echo '    console.log("  ✓ Rides table ready");' >> db.js && \
    echo '    await client.query(`CREATE TABLE IF NOT EXISTS ride_requests (id SERIAL PRIMARY KEY, ride_id INTEGER NOT NULL REFERENCES rides(id) ON DELETE CASCADE, rider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, status VARCHAR(50) DEFAULT '"'"'pending'"'"' CHECK (status IN ('"'"'pending'"'"', '"'"'accepted'"'"', '"'"'rejected'"'"')), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(ride_id, rider_id))`);' >> db.js && \
    echo '    console.log("  ✓ Ride requests table ready");' >> db.js && \
    echo '    await client.query(`CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id); CREATE INDEX IF NOT EXISTS idx_rides_date ON rides(ride_date); CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status); CREATE INDEX IF NOT EXISTS idx_requests_ride ON ride_requests(ride_id); CREATE INDEX IF NOT EXISTS idx_requests_rider ON ride_requests(rider_id);`);' >> db.js && \
    echo '    console.log("  ✓ Indexes created");' >> db.js && \
    echo '    await client.query("COMMIT");' >> db.js && \
    echo '    console.log("✅ Database schema initialized successfully\\n");' >> db.js && \
    echo '  } catch (error) {' >> db.js && \
    echo '    await client.query("ROLLBACK");' >> db.js && \
    echo '    console.error("❌ Schema initialization failed:", error.message);' >> db.js && \
    echo '    throw error;' >> db.js && \
    echo '  } finally {' >> db.js && \
    echo '    client.release();' >> db.js && \
    echo '  }' >> db.js && \
    echo '}' >> db.js && \
    echo '' >> db.js && \
    echo '// DO NOT auto-initialize - let the server control this' >> db.js && \
    echo '' >> db.js && \
    echo 'module.exports = { pool, testConnection, initializeSchema };' >> db.js

# Create a modified server entry point that handles missing database gracefully
RUN echo 'require("dotenv").config();' > server-combined.js && \
    echo 'const express = require("express");' >> server-combined.js && \
    echo 'const session = require("express-session");' >> server-combined.js && \
    echo 'const serveStatic = require("./serve-static");' >> server-combined.js && \
    echo '' >> server-combined.js && \
    echo 'const app = express();' >> server-combined.js && \
    echo 'const PORT = process.env.PORT || 8080;' >> server-combined.js && \
    echo '' >> server-combined.js && \
    echo 'app.use(express.json());' >> server-combined.js && \
    echo '' >> server-combined.js && \
    echo 'app.use(session({' >> server-combined.js && \
    echo '  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",' >> server-combined.js && \
    echo '  resave: false,' >> server-combined.js && \
    echo '  saveUninitialized: false,' >> server-combined.js && \
    echo '  cookie: {' >> server-combined.js && \
    echo '    secure: process.env.NODE_ENV === "production",' >> server-combined.js && \
    echo '    httpOnly: true,' >> server-combined.js && \
    echo '    maxAge: 24 * 60 * 60 * 1000' >> server-combined.js && \
    echo '  }' >> server-combined.js && \
    echo '}));' >> server-combined.js && \
    echo '' >> server-combined.js && \
    echo '// Try to initialize database and load routes' >> server-combined.js && \
    echo 'let dbAvailable = false;' >> server-combined.js && \
    echo '(async () => {' >> server-combined.js && \
    echo '  try {' >> server-combined.js && \
    echo '    const db = require("./db");' >> server-combined.js && \
    echo '    const connected = await db.testConnection();' >> server-combined.js && \
    echo '    if (connected) {' >> server-combined.js && \
    echo '      await db.initializeSchema();' >> server-combined.js && \
    echo '      const routes = require("./routes");' >> server-combined.js && \
    echo '      app.use("/api", routes);' >> server-combined.js && \
    echo '      dbAvailable = true;' >> server-combined.js && \
    echo '      console.log("✅ Database routes loaded successfully");' >> server-combined.js && \
    echo '    } else {' >> server-combined.js && \
    echo '      throw new Error("Database connection failed");' >> server-combined.js && \
    echo '    }' >> server-combined.js && \
    echo '  } catch (error) {' >> server-combined.js && \
    echo '    console.warn("⚠️  Database not available - API routes disabled");' >> server-combined.js && \
    echo '    console.warn("   Error:", error.message);' >> server-combined.js && \
    echo '    console.warn("   To enable API, configure database connection:");' >> server-combined.js && \
    echo '    console.warn("   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT");' >> server-combined.js && \
    echo '    app.use("/api", (req, res) => {' >> server-combined.js && \
    echo '      res.status(503).json({' >> server-combined.js && \
    echo '        error: "Service Unavailable",' >> server-combined.js && \
    echo '        message: "Database connection not configured. API endpoints are disabled."' >> server-combined.js && \
    echo '      });' >> server-combined.js && \
    echo '    });' >> server-combined.js && \
    echo '  }' >> server-combined.js && \
    echo '' >> server-combined.js && \
    echo '  app.get("/health", (req, res) => {' >> server-combined.js && \
    echo '    res.json({' >> server-combined.js && \
    echo '      status: "ok",' >> server-combined.js && \
    echo '      message: "Bob Pool Application is running",' >> server-combined.js && \
    echo '      database: dbAvailable ? "connected" : "not configured"' >> server-combined.js && \
    echo '    });' >> server-combined.js && \
    echo '  });' >> server-combined.js && \
    echo '' >> server-combined.js && \
    echo '  serveStatic(app);' >> server-combined.js && \
    echo '' >> server-combined.js && \
    echo '  app.use((err, req, res, next) => {' >> server-combined.js && \
    echo '    console.error("Error:", err);' >> server-combined.js && \
    echo '    res.status(err.status || 500).json({' >> server-combined.js && \
    echo '      error: err.message || "Internal Server Error",' >> server-combined.js && \
    echo '      ...(process.env.NODE_ENV === "development" && { stack: err.stack })' >> server-combined.js && \
    echo '    });' >> server-combined.js && \
    echo '  });' >> server-combined.js && \
    echo '' >> server-combined.js && \
    echo '  app.listen(PORT, "0.0.0.0", () => {' >> server-combined.js && \
    echo '    console.log(`\\n🚗 Bob Pool Application running on port ${PORT}`);' >> server-combined.js && \
    echo '    console.log(`\\n📍 Available endpoints:`);' >> server-combined.js && \
    echo '    console.log(`   Frontend:      http://localhost:${PORT}`);' >> server-combined.js && \
    echo '    console.log(`   Health Check:  http://localhost:${PORT}/health`);' >> server-combined.js && \
    echo '    if (dbAvailable) {' >> server-combined.js && \
    echo '      console.log(`   API:           http://localhost:${PORT}/api/*`);' >> server-combined.js && \
    echo '    } else {' >> server-combined.js && \
    echo '      console.log(`   API:           http://localhost:${PORT}/api/* (disabled - no database)`);' >> server-combined.js && \
    echo '    }' >> server-combined.js && \
    echo '    console.log(`\\n🔧 Environment: ${process.env.NODE_ENV || "development"}`);' >> server-combined.js && \
    echo '    console.log(`\\n✅ Ready to accept requests!\\n`);' >> server-combined.js && \
    echo '  });' >> server-combined.js && \
    echo '})();' >> server-combined.js

# Expose the application port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production

# Start the combined server
CMD ["node", "server-combined.js"]

# Made with Bob