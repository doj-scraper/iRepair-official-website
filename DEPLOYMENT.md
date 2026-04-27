# Deployment Notes

This document describes how the current iRepair Connect app is built and deployed.

The live application is a Next.js App Router project backed by Supabase, Prisma, and Stripe checkout. The old Vite / React Router model is obsolete for deployment purposes and should not be used as a reference for current releases.

## What deploys

- Public storefront routes under `src/app/`
- API routes under `src/app/api/`
- Supabase Edge Functions under `supabase/functions/`
- Prisma schema and server-side data access
- Static assets from `public/`

## Build flow

The production build is expected to do two things in order:

1. Generate the Prisma client.
2. Run the Next.js build.

The `build` script in `package.json` now runs:

```bash
npm run prisma:generate && next build
```

That ordering matters on Vercel because dependency caching can otherwise leave Prisma client output stale during page data collection.

## Environment variables

Set these in Vercel and in any local environment that runs the app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DATABASE_URL_DIRECT`
- `STRIPE_SECRET_KEY`

Notes:

- `NEXT_PUBLIC_*` values are safe for the browser bundle.
- `SUPABASE_SERVICE_ROLE_KEY` must remain server-only.
- `DATABASE_URL` is required for Prisma.
- `DATABASE_URL_DIRECT` should point at the direct Postgres host for Prisma migrations and seeding when the pooler is in use.
- `STRIPE_SECRET_KEY` is required by the checkout and payment verification Edge Functions.

## Vercel setup

1. Connect the GitHub repository to Vercel.
2. Set the environment variables listed above.
3. Keep the project as a standard Next.js app.
4. Let Vercel run the normal install and build steps.

Expected behavior:

- `npm install`
- `npm run build`

The build should now:

- regenerate Prisma before the Next build starts
- avoid fetching Google Fonts at build time
- compile the App Router pages and API routes normally

## Supabase setup

The app uses Supabase for:

- auth
- public catalog reads
- user orders
- inventory management
- Edge Functions for Stripe checkout and payment verification

Make sure the Edge Functions are deployed with the same environment variables used by the app deployment.

## Prisma setup

Use Prisma for:

- server-side admin order queries
- schema changes
- seed data and data utilities

Common commands:

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:db:seed
```

Recommended order for a fresh Supabase database:

1. Set `DATABASE_URL` to the direct Postgres connection string, or export `DATABASE_URL_DIRECT` and point `DATABASE_URL` at it for the migration step.
2. Run `npm run prisma:migrate:deploy` to create the schema.
3. Run `npm run prisma:db:seed` to populate brands, models, phones, part types, part masters, aliases, and stock ledger rows.
4. Switch back to your preferred runtime connection string if you use a separate pooler for the app.

If schema or seed logic changes, regenerate the client before building or deploying.

## Verification

Before release, verify the following:

- `/catalog` and `/catalog/[skuId]` remain public.
- `/orders` still requires authentication.
- `/admin` still requires admin access.
- Checkout and payment verification both receive the user bearer token.
- Public catalog prices show correctly and do not render `0` for missing values.

## Local checks

Useful commands during release work:

```bash
npm run lint
npm run test
npm run build
```

If you are specifically changing auth, checkout, or admin behavior, run the targeted Vitest suites as well.

## Notes

- `src/pages/` is legacy migration residue.
- Documentation should describe the live `src/app/` tree, not the obsolete pages tree.
- Keep deployment notes aligned with the actual build scripts and environment variables in `package.json`.
