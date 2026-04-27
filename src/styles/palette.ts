/**
 * iRepair Technologies — Design System v2
 * Muted bay-blue base · Blue-green teal gradient accent · Pale-yellow hairline
 *
 * These are the CANONICAL token values that mirror index.css.
 * Use these constants for any JS/TS that needs to reference palette colours
 * (e.g. chart configs, canvas renders, email templates).
 *
 * For UI components, always consume `hsl(var(--token))` via Tailwind classes.
 */

/** Palette ID constants */
export const PALETTE_IDS = ['default', 'ocean', 'neutral'] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];

export const PALETTE_LABELS: Record<PaletteId, string> = {
  default: 'Bay Blue',
  ocean:   'Ocean',
  neutral: 'Neutral',
};

/** HSL string values (no `hsl()` wrapper) — mirrors CSS custom properties */
export const hsl = {
  // Primary — muted bay-teal (blue-green)
  primary:       '192 52% 40%',
  'primary-glow':'180 44% 48%',
  'primary-600': '210 52% 30%',

  // Background scale — calm muted bay-blue
  'bg-100': '210 20% 97%',
  'bg-300': '210 16% 93%',
  'bg-500': '210 14% 87%',
  'bg-700': '208 26% 70%',

  // Foreground
  foreground: '218 35% 11%',

  // Footer surface
  'footer-bg': '216 28% 13%',
  'footer-fg': '210 16% 83%',

  // Hairline accent — pale yellow (decorative only)
  'accent-line': '48 72% 78%',
} as const;

/** Hex equivalents for non-CSS contexts (charts, emails) */
export const tokens = {
  primary:    '#2d9e95',   // muted bay-teal
  'bg-100':   '#F3F7FA',
  'bg-300':   '#E8EFF5',
  foreground: '#131F2E',
  'footer-bg':'#171F2D',
  hairline:   '#F2DC7E',   // pale yellow
} as const;

/**
 * Applies HSL palette vars directly to an HTMLElement (e.g. for chart containers).
 * For normal UI use, rely on CSS custom properties via Tailwind.
 */
export function applyCssVars(root: HTMLElement = document.documentElement) {
  Object.entries(hsl).forEach(([k, v]) => {
    root.style.setProperty(`--${k}`, v);
  });
}

export default tokens;
