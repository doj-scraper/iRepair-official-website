'use client';

import { useCallback, useEffect, useState } from 'react';
import { PALETTE_IDS, type PaletteId } from '@/lib/theme';

const PALETTE_STORAGE_KEY = 'irepair-palette';
const DEFAULT_PALETTE: PaletteId = 'default';

function isValidPalette(v: string | null): v is PaletteId {
  return PALETTE_IDS.includes(v as PaletteId);
}

function getPaletteStorage() {
  if (typeof window === 'undefined') return null;

  const storage = window.localStorage as Storage | undefined;
  if (
    !storage ||
    typeof storage.getItem !== 'function' ||
    typeof storage.setItem !== 'function'
  ) {
    return null;
  }

  return storage;
}

export function usePalette() {
  const [palette, setPaletteState] = useState<PaletteId>(() => {
    const storage = getPaletteStorage();
    if (!storage) return DEFAULT_PALETTE;

    const stored = storage.getItem(PALETTE_STORAGE_KEY);
    return isValidPalette(stored) ? stored : DEFAULT_PALETTE;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);

    const storage = getPaletteStorage();
    storage?.setItem(PALETTE_STORAGE_KEY, palette);
  }, [palette]);

  const setPalette = useCallback((next: PaletteId) => {
    setPaletteState(next);
  }, []);

  return { palette, setPalette };
}
