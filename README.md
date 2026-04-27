# iRepair Connect

A wholesale cell phone part storefront for iRepair Technologies. This project provides a public catalog of inventory, product detail pages, a customer cart experience, and protected order history and admin management.

## Features

- Public catalog browsing at `/catalog`
- Product detail pages at `/catalog/:skuId`
- Customer cart and checkout flow
- Inventory photo handling via `image_url` or fallback public product image
- Supabase authentication for checkout and order history
- Admin inventory management and order review behind secure admin access
- Prisma schema and seed support for inventory and product taxonomy

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase for auth and database access
- Prisma for schema migration and data access
- React Router v6 for routing
- React Query for server state
- Sonner for toast notifications

## Project Architecture

This project is organized for clarity and scalability, following modern React and full-stack conventions.

### Main Folders
- `src/` – Application source code
  - `App.tsx` – Central route definitions and route protection logic
  - `pages/` – Top-level page components (Index, Catalog, ProductDetail, Orders, Admin, Login, About, Dashboard, NotFound)
  - `components/` – Reusable UI and admin components (e.g., ProductCard, NavLink, RequireAuth, RequireAdmin)
  - `context/` – Context providers (e.g., `AuthContext.tsx` for Supabase auth/session)
  - `integrations/` – Third-party integrations (e.g., `supabase/` for client and types)
  - `lib/` – Shared utilities and catalog logic
- `public/` – Static assets (images, favicon, robots.txt, placeholder images)
- `prisma/` – Prisma schema, migrations, and seed scripts
- `supabase/` – Supabase function and database config files

### Routing
- Uses React Router v6 in `src/App.tsx` for all route definitions
- Public routes:
  - `/` – Home
  - `/about` – About
  - `/catalog` – Catalog listing
  - `/catalog/:skuId` – Product detail
  - `/login` – Login/Signup
- Protected routes:
  - `/orders` – Requires authentication (`RequireAuth`)
  - `/dashboard` – Requires authentication (`RequireAuth`)
  - `/admin` – Requires admin access (`RequireAdmin`)
- All unknown routes fall back to `NotFound`

### Key Conventions
- **Route protection**: Centralized in `src/App.tsx` using `RequireAuth` and `RequireAdmin` wrappers
- **UI components**: Follow shadcn/ui style in `src/components/`
- **Auth/session**: Managed via `AuthContext` and Supabase
- **Product images**: Use `image_url` from inventory, fallback to `/F8B48E10-46F9-4474-A98F-191D370F222D.png` in `public/`
- **Database**: Prisma for schema and migrations, Supabase for auth and data

---

## Public Routes

- `/` – home page
- `/about` – about page
- `/catalog` – catalog listing (public)
- `/catalog/:skuId` – product detail (public)
- `/login` – login/signup

## Protected Routes

- `/orders` – requires authenticated user
- `/admin` – requires admin access

## Product Image Behavior

- Customer-facing views use `image_url` from inventory when available
- When no `image_url` exists, fallback uses the public product photo at:
  - `/F8B48E10-46F9-4474-A98F-191D370F222D.png`
- Admin inventory entries accept `Image URL` values and preview the image in the form

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment variables:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ```

3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

4. Seed the database:
   ```bash
   npm run prisma:db:seed
   ```

5. Start the app:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` – start development server
- `npm run build` – build production bundle
- `npm run preview` – preview production build locally
- `npm run lint` – run ESLint
- `npm run test` – run Vitest tests
- `npm run prisma:generate` – generate Prisma client
- `npm run prisma:db:seed` – seed database

## Notes

- The inventory is intentionally public for customers; no login is required to view `/catalog` or product detail pages.
- Orders are protected and require login.
- Admin management is restricted to users who pass admin verification.
- The current product image asset for screen inventory is stored at `public/F8B48E10-46F9-4474-A98F-191D370F222D.png`.

## Contributing

- Follow existing conventions in `src/components/ui/` and use the established shadcn-style UI components.
- Keep route protection logic centralized in `src/App.tsx` and auth checks in `src/components/RequireAuth.tsx` / `src/components/RequireAdmin.tsx`.
- Verify any new inventory or product work against the public catalog and protected order flows.
