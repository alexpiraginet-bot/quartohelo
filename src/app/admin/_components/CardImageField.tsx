"use client";

import { useState } from "react";
import { ImageField } from "./ImageField";
import type { CardImage, CardImageMode } from "@/lib/types";
import { BG_OPACITIES, DEFAULT_BG_OPACITY, DEFAULT_TOP_OPACITY, TOP_OPACITIES } from "@/lib/types";

/* Configuração de imagem por card (uso leigo): escolhe "Sem imagem", "Foto no
 * topo" ou "Foto de fundo", e a opacidade da FOTO (o texto do card nunca muda
 * de opacidade). Reutiliza o anexador/otimizador existente (ImageField).
 * Os valores vão em campos nomeados por prefixo:
 *   {prefix}_img_mode · {prefix}_img_url · {prefix}_img_alt · {prefix}_img_op  */

const MODES: [CardImageMode, string][] = [
  ["none", "Sem imagem"],
  ["top", "Foto no topo"],
  ["background", "Foto de fundo"],
];

const opLabel = (v: number) => (v >= 1 ? "100% (foto cheia)" : `${Math.round(v * 100)}%`);

export function CardImageField({
  prefix,
  value,
  folder,
}: {
  prefix: string;
  value?: CardImage | null;
  folder: string;
}) {
  const [mode, setMode] = useState<CardImageMode>(value?.mode ?? "none");
  // Opacidade já salva (quando é uma das oferecidas) ou o padrão do modo, para
  // um card que já estava configurado continuar exatamente como está.
  const saved = typeof value?.opacity === "number" ? value.opacity : null;
  const [topOp, setTopOp] = useState<number>(
    saved !== null && (TOP_OPACITIES as readonly number[]).includes(saved) ? saved : DEFAULT_TOP_OPACITY,
  );
  const [bgOp, setBgOp] = useState<number>(
    saved !== null && (BG_OPACITIES as readonly number[]).includes(saved) ? saved : DEFAULT_BG_OPACITY,
  );

  const isTop = mode === "top";
  const opacities: readonly number[] = isTop ? TOP_OPACITIES : BG_OPACITIES;
  const current = isTop ? topOp : bgOp;
  const setCurrent = isTop ? setTopOp : setBgOp;

  return (
    <div className="adm-cardimg">
      <span className="lbl">Imagem do card</span>
      <div className="adm-cardimg-modes" role="radiogroup" aria-label="Imagem do card">
        {MODES.map(([m, label]) => (
          <label key={m} className={`adm-radio${mode === m ? " sel" : ""}`}>
            <input type="radio" name={`${prefix}_img_mode`} value={m} checked={mode === m} onChange={() => setMode(m)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
      {mode !== "none" ? (
        <>
          <ImageField
            name={`${prefix}_img_url`}
            label="Arquivo da imagem"
            value={value?.url}
            folder={folder}
            hint="Anexe a foto — ela é otimizada automaticamente."
          />
          <div className="adm-cardimg-op">
            <span className="lbl">Opacidade da foto</span>
            <div className="adm-cardimg-modes" role="radiogroup" aria-label="Opacidade da foto">
              {opacities.map((v) => (
                <label key={v} className={`adm-radio${current === v ? " sel" : ""}`}>
                  <input
                    type="radio"
                    name={`${prefix}_img_op`}
                    value={v}
                    checked={current === v}
                    onChange={() => setCurrent(v)}
                  />
                  <span>{opLabel(v)}</span>
                </label>
              ))}
            </div>
            <small>Vale só para a foto. O texto do card continua igual.</small>
          </div>
          {isTop ? (
            <>
              <label className="adm-cardimg-alt">
                Frase sobre a foto do topo (opcional)
                <input
                  name={`${prefix}_img_caption`}
                  defaultValue={value?.caption ?? ""}
                  maxLength={120}
                  placeholder="Ex.: O berço no lugar certo"
                />
                <small>Aparece escrita por cima da faixa de foto, no rodapé dela.</small>
              </label>
              <label className="adm-cardimg-alt">
                Texto alternativo (opcional)
                <input name={`${prefix}_img_alt`} defaultValue={value?.alt ?? ""} placeholder="Descreva a imagem (vazio = decorativa)" />
              </label>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
