import { NextResponse } from "next/server";
import { serverClient } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

// Registro de eventos de analytics. Só aceita tipos conhecidos e nunca falha
// para o visitante: sem chave de gravação configurada, o evento é descartado.

const KINDS = new Set([
  "visita_site",
  "visita_guia",
  "entrou_guia",
  "escolha_item",
  "projeto_visto",
  "clique_fornecedor",
  "interesse_marcenaria",
]);

export async function POST(req: Request) {
  try {
    const db = serverClient();
    if (!db) return new NextResponse(null, { status: 204 });
    const body = (await req.json().catch(() => null)) as { kind?: unknown; meta?: unknown } | null;
    const kind = typeof body?.kind === "string" ? body.kind : "";
    if (!KINDS.has(kind)) return new NextResponse(null, { status: 204 });
    let meta: Record<string, unknown> | null = null;
    if (body?.meta && typeof body.meta === "object" && !Array.isArray(body.meta)) {
      const s = JSON.stringify(body.meta);
      if (s.length <= 2000) meta = body.meta as Record<string, unknown>;
    }
    await db.from("qh_analytics_events").insert({ kind, meta });
  } catch {
    /* métrica nunca vira erro para quem navega */
  }
  return new NextResponse(null, { status: 204 });
}
