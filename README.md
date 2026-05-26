# Social Media Importer & Embed Widgets

Next.js 15 app for importing Instagram posts and embedding **Carousel**, **Grid**, or **Wall** widgets on any website.

## Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS
- PostgreSQL + Prisma
- NextAuth.js (Google OAuth + email/password)
- Cheerio (OG metadata), sharp (images ≤ 500KB)
- GSAP (carousel), local uploads or AWS S3

## Quick start

1. Copy environment file:

```bash
cp .env.example .env
```

2. Set `AUTH_SECRET` (e.g. `openssl rand -base64 32`) and `DATABASE_URL`.

3. Start Postgres:

```bash
docker compose up -d
```

4. Migrate, seed the default admin user, and run:

```bash
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Production-style setup (deploy migrations + seed):

```bash
npm run db:setup
npm run dev
```

The seed creates or updates the admin account, imports the demo Instagram URLs, and builds a **Wall + Carousel** widget (override with `SEED_ADMIN_*` and `SEED_LOGIN_WIDGET_TOKEN` in `.env`). Public registration is disabled by default; set `REGISTRATION_ENABLED` to `true` in `src/lib/app-config.ts` when you want to re-enable it.

5. Open [http://localhost:3000](http://localhost:3000) — the login page is a full-screen embed of that widget with a small **Sign in** button. After seeding, you can also copy the same embed snippet from the dashboard.

## Embed on external sites

```html
<!-- Give the container a height (e.g. 100vh or a fixed px value) so the widget can fill it -->
<div id="smp-widget-YOUR_TOKEN" style="height: 100vh"></div>
<script
  async
  src="https://your-domain.com/embed/v1/embed.js"
  data-widget="YOUR_TOKEN"
  data-target="smp-widget-YOUR_TOKEN"
></script>
```

Optional: set height on the script instead of the div with `data-height="100vh"`. The loader also matches Elementor widget box height automatically when embedded in a sized flex column.

Public JSON API: `GET /api/embed/YOUR_TOKEN` (CORS enabled).

## Tests

```bash
npm run test:run
```
