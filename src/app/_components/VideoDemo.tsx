"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* "Em breve" que abre a demonstração do guia.
 *
 * O guia ainda não abriu, então no lugar do botão de entrar fica o aviso. Ele
 * é clicável e mostra um vídeo curto com as telas reais do guia, sobre a
 * página, sem levar ninguém para fora.
 *
 * O vídeo só é montado quando o player abre: assim quem não clicar não baixa
 * os 4 MB do arquivo.
 *
 * O player é levado para o fim do <body> por portal. No lugar onde ele nasce,
 * dentro da página, o z-index dele não valeria nada: o contêiner do texto
 * (.lpage-in) tem z-index próprio e cria um contexto de empilhamento, então a
 * barra do topo, a navegação flutuante e o botão do WhatsApp ficariam POR CIMA
 * do véu, acesos e clicáveis, e dava para navegar para outra página com o
 * player aberto. */
export function VideoDemo() {
  const [aberto, setAberto] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);

  const encerrar = useCallback(() => {
    setAberto(false);
    botao.current?.focus();
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        encerrar();
        return;
      }
      // Prende o Tab dentro do player. Sem isto o foco escapa no segundo toque
      // e a pessoa passa a navegar a página que está atrás do véu, o que a
      // promessa de aria-modal diz que não acontece.
      if (e.key !== "Tab") return;
      const caixa = painel.current;
      if (!caixa) return;
      const focaveis = caixa.querySelectorAll<HTMLElement>(
        'button, [href], video, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      const atual = document.activeElement;
      if (e.shiftKey && (atual === primeiro || !caixa.contains(atual))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (atual === ultimo || !caixa.contains(atual))) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", tecla);
    // Trava a rolagem do fundo enquanto o player está aberto.
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fechar.current?.focus();
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = antes;
    };
  }, [aberto, encerrar]);

  return (
    <>
      <button ref={botao} type="button" className="lsoon-btn" onClick={() => setAberto(true)}>
        <span className="lsoon-play" aria-hidden="true" />
        <span className="lsoon-t">Em breve</span>
        <span className="lsoon-hint">assista à demonstração do guia</span>
      </button>

      {aberto && typeof document !== "undefined"
        ? createPortal(
        <div className="vmodal" role="dialog" aria-modal="true" aria-label="Demonstração do Guia Digital" onClick={encerrar}>
          <div className="vmodal-in" ref={painel} onClick={(e) => e.stopPropagation()}>
            <button ref={fechar} type="button" className="vmodal-x" onClick={encerrar} aria-label="Fechar a demonstração">
              ×
            </button>
            <video
              className="vmodal-v"
              src="/video/guia-demo.mp4"
              poster="/video/poster.jpg"
              controls
              autoPlay
              playsInline
              preload="metadata"
            />
            <p className="vmodal-nota">
              Demonstração das telas do guia. O acesso abre em breve.
            </p>
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
