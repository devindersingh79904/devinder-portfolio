#!/usr/bin/env sh
set -e

# Wait for the database to accept connections before running migrations.
# (compose depends_on health usually covers this, but a retry loop makes the
# container resilient to a slow/restarting DB or non-compose runs.)
echo "[entrypoint] Waiting for the database..."
i=0
until python -c "
import os, sys
import psycopg
url = os.environ['DATABASE_URL'].replace('postgresql+psycopg://', 'postgresql://')
try:
    psycopg.connect(url, connect_timeout=3).close()
except Exception as e:
    print(e, file=sys.stderr); sys.exit(1)
" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "[entrypoint] Database not reachable after 30 attempts; giving up." >&2
    exit 1
  fi
  echo "[entrypoint] DB not ready yet (attempt $i/30); retrying in 1s..."
  sleep 1
done
echo "[entrypoint] Database is up."

# Apply database migrations before the app starts.
echo "[entrypoint] Running database migrations..."
alembic upgrade head

# Note: default-data seeding is handled by the app's startup lifespan
# when AUTO_SEED_ON_STARTUP=true (idempotent, also gated by ENABLE_DEFAULT_SEED).

echo "[entrypoint] Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
