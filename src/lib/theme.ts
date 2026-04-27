/**
 * iRepair Technologies — Theme system
 *
 * Centralises theme mode (light / dark / system) and palette preset types.
 * Theme mode is managed by `next-themes` (ThemeProvider in providers.tsx).
 * Palette preset client state lives in `src/lib/theme-client.ts`.
 */

// ─── Mode ───────────────────────────────────────────────────────────────────

export const THEME_MODES = ['light', 'dark', 'system'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

// ─── Palette ─────────────────────────────────────────────────────────────────

export const PALETTE_IDS = ['default', 'ocean', 'neutral'] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];

export const PALETTE_LABELS: Record<PaletteId, string> = {
  default: 'Bay Blue',
  ocean:   'Ocean',
  neutral: 'Neutral',
};

export const PALETTE_DESCRIPTIONS: Record<PaletteId, string> = {
  default: 'Muted bay-blue with teal accents',
  ocean:   'Deeper teal-blue emphasis',
  neutral: 'Desaturated slate',
};

const PALETTE_STORAGE_KEY = 'irepair-palette';
const DEFAULT_PALETTE: PaletteId = 'default';

/**
 * Inline script string for <head> — sets `data-palette` synchronously before
 * first paint to prevent a flash of the wrong palette.
 * Keep this minimal: no imports, no closures that capture outer scope.
 */
export const PALETTE_INIT_SCRIPT = `(function(){
  try {
    var k='${PALETTE_STORAGE_KEY}';
    var valid=${JSON.stringify(PALETTE_IDS)};
    var storage = window.localStorage;
    var p = storage && typeof storage.getItem === 'function' ? storage.getItem(k) : null;
    document.documentElement.setAttribute('data-palette', valid.includes(p)?p:'${DEFAULT_PALETTE}');
  } catch (e) {
    document.documentElement.setAttribute('data-palette', '${DEFAULT_PALETTE}');
  }
})()`;
