# Advocate's Diary · वकील डायरी

A simple phone app for an advocate to track **cases, hearing dates and fees**,
in Hindi and English. It's designed for a busy 50+ user: big text, few words, one job per screen.

## What it does

| Screen | |
|---|---|
| **आज / Today** | Today's and tomorrow's hearings, total dues, money received this month, and big **+ पैसे** / **+ तारीख** buttons |
| **केस / Cases** | Search by name or case no.; filter by Active / Due / Disposed |
| **Case page** | Fee, paid and due amounts, next date, payment history, hearing history, Call / WhatsApp buttons |
| **तारीखें / Dates** | Upcoming hearings by day, plus a red **needs update** list for cases whose date passed with no next date |
| **मुवक्किल / Clients** | Every client with their total dues and cases |
| **और / More** | Language switch, junior accounts, recent-changes log |

**Roles:** the *Advocate* (admin) sees everything. A *Junior* can add cases, dates and payments,
but can't see the total-dues and income figures, delete payments, or manage the team.

## Design

The app borrows from a lawyer's own tools rather than a generic app look:
cream diary paper, ink-blue writing, **red ink for money owed**, ruled register lines,
a red margin line, rubber-stamp marks (PAID / DONE) and calendar-page date stamps.
Fonts: *Mukta* (text) and *Martel* (numbers and headings), both with Devanagari.

## Tech

- Next.js 15 (App Router, Server Actions) + TypeScript + Tailwind CSS 4
- Prisma ORM: SQLite for local use, switches to Postgres for hosting
- Login with a signed cookie (jose + bcrypt)
- Installable on the phone as a PWA ("Add to Home Screen")

```
src/
  app/(auth)/        login, first-time setup
  app/(app)/         every screen behind login
  components/        shared UI (diary design system)
  server/queries.ts  all reads
  server/actions.ts  all writes (validated with zod, logged)
  i18n/              Hindi + English dictionary
  lib/               db, auth, dates (India time), money (₹1,25,000)
prisma/schema.prisma data model
```

## Run locally

```bash
npm install
cp .env.example .env          # then set SESSION_SECRET
npx prisma migrate dev        # creates prisma/dev.db
npm run dev                   # http://localhost:3000
```

The first visit opens **setup**, where you create the advocate's account. Juniors are added later from **More**.

To try it with sample data (this **wipes** the local database):

```bash
npm run seed:demo             # login: advocate / demo123  or  junior / demo123
```

To open it on your phone over home Wi-Fi, run `npm run dev -- -H 0.0.0.0` and
open `http://<your-pc-ip>:3000` on the phone.

## Deploying (later)

1. Create a Postgres database (e.g. Neon or Supabase, both have free tiers).
2. In `prisma/schema.prisma` set `provider = "postgresql"`, then run `npx prisma migrate dev` to create fresh migrations.
3. Deploy to Vercel with `DATABASE_URL` and `SESSION_SECRET` set.

## Roadmap

- PDF receipts shared on WhatsApp
- Monthly / yearly income reports and Excel export
- Hearing and payment reminders to clients
- Case documents (orders, petitions)
- eCourts status lookup by CNR
- Desktop layout
