import { NextResponse } from "next/server";
import { callAdminFn } from "@/lib/db/adminFn";

export const dynamic = "force-dynamic";

// Registro de eventos de analytics: encaminha para a Edge Function (que grava
// com a service role). Nunca falha para o visitante.

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { kind?: unknown; meta?: unknown } | null;
    const kind = typeof body?.kind === "string" ? body.kind : "";
    if (kind) {
      await callAdminFn("event", { kind, meta: body?.meta ?? null });
    }
  } catch {
    /* métrica nunca vira erro para quem navega */
  }
  return new NextResponse(null, { status: 204 });
}
