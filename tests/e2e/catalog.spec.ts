/*
  Playwright E2E test for the public Catalog page.

  Run instructions:
  1. Install Playwright in the project if not already installed:
     npm i -D @playwright/test
     npx playwright install

  2. Start dev server (in another terminal):
     npm run dev

  3. Run tests:
     npx playwright test tests/e2e/catalog.spec.ts

  The test below assumes a running dev server at http://localhost:5173 and that
  the /catalog page renders product cards. If you prefer to run against a built
  preview, start `npm run preview` and adjust the base URL below.
*/

// Uncomment the code below after installing Playwright to run E2E checks.

// import { test, expect } from '@playwright/test';

// test('catalog loads products and search filters results', async ({ page }) => {
//   const base = process.env.E2E_BASE_URL ?? 'http://localhost:5173';
//   await page.goto(`${base}/catalog`);
//   // wait for product cards to render
//   await page.getByText('All wholesale parts', { exact: false }).waitFor({ state: 'visible', timeout: 5000 });
//   // ensure at least one product appears
//   const cards = page.locator('h3');
//   await expect(cards.first()).toBeVisible();
//
//   // perform a search that should filter results
//   const search = page.getByLabel('Search catalog by SKU or name');
//   await search.fill('iphone');
//   // wait briefly for UI to update
//   await page.waitForTimeout(200);
//   // assert that at least one matching product remains
//   await expect(page.getByText(/iphone/i)).toBeVisible();
// });
