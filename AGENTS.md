# iRepair Connect Agent Guide

This document is the operating guide for agents working in this repository. It explains what the app is, where the important code lives, and which conventions matter when making changes.

## Project purpose

iRepair Connect is a wholesale phone-parts storefront. The live application is a Next.js App Router app backed by Supabase, Prisma, Stripe checkout, and a small amount of server-side authorization logic. It supports public catalog browsing, product detail pages, cart checkout, authenticated order history, and an admin portal for inventory and order review.

## Canonical architecture

- Live UI routes are implemented in `src/app/`.
- `src/pages/` is legacy migration residue. Do not extend it casually. If a task touches those files, confirm whether the work should move into the app router tree instead.
- Browser state is split between React Query, Supabase auth, and a Zustand cart store.
- The public inventory catalog and product detail pages are Supabase-backed and intentionally open to anonymous users.
- Admin order review uses a server route with Prisma plus bearer-token verification.
- Checkout and payment verification travel through Next.js API routes that call Supabase Edge Functions.
- The fallback product image must remain `/F8B48E10-46F9-4474-A98F-191D370F222D.png`.

## Important directories

- `src/app/` - live routes, API handlers, and the top-level app shell.
- `src/components/` - reusable UI, layout chrome, cart, admin modules, and shared route guards.
- `src/context/` - auth/session provider.
- `src/hooks/` - client hooks for auth-derived state.
- `src/lib/` - catalog helpers, theme helpers, server helpers, and error normalization.
- `src/store/` - Zustand cart store.
- `src/integrations/supabase/` - browser client and generated Supabase DB types.
- `prisma/` - Prisma schema, generators, and seed helpers.
- `supabase/` - Edge Functions, migrations, and Supabase config.
- `tests/` and `src/__tests__/` - end-to-end and unit tests.
- `public/` - static assets, product image fallback, favicon, and marketing images.

## Route map

- `/` - storefront home page.
- `/about` - company/about content.
- `/catalog` - public catalog listing.
- `/catalog/[skuId]` - public product detail.
- `/login` - Supabase auth entry point.
- `/orders` - authenticated customer orders.
- `/dashboard` - authenticated account summary.
- `/admin` - admin-only inventory and order tools.
- `/api/auth-me` - bearer-token user lookup.
- `/api/create-checkout` - checkout handoff to the Stripe Edge Function.
- `/api/verify-payment` - post-checkout payment verification.
- `/api/admin/orders` - admin order feed backed by Prisma.
- `/api/db-check` - simple database health check.

## Core workflows

- Catalog browsing reads inventory rows from Supabase through `src/lib/catalog.ts`.
- Product detail pages fetch a single SKU plus compatibility data and use the fallback image when needed.
- Login and signup are handled by Supabase auth in `src/app/login/page.tsx` and `src/context/AuthContext.tsx`.
- Cart state lives in the Zustand store in `src/store/cart.ts`.
- Checkout starts in `src/components/cart/CartDrawer.tsx`, passes through `/api/create-checkout`, then into the `create-checkout` Edge Function.
- Stripe returns the user to `/orders?session_id=...`, and the orders page calls `/api/verify-payment`.
- Admin inventory UI lives in `src/components/admin/AdminInventory.tsx`.
- Admin order review UI lives in `src/components/admin/AdminOrders.tsx` and uses `/api/admin/orders`.

## Change rules

- Preserve public catalog access unless the task explicitly asks to restrict it.
- Keep auth, admin checks, and checkout checks in the designated files rather than scattering them across unrelated components.
- Do not silently convert `null` prices to `0` in cart or checkout logic.
- Do not trust browser-supplied checkout prices or product names.
- Keep mobile and desktop navigation in sync for signed-in and admin users.
- Do not hand-edit generated Supabase types unless the task is specifically about regeneration.
- Do not edit Prisma-generated or migration-generated outputs unless the change is part of a schema or migration task.
- Prefer the existing component library under `src/components/ui/`.
- Treat `src/pages/` as legacy unless you are deliberately finishing a migration or aligning tests.

## Files that commonly need coordinated changes

- Route or auth changes often require `src/app/layout.tsx`, `src/app/providers.tsx`, `src/context/AuthContext.tsx`, `src/components/RequireAuth.tsx`, and `src/components/RequireAdmin.tsx`.
- Catalog changes often require `src/app/catalog/page.tsx`, `src/app/catalog/[skuId]/page.tsx`, `src/lib/catalog.ts`, and `src/components/ProductCard.tsx`.
- Checkout changes often require `src/components/cart/CartDrawer.tsx`, `src/app/api/create-checkout/route.ts`, `src/app/api/verify-payment/route.ts`, and both Supabase Edge Functions.
- Admin changes often require `src/app/admin/page.tsx`, `src/components/admin/AdminInventory.tsx`, `src/components/admin/AdminOrders.tsx`, `src/app/api/admin/orders/route.ts`, and `prisma/schema.prisma`.
- Theme or branding changes often require `src/index.css`, `src/lib/theme.ts`, `src/lib/theme-client.ts`, and `src/components/ui/theme-switcher.tsx`.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` - Browser-accessible Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Browser-accessible Supabase anonymous/publishable key
- `SUPABASE_URL` - Server-side Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Server-only Supabase service role key (never expose to browser)
- `DATABASE_URL` - Prisma database connection string
- `STRIPE_SECRET_KEY` - Stripe secret key for payment processing

## Scripts worth knowing

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npm run prisma:generate`
- `npm run prisma:db:seed`

## Verification expectations

- If a change touches auth, checkout, or admin access, verify both the happy path and at least one denial path.
- If a change touches catalog or product detail rendering, verify the fallback image path still works.
- If a change touches docs, make sure the docs match the live `src/app/` tree and do not describe the repo as Vite or React Router based.
- If a change touches public navigation, verify mobile and desktop states separately.

## Documentation policy

- `README.md` should explain what the project is and how to run it.
- `ARCHITECTURE.md` should explain how the codebase is structured and how the request/data flows work.
- `AGENTS.md` should stay focused on how agents should work safely inside the repo.
- When behavior changes, update the docs in the same change set if the docs would otherwise drift.
