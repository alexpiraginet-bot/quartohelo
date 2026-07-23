import "server-only";
import { isDbConfigured, supabase } from "@/lib/db/supabase";
import {
  seedCategories,
  seedGuide,
  seedGuidePages,
  seedProductOptions,
  seedSite,
} from "@/data/seed";
import type { Category, GuideMeta, GuidePage, ProductOption, SiteContent } from "@/lib/types";

/**
 * Camada de conteúdo. Uma porta única para landing, guia e admin lerem os dados.
 * Sem Supabase configurado, devolve o seed (o app roda inteiro). Com Supabase,
 * lê das tabelas. Nunca lança: qualquer falha cai para o seed, então o site
 * jamais fica no ar quebrado.
 */

export const dbReady = isDbConfigured;

export async function getSiteContent(): Promise<SiteContent> {
  if (!supabase) return seedSite;
  try {
    const { data } = await supabase.from("qh_site_content").select("data").eq("id", "landing").maybeSingle();
    // Mescla com o seed: campos novos (landing v2) caem no padrão mesmo que a
    // linha do banco seja antiga. O que a Helô editar no painel prevalece.
    return data?.data ? { ...seedSite, ...(data.data as Partial<SiteContent>) } : seedSite;
  } catch {
    return seedSite;
  }
}

export async function getGuide(): Promise<GuideMeta> {
  if (!supabase) return seedGuide;
  try {
    const { data } = await supabase.from("qh_guide_meta").select("data").eq("id", "guia").maybeSingle();
    return (data?.data as GuideMeta) ?? seedGuide;
  } catch {
    return seedGuide;
  }
}

/**
 * Dados do Guia v2 em uma chamada. A estrutura v2 (páginas + catálogo de
 * opções) só passa a vir do banco quando as tabelas novas existirem e tiverem
 * conteúdo; até lá TUDO do guia vem do seed, para o menu e a grade nunca
 * mostrarem uma estrutura pela metade. As opções ancoram por slug do item.
 */
export async function getGuiaData(): Promise<{
  categories: Category[];
  guide: GuideMeta;
  pages: GuidePage[];
  options: ProductOption[];
}> {
  const guide = await getGuide();
  if (!supabase) {
    return { categories: seedCategories, guide, pages: seedGuidePages, options: seedProductOptions };
  }
  try {
    const { data: pagesRows, error: pagesErr } = await supabase
      .from("qh_guide_pages")
      .select("*")
      .order("order");
    if (pagesErr || !pagesRows?.length) {
      // Banco ainda sem a estrutura v2 — o guia inteiro roda no seed.
      return { categories: seedCategories, guide, pages: seedGuidePages, options: seedProductOptions };
    }
    const pages: GuidePage[] = pagesRows.map((p) => ({
      slug: p.slug,
      title: p.title,
      eyebrow: p.eyebrow,
      paragraphs: Array.isArray(p.paragraphs) ? p.paragraphs : [],
      cards: Array.isArray(p.cards) ? p.cards : null,
      closing: p.closing ?? null,
      ready: !!p.ready,
      order: p.order ?? 0,
    }));
    const { data: optRows } = await supabase.from("qh_product_options").select("*").order("order");
    const options: ProductOption[] = (optRows ?? []).map((o) => ({
      id: o.id,
      itemSlug: o.item_slug,
      genero: o.genero,
      tier: o.tier,
      name: o.name,
      photoUrl: o.photo_url,
      priceCents: o.price_cents,
      url: o.url,
      supplier: o.supplier,
      note: o.note,
      exemplo: !!o.exemplo,
      order: o.order ?? 0,
    }));
    const categories = await getCategories();
    return { categories, guide, pages, options };
  } catch {
    return { categories: seedCategories, guide, pages: seedGuidePages, options: seedProductOptions };
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!supabase) return seedCategories;
  try {
    const { data: cats } = await supabase.from("qh_categories").select("*").order("order");
    if (!cats?.length) return seedCategories;
    const { data: items } = await supabase.from("qh_items").select("*").order("order");
    const { data: suppliers } = await supabase.from("qh_suppliers").select("*");
    const byItem = new Map<string, Category["items"][number]["suppliers"]>();
    for (const s of suppliers ?? []) {
      const arr = byItem.get(s.item_id) ?? [];
      arr.push({ id: s.id, itemId: s.item_id, tier: s.tier, name: s.name, url: s.url, photoUrl: s.photo_url, note: s.note });
      byItem.set(s.item_id, arr);
    }
    return cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      intro: c.intro,
      order: c.order,
      items: (items ?? [])
        .filter((i) => i.category_id === c.id)
        .map((i) => ({
          id: i.id,
          categoryId: i.category_id,
          slug: i.slug,
          name: i.name,
          summary: i.summary,
          photoUrl: i.photo_url,
          decision: i.decision ?? {},
          suppliers: byItem.get(i.id) ?? [],
          order: i.order,
          published: i.published,
        })),
    }));
  } catch {
    return seedCategories;
  }
}
