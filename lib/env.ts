/**
 * lib/env.ts
 * Leitura centralizada de variáveis de ambiente. Chaves sensíveis
 * (GEMINI_API_KEY, ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY) devem
 * ser lidas apenas em código de servidor (backend/, app/api/), nunca em
 * componentes de cliente.
 */
export const publicEnv = {
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
};

/** Uso exclusivo em código de servidor. */
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  aiRouterDefaultProvider: process.env.AI_ROUTER_DEFAULT_PROVIDER ?? 'gemini',
  aiRouterFallbackProvider: process.env.AI_ROUTER_FALLBACK_PROVIDER ?? 'anthropic'
};
