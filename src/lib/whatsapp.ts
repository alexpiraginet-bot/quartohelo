/**
 * Fonte única do WhatsApp do Quarto da Helô.
 *
 * A Helô edita UM número no painel (campo "whatsapp"). Daqui derivamos tudo:
 *  - o texto legível na interface  → waDisplay()  ex.: "(27) 99854-2106"
 *  - o destino de todos os links   → waHref()     ex.: https://wa.me/5527998542106
 *
 * Assim o número exibido e os links wa.me nunca divergem. Mensagens iniciais
 * simples por origem (sem compromisso comercial) ficam em WA_MSG.
 */

/** Só os dígitos, com DDI 55 (Brasil) garantido — para montar o link wa.me. */
export function waIntl(raw?: string | null): string | null {
  const d = (raw ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("55") && d.length >= 12) return d; // já veio com DDI
  if (d.length >= 10 && d.length <= 11) return "55" + d; // BR com DDD
  return d; // formato inesperado: usa como veio, sem inventar DDI
}

/** Número legível "(DD) 9XXXX-XXXX" a partir de qualquer forma digitada. */
export function waDisplay(raw?: string | null): string | null {
  const all = (raw ?? "").replace(/\D/g, "");
  if (!all) return null;
  const local = all.startsWith("55") && all.length > 11 ? all.slice(2) : all;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return (raw ?? "").trim() || null; // não reconheceu o padrão: mostra como veio
}

/** Link wa.me a partir do número + uma mensagem inicial opcional. */
export function waHref(raw?: string | null, message?: string | null): string | null {
  const intl = waIntl(raw);
  if (!intl) return null;
  const text = message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${intl}${text}`;
}

/** Mensagens iniciais simples por origem (só um "oi" com contexto — nada de
 *  preço, prazo ou promessa comercial). */
export const WA_MSG = {
  geral: "Olá! Vim pelo site do Quarto da Helô e gostaria de conversar.",
  projeto: "Olá! Vim pelo site do Quarto da Helô e gostaria de saber mais sobre o Projeto Conceito.",
  curadoria: "Olá! Vim pelo site do Quarto da Helô e gostaria de saber mais sobre a Curadoria Assinada.",
  guia: "Olá! Vim pelo site do Quarto da Helô e gostaria de saber mais sobre o Guia da Helô.",
} as const;
