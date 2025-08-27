## Job Board

A full‑stack job board with employer and job‑seeker experiences. Built with Next.js App Router, Clerk authentication, Drizzle ORM (Postgres), Inngest background jobs, UploadThing file uploads, and Resend email. Includes AI features powered by Anthropic and Gemini.

### Highlights
- **Job seekers**: browse listings, AI search, upload resume (PDF), automatic AI summary, email digests.
- **Employers**: create/manage job listings, review applications, ratings/stages, organization‑scoped access.
- **Auth & orgs**: Clerk for users, organizations, pricing table, middleware‑based route protection.
- **Infra**: Postgres via Docker, Drizzle migrations, background jobs via Inngest, file uploads via UploadThing, email via Resend.
- **AI**: Anthropic for resume summarization; Gemini for job matching.


## Tech Stack
- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4, Radix UI, TanStack Table
- Clerk (auth, orgs)
- Postgres + Drizzle ORM (`drizzle-kit` for migrations)
- Inngest (cron jobs, webhooks, background tasks)
- UploadThing (file storage)
- Resend + React Email (email delivery/previews)
- Anthropic + Google Gemini (AI)


## Project Structure
Key folders only:
- `src/app`: App Router pages and route groups for job‑seeker and employer flows
- `src/features`: Feature modules (applications, listings, organization, users)
- `src/drizzle`: DB schema and migrations
- `src/services`: Integrations (clerk, inngest, uploadthing, resend)
- `src/data/env`: Type‑safe environment variables (server/client)
- `docker-compose.yml`: Local Postgres


## Prerequisites
- Node.js 20+ and npm (or pnpm/yarn)
- Docker (for local Postgres)
- Accounts/keys:
  - Clerk (publishable + secret keys; webhook secret)
  - Resend (API key)
  - UploadThing (token)
  - Anthropic (API key)
  - Google AI Studio (Gemini API key)


## Environment Variables
Use `.env.local` for local development. An `.env.example` is provided as a reference.

Server (set in `.env.local`):
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — database connection
- `CLERK_SECRET_KEY` — Clerk secret key
- `CLERK_WEBHOOK_SECRET` — Clerk webhook secret (Svix)
- `UPLOADTHING_TOKEN` — UploadThing API token
- `ANTHROPIC_API_KEY` — Anthropic API key
- `GEMINI_API_KEY` — Google Gemini API key
- `RESEND_API_KEY` — Resend API key
- `SERVER_URL` — public base URL of the app (e.g., `http://localhost:3000` in dev)

Derived at runtime:
- `DATABASE_URL` — constructed from the DB_* vars by `src/data/env/server.ts`

Client (public) variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`


## Local Development

1) Clone and install dependencies
```bash
npm install
```

2) Configure environment
```bash
cp .env.example .env.local
# Fill in all required values (see sections above)
```

3) Start Postgres (Docker)
```bash
docker compose up -d
```
`docker-compose.yml` uses `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` from your env.

4) Apply database schema
```bash
npm run db:push
# or, if you prefer migrations
npm run db:generate && npm run db:migrate
```

5) Run the dev servers
```bash
# Next.js app
npm run dev

# In another terminal: Inngest local runner (webhooks/cron/background jobs)
npm run inngest

# Optional: React Email preview server (templates at src/services/resend/components)
npm run email
```
Open `http://localhost:3000` and `http://localhost:3001` (email previews).


## Integrations Setup

### Clerk (Auth, Orgs, Pricing)
- Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
- Configure sign‑in/up URLs: `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`.
- Middleware at `src/middleware.ts` protects non‑public routes.
- Webhooks: add a Clerk webhook pointing to your server (dev: `http://localhost:3000/api/inngest`). Use `CLERK_WEBHOOK_SECRET`. The webhook events are processed in Inngest functions under `src/services/inngest/functions/clerk.ts`.

### Inngest (Background Jobs & Webhooks)
- Dev runner: `npm run inngest` (targets `http://localhost:3000/api/inngest`).
- Functions: email digests, Clerk sync, resume processing, application ranking. See `src/services/inngest/functions/*`.
- Cron examples: daily digests run at 7am America/Chicago.

### Database (Postgres + Drizzle)
- Connection URL is generated from `DB_*` via `src/data/env/server.ts`.
- Schema in `src/drizzle/schema/*`; migrations in `src/drizzle/migrations`.
- Commands: `npm run db:push | db:generate | db:migrate | db:studio`.

### UploadThing (Resumes)
- Set `UPLOADTHING_TOKEN`.
- Upload route: `src/app/api/uploadthing/route.ts` with router in `src/services/uploadthing/router.ts`.
- Only PDF uploads are allowed; existing resume is cleaned up on new upload.

### Resend (Email)
- Set `RESEND_API_KEY`.
- Sending logic in `src/services/inngest/functions/email.ts`.
- Update the `from` domain to your verified domain.
- Preview templates locally with `npm run email` at `http://localhost:3001`.

### AI Providers
- Anthropic: `ANTHROPIC_API_KEY` for resume summarization (`src/services/inngest/functions/resume.ts`).
- Google Gemini: `GEMINI_API_KEY` for matching job listings to user prompts.


## Common Scripts
```bash
npm run dev        # Start Next.js (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Lint
npm run db:push    # Push schema to DB
npm run db:studio  # Drizzle Studio
npm run inngest    # Inngest local runner (hooks/cron)
npm run email      # React Email preview
```


## Troubleshooting
- Missing env var: check `.env.local` and ensure it matches `.env.example` and `src/data/env/*`.
- DB connection issues: verify Docker is running and `DB_*` values are correct.
- Clerk redirects: ensure the sign‑in/up URLs match your configured routes and host.
- Webhooks not firing: in dev, keep `npm run inngest` running and confirm webhook endpoint points to `/api/inngest`.
- Emails not sending: verify `RESEND_API_KEY` and sender domain.
- Uploads failing: verify `UPLOADTHING_TOKEN` and that file is a PDF under 8MB.


## License
MIT (or project default). Update as appropriate.
