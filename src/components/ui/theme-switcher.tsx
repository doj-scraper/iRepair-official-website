'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PALETTE_IDS, PALETTE_LABELS } from '@/lib/theme';
import { usePalette } from '@/lib/theme-client';

const MODE_ICONS = {
  light:  Sun,
  dark:   Moon,
  system: Monitor,
} as const;

/**
 * ThemeSwitcher — compact dropdown for light/dark/system mode
 * and colour palette preset. Renders nothing until mounted to
 * prevent a hydration mismatch from server-rendered HTML.
 */
export function ThemeSwitcher() {
  const { theme = 'system', setTheme } = useTheme();
  const { palette, setPalette } = usePalette();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    // Reserve space so layout doesn't shift
    return <span className="inline-flex h-9 w-9" aria-hidden />;
  }

  const ModeIcon = MODE_ICONS[theme as keyof typeof MODE_ICONS] ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          <ModeIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Mode
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <Sun className="mr-2 h-3.5 w-3.5" /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="mr-2 h-3.5 w-3.5" /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="mr-2 h-3.5 w-3.5" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Palette className="h-3 w-3" /> Palette
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={palette} onValueChange={(v) => setPalette(v as typeof palette)}>
          {PALETTE_IDS.map((id) => (
            <DropdownMenuRadioItem key={id} value={id}>
              {PALETTE_LABELS[id]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
