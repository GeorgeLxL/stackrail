# StrantaDigital — Landing Page

A partnership-focused landing page built with **Next.js (App Router) · TypeScript · Tailwind CSS · Supabase**.

Features:

- Editorial, fully responsive landing page (recreated from the Figma design)
- Light / dark theme toggle (dark by default), persisted via `next-themes`
- Header with smooth-scroll links to each section
- Contact form — **name, email, phone (required, validated), message** —
  persisted to Supabase. Phone uses `react-phone-number-input` +
  `libphonenumber-js` for real-number validation on both client and server.
- Private admin panel at `/admin` with a single seeded user (custom
  cookie-session auth, not Supabase Auth). Sidebar with:
  - **Dashboard** — message/team counts + recent messages
  - **Messages** — read & delete contact inquiries; the list updates **live**
    and a **desktop notification** fires when a new message arrives (click
    "Enable desktop notifications" in the sidebar once to allow them)
  - **Team** — add / delete team members
  - **Settings** — edit the public contact email & Telegram
- The landing page shows an **About us / team** section automatically when one
  or more team members exist, and reads its contact details from Settings
  (falling back to built-in defaults when unset).

> Note: team size is intentionally never stated anywhere in the copy.

---

## 1. Prerequisites

- Node.js 18.18+ (developed on Node 24)
- A free [Supabase](https://supabase.com) project

## 2. Install

```bash
npm install
```

## 3. Configure Supabase

1. Create a project at https://supabase.com.
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `contacts` and `users` tables with Row Level Security enabled.
3. Copy your keys from **Project Settings → API** and create `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in:

   | Variable | Where to find it |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (server-only secret) |
   | `AUTH_SECRET` | Any long random string (signs the admin session cookie) |
   | `ADMIN_USERNAME` | Admin login username (seed-time only) |
   | `ADMIN_PASSWORD` | Admin login password (seed-time only) |

## 4. Seed the admin user

The admin panel has **one** account, created by a seed script (no public
sign-up, no Supabase Auth):

```bash
npm run seed
```

This reads `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env.local` and inserts
that user (password stored bcrypt-hashed in the `users` table). The script is
idempotent — change the credentials in `.env.local` and rerun to update.

> `ADMIN_USERNAME` / `ADMIN_PASSWORD` are only used by the seed command. The
> running app never reads them, so they don't belong in production env vars —
> keep them in `.env.local`.

## 5. Run

```bash
npm run dev
```

- Landing page: http://localhost:3000
- Admin panel: http://localhost:3000/admin (redirects to `/admin/login`)

```bash
npm run build && npm start   # production build
```

---

## How data flows / security model

- The public contact form POSTs to `POST /api/contact`. The route validates the
  input and inserts the row using the **service-role** key on the server.
- `contacts` has **RLS enabled with no public policies**, so the `anon` key can
  neither read nor write it. Submissions can never be read by visitors.
- Admin login checks the username/password against the bcrypt hash in the
  `users` table (server-side, service-role) and issues a signed, httpOnly
  JWT session cookie (`jose`, signed with `AUTH_SECRET`).
- `/admin/*` is protected by middleware (`src/middleware.ts`): it verifies the
  session cookie and redirects unauthenticated users to `/admin/login`. The
  admin page re-verifies the session, then reads messages via the service-role
  client.
- `users` also has **RLS with no public policies** — only the service role
  (seed script + login check) can touch it. The service-role key and
  `AUTH_SECRET` are never exposed to the browser.

## Project structure

```
src/
  app/
    layout.tsx              Root layout, fonts, ThemeProvider
    page.tsx                Fetches team + contact, renders <Landing/>
    globals.css             Theme tokens (light/dark) + phone-input styling
    api/contact/route.ts    Contact form endpoint (validates phone)
    admin/
      login/page.tsx        Username/password login form
      actions.ts            login / logout server actions
      (panel)/              Authenticated area (sidebar layout)
        layout.tsx          Sidebar + session guard
        SidebarNav.tsx      Active-link nav (client)
        actions.ts          add/delete team, update settings, delete message
        page.tsx            Dashboard (counts + recent messages)
        messages/page.tsx   Contact inquiries + delete
        team/page.tsx       Team members: add / delete
        settings/page.tsx   Edit contact email + Telegram
  components/
    Landing.tsx             Full landing page (faithful port; About-us section)
    ThemeProvider.tsx       next-themes wrapper
    ThemeToggle.tsx         light/dark switch
  lib/
    supabase/admin.ts       service-role client (server only)
    auth.ts                 bcrypt credential check (server only)
    session.ts              JWT cookie sign/verify (edge-safe, jose)
    data.ts                 read helpers (team, contact, messages, counts)
    types.ts
  middleware.ts             verifies session, guards /admin/:path*
scripts/seed.mjs            `npm run seed` — creates the single admin user
scripts/make-favicon.mjs    `npm run favicon` — generates the brand favicon
supabase/schema.sql         contacts + users + team_members + site_settings
```
