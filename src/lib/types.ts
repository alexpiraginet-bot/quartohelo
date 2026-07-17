// Modelo de dados do Quarto da Helô — a fonte de verdade da estrutura.
// Tudo (landing, guia interativo, admin) lê estes tipos. O conteúdo vem do
// Supabase quando conectado; até lá, do seed (src/data/seed.ts).

export type PriceTier = "acessivel" | "medio" | "alto";

export const TIER_LABEL: Record<PriceTier, string> = {
  acessivel: "Acessível",
  medio: "Médio",
  alto: "Alto padrão",
};

/** Fornecedor sugerido para um item, por faixa de investimento. */
export interface Supplier {
  id: string;
  itemId: string;
  tier: PriceTier;
  name: string;
  url?: string | null;
  photoUrl?: string | null;
  note?: string | null;
}

/**
 * A "DECISÃO" — o ouro do guia. Para cada item, ensinamos a decidir, não só
 * descrevemos. Todos os campos são opcionais para a Helô preencher aos poucos.
 */
export interface ItemDecision {
  quandoUsar?: string | null;
  quandoNao?: string | null;
  erroComum?: string | null;
  efeito?: string | null;
  instalacao?: string | null;
}

export interface Item {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  /** Uma frase do que é / por que importa. */
  summary?: string | null;
  photoUrl?: string | null;
  decision: ItemDecision;
  suppliers: Supplier[];
  order: number;
  published: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  /** Subtítulo curto da categoria. */
  intro?: string | null;
  order: number;
  items: Item[];
}

/** Guia como produto: nome, promessa, preço (controlados no admin). */
export interface GuideMeta {
  name: string;
  tagline: string;
  promise: string;
  /** Preço em centavos; null = não exibir publicamente ainda. */
  priceCents: number | null;
  hotmartUrl?: string | null;
  status: "rascunho" | "lista_espera" | "a_venda";
}

/* ------------------------------------------------------------------ *
 *  CMS da landing — a Helô edita textos e fotos sem depender de dev.
 * ------------------------------------------------------------------ */

export interface ServiceCard {
  tag: string;
  title: string;
  desc: string;
  bullets: string[];
  foot?: string | null;
  featured?: boolean;
  featuredLabel?: string | null;
}

export interface SiteContent {
  heroEyebrow: string;
  heroTitleHtml: string; // permite <i> para o itálico da marca
  heroSub: string;
  heroCats: string[];
  quemEyebrow: string;
  quemTitleHtml: string;
  quemParagraphs: string[];
  quemClose: string;
  trabalhoEyebrow: string;
  trabalhoTitle: string;
  trabalhoLead: string;
  services: ServiceCard[];
  guiaEyebrow: string;
  guiaTitle: string;
  guiaKicker: string;
  guiaText: string;
  contatoEyebrow: string;
  contatoTitleHtml: string;
  contatoLead: string;
  footerTagline: string;
}

/* ------------------------------------------------------------------ *
 *  Cliente que comprou o Guia + sua jornada personalizada.
 * ------------------------------------------------------------------ */

export interface ClientChoice {
  itemId: string;
  supplierId?: string | null;
  status: "escolhido" | "pulado" | "duvida";
  note?: string | null;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  hotmartTransaction?: string | null;
}
