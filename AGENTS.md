# iRepair Connect Agent Guide

This document is intended for agents, copilots, and collaborators working on the iRepair Connect repository.

## Project Purpose

iRepair Connect is a wholesale phone parts storefront built with React, Vite, Supabase, and Prisma. It supports public inventory browsing, product detail pages, cart checkout, customer order history, and an admin portal for inventory management.

## What the repo contains

- `src/App.tsx` – route definitions and auth gating
- `src/pages/` – page-level rendering components
- `src/components/` – reusable UI pieces and admin features
- `src/context/AuthContext.tsx` – Supabase authentication provider and session handling
- `src/integrations/supabase/` – Supabase client and generated DB type definitions
- `src/lib/catalog.ts` – catalog query helper and shared placeholder image
- `prisma/` – schema, migrations, and seed scripts
- `public/` – static assets and the fallback product image

## Key app behavior

- `/catalog` and `/catalog/:skuId` are customer-facing and public.
- `/orders` is only accessible if the user is authenticated.
- `/admin` is restricted to admin users.
- The app uses `RequireAuth` for order protection and `RequireAdmin` for admin screens.
- Inventory product images may be stored as an `image_url`; if missing, customer views use the fallback product image at `/F8B48E10-46F9-4474-A98F-191D370F222D.png`.

## Common tasks for agents

- Add or update inventory listing behavior in `src/components/AdminInventory.tsx`.
- Change catalog or product details appearance in `src/pages/Catalog.tsx` and `src/pages/ProductDetail.tsx`.
- Adjust route protection in `src/App.tsx`.
- Update authentication flow in `src/context/AuthContext.tsx` and related require components.
- Modify or extend Supabase integration in `src/integrations/supabase/`.
- Seed or migrate database schema using Prisma files in `prisma/`.

## Agent guidance

- Keep customer-facing inventory public unless instructed otherwise.
- Preserve the public fallback image path and use it when `image_url` is unavailable.
- If a change touches auth or admin routes, verify the route protection logic in `src/App.tsx`.
- Avoid editing unrelated generated files unless the task explicitly requires it.
- Prefer existing UI component conventions from `src/components/ui/`.

## Environment details

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`

## Useful scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run prisma:generate`
- `npm run prisma:db:seed`

## Notes for future updates

- Keep documentation in `README.md` aligned with current routes and auth behavior.
- Document any new conventions or custom engine behavior in `AGENTS.md`.
- This repository uses a mixture of standard React/Vite configuration and Supabase/Prisma backend wiring, so coordinate changes across both frontend and backend when introducing new inventory or auth features.
