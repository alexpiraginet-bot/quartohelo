"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { serverClient } from "@/lib/db/supabase";
import { adminPassword, grantAdmin, isAdminAuthed, revokeAdmin } from "@/lib/admin/auth";
import { seedCategories, seedGuide, seedGuidePages, seedProductOptions } from "@/data/seed";

/**
 * Ações do painel da Helô. Todas devolvem { ok, msg } para o formulário
 * mostrar o resultado em linguagem simples. Nenhuma ação derruba o site:
 * qualquer pré-condição ausente vira uma mensagem clara do que fazer.
 */

export interface ActionState {
  ok: boolean;
  msg: string;
}

const BUCKET = "qh-fotos";

function parseBRL(s: FormDataEntryValue | null): number | null {
  const raw = typeof s === "string" ? s : "";
  const t = raw.replace(/[^\d.,]/g, "");
  if (!t) return null;
  const norm = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const v = Number(norm);
  return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) : null;
}

function str(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}

function guard(): { db: SupabaseClient } | { err: ActionState } {
  if (!adminPassword()) {
    return { err: { ok: false, msg: "Para editar com segurança, defina a senha do painel (QH_ADMIN_SENHA) na Vercel." } };
  }
  if (!isAdminAuthed()) {
    return { err: { ok: false, msg: "Sua sessão expirou. Entre de novo com a senha do painel." } };
  }
  const db = serverClient();
  if (!db) {
    return { err: { ok: false, msg: "A chave de gravação (SUPABASE_SERVICE_ROLE_KEY) ainda não está configurada na Vercel." } };
  }
  return { db };
}

function refreshAll() {
  revalidatePath("/guia");
  revalidatePath("/admin");
  revalidatePath("/admin/paginas");
  revalidatePath("/admin/catalogo");
}

/* ------------------------------ sessão ------------------------------ */

export async function entrarNoPainel(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  if (!adminPassword()) return { ok: false, msg: "A senha do painel ainda não foi definida (QH_ADMIN_SENHA na Vercel)." };
  if (!grantAdmin(str(fd, "senha"))) return { ok: false, msg: "Senha incorreta. Tente de novo." };
  revalidatePath("/admin");
  return { ok: true, msg: "Pronto! Edição liberada." };
}

export async function sairDoPainel(): Promise<void> {
  revokeAdmin();
  revalidatePath("/admin");
}

/* --------------------------- páginas do guia --------------------------- */

export async function salvarPagina(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const g = guard();
  if ("err" in g) return g.err;
  const slug = str(fd, "slug");
  const title = str(fd, "title");
  if (!slug || !title) return { ok: false, msg: "A página precisa de um título." };
  const paragraphs = str(fd, "texto")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+\n/g, "\n").trim())
    .filter(Boolean);
  const row = {
    slug,
    title,
    eyebrow: str(fd, "eyebrow") || null,
    paragraphs,
    ready: fd.get("ready") === "on",
    order: Number(str(fd, "order")) || 0,
  };
  const { error } = await g.db.from("qh_guide_pages").upsert(row);
  if (error) {
    return { ok: false, msg: `Não consegui salvar: ${error.message}. Se as tabelas novas ainda não existem, use "Preparar o banco" no Painel.` };
  }
  refreshAll();
  revalidatePath(`/admin/paginas/${slug}`);
  return { ok: true, msg: "Página salva. Já está valendo no guia." };
}

/* ------------------------- textos de cada item ------------------------- */

export async function salvarTextosItem(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const g = guard();
  if ("err" in g) return g.err;
  const slug = str(fd, "slug");
  if (!slug) return { ok: false, msg: "Item inválido." };
  const decision = {
    quandoUsar: str(fd, "quandoUsar") || null,
    quandoNao: str(fd, "quandoNao") || null,
    erroComum: str(fd, "erroComum") || null,
    efeito: str(fd, "efeito") || null,
    instalacao: str(fd, "instalacao") || null,
  };
  const { data, error } = await g.db
    .from("qh_items")
    .update({ summary: str(fd, "summary") || null, decision })
    .eq("slug", slug)
    .select("id");
  if (error) return { ok: false, msg: `Não consegui salvar: ${error.message}` };
  if (!data?.length) {
    return { ok: false, msg: 'A estrutura das categorias ainda não está no banco. Use "Preparar o banco" no Painel e salve de novo.' };
  }
  refreshAll();
  revalidatePath(`/admin/catalogo/${slug}`);
  return { ok: true, msg: "Textos salvos. Já estão valendo no guia." };
}

/* ------------------------- catálogo de opções ------------------------- */

async function ensureBucket(db: SupabaseClient) {
  const { data } = await db.storage.getBucket(BUCKET);
  if (!data) await db.storage.createBucket(BUCKET, { public: true });
}

export async function salvarOpcao(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const g = guard();
  if ("err" in g) return g.err;
  const id = str(fd, "id") || randomUUID();
  const itemSlug = str(fd, "itemSlug");
  const genero = str(fd, "genero");
  const tier = str(fd, "tier");
  const name = str(fd, "name");
  if (!itemSlug || !genero || !tier) return { ok: false, msg: "Opção inválida." };
  if (!name) return { ok: false, msg: "Dê um nome para a opção (ex.: Berço Lume)." };

  const isNew = !str(fd, "id");
  if (isNew) {
    const { count } = await g.db
      .from("qh_product_options")
      .select("id", { count: "exact", head: true })
      .eq("item_slug", itemSlug)
      .eq("genero", genero)
      .eq("tier", tier);
    if ((count ?? 0) >= 3) {
      return { ok: false, msg: "Esta faixa já tem 3 opções (o guia mostra até 3 por linha). Exclua uma antes de adicionar." };
    }
  }

  let photoUrl: string | null = null;
  const foto = fd.get("foto");
  if (foto instanceof File && foto.size > 0) {
    if (foto.size > 6 * 1024 * 1024) return { ok: false, msg: "A foto passou de 6 MB. Envie uma versão menor." };
    try {
      await ensureBucket(g.db);
      const ext = (foto.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `opcoes/${itemSlug}/${genero}-${tier}-${Date.now()}.${ext}`;
      const buf = Buffer.from(await foto.arrayBuffer());
      const { error: upErr } = await g.db.storage
        .from(BUCKET)
        .upload(path, buf, { contentType: foto.type || "image/jpeg", upsert: true });
      if (upErr) return { ok: false, msg: `A foto não subiu: ${upErr.message}` };
      photoUrl = g.db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    } catch (e) {
      return { ok: false, msg: `A foto não subiu: ${e instanceof Error ? e.message : "erro inesperado"}.` };
    }
  }

  const row: Record<string, unknown> = {
    id,
    item_slug: itemSlug,
    genero,
    tier,
    name,
    price_cents: parseBRL(fd.get("preco")),
    url: str(fd, "url") || null,
    supplier: str(fd, "supplier") || null,
    note: str(fd, "note") || null,
    exemplo: false, // editado pela Helô = passa a ser curadoria real
    order: Number(str(fd, "order")) || 0,
  };
  if (photoUrl) row.photo_url = photoUrl;

  const { error } = await g.db.from("qh_product_options").upsert(row);
  if (error) {
    return { ok: false, msg: `Não consegui salvar: ${error.message}. Se as tabelas novas ainda não existem, use "Preparar o banco" no Painel.` };
  }
  refreshAll();
  revalidatePath(`/admin/catalogo/${itemSlug}`);
  return { ok: true, msg: photoUrl ? "Opção e foto salvas. Já estão no guia." : "Opção salva. Já está no guia." };
}

export async function excluirOpcao(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  const g = guard();
  if ("err" in g) return g.err;
  const id = str(fd, "id");
  const itemSlug = str(fd, "itemSlug");
  if (!id) return { ok: false, msg: "Opção inválida." };
  const { error } = await g.db.from("qh_product_options").delete().eq("id", id);
  if (error) return { ok: false, msg: `Não consegui excluir: ${error.message}` };
  refreshAll();
  if (itemSlug) revalidatePath(`/admin/catalogo/${itemSlug}`);
  return { ok: true, msg: "Opção excluída do guia." };
}

/* ----------------------- preparar o banco (1 vez) ----------------------- */

export async function prepararBanco(_prev: ActionState | null, _fd: FormData): Promise<ActionState> {
  const g = guard();
  if ("err" in g) return g.err;
  const db = g.db;

  // As tabelas v2 existem? (criadas rodando supabase/schema.sql no SQL Editor)
  const probe = await db.from("qh_guide_pages").select("slug", { head: true, count: "exact" });
  if (probe.error) {
    return {
      ok: false,
      msg: "Antes de preparar, rode o arquivo supabase/schema.sql no SQL Editor do Supabase (cria as tabelas novas). Depois toque aqui de novo.",
    };
  }

  const feito: string[] = [];

  // 1. Páginas: insere só as que faltam (não sobrescreve texto editado).
  const { data: pageRows } = await db.from("qh_guide_pages").select("slug");
  const existentes = new Set((pageRows ?? []).map((p) => p.slug));
  const novas = seedGuidePages.filter((p) => !existentes.has(p.slug));
  if (novas.length) {
    const { error } = await db.from("qh_guide_pages").insert(
      novas.map((p) => ({
        slug: p.slug,
        title: p.title,
        eyebrow: p.eyebrow ?? null,
        paragraphs: p.paragraphs,
        ready: p.ready,
        order: p.order,
      })),
    );
    if (error) return { ok: false, msg: `Falha ao carregar as páginas: ${error.message}` };
    feito.push(`${novas.length} páginas`);
  }

  // 2. Categorias/itens: substitui apenas se o banco ainda está na estrutura
  //    antiga (sem "papel-de-parede"), para não apagar textos já editados.
  const { count: temV2 } = await db
    .from("qh_items")
    .select("id", { count: "exact", head: true })
    .eq("slug", "papel-de-parede");
  if (!temV2) {
    const del = await db.from("qh_categories").delete().neq("id", "");
    if (del.error) return { ok: false, msg: `Falha ao limpar a estrutura antiga: ${del.error.message}` };
    const catsIns = await db.from("qh_categories").insert(
      seedCategories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, intro: c.intro ?? null, order: c.order })),
    );
    if (catsIns.error) return { ok: false, msg: `Falha ao carregar categorias: ${catsIns.error.message}` };
    const itemsIns = await db.from("qh_items").insert(
      seedCategories.flatMap((c) =>
        c.items.map((i) => ({
          id: i.id,
          category_id: c.id,
          slug: i.slug,
          name: i.name,
          summary: i.summary ?? null,
          photo_url: i.photoUrl ?? null,
          decision: i.decision ?? {},
          order: i.order,
          published: i.published,
        })),
      ),
    );
    if (itemsIns.error) return { ok: false, msg: `Falha ao carregar itens: ${itemsIns.error.message}` };
    feito.push("22 categorias");
  }

  // 3. Opções de exemplo: só entram se o catálogo está totalmente vazio.
  const { count: totalOpts } = await db.from("qh_product_options").select("id", { count: "exact", head: true });
  if (!totalOpts) {
    const { error } = await db.from("qh_product_options").insert(
      seedProductOptions.map((o) => ({
        id: o.id,
        item_slug: o.itemSlug,
        genero: o.genero,
        tier: o.tier,
        name: o.name,
        photo_url: o.photoUrl ?? null,
        price_cents: o.priceCents,
        url: o.url ?? null,
        supplier: o.supplier ?? null,
        note: o.note ?? null,
        exemplo: true,
        order: o.order,
      })),
    );
    if (error) return { ok: false, msg: `Falha ao carregar os exemplos: ${error.message}` };
    feito.push("exemplos do catálogo");
  }

  // 4. Metadados do guia (capa, promessa): só se ainda não existem.
  const meta = await db.from("qh_guide_meta").select("id").eq("id", "guia").maybeSingle();
  if (!meta.data) {
    await db.from("qh_guide_meta").insert({ id: "guia", data: seedGuide });
    feito.push("dados do guia");
  }

  // 5. Pasta de fotos.
  try {
    await ensureBucket(db);
  } catch {
    /* o upload cria na primeira foto se precisar */
  }

  refreshAll();
  return {
    ok: true,
    msg: feito.length
      ? `Banco preparado: ${feito.join(", ")}. Pode editar à vontade.`
      : "O banco já estava preparado — nada foi sobrescrito.",
  };
}
