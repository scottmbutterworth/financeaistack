# Finance AI Stack

A directory of AI tools and workflows for CFOs and finance teams, plus a weekly newsletter and a small sponsor spot. Built for [financeaistack.com](https://financeaistack.com).

The audience is finance leaders. Prices are shown in USD and AUD only when a vendor publishes them. Each price has a source link and the date it was checked. If a price is not public, the entry says contact sales.

## Stack

- Next.js (App Router, TypeScript), meant for Vercel Hobby
- Postgres via `DATABASE_URL`, using [postgres.js](https://github.com/porsager/postgres). A Vercel Marketplace Neon database works with its pooled connection string (`sslmode=require`). The same client runs migrations locally.
- Resend for newsletter contacts, sponsor emails, and draft broadcasts
- Admin routes protected by `ADMIN_TOKEN` as a Bearer token

The app renders an empty catalogue if `DATABASE_URL` is missing or Postgres is down. It does not throw on an empty database.

## Environment variables

Copy `.env.example` to `.env.local`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | For data | Postgres connection string (Neon pooled URL in production, local Postgres for migrate/seed) |
| `RESEND_API_KEY` | For email | Resend API key |
| `RESEND_AUDIENCE_ID` | For the list | Resend **segment** id. Audiences were replaced by segments; this variable still holds that id |
| `ADMIN_TOKEN` | For admin | Bearer token for `/api/admin/*` |
| `CRON_SECRET` | For the daily news fetch | Vercel sends this as a Bearer token to `/api/cron/news`. The route also accepts `ADMIN_TOKEN` |
| `OWNER_EMAIL` | For sponsor mail | Inbox that receives “Get in touch” emails |
| `FROM_EMAIL` | For sending | Verified sender, for example `Finance AI Stack <news@financeaistack.com>` |
| `NEXT_PUBLIC_SITE_URL` | Optional | Public origin. Defaults to `https://financeaistack.com` |

## Scripts

```bash
npm install
npm run db:migrate   # idempotent; safe to re-run
npm run db:seed      # upserts the researched catalogue; safe to re-run
npm run dev
npm run lint
npm run build
npm run newsletter:draft   # creates a Resend broadcast draft and does not send it
```

`db:migrate` and `db:seed` read `.env.local` then `.env`.

## What is included

- Home, eight job categories, a page per tool, and a workflows section
- Search with category and type filters. Searches with no matches are stored in `zero_result_searches`
- Submit form (tool or workflow) with a honeypot and a per-network rate limit. Rows land in `submissions` until reviewed
- Email signup. Disposable, test, and obvious fake addresses are rejected. Real addresses are stored and added to the Resend segment
- Closable sponsor bar. It reads the sponsor week whose `week_start` covers today, otherwise “Sponsor this spot”
- `/sponsor` with subscriber and monthly pageview counts from the database, the A$150/week and A$99/month offers, and a form that saves an inquiry and emails `OWNER_EMAIL`. No checkout
- `/go/[sponsor]` logs a row in `sponsor_clicks` and redirects to the URL stored for that sponsor
- Pageviews counted with a small POST, no cookies, bots skipped
- Server errors written to `errors` from `instrumentation.ts`
- Sitemap, robots, and an Open Graph image
- React Email newsletter: five picks, one story, a sponsored line. `POST /api/admin/newsletter` or `npm run newsletter:draft` creates a draft broadcast only

## Admin API

Send `Authorization: Bearer $ADMIN_TOKEN`.

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/admin/queue
curl -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"id":1,"action":"approve"}' http://localhost:3000/api/admin/approve
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/admin/stats
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/admin/searches
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/admin/sponsors
curl -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"week_start":"2026-11-09","sponsor_name":"Example","sponsor_slug":"example","tagline":"For finance teams","destination_url":"https://example.com"}' \
  http://localhost:3000/api/admin/sponsors
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/admin/newsletter
```

`action` is `approve` or `reject`. Approving publishes an `entries` row from the submission.

## Deploy

1. Import the repo in Vercel (Framework preset: Next.js).
2. Attach a Neon Postgres database from the Vercel Marketplace and confirm `DATABASE_URL` is set.
3. Set the rest of the variables above. Verify the sending domain in Resend before `FROM_EMAIL` will deliver.
4. Create a Resend segment for the newsletter and put its id in `RESEND_AUDIENCE_ID`.
5. After the first deploy, run `npm run db:migrate` and `npm run db:seed` once against that `DATABASE_URL` (from a machine that can reach the database, or a one-off shell). The site loads before that; the catalogue is simply empty.
6. Do not send the broadcast until you have read the draft in Resend. The app never calls send.

## Manual steps you still do

- Buy and attach the domain, and point `NEXT_PUBLIC_SITE_URL` at it.
- Create the Resend API key, segment, and verified domain.
- Choose `ADMIN_TOKEN`, `OWNER_EMAIL`, and `FROM_EMAIL`.
- Run migrate and seed once `DATABASE_URL` exists.
- Review the draft newsletter before any send. Sending is a separate action in Resend, not in this app.
- Sponsor weeks are created with `POST /api/admin/sponsors`. There is no card checkout.
