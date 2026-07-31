import "server-only";
import { isDbConfigured, supabase } from "@/lib/db/supabase";
import {
  seedCategories,
  seedGuide,
  seedGuidePages,
  seedProductOptions,
  seedSite,
} from "@/data/seed";
import type { Category, GuideMeta, GuidePage, ProductOption, ServiceCard, SiteContent } from "@/lib/types";

/**
 * Camada de conteúdo. Uma porta única para landing, guia e admin lerem os dados.
 * Sem Supabase configurado, devolve o seed (o app roda inteiro). Com Supabase,
 * lê das tabelas. Nunca lança: qualquer falha cai para o seed, então o site
 * jamais fica no ar quebrado.
 */

export const dbReady = isDbConfigured;

/* Normalização de leitura da landing (retrocompatível, não reescreve o banco).
 * A v1 trouxe frases/valores que a Amanda pediu para remover/atualizar. Como o
 * conteúdo ao vivo vive no blob (que sobrepõe o seed) e estes campos não são
 * editáveis no painel (featuredLabel/foot) — ou o valor legado é apenas uma
 * cópia do seed antigo (horário) — aplicamos a limpeza na leitura. Um "Salvar"
 * no painel consolida os valores já normalizados. */
const normText = (v: string) => v.trim().replace(/\.$/, "").toLowerCase();
const DEPRECATED_CARD_LINES = new Set(
  [
    "Integração total entre arquitetura e curadoria",
    "Você conduz com autonomia, a partir de um direcionamento claro e estruturado",
  ].map(normText),
);
const LEGACY_HORARIO = "9h30 às 17h30";
/* Rótulos de botão que foram reescritos: o valor antigo vive no blob e o painel
 * ainda mostra o texto salvo, então trocamos na leitura até um "Salvar"
 * consolidar. Chave normalizada -> texto novo. */
const RENAMED_CTA_LABELS = new Map<string, string>([
  [normText("Conhecer o produto digital"), "Conheça o produto digital"],
]);

function stripDeprecated(v?: string | null): string | null {
  return v && DEPRECATED_CARD_LINES.has(normText(v)) ? null : (v ?? null);
}
function renameCta(v?: string | null): string | null {
  if (!v) return v ?? null;
  return RENAMED_CTA_LABELS.get(normText(v)) ?? v;
}
function normalizeCard(c: ServiceCard): ServiceCard {
  return {
    ...c,
    featuredLabel: stripDeprecated(c.featuredLabel),
    foot: stripDeprecated(c.foot),
    ctaLabel: renameCta(c.ctaLabel),
  };
}
function normalizeSite(s: SiteContent): SiteContent {
  return {
    ...s,
    services: Array.isArray(s.services) ? s.services.map(normalizeCard) : s.services,
    produtoDigital: s.produtoDigital ? normalizeCard(s.produtoDigital) : s.produtoDigital,
    // Horário: migra a cópia legada do seed antigo para o valor atual (do seed).
    horario: s.horario && s.horario.trim() === LEGACY_HORARIO ? seedSite.horario : s.horario,
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!supabase) return seedSite;
  try {
    const { data } = await supabase.from("qh_site_content").select("data").eq("id", "landing").maybeSingle();
    // Mescla com o seed: campos novos (landing v2) caem no padrão mesmo que a
    // linha do banco seja antiga. O que a Helô editar no painel prevalece.
    const merged = data?.data ? { ...seedSite, ...(data.data as Partial<SiteContent>) } : seedSite;
    return normalizeSite(merged);
  } catch {
    return seedSite;
  }
}

/* Pré-visualização: linhas separadas da mesma tabela, gravadas pelo painel e
 * lidas só pelas telas de pré-visualização (que exigem sessão de admin). O que
 * está publicado (id "landing") não é tocado. Sem linha, devolve null e a tela
 * avisa que é preciso clicar em "Ver como vai ficar" primeiro. */
async function readPreview<T>(id: string): Promise<T | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.from("qh_site_content").select("data").eq("id", id).maybeSingle();
    return (data?.data as T) ?? null;
  } catch {
    return null;
  }
}

export async function getSitePreview(): Promise<SiteContent | null> {
  const d = await readPreview<Partial<SiteContent>>("landing_preview");
  return d ? normalizeSite({ ...seedSite, ...d }) : null;
}

export async function getPagePreview(): Promise<GuidePage | null> {
  const d = await readPreview<GuidePage>("page_preview");
  return d?.slug ? normalizeProjectTexts(normalizeMeasuresParagraphs(d)) : null;
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

/* Título do moodboard: passa a ser automático ("Quarto do/da <nome da
 * criança>"). Os rótulos genéricos que estão salvos no banco valem como "não
 * preenchido", senão eles continuariam vencendo o título automático para
 * sempre. Um título próprio, escrito pela Helô, continua prevalecendo. */
const GENERIC_MOOD_TITLES = new Set(["moodboard", "meu quartinho", "meu moodboard"]);

function normalizeProjectTexts(p: GuidePage): GuidePage {
  const t = p.project?.moodTitle?.trim();
  if (!t || !GENERIC_MOOD_TITLES.has(t.toLowerCase())) return p;
  return { ...p, project: { ...p.project, moodTitle: null } };
}

/**
 * Normalização retrocompatível e conservadora (não toca o banco): quando uma
 * página tem tabela de medidas, as linhas de texto que apenas repetem a tabela
 * (conteúdo legado, importado como "texto corrido") deixam de ser renderizadas —
 * mantemos só a introdução, que vem antes da primeira linha de medida. Novas
 * edições pelo painel já salvam apenas a introdução, então isto é um "de-dup" de
 * leitura para dados antigos; o factual continua íntegro (vive na tabela).
 */
function normalizeMeasuresParagraphs(p: GuidePage): GuidePage {
  const rows = p.measures?.rows;
  if (!rows?.length || p.paragraphs.length <= 1) return p;
  const items = rows.map((r) => (r.item ?? "").trim()).filter(Boolean);
  if (!items.length) return p;
  const cut = p.paragraphs.findIndex((para) => {
    const t = (para ?? "").trim();
    return items.some((it) => t.startsWith(it));
  });
  return cut > 0 ? { ...p, paragraphs: p.paragraphs.slice(0, cut) } : p;
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
    return { categories: seedCategories, guide, pages: seedGuidePages.map(normalizeMeasuresParagraphs).map(normalizeProjectTexts), options: seedProductOptions };
  }
  try {
    const { data: pagesRows, error: pagesErr } = await supabase
      .from("qh_guide_pages")
      .select("*")
      .order("order");
    if (pagesErr || !pagesRows?.length) {
      // Banco ainda sem a estrutura v2 — o guia inteiro roda no seed.
      return { categories: seedCategories, guide, pages: seedGuidePages.map(normalizeMeasuresParagraphs).map(normalizeProjectTexts), options: seedProductOptions };
    }
    const dbPages: GuidePage[] = pagesRows.map((p) => ({
      slug: p.slug,
      title: p.title,
      eyebrow: p.eyebrow,
      paragraphs: Array.isArray(p.paragraphs) ? p.paragraphs : [],
      cards: Array.isArray(p.cards) ? p.cards : null,
      closing: p.closing ?? null,
      measures: p.measures && typeof p.measures === "object" && !Array.isArray(p.measures) ? (p.measures as GuidePage["measures"]) : null,
      project: p.project && typeof p.project === "object" && !Array.isArray(p.project) ? (p.project as GuidePage["project"]) : null,
      backgroundUrl: p.background_url ?? null,
      backgroundOpacity: typeof p.background_opacity === "number" ? p.background_opacity : null,
      ready: !!p.ready,
      order: p.order ?? 0,
    }));
    // "Visão geral" e "Meu projeto" são páginas como as outras. Se o banco ainda
    // não as tiver (instalações anteriores), entram a partir do seed — assim
    // sempre aparecem no painel e no guia, e passam a vir do banco quando salvas.
    const ensureSeed = (list: GuidePage[], slug: string): GuidePage[] => {
      if (list.some((p) => p.slug === slug)) return list;
      const s = seedGuidePages.find((p) => p.slug === slug);
      return s ? [...list, s] : list;
    };
    let pages = ensureSeed(dbPages, "visao-geral");
    pages = ensureSeed(pages, "meu-projeto");
    pages = [...pages].sort((a, b) => a.order - b.order).map(normalizeMeasuresParagraphs).map(normalizeProjectTexts);
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
    return { categories: seedCategories, guide, pages: seedGuidePages.map(normalizeMeasuresParagraphs).map(normalizeProjectTexts), options: seedProductOptions };
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
