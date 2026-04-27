# iRepair Connect Review Findings

This document captures the seven highest-signal issues that were found during review and a practical workflow for fixing each one.

Status note: the working tree has since addressed most of these items, but the workflows are kept here as a durable record of what was wrong and how each issue was approached.

## 1. Checkout auth is broken end to end

What is wrong:
- `CartDrawer` sends checkout requests without a bearer token.
- The Next route checks for auth, then calls the edge function without forwarding the token.
- The edge function also expects the bearer token, so the request fails before Stripe checkout can be created.

Workflow:
1. Decide on one auth path and keep it consistent through the browser, Next route, and edge function.
2. Add the Supabase access token to the checkout request from the cart UI.
3. Forward that token from the Next route to the edge function, or remove the duplicate auth check from the edge function if the route becomes the only gate.
4. Verify the edge function can still resolve the user and create the Stripe session.
5. Add tests for the unauthenticated 401 case and the successful checkout case.

## 2. Payment verification is also blocked by auth propagation

What is wrong:
- The orders page posts only `sessionId`.
- The Next route and the edge function both require bearer auth.
- Because the token is not forwarded, a successful Stripe return can still leave the order stuck in `PENDING`.

Workflow:
1. Pass the current Supabase access token when calling the payment verification endpoint.
2. Forward the token through the Next route to the edge function.
3. Confirm the edge function updates the matching order to `PAID` only for the authenticated user.
4. Clear `session_id` from the URL after verification so refreshes do not repeat the flow.
5. Add a regression test for a paid session that becomes `PAID` after verification.

## 3. Checkout pricing is client authoritative

What is wrong:
- The edge checkout function trusts `items.name` and `items.price` from the browser.
- Those values are used to create Stripe line items and to write `order_items`.
- A tampered cart can undercharge or write incorrect order data.

Workflow:
1. Reduce the browser payload to stable identifiers and quantities only.
2. In the edge function, look up each SKU in the database and build the charge from server-side inventory data.
3. Reject unknown SKUs, missing stock, and any line item that cannot be resolved cleanly.
4. Use the server-calculated name and price for both Stripe and the order record.
5. Add a test that submits a tampered client price and proves the server ignores it.

## 4. The shipped app, tests, and docs are out of sync

What is wrong:
- The live app is under `src/app/*`, but the tests still target legacy `src/pages/*` files.
- `README.md` and `DEPLOYMENT.md` still describe Vite and React Router even though the repo is using Next.js app router.
- This makes the project harder to reason about and can hide regressions in CI.

Workflow:
1. Declare the app router tree canonical and treat the legacy `src/pages` tree as migration residue.
2. Update the tests to target `src/app/*` pages and the live auth/navigation behavior.
3. Remove or clearly quarantine any legacy page tests that no longer reflect the shipped app.
4. Rewrite the root docs so they describe the actual stack, routes, and deployment flow.
5. Add a short "current architecture" section so future work lands in the right files.

## 5. Mobile navigation hides account and admin access

What is wrong:
- Desktop navigation exposes Orders and Admin when the user is signed in.
- The mobile nav hard-codes Home, Catalog, About, and Log in only.
- Authenticated mobile users have no obvious path to orders or admin.

Workflow:
1. Make the mobile nav aware of auth state and admin state.
2. Add Orders for signed-in users and Admin for admin users.
3. Keep the bottom bar layout stable so the icons do not shift or overflow on small screens.
4. Verify the mobile nav still fits on narrow widths and safe-area insets.
5. Add a small interaction test for the authenticated mobile state if the test harness can support it.

## 6. Catalog search is not fully URL synchronized

What is wrong:
- The catalog page initializes `q` once, but does not stay in sync with the URL after mount.
- Search state can drift from browser navigation, shared links, or back-forward interactions.

Workflow:
1. Treat the URL as the source of truth for the search query.
2. Sync the input state with `searchParams` whenever the route changes.
3. Update the URL when the user types, using replace or push consistently.
4. Preserve the existing filter history behavior so back navigation still restores catalog state.
5. Add a test for opening a direct `?q=` link and for navigating back after a search.

## 7. Null pricing can be treated like a free item

What is wrong:
- `ProductCard` only disables the add button when `wholesale_price === 0`.
- A `null` price can still be coerced into `0` when the item is added to the cart.
- That creates a path for an unintended free line item.

Workflow:
1. Treat `null` as "not purchasable yet", not as zero.
2. Disable add-to-cart whenever the price is `null` or non-positive.
3. Keep the cart and checkout server-side validation aligned with that rule.
4. Decide whether zero-priced items should be allowed at all, then enforce that rule consistently across UI and API.
5. Add a regression test for a null-priced SKU.

## Suggested order

1. Fix checkout auth propagation.
2. Fix payment verification propagation.
3. Move pricing authority to the server.
4. Align tests and docs with the app router tree.
5. Restore mobile account/admin navigation.
6. Sync catalog search with the URL.
7. Harden null pricing behavior.
