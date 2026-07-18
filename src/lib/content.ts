import "server-only";
import { isDbConfigured, supabase } from "@/lib/db/supabase";
import { seedCategories, seedGuide, seedSite } from "@/data/seed";
import type { Category, GuideMeta, SiteContent } from "@/lib/types";

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
    return (data?.data as SiteContent) ?? seedSite;
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
