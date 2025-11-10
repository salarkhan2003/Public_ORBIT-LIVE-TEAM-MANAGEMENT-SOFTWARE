import { createClient } from '@supabase/supabase-js';

// Production: require environment variables. Do not fall back to hard-coded demo keys.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment or .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Keep default behaviour but ensure session persistence is enabled for browser usage
  auth: { persistSession: true, detectSessionInUrl: true }
});
