"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("[AURA/ARGUS] Variaveis publicas do Supabase ausentes.");
  }

  return createBrowserClient(url ?? "", anonKey ?? "");
}
