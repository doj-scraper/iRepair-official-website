import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Server-only Supabase admin client — requires SUPABASE_SERVICE_ROLE_KEY in environment (never expose this key to the browser)
// Lazily initialized so missing env vars fail at request time, not at module load.
let _client: ReturnType<typeof createClient> | null = null;

function getAdminClient() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';
  if (!url) throw new Error('SUPABASE_URL env var is required');
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

// Named export preserved for compatibility
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getAdminClient() as any)[prop];
  },
});

export async function getUserFromAuthHeader(authHeader?: string | null) {
  if (!authHeader) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!match) return null;
  const token = match[1];
  const { data, error } = await getAdminClient().auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

export default supabaseAdmin;
