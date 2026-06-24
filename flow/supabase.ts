import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Booking, FlowForm, SITTERS, Sitter } from './data';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Only create a client if env vars are present (so the app still runs — falling back to
// the static seed — when Supabase isn't configured, e.g. on a deploy without env vars).
export const supabase =
  url && anon
    ? createClient(url, anon, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
export const isSupabaseConfigured = !!supabase;

// ---- Auth ----
export type AuthResult = { ok: boolean; needsConfirmation?: boolean; error?: string };

export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'Auth not configured' };
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  // If email confirmation is ON, there's no session yet.
  return { ok: true, needsConfirmation: !data.session };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'Auth not configured' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

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

/** Persist a confirmed booking. Best-effort: never throws, so the success screen always shows. */
export async function createBooking(sitter: Sitter, form: FlowForm, booking: Booking): Promise<boolean> {
  if (!supabase) return false;
  const total = booking.duration === 60 ? booking.basePrice + 12 : booking.basePrice;
  try {
    const { error } = await supabase.from('bookings').insert({
      sitter_id: sitter.id,
      sitter_name: sitter.name,
      dog_name: form.name,
      dog_breed: form.breed,
      dow: booking.dow,
      day: booking.day,
      time: booking.time,
      duration: booking.duration,
      total,
    });
    return !error;
  } catch {
    return false;
  }
}
