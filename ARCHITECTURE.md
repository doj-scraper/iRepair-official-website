# iRepair Connect Architecture

This document is the codebase map for iRepair Connect. It explains how the app is structured, how requests move through the system, which files own which concerns, and where to make changes safely.

## 1. Big picture

iRepair Connect is a wholesale parts storefront for phone repair shops. The application is built as a Next.js App Router app and split across three main execution environments:

- The browser, which renders storefront pages, manages auth state, and holds the shopping cart.
- The Next.js server, which exposes API routes and the app shell.
- Supabase Edge Functions, which perform checkout and payment verification with Stripe and Supabase auth.

The application is intentionally public for catalog browsing. Authentication is used for orders, dashboard access, and admin access. Inventory management and order review are restricted to admins.

## 2. Stack summary

- Next.js App Router
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Supabase auth and database access
- Prisma for server-side schema and admin data access
- Stripe for checkout
- TanStack Query for browser data fetching
- Zustand for cart state
- Sonner for toasts
- next-themes for light/dark mode

## 3. Repository map

### 3.1 Application shell

- `src/app/layout.tsx` sets the root HTML shell, metadata, font, and palette bootstrap script.
- `src/app/providers.tsx` wires the global client providers.
- `src/index.css` defines the design tokens, theme variables, palette variants, and global resets.
- `src/app/not-found.tsx` renders the 404 page.

### 3.2 Live storefront routes

- `src/app/page.tsx` - home page.
- `src/app/about/page.tsx` - about page.
- `src/app/catalog/page.tsx` - public catalog listing.
- `src/app/catalog/[skuId]/page.tsx` - public product detail.
- `src/app/login/page.tsx` - login and signup.
- `src/app/orders/page.tsx` - authenticated customer orders.
- `src/app/dashboard/page.tsx` - authenticated account summary.
- `src/app/admin/page.tsx` - admin inventory and order console.

### 3.3 API routes

- `src/app/api/auth-me/route.ts` - resolves a Supabase user from a bearer token.
- `src/app/api/create-checkout/route.ts` - validates auth, then invokes the checkout Edge Function.
- `src/app/api/verify-payment/route.ts` - validates auth, then invokes the payment verification Edge Function.
- `src/app/api/admin/orders/route.ts` - admin-only order feed backed by Prisma.
- `src/app/api/db-check/route.ts` - simple database health probe.

### 3.4 Shared components

- `src/components/layout/Header.tsx` - top navigation and auth/cart controls.
- `src/components/layout/MobileNav.tsx` - bottom navigation for small screens.
- `src/components/layout/Footer.tsx` - footer content and contact details.
- `src/components/layout/MainLayout.tsx` - wraps pages with header, footer, mobile nav, and cart drawer.
- `src/components/cart/CartDrawer.tsx` - cart UI and checkout entry point.
- `src/components/ProductCard.tsx` - catalog card layout.
- `src/components/CatalogSidebar.tsx` - brand/model/generation filter tree.
- `src/components/RequireAuth.tsx` - legacy auth gate.
- `src/components/RequireAdmin.tsx` - legacy admin gate.
- `src/components/Logo.tsx` - brand lockup.
- `src/components/NavLink.tsx` - `next/link` wrapper that adds active-state behavior.

### 3.5 Auth, data, and helpers

- `src/context/AuthContext.tsx` - app-wide Supabase auth/session provider.
- `src/hooks/useIsAdmin.ts` - admin-role lookup.
- `src/lib/catalog.ts` - catalog fetch helper, filter tree builder, and query normalization.
- `src/lib/supabaseServer.ts` - server-only Supabase admin client and bearer-token user lookup.
- `src/lib/prisma.ts` - Prisma client singleton for server routes.
- `src/lib/error.ts` - human-friendly error message helper.
- `src/store/cart.ts` - persistent cart state and price formatting.
- `src/lib/theme.ts` - theme mode and palette bootstrap script.
- `src/lib/theme-client.ts` - client-side palette state.
- `src/integrations/supabase/client.ts` - browser Supabase client factory.
- `src/integrations/supabase/types.ts` - generated Supabase DB types.

### 3.6 Data and backend

- `prisma/schema.prisma` - Prisma schema used for server-side data work and admin queries.
- `prisma/seed.ts` and helper files - Prisma seed and utility scripts.
- `supabase/functions/create-checkout/index.ts` - Stripe checkout Edge Function.
- `supabase/functions/verify-payment/index.ts` - Stripe payment verification Edge Function.
- `supabase/migrations/` - Supabase SQL migrations.
- `supabase/seed.sql` - Supabase seed data.

### 3.7 Tests and documentation

- `src/__tests__/` - Vitest unit tests for shared UI and page behavior.
- `src/app/api/admin/orders/route.test.ts` - API route coverage.
- `tests/e2e/` - Playwright test skeletons.
- `README.md` - project overview and setup.
- `AGENTS.md` - agent operating guide.
- `CODE_REVIEW_FINDINGS.md` - recent review notes and fix workflows.
- `DEPLOYMENT.md` - deployment notes and history.

### 3.8 Legacy migration residue

- `src/pages/` contains older page components from the prior routing model.
- Those files are useful as migration references, but the shipping application is the `src/app/` tree.
- If a task touches `src/pages/`, decide explicitly whether the code should stay there or move into the app router.

## 4. Request flow by user journey

### 4.1 Home and browsing

1. The user lands on `/`.
2. `src/app/page.tsx` renders the hero, category shortcuts, and promotional content.
3. The page can push users into `/catalog?q=...` from the search field.
4. Catalog browsing happens in `src/app/catalog/page.tsx`, which uses `useCatalog()` from `src/lib/catalog.ts`.

### 4.2 Catalog filtering and search

1. `useCatalog()` fetches inventory rows plus joined brand, model, and category data from Supabase.
2. `buildCatalogTree()` transforms the flat result set into a nested brand/model/generation tree.
3. `CatalogSidebar` renders the tree and mutates the current filter state.
4. The page filters by brand, model, generation, and search query.
5. `ProductCard` renders each matching SKU and adds it to the cart.

### 4.3 Product detail

1. `src/app/catalog/[skuId]/page.tsx` reads the SKU from the URL.
2. The page fetches the inventory row and compatibility rows for that SKU.
3. The fallback image path is used when `image_url` is missing.
4. MOQ, price, compatibility, and stock state are shown on the page.
5. The user can add the selected quantity to the cart.

### 4.4 Login and session state

1. `src/app/login/page.tsx` calls Supabase auth directly in the browser.
2. `AuthContext` listens for auth state changes and publishes the current user/session.
3. `useAuth()` gives pages and components access to that session.
4. `RequireAuth` and `RequireAdmin` remain available for compatibility, while the app-router pages do their own redirect handling.

### 4.5 Cart and checkout

1. `src/store/cart.ts` persists cart items in local storage.
2. `CartDrawer` renders the cart and starts checkout.
3. The browser posts to `/api/create-checkout`.
4. The Next.js route verifies the current user, then invokes the `create-checkout` Edge Function.
5. The Edge Function creates the Stripe checkout session, inserts a pending order, and stores the Stripe session id.
6. The browser redirects the user to Stripe.

### 4.6 Payment return and order history

1. Stripe returns the user to `/orders?session_id=...`.
2. `src/app/orders/page.tsx` detects the session id and calls `/api/verify-payment`.
3. The Next.js route forwards the request to the payment verification Edge Function.
4. The Edge Function checks Stripe payment status and marks the matching order `PAID`.
5. The orders page clears the query parameter and reloads the order feed.

### 4.7 Admin inventory

1. `src/app/admin/page.tsx` checks auth and admin state.
2. `AdminInventory` fetches inventory, categories, and models from Supabase.
3. The user can create or edit SKU rows, preview image URLs, and adjust stock.
4. Changes invalidate the catalog query so storefront views refresh.

### 4.8 Admin orders

1. `AdminOrders` reads the current access token from `AuthContext`.
2. It calls `/api/admin/orders` with a bearer token.
3. The Next.js route validates the token, checks the admin role in Prisma, and loads all orders.
4. The table shows customer info, status, item count, and total.

## 5. Data architecture

### 5.1 Browser-facing Supabase data

The storefront reads and writes against Supabase tables such as:

- `inventory`
- `brands`
- `models`
- `categories`
- `compatibility_map`
- `orders`
- `order_items`
- `profiles`
- `user_roles`

These tables are surfaced to the browser through the generated types in `src/integrations/supabase/types.ts`.

### 5.2 Prisma data model

The repository also contains a Prisma schema in `prisma/schema.prisma`. That schema is used for server-side data access and migration/seed work, especially in the admin order route.

The important point is not that every Prisma model is consumed by the browser UI. The important point is that the repo has two data-facing layers:

- Supabase for live browser data and auth.
- Prisma for server-side data tasks, admin queries, and schema work.

When you change one layer, check whether the other layer should be updated too.

### 5.3 Cart data

Cart data is intentionally local and persistent in the browser. The cart store does not require authentication to exist, but checkout does.

### 5.4 Theme data

Theme mode is managed by `next-themes`, and palette selection is stored locally. `src/lib/theme.ts` injects the initial palette before first paint to avoid a flash of the wrong colors.

## 6. Auth boundaries

Auth in this repo is split by surface:

- Public catalog and product pages do not require sign-in.
- Orders and dashboard views require an authenticated user.
- Admin views require both authentication and admin role verification.
- Checkout and payment verification require auth propagation across the browser, Next route, and Edge Function.

The important design rule is that auth should be consistent across all layers. A route guard in the UI is not enough by itself if the API and Edge Function also need to trust the user.

## 7. Styling and UI system

- Tailwind is the primary styling layer.
- `src/index.css` owns design tokens, palette definitions, borders, radius behavior, and typography defaults.
- `src/components/ui/` contains the shadcn-style building blocks.
- `ThemeSwitcher` changes light/dark mode and palette presets.
- The layout system uses `Header`, `Footer`, `MobileNav`, and `MainLayout` to keep the shell consistent.
- The fallback product image and existing palette values should be preserved unless a visual redesign is intentionally requested.

## 8. Testing strategy

The test surface is split by purpose:

- Unit tests in `src/__tests__/` cover page rendering and catalog behavior.
- API route tests cover server behavior, especially admin orders.
- Playwright tests in `tests/e2e/` are scaffolds for higher-level flows.

Useful test targets:

- Catalog filtering and search
- Dashboard order summary
- Admin order route auth handling
- Checkout and payment return flow
- Mobile and desktop navigation states

If a change touches checkout, auth, or admin access, add tests before declaring the work done.

## 9. Deployment and runtime expectations

The app is intended to be deployed as a Next.js project, with environment variables supplied by the hosting platform.

Expected runtime environment variables include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`

The repository also includes bot-detection hooks via `botid`, so requests to API routes and Edge Functions may include an additional verification step.

## 10. Change guidance

When making changes:

- Keep the live app router tree as the source of truth.
- Keep customer-facing inventory public.
- Preserve the fallback image path.
- Avoid trusting client-supplied checkout prices.
- Keep mobile and desktop navigation aligned for signed-in users.
- Update tests and docs when route, auth, or deployment behavior changes.
- Prefer small, explicit changes over broad rewrites unless the task is specifically about a migration or refactor.

## 11. Legacy files and migration notes

This repository still carries `src/pages/` files from an older routing model. Those files are not the canonical shipped app, but they are still present and may still be referenced by some tests or documentation.

If you touch legacy files:

- Decide whether the change belongs in the legacy tree or the app router tree.
- Do not assume the legacy files are automatically kept in sync.
- Update docs and tests so they point at the same source of truth as the live app.

## 12. Where to start for common tasks

- Routing or shell changes: `src/app/layout.tsx`, `src/app/providers.tsx`, `src/components/layout/*`
- Auth changes: `src/context/AuthContext.tsx`, `src/app/login/page.tsx`, `src/app/orders/page.tsx`, `src/app/admin/page.tsx`
- Catalog changes: `src/app/catalog/page.tsx`, `src/app/catalog/[skuId]/page.tsx`, `src/lib/catalog.ts`, `src/components/ProductCard.tsx`
- Cart and checkout changes: `src/store/cart.ts`, `src/components/cart/CartDrawer.tsx`, `src/app/api/create-checkout/route.ts`, `supabase/functions/create-checkout/index.ts`
- Payment verification changes: `src/app/api/verify-payment/route.ts`, `supabase/functions/verify-payment/index.ts`, `src/app/orders/page.tsx`
- Admin inventory changes: `src/components/admin/AdminInventory.tsx`, `src/app/admin/page.tsx`
- Admin orders changes: `src/components/admin/AdminOrders.tsx`, `src/app/api/admin/orders/route.ts`, `prisma/schema.prisma`
- Styling changes: `src/index.css`, `src/lib/theme.ts`, `src/lib/theme-client.ts`, `src/components/ui/theme-switcher.tsx`
