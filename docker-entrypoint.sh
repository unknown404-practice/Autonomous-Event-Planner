#!/bin/sh
set -e

# Ensure data directory exists for persistent SQLite database
mkdir -p /app/data

# Migrate initial database if persistent volume is fresh
if [ ! -f /app/data/dev.db ]; then
  if [ -f /app/dev.db ]; then
    echo "[EventPilot Docker] Migrating existing dev.db to persistent volume..."
    cp /app/dev.db /app/data/dev.db
  elif [ -f /app/prisma/dev.db ]; then
    echo "[EventPilot Docker] Migrating existing prisma/dev.db to persistent volume..."
    cp /app/prisma/dev.db /app/data/dev.db
  fi
fi

# Ensure SQLite database schema is applied safely
echo "[EventPilot Docker] Ensuring database schema is synchronized..."
./node_modules/.bin/prisma db push --skip-generate 2>/dev/null || node node_modules/prisma/build/index.js db push --skip-generate || npx prisma db push --skip-generate

echo "[EventPilot Docker] Starting EventPilot AI application..."
exec "$@"
