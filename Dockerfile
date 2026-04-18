ARG BUN_VERSION=1.3.0

FROM oven/bun:${BUN_VERSION}-alpine AS base
WORKDIR /app

# --- install dependencies ---
FROM base AS deps
COPY package.json bun.lock* bun.lockb* ./
RUN bun install --frozen-lockfile

# --- build ---
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# --- runtime ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 app \
 && adduser -S -u 1001 -G app app

# Next.js standalone output (includes minimal traced node_modules)
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public

# Migration assets (drizzle-orm is traced into standalone; pg + drizzle-orm
# are runtime deps so they're available for the migrator too).
COPY --from=builder --chown=app:app /app/drizzle ./drizzle
COPY --from=builder --chown=app:app /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=app:app /app/lib/db/migrate.ts ./lib/db/migrate.ts

COPY --chown=app:app docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER app
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bun", "server.js"]
