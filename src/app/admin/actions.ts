"use server";

import { revalidatePath } from "next/cache";
import { callAdminFn } from "@/lib/db/adminFn";
import { adminToken, clearAdminSession, setAdminSession } from "@/lib/admin/auth";
import { getSiteContent } from "@/lib/content";
import type { ServiceCard, SiteContent, SitePage } from "@/lib/types";

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
  // Cards numerados (ex.: os 4 passos do "Como usar"). As linhas vêm indexadas
  // do formulário; guardamos as que têm título ou texto, na ordem da tela.
  const cards: { n: string; title: string; text: string }[] = [];
  const cardCount = Number(str(fd, "cardCount")) || 0;
  for (let i = 0; i < cardCount; i++) {
    const title = str(fd, `card_title_${i}`);
    const text = str(fd, `card_text_${i}`);
    if (!title && !text) continue;
    const n = str(fd, `card_n_${i}`) || String(cards.length + 1).padStart(2, "0");
    cards.push({ n, title, text });
  }
  const r = await callAdminFn("save_page", {
    token,
    slug: str(fd, "slug"),
    title: str(fd, "title"),
    eyebrow: str(fd, "eyebrow") || null,
    paragraphs,
    cards,
    closing: str(fd, "closing") || null,
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
      dicaHelo: str(fd, "dicaHelo") || null,
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

/* --------------------------- site / landing --------------------------- */

export async function salvarSite(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const token = adminToken();
  if (!token) return { ok: false, msg: "Sua sessão expirou. Entre de novo." };
  const cur = await getSiteContent();

  const paras = (k: string) =>
    str(fd, k).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const lines = (k: string) =>
    str(fd, k).split(/\n/).map((p) => p.trim()).filter(Boolean);
  const page = (prefix: string, fallbackTitle: string): SitePage => ({
    eyebrow: str(fd, `${prefix}_eyebrow`) || null,
    title: str(fd, `${prefix}_title`) || fallbackTitle,
    paragraphs: paras(`${prefix}_paras`),
    photo: str(fd, `${prefix}_photo`) || null,
  });
  const card = (prefix: string, base?: ServiceCard | null): ServiceCard => ({
    ...(base ?? { tag: "", title: "", desc: "", bullets: [] }),
    tag: str(fd, `${prefix}_tag`),
    title: str(fd, `${prefix}_title`),
    desc: str(fd, `${prefix}_desc`),
    bullets: lines(`${prefix}_bullets`),
    ctaLabel: str(fd, `${prefix}_ctaLabel`) || null,
    ctaHref: str(fd, `${prefix}_ctaHref`) || null,
  });

  const services = cur.services.map((sv, i) => card(`svc${i}`, sv));

  const data: SiteContent = {
    ...cur,
    heroEyebrow: str(fd, "heroEyebrow"),
    heroTitleHtml: str(fd, "heroTitleHtml"),
    heroSub: str(fd, "heroSub"),
    quemEyebrow: str(fd, "quemEyebrow"),
    quemParagraphs: paras("quemParagraphs"),
    quemClose: str(fd, "quemClose"),
    sobrePhoto: str(fd, "sobrePhoto") || null,
    trabalhoEyebrow: str(fd, "trabalhoEyebrow"),
    trabalhoTitle: str(fd, "trabalhoTitle"),
    trabalhoLead: str(fd, "trabalhoLead"),
    services,
    produtoDigital: card("pd", cur.produtoDigital),
    contatoEyebrow: str(fd, "contatoEyebrow"),
    contatoTitleHtml: str(fd, "contatoTitleHtml"),
    contatoLead: str(fd, "contatoLead"),
    whatsapp: str(fd, "whatsapp") || null,
    whatsappHref: str(fd, "whatsappHref") || null,
    horario: str(fd, "horario") || null,
    email: str(fd, "email") || null,
    instagram: str(fd, "instagram") || null,
    facebook: str(fd, "facebook") || null,
    contatoPhoto: str(fd, "contatoPhoto") || null,
    footerTagline: str(fd, "footerTagline"),
    curadoriaPage: page("cur", "Curadoria Assinada"),
    projetoPage: page("proj", "Projeto Conceito"),
    digitalPage: page("dig", "O Fim da Dúvida"),
  };

  const r = await callAdminFn("save_site", { token, data });
  if (r.ok) {
    revalidatePath("/");
    revalidatePath("/curadoria-assinada");
    revalidatePath("/projeto-conceito");
    revalidatePath("/produto-digital");
    revalidatePath("/admin/site");
  }
  return { ok: r.ok, msg: r.msg ?? "" };
}
