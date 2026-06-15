import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SITTERS, Sitter } from './data';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Only create a client if env vars are present (so the app still runs — falling back to
// the static seed — when Supabase isn't configured, e.g. on a deploy without env vars).
export const supabase = url && anon ? createClient(url, anon) : null;
export const isSupabaseConfigured = !!supabase;

/** Fetch sitters from Supabase; falls back to the static seed on any error / missing config. */
export async function fetchSitters(): Promise<Sitter[]> {
  if (!supabase) return SITTERS;
  try {
    const { data, error } = await supabase.from('sitters').select('*').order('sort');
    if (error || !data || data.length === 0) return SITTERS;
    return data as Sitter[];
  } catch {
    return SITTERS;
  }
}
