import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase. Enquanto as variáveis de ambiente não estão configuradas,
 * `isDbConfigured` é false e o app continua rodando sobre o seed local — então
 * nada quebra antes do banco existir. Assim que a Helô criar o projeto no
 * Supabase e definir as envs na Vercel, o backend entra no ar sem tocar no código.
 */
// URL e chave pública (anon) do projeto. São valores PÚBLICOS por design: vão
// para o navegador e o RLS é quem protege os dados (leitura liberada só no
// conteúdo; clientes/jornada/analytics ficam a cargo da service role). Ficam
// aqui como padrão para o app conectar sem depender de config externa; se as
// envs existirem (ex.: outro ambiente), elas têm prioridade.
// Projeto: LexFlow (vpwjaciuwgiwntyoaozj), região sa-east-1 (São Paulo).
// O quartohelo coabita com outros produtos neste projeto — por isso o prefixo
// qh_ nas tabelas. A chave anon é pública por design (o RLS protege os dados).
const DEFAULT_URL = "https://vpwjaciuwgiwntyoaozj.supabase.co";
const DEFAULT_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwd2phY2l1d2dpd250eW9hb3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzUwMTMsImV4cCI6MjEwMDIxMTAxM30.o6BA6Zfx8793hC5XqNhzwgkCS7gQNXJXzK9aUrbowmQ";

export function normalizeSupabaseUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  return u.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "").replace(/\/+$/, "");
}

const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? DEFAULT_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? DEFAULT_ANON;

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
