#!/bin/sh
set -e

if [ -n "$SKIP_MIGRATIONS" ]; then
  echo "[entrypoint] SKIP_MIGRATIONS set — skipping db:migrate"
else
  echo "[entrypoint] Running database migrations..."
  bun migrate.js
fi

echo "[entrypoint] Starting app: $*"
exec "$@"
