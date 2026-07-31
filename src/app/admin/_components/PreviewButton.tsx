"use client";

import { useState } from "react";
import { previsualizarPagina, previsualizarSite } from "../actions";

/* Botão "Ver como vai ficar". Manda para o servidor o que está no formulário
 * neste instante (sem salvar) e abre o ensaio em outra aba.
 *
 * A aba é aberta no clique, antes da ida ao servidor, senão o navegador trata
 * como pop-up e bloqueia. Se der errado, a aba é fechada e a mensagem aparece
 * ao lado do botão. */

export function PreviewButton({ kind }: { kind: "site" | "pagina" }) {
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function abrir(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const aba = window.open("about:blank", "_blank");
    setErro(null);
    setPendente(true);
    try {
      const fd = new FormData(form);
      const r = kind === "site" ? await previsualizarSite(fd) : await previsualizarPagina(fd);
      if (r.ok && r.url) {
        if (aba) aba.location.href = r.url;
        else window.location.href = r.url; // aba bloqueada: abre aqui mesmo
      } else {
        aba?.close();
        setErro(r.msg || "Não consegui montar a pré-visualização.");
      }
    } catch {
      aba?.close();
      setErro("Não consegui montar a pré-visualização. Tente de novo.");
    } finally {
      setPendente(false);
    }
  }

  return (
    <>
      <button type="button" className="adm-btn soft" onClick={abrir} disabled={pendente}>
        {pendente ? "Preparando…" : "Ver como vai ficar"}
      </button>
      {erro ? <span className="adm-msg err inline">{erro}</span> : null}
    </>
  );
}
