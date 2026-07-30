"use client";

import { useState } from "react";
import { ImageField } from "./ImageField";
import { PAGE_OPACITIES } from "@/lib/types";

/* Foto de fundo + opacidade (Início e páginas próprias). Mesmo padrão de
 * anexo/otimização dos demais campos; a opacidade vale só para a FOTO, o texto
 * por cima continua 100% opaco. Campos: {name} (URL) e {name}_op (opacidade). */

const opLabel = (v: number) => (v >= 1 ? "Sem opacidade" : `${Math.round(v * 100)}%`);

export function PhotoOpacityField({
  name,
  label,
  value,
  opacity,
  folder,
  hint,
  defaultOpacity = 0.5,
}: {
  name: string;
  label: string;
  value?: string | null;
  opacity?: number | null;
  folder: string;
  hint?: string;
  defaultOpacity?: number;
}) {
  const saved = typeof opacity === "number" && opacity > 0 && opacity <= 1 ? opacity : null;
  const [op, setOp] = useState<number>(saved ?? defaultOpacity);
  // O trio oferecido é 90/80/50. Se a foto já estiver salva com outro valor
  // (config antiga), ele entra na lista para o botão dela não sumir da tela.
  const opacities = ((): number[] => {
    const base = [...PAGE_OPACITIES] as number[];
    return saved !== null && !base.includes(saved) ? [...base, saved].sort((a, b) => b - a) : base;
  })();
  return (
    <div className="adm-photoop">
      <ImageField name={name} label={label} value={value} folder={folder} hint={hint} />
      <div className="adm-cardimg-op">
        <span className="lbl">Opacidade da foto</span>
        <div className="adm-cardimg-modes" role="radiogroup" aria-label={`Opacidade — ${label}`}>
          {opacities.map((v) => (
            <label key={v} className={`adm-radio${op === v ? " sel" : ""}`}>
              <input type="radio" name={`${name}_op`} value={v} checked={op === v} onChange={() => setOp(v)} />
              <span>{opLabel(v)}</span>
            </label>
          ))}
        </div>
        <small>Vale só para a foto. Os textos por cima continuam legíveis.</small>
      </div>
    </div>
  );
}
