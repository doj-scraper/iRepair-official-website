import type { Database } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient<Database> | null = null;

export async function getSupabaseClient() {
  if (cached) return cached;
  
  // These are inlined by Next.js for browser bundles
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Please ensure these environment variables are set in your deployment platform.'
    );
  }
  
  const { createClient } = await import('@supabase/supabase-js');
  cached = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  
  return cached;
}

// Synchronous stub for imports that expect a named export. Consumers should prefer getSupabaseClient().
export const supabase = {} as any;
