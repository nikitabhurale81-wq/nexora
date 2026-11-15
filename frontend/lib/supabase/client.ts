"use client";

/**
 * Supabase browser client for authentication.
 *
 * The publishable/anon key is safe to expose in the frontend. If the key is
 * not configured yet, `supabase` is null and auth UIs show a clear message
 * instead of crashing (guest features still work without it).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured =
  Boolean(url) && Boolean(anonKey) && !anonKey.startsWith("PASTE_");

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
