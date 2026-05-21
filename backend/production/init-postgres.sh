#!/bin/bash
# PostgreSQL initialization script for single-container deployment
# Initializes database on first run if data directory is empty

set -e

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
DB_USER="${DB_USER:-bobpool}"
DB_NAME="${DB_NAME:-bobpool}"
DB_PASSWORD="${DB_PASSWORD:-bobpool_prod}"

echo "🔍 Checking PostgreSQL data directory: $PGDATA"

# Check if PostgreSQL is already initialized (PG_VERSION file exists)
if [ -f "$PGDATA/PG_VERSION" ]; then
    echo "✅ PostgreSQL already initialized"
else
    echo "📦 PostgreSQL data directory needs initialization..."
    
    echo "🔧 Initializing PostgreSQL database cluster..."
    
    # Initialize database as postgres user with relaxed permissions for Windows mounts
    su-exec postgres initdb \
      --locale=C \
      --data-checksums \
      --allow-group-access \
      -D "$PGDATA"
    
    echo "✅ Database cluster initialized"
    echo "🚀 Starting PostgreSQL temporarily to create database and user..."
    su-exec postgres pg_ctl -D "$PGDATA" -w start
    
    # Wait for PostgreSQL to be ready
    sleep 2
    
    # Create database user and database
    echo "👤 Creating database user: $DB_USER"
    su-exec postgres psql -v ON_ERROR_STOP=1 <<-EOSQL
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
        CREATE DATABASE $DB_NAME OWNER $DB_USER;
        GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL
    
    echo "✅ Database and user created successfully"
    
    # Stop PostgreSQL (supervisord will start it properly)
    echo "🛑 Stopping temporary PostgreSQL instance..."
    su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop
    
    echo "✅ PostgreSQL initialization complete"
fi

echo "🎯 Ready to start services with supervisord"

# Made with Bob
