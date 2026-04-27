# iRepair Connect Handoff

## Current state

- Next.js app-router storefront for wholesale phone parts
- Supabase handles auth, profiles, roles, catalog, and orders tables
- Prisma is present for schema/query work, with admin-orders server boundary added
- Local git repo was rebuilt from a broken `.git` file on April 27, 2026

## Important repo notes

- `src/app/api/admin/orders/route.ts` uses server-side Prisma plus Supabase bearer-token verification
- `src/components/admin/AdminOrders.tsx` now fetches from that server route instead of merging Supabase client queries in-browser
- Login password fields have correct autocomplete attributes
- Global UI flattening pass has started in `src/index.css` to remove rounded corners
- `vercel.json` was deleted because it contained a stale SPA rewrite that would break a Next.js Vercel deployment

## Known follow-up work

- Finish Vercel prep:
  - refresh `README.md` and `DEPLOYMENT.md` for Next.js App Router and Supabase env names
  - verify metadata/favicon choices in `src/app/layout.tsx` and `public/`
- Finish visual direction:
  - hard 90-degree corners everywhere
  - replace the homepage car hero image currently sourced from `public/images/houston-2.jpg`
  - user may provide/regenerate a replacement image
- Expand `supabase/seed.sql` with real starter inventory for catalog launch
- Confirm `/api/admin/orders` against a real deployed admin session

## Deployment/env

- Expected runtime envs include:
  - `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` for server admin flows
  - `DATABASE_URL` for Prisma-backed server access

## Recommended next actions

1. Push this repo to GitHub `doj-scraper/iRepair-official-website`
2. Import the repo into Vercel
3. Set Supabase env vars in Vercel
4. Replace homepage hero image
5. Load expanded inventory seed into Supabase
