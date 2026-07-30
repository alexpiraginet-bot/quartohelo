"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioPhoto } from "@/lib/types";

/* Carrossel do Portfólio.
 * Não havia carrossel no projeto, então o padrão adotado é conservador:
 * troca automática a cada 6s, que pausa quando o mouse está em cima, quando o
 * teclado entra no carrossel e quando a aba sai de foco. Quem prefere menos
 * movimento (prefers-reduced-motion) não recebe troca automática nenhuma.
 * Sempre há controle manual: setas, bolinhas, teclado (← →) e arrastar. */

const AUTOPLAY_MS = 6000;

export function Portfolio({ photos }: { photos: PortfolioPhoto[] }) {
  const total = photos.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const go = useCallback((next: number) => {
    if (total > 0) setI(((next % total) + total) % total);
  }, [total]);

  // Troca automática: desligada com 1 foto, em pausa ou com movimento reduzido.
  useEffect(() => {
    if (reduced || paused || total < 2) return;
    const t = window.setInterval(() => setI((c) => (c + 1) % total), AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [reduced, paused, total]);

  if (!total) return null;

  return (
    <div
      className="lport-carousel"
      role="group"
      aria-roledescription="carrossel"
      aria-label="Fotos do portfólio"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
      }}
      onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX ?? null;
        touchX.current = null;
        if (start == null || end == null) return;
        const dx = end - start;
        if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
      }}
    >
      <div className="frame">
        {photos.map((p, n) => (
          <figure key={`${p.url}-${n}`} className={`slide${n === i ? " on" : ""}`} aria-hidden={n !== i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.alt?.trim() ? p.alt : `Foto ${n + 1} de ${total} do portfólio`}
              loading={n === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </figure>
        ))}

        {total > 1 ? (
          <>
            <button type="button" className="pnav prev" onClick={() => go(i - 1)} aria-label="Foto anterior">
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" className="pnav next" onClick={() => go(i + 1)} aria-label="Próxima foto">
              <span aria-hidden="true">›</span>
            </button>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="dots" role="tablist" aria-label="Escolher foto">
          {photos.map((_, n) => (
            <button
              key={n}
              type="button"
              role="tab"
              className={`d${n === i ? " on" : ""}`}
              aria-selected={n === i}
              aria-label={`Foto ${n + 1} de ${total}`}
              onClick={() => go(n)}
            />
          ))}
        </div>
      ) : null}

      {/* Leitores de tela anunciam a troca sem precisar ver a transição. */}
      <p className="sr-only" aria-live="polite">{`Foto ${i + 1} de ${total}`}</p>
    </div>
  );
}
