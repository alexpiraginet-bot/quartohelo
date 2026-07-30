"use client";

import { useRef, useState } from "react";
import { ImageField } from "./ImageField";
import type { PortfolioPhoto } from "@/lib/types";

/* Fotos do Portfólio (carrossel da landing). Segue o padrão que o painel já
 * usa nos cards: campos indexados (portfolio_url_0, portfolio_alt_0, …) mais um
 * contador, e a ação do painel percorre a lista ao salvar. A foto é anexada e
 * otimizada pelo ImageField, igual ao resto do projeto.
 * Começa vazio, sem foto de exemplo: a landing mostra o estado vazio até a
 * cliente anexar a primeira. A ordem das linhas é a ordem do carrossel. */

type Row = { uid: number; url: string; alt: string };

export function PortfolioField({ photos }: { photos: PortfolioPhoto[] }) {
  const uid = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    (photos ?? [])
      .filter((p) => p?.url)
      .map((p) => ({ uid: uid.current++, url: p.url, alt: p.alt ?? "" })),
  );

  const setAlt = (i: number, alt: string) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, alt } : r)));
  const add = () => setRows((prev) => [...prev, { uid: uid.current++, url: "", alt: "" }]);
  const remove = (i: number) => setRows((prev) => prev.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) =>
    setRows((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="adm-portfolio">
      {/* Quantas linhas a ação deve percorrer ao salvar. */}
      <input type="hidden" name="portfolio_count" value={rows.length} />
      {rows.length === 0 ? (
        <p className="adm-empty">
          Nenhuma foto ainda. As fotos aparecem no carrossel do Portfólio, na ordem abaixo.
        </p>
      ) : null}
      {rows.map((r, i) => (
        // A chave é o uid: ao reordenar, cada linha leva junto a foto que já
        // estava anexada, e o nome do campo passa a ser o da nova posição.
        <div className="adm-portrow" key={r.uid}>
          <div className="ord">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Subir">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="Descer">↓</button>
          </div>
          <div className="bd">
            <ImageField
              name={`portfolio_url_${i}`}
              label={`Foto ${i + 1}`}
              value={r.url}
              folder="portfolio"
              hint="Anexe a foto — ela é otimizada automaticamente."
            />
            <label className="adm-cardimg-alt">
              Descrição da foto (opcional)
              <input
                name={`portfolio_alt_${i}`}
                value={r.alt}
                onChange={(e) => setAlt(i, e.target.value)}
                placeholder="Ex.: quarto em tons de areia"
              />
            </label>
          </div>
          <button type="button" className="rm" onClick={() => remove(i)} title="Remover foto">×</button>
        </div>
      ))}
      <button type="button" className="adm-btn soft add" onClick={add}>+ adicionar foto</button>
    </div>
  );
}
