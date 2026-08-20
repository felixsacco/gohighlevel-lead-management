import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client from environment variables (no hardcoded credentials)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single instance with realtime disabled to avoid WebSocket issues
export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
}); 