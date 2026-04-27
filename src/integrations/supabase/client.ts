// This file provides a browser-only, dynamically-loaded Supabase client.
// Avoid importing '@supabase/supabase-js' at module init so server bundles don't include it.
import type { Database } from './types';

// Resolve environment variables safely in Next.js and browser runtimes.
const resolveEnv = () => {
  const isBrowser = typeof window !== 'undefined';

  const nodeEnv = typeof process !== 'undefined' && (process as any).env ? (process as any).env : undefined;

  const SUPABASE_URL =
    nodeEnv?.NEXT_PUBLIC_SUPABASE_URL ??
    nodeEnv?.VITE_SUPABASE_URL ??
    nodeEnv?.SUPABASE_URL ??
    (isBrowser ? (window as any).__NEXT_PUBLIC_SUPABASE_URL : undefined);

  const SUPABASE_PUBLISHABLE_KEY =
    nodeEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    nodeEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    nodeEnv?.VITE_SUPABASE_PUBLISHABLE_KEY ??
    nodeEnv?.SUPABASE_PUBLISHABLE_KEY ??
    (isBrowser ? (window as any).__NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined);

  return { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isBrowser };
};

let cached: any = null;

export async function getSupabaseClient() {
  if (cached) return cached;
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isBrowser } = resolveEnv();
  if (!isBrowser) return ({} as any);
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return ({} as any);
  const { createClient } = await import('@supabase/supabase-js');
  const win = window as any;
  if (!win.__SUPABASE_CLIENT) {
    win.__SUPABASE_CLIENT = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: typeof localStorage !== 'undefined' ? (localStorage as any) : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  cached = win.__SUPABASE_CLIENT;
  return cached;
}

// Synchronous stub for imports that expect a named export. Consumers should prefer getSupabaseClient().
export const supabase = {} as any;
