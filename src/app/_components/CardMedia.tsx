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
  // O véu creme sobe junto com a foto, para o texto seguir legível (contraste
  // AA), mas devagar: com o coeficiente antigo (0,34 + 0,45·op) ele engolia o
  // ajuste — 50% e 80% chegavam à tela com 0,22 e 0,24 de foto visível, e a
  // cliente mexia na opacidade sem ver diferença. Aqui a foto visível sai de
  // 0,33 em 50% para 0,53 em 90%, e o véu nunca cai abaixo de 0,35.
  const veil = Math.min(0.62, 0.28 + 0.14 * op);
  return (
    <div className="card-media-bg" aria-hidden="true">
      <span className="ph" style={{ backgroundImage: `url(${image!.url})`, opacity: op }} />
      <span className="veil" style={{ opacity: veil }} />
    </div>
  );
}
