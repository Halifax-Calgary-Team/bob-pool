#!/bin/sh
set -e

# Ensure dependencies are installed
echo "Checking and installing dependencies..."
npm install --legacy-peer-deps

# Start the application
exec "$@"

# Made with Bob
