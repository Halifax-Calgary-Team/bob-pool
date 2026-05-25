#!/usr/bin/env node
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const runner = require('node-pg-migrate').default;

// Helper to read secrets from files (same as db.js)
function readSecret(envVar, fileEnvVar) {
  const secretFile = process.env[fileEnvVar];
  if (secretFile && existsSync(secretFile)) {
    return readFileSync(secretFile, 'utf8').trim();
  }
  return process.env[envVar];
}

// Build database URL from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bobpool',
  user: process.env.DB_USER || 'bobpool',
  password: readSecret('DB_PASSWORD', 'DB_PASSWORD_FILE') || 'bobpool_dev',
};

const databaseUrl = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;

// Get command from arguments
const command = process.argv[2] || 'up';

// Migration options
const options = {
  databaseUrl,
  dir: join(__dirname, 'migrations'),
  direction: command === 'down' ? 'down' : 'up',
  migrationsTable: 'pgmigrations',
  count: command === 'down' ? 1 : Infinity, // Only rollback one migration at a time
  verbose: true,
  log: console.log,
};

// Run migrations
runner(options)
  .then(() => {
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });

// Made with Bob
