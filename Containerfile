# Single-container Containerfile with embedded PostgreSQL
# Multi-stage build: Frontend Builder -> Backend Dependencies -> Production Runtime with PostgreSQL

# ============================================
# STAGE 1: FRONTEND BUILDER
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies with legacy peer deps flag
RUN npm install --legacy-peer-deps

# Copy frontend source code
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# ============================================
# STAGE 2: BACKEND DEPENDENCIES
# ============================================
FROM node:20-alpine AS backend-deps

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm install --production

# ============================================
# STAGE 3: PRODUCTION RUNTIME WITH POSTGRESQL
# ============================================
FROM node:20-alpine

# Install PostgreSQL, supervisord, and utilities
RUN apk add --no-cache \
    postgresql \
    postgresql-contrib \
    supervisor \
    bash \
    su-exec \
    wget

# Create postgres user and group if they don't exist
RUN set -eux; \
    addgroup -g 70 -S postgres 2>/dev/null || true; \
    adduser -u 70 -S -D -G postgres -H -h /var/lib/postgresql -s /bin/sh postgres 2>/dev/null || true

# Create necessary directories
RUN mkdir -p /var/lib/postgresql/data /var/log/supervisor /run/postgresql && \
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql && \
    chmod 750 /var/lib/postgresql/data

# Set working directory
WORKDIR /app

# Copy backend source code
COPY backend/*.js ./
COPY backend/routes ./routes/
COPY backend/production ./production/

# Copy production node_modules from Stage 2
COPY --from=backend-deps /app/node_modules ./node_modules

# Copy built frontend from Stage 1 to public directory
COPY --from=frontend-builder /frontend/dist ./public

# Copy supervisord configuration
COPY backend/production/supervisord.conf /etc/supervisord.conf

# Copy PostgreSQL initialization script
COPY backend/production/init-postgres.sh /usr/local/bin/init-postgres.sh
RUN chmod +x /usr/local/bin/init-postgres.sh

# Copy health check script
COPY backend/production/healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Expose application port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080 \
    DB_HOST=localhost \
    DB_USER=bobpool \
    DB_NAME=bobpool \
    DB_PORT=5432 \
    PGDATA=/var/lib/postgresql/data

# Volume for PostgreSQL data persistence
VOLUME ["/var/lib/postgresql/data"]

# Initialize PostgreSQL and start supervisord
CMD ["/bin/sh", "-c", "/usr/local/bin/init-postgres.sh && exec /usr/bin/supervisord -c /etc/supervisord.conf"]

# Made with Bob