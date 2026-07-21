"use server";

import { revalidatePath } from "next/cache";
import { callAdminFn } from "@/lib/db/adminFn";
import { adminToken, clearAdminSession, setAdminSession } from "@/lib/admin/auth";

/**
 * Ações do painel da Helô. Todas encaminham para a Edge Function qh-admin
 * (que tem a service role nativa) e devolvem { ok, msg } para o formulário
 * mostrar o resultado em português claro. A senha e o token vivem no banco/
 * cookie — nada depende de variável de ambiente na Vercel.
 */

export interface ActionState {
  ok: boolean;
  msg: string;
}

function parseBRL(v: FormDataEntryValue | null): number | null {
  const raw = typeof v === "string" ? v : "";
  const t = raw.replace(/[^\d.,]/g, "");
  if (!t) return null;
  const norm = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = Number(norm);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};

function refreshAll() {
  revalidatePath("/guia");
  revalidatePath("/admin");
  revalidatePath("/admin/paginas");
  revalidatePath("/admin/catalogo");
}

/* ------------------------------ sessão ------------------------------ */

export async function entrarNoPainel(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const r = await callAdminFn("login", { senha: str(fd, "senha") });
  if (r.ok && r.token) {
    setAdminSession(r.token);
    revalidatePath("/admin");
    return { ok: true, msg: r.msg ?? "Pronto! Edição liberada." };
  }
  return { ok: false, msg: r.msg ?? "Senha incorreta." };
}

export async function sairDoPainel(): Promise<void> {
  clearAdminSession();
  revalidatePath("/admin");
}

export async function trocarSenha(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const token = adminToken();
  if (!token) return { ok: false, msg: "Entre no painel primeiro." };
  const r = await callAdminFn("change_password", { token, atual: str(fd, "atual"), nova: str(fd, "nova") });
  if (r.ok && r.token) setAdminSession(r.token);
  return { ok: r.ok, msg: r.msg ?? (r.ok ? "Senha trocada." : "Não consegui trocar a senha.") };
}

/* --------------------------- páginas do guia --------------------------- */

export async function salvarPagina(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const token = adminToken();
  if (!token) return { ok: false, msg: "Sua sessão expirou. Entre de novo." };
  const paragraphs = str(fd, "texto")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const r = await callAdminFn("save_page", {
    token,
    slug: str(fd, "slug"),
    title: str(fd, "title"),
    eyebrow: str(fd, "eyebrow") || null,
    paragraphs,
    ready: fd.get("ready") === "on",
    order: Number(str(fd, "order")) || 0,
  });
  if (r.ok) {
    refreshAll();
    revalidatePath(`/admin/paginas/${str(fd, "slug")}`);
  }
  return { ok: r.ok, msg: r.msg ?? "" };
}

/* ------------------------- textos de cada item ------------------------- */

export async function salvarTextosItem(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const token = adminToken();
  if (!token) return { ok: false, msg: "Sua sessão expirou. Entre de novo." };
  const r = await callAdminFn("save_item_texts", {
    token,
    slug: str(fd, "slug"),
    summary: str(fd, "summary") || null,
    decision: {
      quandoUsar: str(fd, "quandoUsar") || null,
      quandoNao: str(fd, "quandoNao") || null,
      erroComum: str(fd, "erroComum") || null,
      efeito: str(fd, "efeito") || null,
      instalacao: str(fd, "instalacao") || null,
    },
  });
  if (r.ok) {
    refreshAll();
    revalidatePath(`/admin/catalogo/${str(fd, "slug")}`);
  }
  return { ok: r.ok, msg: r.msg ?? "" };
}

/* ------------------------- catálogo de opções ------------------------- */

export async function salvarOpcao(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const token = adminToken();
  if (!token) return { ok: false, msg: "Sua sessão expirou. Entre de novo." };

  // Foto vira data URL (base64) para a função subir ao Storage.
  let foto: string | null = null;
  const file = fd.get("foto");
  if (file instanceof File && file.size > 0) {
    if (file.size > 6 * 1024 * 1024) return { ok: false, msg: "A foto passou de 6 MB. Envie uma versão menor." };
    const buf = Buffer.from(await file.arrayBuffer());
    foto = `data:${file.type || "image/jpeg"};base64,${buf.toString("base64")}`;
  }

  const itemSlug = str(fd, "itemSlug");
  const r = await callAdminFn("save_option", {
    token,
    id: str(fd, "id") || null,
    item_slug: itemSlug,
    genero: str(fd, "genero"),
    tier: str(fd, "tier"),
    name: str(fd, "name"),
    price_cents: parseBRL(fd.get("preco")),
    url: str(fd, "url") || null,
    supplier: str(fd, "supplier") || null,
    order: Number(str(fd, "order")) || 0,
    foto,
  });
  if (r.ok) {
    refreshAll();
    revalidatePath(`/admin/catalogo/${itemSlug}`);
  }
  return { ok: r.ok, msg: r.msg ?? "" };
}

export async function excluirOpcao(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const token = adminToken();
  if (!token) return { ok: false, msg: "Sua sessão expirou. Entre de novo." };
  const itemSlug = str(fd, "itemSlug");
  const r = await callAdminFn("delete_option", { token, id: str(fd, "id") });
  if (r.ok) {
    refreshAll();
    if (itemSlug) revalidatePath(`/admin/catalogo/${itemSlug}`);
  }
  return { ok: r.ok, msg: r.msg ?? "" };
}
