"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioPhoto } from "@/lib/types";

/* Carrossel do Portfólio.
 * As fotos passam sozinhas a cada 6s e, ao mesmo tempo, dá para passar na mão
 * pela seta, pela bolinha, pelo teclado (← →) ou arrastando. Um toque manual
 * não desliga o automático: só reinicia a contagem, para a foto escolhida não
 * trocar logo em seguida. Quem prefere menos movimento
 * (prefers-reduced-motion) não recebe troca automática.
 *
 * Só três fotos ficam montadas por vez: a atual e as duas vizinhas. É isso que
 * segura o peso da página. O acervo tem centenas de fotos e as lâminas ficam
 * empilhadas dentro do mesmo quadro, então `loading="lazy"` não resolveria: o
 * navegador entende que todas estão na tela e baixaria todas. Com a janela de
 * três, quem visita baixa três, tendo o portfólio 8 fotos ou 400. */

const AUTOPLAY_MS = 6000;
// Acima disso a fileira de bolinhas vira um borrão: troca por um contador.
const MAX_BOLINHAS = 12;

export function Portfolio({ photos }: { photos: PortfolioPhoto[] }) {
  const total = photos.length;
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);
  // Muda a cada interação manual, só para reiniciar o cronômetro do automático.
  const [tick, setTick] = useState(0);
  // O automático só corre com o carrossel à vista e a aba na frente. Sem isso,
  // uma página esquecida aberta iria trocando de foto sozinha e, de 6 em 6
  // segundos, baixando mais uma: em quarenta minutos teria baixado o acervo
  // inteiro, justamente o que a janela de três lâminas evita.
  const [rodando, setRodando] = useState(true);
  const caixa = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const el = caixa.current;
    let naTela = true;
    const aplicar = () => setRodando(naTela && !document.hidden);
    const obs =
      el && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([e]) => {
              naTela = e.isIntersecting;
              aplicar();
            },
            { threshold: 0.2 },
          )
        : null;
    if (obs && el) obs.observe(el);
    document.addEventListener("visibilitychange", aplicar);
    return () => {
      obs?.disconnect();
      document.removeEventListener("visibilitychange", aplicar);
    };
  }, []);

  // Troca automática: segue rodando mesmo com o mouse em cima ou depois de a
  // pessoa usar a seta. Não roda com uma foto só, com movimento reduzido, nem
  // com o carrossel fora da vista.
  useEffect(() => {
    if (reduced || total < 2 || !rodando) return;
    const t = window.setInterval(() => setI((c) => (c + 1) % total), AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [reduced, total, tick, rodando]);

  if (!total) return null;

  /* Distância circular até a foto atual: 0 é a que está à vista, 1 são as
   * vizinhas (que precisam estar montadas para a transição acontecer).
   *
   * Enquanto há bolinhas, tudo fica montado: por elas dá para pular para
   * qualquer posição, e uma lâmina que nasce já visível não faz transição
   * nenhuma (o navegador não tem estilo anterior para animar) e ainda apareceria
   * vazia até a foto baixar. A janela só entra quando as bolinhas saem, que é
   * quando a navegação passa a ser de uma em uma. */
  const perto = (n: number) => {
    if (total <= MAX_BOLINHAS) return true;
    const frente = (n - i + total) % total;
    return Math.min(frente, total - frente) <= 1;
  };

  return (
    <div
      ref={caixa}
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
        {photos.map((p, n) =>
          perto(n) ? (
            <figure key={`${p.url}-${n}`} className={`slide${n === i ? " on" : ""}`} aria-hidden={n !== i}>
              {/* Fundo desfocado da própria foto: o quadro é em pé, como quase
                  todo o acervo, então uma foto deitada sobraria faixa. Nas fotos
                  em pé este fundo fica todo coberto e não muda nada. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="fundo" src={p.url} alt="" aria-hidden="true" draggable={false} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.alt?.trim() ? p.alt : `Foto ${n + 1} de ${total} do portfólio`}
                loading={n === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
              />
            </figure>
          ) : null,
        )}

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

      {total > 1 && total <= MAX_BOLINHAS ? (
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

      {total > MAX_BOLINHAS ? (
        <p className="pconta" aria-hidden="true">
          {String(i + 1).padStart(2, "0")} <span>de</span> {total}
        </p>
      ) : null}

      {/* Leitores de tela anunciam a troca sem precisar ver a transição. */}
      <p className="sr-only" aria-live="polite">{`Foto ${i + 1} de ${total}`}</p>
    </div>
  );
}
