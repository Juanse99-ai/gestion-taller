import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Export a null client if env vars are missing, to allow the app to run without Supabase configured yet.
export const supabase = (url && key) ? createClient(url, key) : null;

export const isSupabaseReady = Boolean(url && key);