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
echo "🚀 Starting NestJS application..."
exec node dist/main
