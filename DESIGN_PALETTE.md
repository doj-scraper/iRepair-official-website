Design palette — Matte baby-blue base

Palette tokens

- primary: #66A8FF (HSL 214 100% 70%) — matte baby-blue base
- primary-600: #2F6FD4 (HSL 217 66% 51%) — deeper primary for CTA backgrounds
- bg-100: #F5FAFF (HSL 210 100% 98%) — page background (very light)
- bg-300: #E8F4FF (HSL 209 100% 96%) — surfaces / cards
- bg-500: #CFE8FF (HSL 209 100% 91%) — subtle surfaces / borders
- bg-700: #8EBEFF (HSL 214 100% 78%) — subtle accents / strokes
- charcoal: #111827 (HSL 221 39% 11%) — primary text color (dark)
- accent: #FFB86B (HSL 31 100% 71%) — warm accent for highlights

Accessibility checks (WCAG AA)

- charcoal (#111827) on bg-100: contrast 16.9 — PASS AA
- charcoal on bg-300: contrast 15.9 — PASS AA
- charcoal on bg-500: contrast 14.1 — PASS AA
- charcoal on bg-700: contrast 9.3 — PASS AA
- white (#ffffff) on primary-600: contrast 4.83 — PASS AA for normal text
- charcoal on primary: contrast 7.27 — PASS AA
- charcoal on accent: contrast 10.41 — PASS AA

Typography scale

- h1: 2rem (32px) — .text-3xl / font-weight 700
- h2: 1.5rem (24px) — .text-2xl / font-weight 600
- body: 1rem (16px) — .text-base / font-weight 400

Spacing scale (base 4px)

- xs: 0.25rem (4px) — .p-1
- sm: 0.5rem (8px) — .p-2
- md: 0.75rem (12px) — .p-3
- lg: 1rem (16px) — .p-4
- xl: 1.5rem (24px) — .p-6
- xxl: 2rem (32px) — .p-8

Example utility snippets

- Primary button:

  .btn-primary {
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    box-shadow: var(--shadow-elegant);
    transition: var(--transition-smooth);
  }

- Card surface:

  .card { background: hsl(var(--card)); color: hsl(var(--card-foreground)); padding: 1rem; border-radius: var(--radius); }

Framer Motion active-state patterns

- whileTap: { scale: 0.98, transition: { duration: 0.08 } } — subtle press
- whileHover: { y: -2, transition: { duration: 0.12 } } — lift on hover
- animate: { scale: 1, boxShadow: '0 6px 18px -8px hsl(var(--primary) / 0.25)' } — gentle elevation

Recommended follow-ups

- Optionally map these tokens into tailwind.config.ts theme.extend.colors for design-system integration.
- Audit components to ensure they use hsl(var(--...)) tokens for dynamic theming.
- Add disabled/hover states and a saturation-reduced variant for accessible emphasis.
