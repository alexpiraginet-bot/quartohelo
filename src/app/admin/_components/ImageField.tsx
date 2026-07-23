"use client";

import { useState } from "react";
import { subirImagem, type UploadState } from "../actions";

/* Anexador de imagem com otimização integrada (para uso leigo).
 * Ao escolher o arquivo: redimensiona (máx. 1800px) e comprime no navegador,
 * sobe pela função e guarda a URL num campo escondido — nada de "caminho". */

async function optimizeImage(file: File, maxDim = 1800, quality = 0.82): Promise<string> {
  const dataUrl: string = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = () => rej(new Error("read"));
    fr.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("img"));
    i.src = dataUrl;
  });
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  const scale = Math.min(1, maxDim / Math.max(w, h || 1));
  w = Math.max(1, Math.round(w * scale));
  h = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  // WebP preserva transparência e é bem menor; se o navegador não gerar, cai no JPEG.
  let out = canvas.toDataURL("image/webp", quality);
  if (!out.startsWith("data:image/webp")) out = canvas.toDataURL("image/jpeg", quality);
  return out;
}

export function ImageField({
  name,
  label,
  value,
  folder = "site",
  hint,
}: {
  name: string;
  label: string;
  value?: string | null;
  folder?: string;
  hint?: string;
}) {
  const [url, setUrl] = useState(value ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<UploadState | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg({ ok: false, msg: "Envie um arquivo de imagem (JPG, PNG…)." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const optimized = await optimizeImage(file);
      const r = await subirImagem(optimized, folder);
      if (r.ok && r.url) {
        setUrl(r.url);
        setMsg({ ok: true, msg: "Imagem enviada e otimizada." });
      } else {
        setMsg({ ok: false, msg: r.msg ?? "Não consegui enviar a imagem." });
      }
    } catch {
      setMsg({ ok: false, msg: "Não consegui processar essa imagem." });
    }
    setBusy(false);
  }

  return (
    <div className="adm-img">
      <span className="lbl">{label}</span>
      <div className="adm-img-row">
        <div className="prev">{url ? <img src={url} alt="" /> : <span>sem imagem</span>}</div>
        <div className="ops">
          <label className={`adm-btn soft up${busy ? " off" : ""}`}>
            {busy ? "Enviando…" : url ? "Trocar imagem" : "Anexar imagem"}
            <input type="file" accept="image/*" onChange={onFile} disabled={busy} />
          </label>
          {url ? (
            <button type="button" className="adm-img-rm" onClick={() => { setUrl(""); setMsg(null); }}>
              Remover
            </button>
          ) : null}
          {hint ? <small>{hint}</small> : null}
          {msg ? <p className={`adm-msg${msg.ok ? " ok" : " err"}`}>{msg.msg}</p> : null}
        </div>
      </div>
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
