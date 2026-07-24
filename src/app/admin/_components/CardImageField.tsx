"use client";

import { useState } from "react";
import { ImageField } from "./ImageField";
import type { CardImage, CardImageMode } from "@/lib/types";

/* Configuração de imagem por card (uso leigo): escolhe "Sem imagem", "Foto no
 * topo" ou "Foto de fundo (50%)". Reutiliza o anexador/otimizador existente
 * (ImageField). Os valores vão em campos nomeados por prefixo:
 *   {prefix}_img_mode · {prefix}_img_url · {prefix}_img_alt  */

const MODES: [CardImageMode, string][] = [
  ["none", "Sem imagem"],
  ["top", "Foto no topo"],
  ["background", "Foto de fundo (50%)"],
];

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
          {mode === "top" ? (
            <label className="adm-cardimg-alt">
              Texto alternativo (opcional)
              <input name={`${prefix}_img_alt`} defaultValue={value?.alt ?? ""} placeholder="Descreva a imagem (vazio = decorativa)" />
            </label>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
