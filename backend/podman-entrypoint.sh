#!/bin/sh
set -e

# Ensure dependencies are installed and rebuild native modules
echo "Checking and installing dependencies..."
npm install

# Rebuild bcrypt for the current architecture
echo "Rebuilding bcrypt native module..."
npm rebuild bcrypt

# Start the application
exec "$@"

# Made with Bob