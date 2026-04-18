# CourseForge

## What and Why

A self-hostable, white-label course selling platform. The business rationale: every existing open-source LMS is either enterprise bloat (Moodle, Open edX) or a rigid one-off deployment. CourseForge is designed to be a repeatable product — each client gets their own Docker-deployed instance, their own Stripe account, their own Bunny Stream library. No SaaS lock-in, no platform transaction fees. Unartech deploys it, hands over the admin URL, client configures everything through the UI.

The platform has two users: a **creator/admin** who uploads courses and customises the storefront, and a **student** who buys and watches.

---

## Core Product Decisions

**Video is never served from the VPS.** All video lives in Bunny Stream. The app only stores a `bunny_video_id` and constructs signed embed URLs server-side. This is non-negotiable — it's what makes the platform scale without rearchitecting later.

**Payments via Stripe only.** Stripe Checkout handles the session, a webhook creates the enrollment. Free courses bypass Stripe entirely.

**The storefront is editable.** Sales pages (homepage, per-course landing pages) are built with Puck (`@measured/puck`) — an open source drag-and-drop page builder for Next.js. Puck data is stored as JSONB. This is what makes it a product rather than a template.

**Theming via CSS custom properties.** The admin sets colours, fonts (curated Google Fonts list), border radius, and can write raw custom CSS. All storefront components use `var(--cf-*)` variables and carry `cf-` class names for targeting. No hardcoded values anywhere in public-facing UI.

**Rich text via TipTap v2** for course and lesson descriptions.

---

## Tech Stack

Next.js 15 App Router, TypeScript strict, PostgreSQL with Drizzle ORM, Better Auth (email/password + optional Google OAuth), Stripe Checkout + webhooks, Bunny Stream API, Puck for the page builder, TipTap for rich text, Tailwind CSS v4 + shadcn/ui, Resend for transactional email, Docker Compose for deployment.

---

## What Gets Built

**Student-facing:** Course catalogue, individual course sales pages (Puck-rendered), Stripe checkout flow, course player with Bunny embed and lesson progress tracking, student dashboard showing enrolled courses with completion progress.

**Admin panel:** Course and lesson CRUD, chunked video upload to Bunny with progress indicator, Puck page editor for homepage and course sales pages, appearance panel (theme colours, font picker, custom CSS with CodeMirror), settings panel for Stripe/Bunny/Resend credentials (stored encrypted in DB), admin dashboard with revenue and enrollment stats.

**Puck component library for sales pages:** Hero block, course grid (live data), rich text block, video preview block, testimonial block, feature list, pricing card (live data), instructor bio, spacer, and a raw HTML block with an explicit enable toggle.

**Emails via Resend:** Enrollment confirmation and welcome email.

**Infrastructure:** Docker Compose with Postgres, Next.js app, and Nginx reverse proxy. Single `.env.example` with all vars documented.

---

## Explicitly Out of Scope (v1)

Quizzes, certificates, coupons, affiliates, subscriptions, bundles, multi-instructor, multi-tenant, i18n, mobile app, email sequences, comments/Q&A.

---

## Sensitive Data

Stripe secret key, Bunny API key, Resend API key, and webhook secrets are stored encrypted (AES-256-GCM) in the database. The `ENCRYPTION_KEY` env var is the only secret that must be protected at the infrastructure level. All other credentials are configurable through the admin UI post-deploy.

---

## First User

The first registered account automatically becomes admin. All subsequent registrations are students.
