"use client";

import { useEffect, useRef, useState } from "react";
import { TUTORIAL } from "../_content/tutorial";

/* O "?" que fica ao lado de um bloco de edição e abre o passo a passo daquela
 * tarefa ali mesmo. O texto é o MESMO da aba "Como faço" — uma fonte só, então
 * a ajuda de dentro da tela nunca fica diferente da ajuda da aba. */

const TAREFAS = TUTORIAL.flatMap((s) => s.tasks);

export function Ajuda({ tarefa }: { tarefa: string }) {
  const t = TAREFAS.find((x) => x.id === tarefa);
  const [aberto, setAberto] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  if (!t) return null;

  return (
    <span className="adm-ajuda" ref={box as React.RefObject<HTMLDivElement>}>
      <button
        type="button"
        className="adm-ajuda-btn"
        aria-expanded={aberto}
        aria-label={`Como faço: ${t.title}`}
        onClick={() => setAberto((v) => !v)}
      >
        ?
      </button>
      {/* Só elementos de texto aqui dentro: o "?" fica ao lado de legendas e
          rótulos, onde uma lista de verdade não seria HTML válido. A numeração
          vem do CSS (counter), então a leitura continua sendo 1, 2, 3. */}
      {aberto ? (
        <span className="adm-ajuda-box" role="dialog" aria-label={t.title}>
          <b>{t.title}</b>
          <em>{t.result}</em>
          <span className="passos">
            {t.steps.map((s, i) => (
              <span className="passo" key={i}>
                {s.text}
                {s.note ? <small>{s.note}</small> : null}
              </span>
            ))}
          </span>
          <a className="adm-ajuda-mais" href={`/admin/tutorial#${t.id}`} target="_blank" rel="noopener noreferrer">
            Ver na aba “Como faço”
          </a>
        </span>
      ) : null}
    </span>
  );
}
