import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase. Enquanto as variáveis de ambiente não estão configuradas,
 * `isDbConfigured` é false e o app continua rodando sobre o seed local — então
 * nada quebra antes do banco existir. Assim que a Helô criar o projeto no
 * Supabase e definir as envs na Vercel, o backend entra no ar sem tocar no código.
 */
export function normalizeSupabaseUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  return u.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "").replace(/\/+$/, "");
}

const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isDbConfigured = Boolean(url && anon);

/** Cliente público (leitura). Null quando ainda não configurado. */
export const supabase: SupabaseClient | null = isDbConfigured
  ? createClient(url as string, anon as string, { auth: { persistSession: false } })
  : null;

/** Cliente de servidor (escrita no admin) usando a service role. */
export function serverClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
