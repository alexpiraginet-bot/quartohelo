"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* "Em breve" que abre a demonstração do guia.
 *
 * O guia ainda não abriu, então no lugar do botão de entrar fica o aviso. Ele
 * é clicável e mostra um vídeo curto com as telas reais do guia, sobre a
 * página, sem levar ninguém para fora.
 *
 * O vídeo só é montado quando o player abre: assim quem não clicar não baixa
 * os 4 MB do arquivo. */
export function VideoDemo() {
  const [aberto, setAberto] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  const encerrar = useCallback(() => {
    setAberto(false);
    botao.current?.focus();
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") encerrar();
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

      {aberto ? (
        <div className="vmodal" role="dialog" aria-modal="true" aria-label="Demonstração do Guia Digital" onClick={encerrar}>
          <div className="vmodal-in" onClick={(e) => e.stopPropagation()}>
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
        </div>
      ) : null}
    </>
  );
}
