#!/bin/sh
set -e

echo "⏳ Running database migrations..."
npx typeorm migration:run -d dist/config/typeorm.config.js
MIGRATE_EXIT=$?

if [ $MIGRATE_EXIT -ne 0 ]; then
  echo "❌ Migration failed with exit code $MIGRATE_EXIT"
  exit $MIGRATE_EXIT
fi

echo "✅ Migrations applied successfully"

echo "⏳ Running database seed..."
node dist/seed/seed.js
SEED_EXIT=$?

if [ $SEED_EXIT -ne 0 ]; then
  echo "⚠️ Seed exited with code $SEED_EXIT (non-fatal, continuing...)"
else
  echo "✅ Seed completed successfully"
fi

echo "🚀 Starting NestJS application..."
exec node dist/main
