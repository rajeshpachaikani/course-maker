# CourseMaker

A self-hostable, white-label course selling platform. Each client gets
their own Docker-deployed instance, their own Stripe / Bunny Stream /
Resend credentials, and full control over storefront appearance.

- **Stack:** Next.js 16, TypeScript strict, PostgreSQL + Drizzle ORM,
  Better Auth, Stripe Checkout, Bunny Stream, Puck page builder,
  TipTap, Tailwind v4, Resend.
- **Runtime / package manager:** Bun (used for dev, build, and
  migrations). Do not use `npm` or `pnpm`.

---

## Local development

```bash
cp .env.example .env.local
# Fill in BETTER_AUTH_SECRET and ENCRYPTION_KEY:
#   openssl rand -base64 32

# Start Postgres on port 5455
docker compose -f docker-compose.dev.yml up -d

# Install deps + run migrations + start the dev server
bun install
bun run db:migrate
bun run dev
```

Open <http://localhost:3000>. The first account you register
automatically becomes the admin; all subsequent registrations are
students.

Configure Stripe / Bunny / Resend / Google OAuth credentials from
`/admin/settings` — they are stored encrypted (AES-256-GCM) in the
database, never in env files.

---

## Production deployment (Docker Compose)

The production stack is three containers: Postgres, the Next.js app
(migrations run automatically at container start), and an Nginx
reverse proxy.

```bash
cp .env.example .env
# Required for production:
#   POSTGRES_PASSWORD       (choose a strong password)
#   NEXT_PUBLIC_APP_URL     (public https URL, e.g. https://learn.example.com)
#   BETTER_AUTH_URL         (usually the same as NEXT_PUBLIC_APP_URL)
#   BETTER_AUTH_SECRET      openssl rand -base64 32
#   ENCRYPTION_KEY          openssl rand -base64 32  ← back this up!

docker compose up -d --build
```

The app binds to `${NGINX_HTTP_PORT:-80}` on the host. Put a real
HTTPS terminator (Caddy, Cloudflare, a managed load balancer, etc.)
in front of it — the bundled Nginx config serves HTTP only.

### Post-deploy checklist

1. Open the deployment URL and register the first account — it
   becomes the admin.
2. Visit **/admin/settings**: paste in Stripe, Bunny Stream, and
   Resend credentials. Toggle Google OAuth and/or the raw HTML Puck
   block as needed.
3. Visit **/admin/appearance**: set colours, fonts, border radius,
   and optional custom CSS.
4. Visit **/admin/courses**: create the first course, add modules /
   lessons, upload videos (chunked direct-to-Bunny via TUS), publish.
5. Point your Stripe webhook endpoint at
   `https://<your-domain>/api/webhooks/stripe` (subscribe to
   `checkout.session.completed`) and paste the signing secret into
   `/admin/settings`.

### Environment reference

The app only needs the following infrastructure-level secrets:

| Variable              | Required | Notes                                              |
| --------------------- | -------- | -------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | yes      | Canonical public URL (no trailing slash)           |
| `BETTER_AUTH_URL`     | yes      | Usually equal to `NEXT_PUBLIC_APP_URL`             |
| `BETTER_AUTH_SECRET`  | yes      | 32-byte random, base64                             |
| `ENCRYPTION_KEY`      | yes      | 32-byte random, base64 — **losing this is fatal**  |
| `POSTGRES_PASSWORD`   | yes      | Prod compose only                                  |
| `POSTGRES_USER`       | no       | Defaults to `coursemaker`                          |
| `POSTGRES_DB`         | no       | Defaults to `coursemaker`                          |
| `NGINX_HTTP_PORT`     | no       | Host port for the reverse proxy, defaults to `80`  |

All tenant credentials (Stripe / Bunny / Resend / Google) live in the
database, encrypted with `ENCRYPTION_KEY`.

### Operations

- **Logs:** `docker compose logs -f app`
- **Skip migrations on startup:** set `SKIP_MIGRATIONS=1` on the
  `app` service (useful when rolling back).
- **Manual migrate:** `docker compose exec app bun lib/db/migrate.ts`
- **Backup:** dump `pgdata` volume and store `ENCRYPTION_KEY`
  alongside it — without the key the encrypted credential rows are
  unreadable.

---

## Architecture notes

- **Video** never traverses the VPS — lessons store only a
  `bunny_video_id`; signed embed URLs are generated server-side for
  playback, signed TUS URLs for upload.
- **Payments** are Stripe Checkout Sessions; the
  `checkout.session.completed` webhook creates the enrollment
  (idempotent via `webhook_events`).
- **Theming** is driven by `--cm-*` CSS custom properties written from
  `theme_settings`; everything in the storefront uses them, so
  per-tenant branding requires no code changes.
- **Sales pages** are Puck trees stored as JSONB; rendered via
  `<Render config={config} data={data} />` on public routes.
