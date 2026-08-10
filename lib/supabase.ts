import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function warnMissing(label: string): void {
  console.warn(`Supabase ${label} not set — Supabase features disabled`);
}

let _client: SupabaseClient | null = null;
let _clientInitialized = false;

function getClient(): SupabaseClient | null {
  if (_clientInitialized) return _client;
  _clientInitialized = true;

  if (!supabaseUrl || !supabaseAnonKey) {
    warnMissing('URL or anon key');
    return null;
  }

  _client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

export const supabase = getClient() as SupabaseClient;

export function createClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    warnMissing('URL or anon key');
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'myapproved-trades-platform' } },
  });
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    warnMissing('URL or service role key (admin)');
    return null;
  }

  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
