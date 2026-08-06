import type { CardImage } from "@/lib/types";
import { DEFAULT_BG_OPACITY, DEFAULT_TOP_OPACITY } from "@/lib/types";

/* Imagem opcional de um card, em dois modos:
 *  - "top": faixa de imagem no topo do card (object-fit: cover).
 *  - "background": camada isolada atrás do conteúdo.
 * A opacidade escolhida no painel vale só para a IMAGEM: texto e botões seguem
 * 100% opacos (nunca aplicamos opacity no card inteiro). Card sem opacidade
 * salva usa o padrão do modo, então o que já estava configurado não muda.
 * Componente puramente visual: serve na landing (server) e no guia. */

function opacityOf(image: CardImage, fallback: number): number {
  const o = image.opacity;
  return typeof o === "number" && o > 0 && o <= 1 ? o : fallback;
}

export function cardHasBg(image?: CardImage | null): boolean {
  return !!(image?.url && image.mode === "background");
}

export function CardMediaTop({ image }: { image?: CardImage | null }) {
  if (!image?.url || image.mode !== "top") return null;
  const caption = image.caption?.trim();
  return (
    <div className={`card-media-top${caption ? " has-cap" : ""}`}>
      <img
        src={image.url}
        alt={image.alt?.trim() ? image.alt : ""}
        loading="lazy"
        style={{ opacity: opacityOf(image, DEFAULT_TOP_OPACITY) }}
      />
      {caption ? <span className="cap">{caption}</span> : null}
    </div>
  );
}

export function CardMediaBg({ image }: { image?: CardImage | null }) {
  if (!cardHasBg(image)) return null;
  const op = opacityOf(image!, DEFAULT_BG_OPACITY);
  // O véu creme acompanha a opacidade escolhida (0,18 em 50%, como sempre
  // esteve), mas nunca some de todo: o card tem texto escuro por cima da foto,
  // e sem um mínimo de véu uma foto escura torna a leitura impossível. Por isso
  // a foto de fundo do card vai até 90%, e não até 100% como o fundo das
  // páginas, onde não há texto escuro por cima.
  const veil = Math.max(0.12, (1 - op) * 0.36);
  return (
    <div className="card-media-bg" aria-hidden="true">
      <span className="ph" style={{ backgroundImage: `url(${image!.url})`, opacity: op }} />
      <span className="veil" style={{ opacity: veil }} />
    </div>
  );
}
