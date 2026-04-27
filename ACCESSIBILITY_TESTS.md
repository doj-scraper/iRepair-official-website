Manual accessibility test steps — iRepair Connect

1) Keyboard navigation (header & nav)
   - Focus the page and press Tab to reach the header links.
   - Verify a visible focus ring appears and you can activate links with Enter.

2) Search input
   - Focus the search field on /catalog. Confirm the screen-reader reads: "Search catalog by SKU or name".

3) Contrast checks
   - Inspect muted text (captions, helper text) on catalog and product pages; text should be clearly legible against the background.

4) Responsive checks
   - On small screens, ensure the product page stacks, mobile nav is reachable, and cart drawer can be opened via keyboard.

Notes: Automated checks added (unit test) for nav keyboard focus. Use Lighthouse/axe for further automated scans.