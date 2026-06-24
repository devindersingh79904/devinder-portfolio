#!/usr/bin/env sh
set -e

# Apply database migrations before the app starts.
echo "[entrypoint] Running database migrations..."
alembic upgrade head

# Note: default-data seeding is handled by the app's startup lifespan
# when AUTO_SEED_ON_STARTUP=true (idempotent, also gated by ENABLE_DEFAULT_SEED).

echo "[entrypoint] Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
