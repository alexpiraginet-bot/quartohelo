"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioPhoto } from "@/lib/types";

/* Carrossel do Portfólio.
 * As fotos passam sozinhas a cada 6s e, ao mesmo tempo, dá para passar na mão
 * pela seta, pela bolinha, pelo teclado (← →) ou arrastando. Um toque manual
 * não desliga o automático: só reinicia a contagem, para a foto escolhida não
 * trocar logo em seguida. Quem prefere menos movimento
 * (prefers-reduced-motion) não recebe troca automática. */

const AUTOPLAY_MS = 6000;

export function Portfolio({ photos }: { photos: PortfolioPhoto[] }) {
  const total = photos.length;
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);
  // Muda a cada interação manual, só para reiniciar o cronômetro do automático.
  const [tick, setTick] = useState(0);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const go = useCallback((next: number) => {
    if (total > 0) {
      setI(((next % total) + total) % total);
      setTick((t) => t + 1);
    }
  }, [total]);

  // Troca automática: segue rodando mesmo com o mouse em cima ou depois de a
  // pessoa usar a seta. Só não roda com uma foto só ou com movimento reduzido.
  useEffect(() => {
    if (reduced || total < 2) return;
    const t = window.setInterval(() => setI((c) => (c + 1) % total), AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [reduced, total, tick]);

  if (!total) return null;

  return (
    <div
      className="lport-carousel"
      role="group"
      aria-roledescription="carrossel"
      aria-label="Fotos do portfólio"
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
