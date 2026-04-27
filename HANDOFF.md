# iRepair Connect Handoff

## Current state

- The repo is now a Next.js App Router storefront for wholesale phone parts.
- Auth, checkout, payment verification, and admin-order handling were already fixed earlier in the session.
- Prisma seed/migration work was added for the server-side schema.
- Documentation was updated to match the live app structure.
- The homepage hero image was changed from the car to a custom storefront image.

## What was fixed in this session

- Prisma seed script now uses upserts and is idempotent.
- Prisma migration was created and applied successfully to the Prisma-backed database.
- `CartItem.userId` was fixed to use `@db.Uuid` so the migration could apply.
- `npm run prisma:migrate:deploy` and `npm run prisma:db:seed` both succeeded against the Prisma DB.
- Documentation was updated in:
  - `README.md`
  - `ARCHITECTURE.md`
  - `AGENTS.md`
  - `DEPLOYMENT.md`
- Env docs now mention `DATABASE_URL_DIRECT`.
- A repo script was added:
  - `npm run prisma:migrate:deploy`
- `supabase/seed.sql` now points inventory rows at `/product.png`.
- `public/images/README` documents the inventory image choice.

## Important repo split

There are effectively two database tracks in this repo:

- Prisma-backed DB: `Brand`, `Model`, `Phone`, `PartMaster`, `StockLedger`, etc.
- Supabase storefront DB: `inventory`, `brands`, `models`, `categories`, `compatibility_map`, `orders`, etc.

The storefront UI reads `inventory` from Supabase, not from Prisma. That is the part that still needs a clean rebuild.

## Current blocker

- I attempted to rebuild the Supabase storefront DB, but the direct credentials that were tried did not authenticate.
- The Prisma database is not the storefront inventory database.
- To finish the inventory rebuild, the next session needs the exact Supabase project/direct Postgres connection string for the database that contains `public.inventory`.

## Rebuild plan for inventory

1. Confirm the correct Supabase database/project that owns `public.inventory`.
2. Apply `supabase/migrations/20260416183646_9990e2a8-a9b1-4dc7-9fec-9c41115587da.sql`.
3. Apply `supabase/seed.sql`.
4. Verify `/catalog` and `/catalog/[skuId]` render inventory rows with `image_url` and `wholesale_price`.
5. Leave the fallback image path alone for rows without images.

## Files changed most recently

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/migrations/20260427120000_initial/migration.sql`
- `prisma/migrations/migration_lock.toml`
- `supabase/seed.sql`
- `supabase/migrations/20260427150000_inventory_product_image.sql`
- `package.json`
- `package-lock.json`
- `.env.example`
- `README.md`
- `DEPLOYMENT.md`
- `AGENTS.md`
- `public/images/README`
- `src/app/page.tsx`
- `src/integrations/supabase/client.ts`
- `src/lib/supabaseServer.ts`
- `CODE_REVIEW_FINDINGS.md`

## Useful commands

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:db:seed
npm run lint
npm run test
```

## Suggested next step

- Get the correct Supabase database connection string and rebuild the storefront inventory DB from the existing Supabase migrations and seed.
