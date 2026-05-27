#!/bin/sh
set -e

# Ensure dependencies are installed
echo "Checking and installing dependencies..."
# Force rebuild of native modules for the current architecture
npm install --legacy-peer-deps

# Explicitly install the missing rollup native module
echo "Installing rollup native module for ARM64..."
npm install --no-save @rollup/rollup-linux-arm64-musl --legacy-peer-deps || echo "Warning: Could not install ARM64 rollup module"

# Start the application
exec "$@"

# Made with Bob
