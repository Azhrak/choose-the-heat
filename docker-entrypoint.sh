#!/bin/sh
set -e

echo "🚀 Starting Spicy Tales..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT 1')
  .then(() => { console.log('✅ Database ready'); process.exit(0); })
  .catch((err) => { console.error('❌ Database not ready:', err.message); process.exit(1); });
" 2>/dev/null; do
  echo "⏳ Database is unavailable - sleeping"
  sleep 2
done

# Run database migrations
echo "📦 Running database migrations..."
pnpm db:migrate || echo "⚠️  Migrations failed or already applied"

# Seed database if needed (only on first run)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  pnpm db:seed || echo "⚠️  Seed failed or already seeded"
fi

echo "✨ Starting application..."
exec "$@"
