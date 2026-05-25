#!/bin/sh
# Health check script for production container
# Verifies PostgreSQL and Node.js application are running and responding

set -e

echo "🔍 Checking container health..."

# Check if PostgreSQL is running
if ! pgrep -x postgres > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running"
    exit 1
fi
echo "✅ PostgreSQL is running"

# Check if Node.js app is running (match any node process)
if ! pgrep node > /dev/null 2>&1; then
    echo "❌ Node.js application is not running"
    exit 1
fi
echo "✅ Node.js application is running"

# Check if port 8080 is listening using /proc/net/tcp
# Port 8080 in hex is 1F90
if ! grep -q ':1F90 ' /proc/net/tcp 2>/dev/null; then
    echo "❌ Application is not listening on port 8080"
    exit 1
fi
echo "✅ Application is listening on port 8080"

# Check health endpoint using wget (available in alpine)
if wget -q -O- --timeout=5 http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Health endpoint responding"
else
    echo "❌ Health endpoint not responding"
    exit 1
fi

echo "✅ All health checks passed!"
exit 0

# Made with Bob
