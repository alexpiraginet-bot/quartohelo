import "server-only";
import { SUPA_ANON, SUPA_URL } from "./supabase";

/**
 * Chama a Edge Function qh-admin (login + gravação do painel). A função roda no
 * Supabase com a service role NATIVA, então nada aqui depende de variável de
 * ambiente na Vercel — só da URL e chave pública (anon), que já têm padrão no
 * código. Sempre devolve { ok, msg, ... }; nunca lança.
 */
export interface FnResult {
  ok: boolean;
  msg?: string;
  token?: string;
  rows?: unknown[];
  [k: string]: unknown;
}

export async function callAdminFn(action: string, payload: Record<string, unknown> = {}): Promise<FnResult> {
  try {
    const res = await fetch(`${SUPA_URL}/functions/v1/qh-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPA_ANON,
        Authorization: `Bearer ${SUPA_ANON}`,
      },
      body: JSON.stringify({ action, ...payload }),
      cache: "no-store",
    });
    const data = (await res.json()) as FnResult;
    return data ?? { ok: false, msg: "Resposta vazia do servidor." };
  } catch {
    return { ok: false, msg: "Não consegui falar com o servidor. Tente de novo." };
  }
}
