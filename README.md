# iRepair Connect

iRepair Connect is a wholesale phone-parts storefront for repair shops. The app is public for browsing inventory, but it requires authentication for customer orders and stricter admin verification for inventory and order management.

This repository is a Next.js App Router application. The live app is in `src/app/`. A legacy `src/pages/` tree still exists from an earlier routing model, but it is migration residue and should not be treated as the canonical application surface.

For a deeper internal map of the codebase, read [ARCHITECTURE.md](./ARCHITECTURE.md). For agent-specific operating rules, read [AGENTS.md](./AGENTS.md).

## What the app does

- Public customers can browse `/catalog` and product detail pages without signing in.
- Authenticated customers can view `/orders` and `/dashboard`.
- Admin users can manage inventory and review orders on `/admin`.
- Cart checkout is handled through a Stripe handoff.
- Product images use the inventory `image_url` when available and fall back to `/F8B48E10-46F9-4474-A98F-191D370F222D.png`.

## Live routes

- `/` - storefront home page.
- `/about` - company and fulfillment story.
- `/catalog` - public catalog listing with brand/model/generation filters.
- `/catalog/[skuId]` - public product detail page.
- `/login` - Supabase auth entry point.
- `/orders` - authenticated order history and payment return handling.
- `/dashboard` - authenticated account summary.
- `/admin` - admin inventory and order console.
- `/api/auth-me` - bearer-token user lookup.
- `/api/create-checkout` - checkout handoff to the Stripe Edge Function.
- `/api/verify-payment` - payment status verification after Stripe redirects back.
- `/api/admin/orders` - admin order feed backed by Prisma.
- `/api/db-check` - database health check.

## How the codebase is organized

### App shell

- `src/app/layout.tsx` defines the root document shell, font loading, metadata, and palette bootstrap script.
- `src/app/providers.tsx` sets up QueryClient, ThemeProvider, Toasters, TooltipProvider, and AuthProvider.
- `src/index.css` contains the design tokens, palette presets, typography defaults, and global resets.

### Shared UI

- `src/components/layout/` contains the header, footer, mobile navigation, and main layout wrapper.
- `src/components/ui/` contains the shadcn-style primitive components used everywhere else.
- `src/components/cart/CartDrawer.tsx` contains the cart sheet and checkout trigger.
- `src/components/ProductCard.tsx` and `src/components/CatalogSidebar.tsx` drive the browsing experience.
- `src/components/admin/` contains the inventory editor and the admin orders table.

### Auth and state

- `src/context/AuthContext.tsx` is the global Supabase auth/session provider.
- `src/hooks/useIsAdmin.ts` checks the current user against the `admin` role.
- `src/store/cart.ts` persists the shopping cart in local storage with Zustand.
- `src/lib/theme.ts` and `src/lib/theme-client.ts` manage palette selection and theme state.

### Data and integration

- `src/lib/catalog.ts` fetches and normalizes public inventory data.
- `src/lib/supabaseServer.ts` provides the server-only Supabase admin client and bearer-token user lookup.
- `src/lib/prisma.ts` exports the Prisma client singleton used by server routes.
- `src/integrations/supabase/client.ts` creates the browser Supabase client lazily.
- `src/integrations/supabase/types.ts` contains the generated Supabase DB types.

### Server and backend

- `src/app/api/` contains the Next.js API routes.
- `supabase/functions/` contains the Stripe checkout and payment verification Edge Functions.
- `prisma/` contains the Prisma schema and seed helpers.
- `supabase/migrations/` contains SQL migrations for the Supabase database.

### Tests and docs

- `src/__tests__/` holds Vitest unit tests.
- `src/app/api/admin/orders/route.test.ts` covers the admin order API route.
- `tests/e2e/` holds Playwright scaffolding.
- `CODE_REVIEW_FINDINGS.md` records the last review findings and fix workflows.
- `ARCHITECTURE.md` is the internal system map.
- `AGENTS.md` is the repository operating guide.

## Request and data flow

### Public catalog browsing

1. The home page routes users into `/catalog`.
2. `src/app/catalog/page.tsx` calls `useCatalog()` from `src/lib/catalog.ts`.
3. The query loads inventory rows from Supabase with joined model, brand, and category information.
4. `CatalogSidebar` filters by brand, model, and generation.
5. `ProductCard` shows the image, price, MOQ, and a quick-add action.

### Product detail

1. `src/app/catalog/[skuId]/page.tsx` reads the SKU from the route.
2. The page fetches the matching inventory row and compatibility rows.
3. If `image_url` is missing, the fallback asset is shown.
4. The quantity selector respects MOQ and stock.
5. The user can add the item to the cart.

### Login and auth state

1. `src/app/login/page.tsx` signs users in or up through Supabase auth.
2. `AuthContext` keeps the current session and user state in memory.
3. `useAuth()` is the shared hook for auth-aware UI.
4. Admin access is checked by `useIsAdmin()` against the `admin` role.

### Cart and checkout

1. The cart lives in `src/store/cart.ts` and persists locally.
2. The cart drawer submits checkout through `/api/create-checkout`.
3. The Next.js route validates the current user and then calls the checkout Edge Function.
4. The Edge Function creates a Stripe session and writes a pending order.
5. Stripe redirects the user back to `/orders?session_id=...`.

### Payment verification and orders

1. `src/app/orders/page.tsx` detects the Stripe session id in the URL.
2. The page calls `/api/verify-payment`.
3. The Next.js route invokes the payment verification Edge Function.
4. The Edge Function checks Stripe payment status and marks the matching order paid.
5. The orders page clears the query parameter and reloads the order list.

### Admin inventory and admin orders

1. `src/app/admin/page.tsx` checks both authentication and admin status.
2. `AdminInventory` reads and mutates inventory records from Supabase.
3. Changes invalidate the catalog query so storefront views stay fresh.
4. `AdminOrders` calls `/api/admin/orders` with the user access token.
5. The admin API route checks the token, verifies the admin role in Prisma, and returns orders.

## Data model overview

The browser-facing app primarily reads Supabase tables:

- `inventory`
- `brands`
- `models`
- `categories`
- `compatibility_map`
- `orders`
- `order_items`
- `profiles`
- `user_roles`

The repository also contains a Prisma schema. That schema is used for server-side work and admin queries, and it may not mirror every browser-facing Supabase concern one-for-one. The important thing is to know which layer owns which data:

- Supabase owns live storefront data and auth.
- Prisma owns server-side schema work and admin reads.
- The browser never needs to know about service-role credentials.

## Styling system

- The app uses Tailwind CSS with tokenized color values defined in `src/index.css`.
- Theme mode is provided by `next-themes`.
- Palette presets are injected before first paint to avoid a flash of incorrect colors.
- `src/components/ui/theme-switcher.tsx` exposes the mode and palette controls.
- The design system intentionally preserves the public fallback image path and the current token naming.

## Testing expectations

- Unit tests should cover catalog search, dashboard rendering, and other browser logic that can be verified without a full browser.
- API route tests should cover bearer-token handling and admin authorization.
- E2E tests should cover checkout, orders, and navigation paths once the browser harness is available.

When you change auth, checkout, admin access, or route behavior, add a regression test or update an existing one.

## Setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Provide the environment variables required by the app and server routes.

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL="postgresql://user:password@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DATABASE_URL_DIRECT="postgresql://user:password@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
   DIRECT_URL="postgresql://user:password@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
   STRIPE_SECRET_KEY=sk_test_...
   ```

3. Generate Prisma client artifacts if you are changing schema or seed logic.

   ```bash
   npm run prisma:generate
   ```

4. Seed data if the task requires a populated database.

   ```bash
   npm run prisma:db:seed
   ```

5. Run the app.

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - start the Next.js dev server.
- `npm run build` - build the production app.
- `npm run start` - run the production build locally.
- `npm run lint` - run ESLint across the repo.
- `npm run test` - run the Vitest suite.
- `npm run test:e2e` - run Playwright tests.
- `npm run test:all` - run unit tests and E2E tests in sequence.
- `npm run prisma:generate` - generate Prisma client output.
- `npm run prisma:db:seed` - seed the database.

## Deployment notes

The deployment target should be configured as a Next.js application. Do not use the old Vite/React Router assumptions from earlier docs. The main operational requirement is that the hosting platform provides the Supabase and Stripe environment variables listed above.

## Working conventions

- Keep customer-facing inventory public.
- Preserve the fallback product image.
- Keep auth, admin, and checkout logic in the designated files.
- Do not trust browser-supplied prices at checkout.
- Treat `src/pages/` as legacy unless the task is specifically about migration cleanup.
- Update this README and `AGENTS.md` when the live application structure changes.
