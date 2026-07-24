import type { CardImage } from "@/lib/types";

/* Imagem opcional de um card, em dois modos:
 *  - "top": área de imagem responsiva no topo do card (object-fit: cover).
 *  - "background": camada isolada atrás do conteúdo, a 50% de opacidade (nunca
 *    aplicamos opacity no card inteiro — texto e botões seguem 100% opacos).
 * Componente puramente visual: serve tanto na landing (server) quanto no guia. */

export function cardHasBg(image?: CardImage | null): boolean {
  return !!(image?.url && image.mode === "background");
}

export function CardMediaTop({ image }: { image?: CardImage | null }) {
  if (!image?.url || image.mode !== "top") return null;
  return (
    <div className="card-media-top">
      <img src={image.url} alt={image.alt?.trim() ? image.alt : ""} loading="lazy" />
    </div>
  );
}

export function CardMediaBg({ image }: { image?: CardImage | null }) {
  if (!cardHasBg(image)) return null;
  return (
    <div className="card-media-bg" aria-hidden="true">
      <span className="ph" style={{ backgroundImage: `url(${image!.url})` }} />
      <span className="veil" />
    </div>
  );
}
