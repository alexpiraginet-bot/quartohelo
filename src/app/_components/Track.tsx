"use client";

import { useEffect } from "react";

/**
 * Coleta de analytics própria (primeira parte): eventos anônimos enviados ao
 * nosso backend (/api/evento). Nunca atrapalha a navegação: fire-and-forget,
 * e se a gravação não estiver configurada o servidor simplesmente ignora.
 */
export function track(kind: string, meta?: Record<string, unknown>) {
  try {
    const body = JSON.stringify({ kind, meta: meta ?? null });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/evento", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/evento", {
        method: "POST",
        body,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});
    }
  } catch {
    /* nunca interrompe a página por causa de métricas */
  }
}

/** Dispara um evento uma vez, ao montar a página (ex.: visita). */
export function Track({ kind }: { kind: string }) {
  useEffect(() => {
    track(kind);
  }, [kind]);
  return null;
}
