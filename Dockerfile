ARG BUN_VERSION=1.3.0
ARG NODE_VERSION=22

FROM oven/bun:${BUN_VERSION}-alpine AS base
WORKDIR /app

# --- install dependencies (bun is fast + respects bun.lock) ---
FROM base AS deps
COPY package.json bun.lock* bun.lockb* ./
RUN bun install --frozen-lockfile

# --- build with node/turbopack (bun's turbopack chunk loader
# fails on arm64 with ChunkLoadError in page-data collection) ---
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node node_modules/next/dist/bin/next build

# --- bundle the migrator as a single JS file so it survives the
# Next.js standalone trim (drizzle-orm isn't pulled in by pages) ---
FROM base AS migrator-bundler
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY lib ./lib
COPY drizzle.config.ts ./
COPY tsconfig.json ./
RUN bun build lib/db/migrate.ts \
  --outfile=/migrate.js \
  --target=bun \
  --minify

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

# Migration assets: SQL files + the bundled migrator
# (drizzle-orm is not pulled into the Next standalone trace, so we
# ship a self-contained bun-bundled migrator).
COPY --from=builder --chown=app:app /app/drizzle ./drizzle
COPY --from=migrator-bundler --chown=app:app /migrate.js ./migrate.js

COPY --chown=app:app docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER app
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bun", "server.js"]
