// Modelo de dados do Quarto da Helô — a fonte de verdade da estrutura.
// Tudo (landing, guia interativo, admin) lê estes tipos. O conteúdo vem do
// Supabase quando conectado; até lá, do seed (src/data/seed.ts).

export type PriceTier = "acessivel" | "medio" | "alto";

export const TIER_LABEL: Record<PriceTier, string> = {
  acessivel: "Acessível",
  medio: "Médio",
  alto: "Alto padrão",
};

export type Genero = "menina" | "neutro" | "menino";

export const GENERO_LABEL: Record<Genero, string> = {
  menina: "Menina",
  neutro: "Neutro",
  menino: "Menino",
};

/**
 * Como um item mostra a curadoria.
 *  · faixas (padrão): três faixas de investimento, até 3 produtos em cada.
 *  · fornecedores: sem faixas. Até 3 fornecedores, cada um com até 3 fotos.
 *    É o formato de papel de parede, arandela, kit higiene e afins, onde a
 *    curadoria é do fornecedor e não de um produto solto.
 *  · grade: sem faixas. Todas as opções numa grade só, no mesmo formato.
 */
export type ItemLayout = "faixas" | "fornecedores" | "grade";

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
 * Opção concreta de produto dentro de uma categoria do guia: a curadoria da
 * Helô com foto, preço e fornecedor, por gênero e faixa de investimento.
 * Ancorada pelo SLUG do item (estável entre seed e banco) para o catálogo
 * poder ser preenchido aos poucos pelo painel sem depender de ids.
 */
export interface ProductOption {
  id: string;
  itemSlug: string;
  genero: Genero;
  tier: PriceTier;
  name: string;
  photoUrl?: string | null;
  /** Fotos do fornecedor (layout "fornecedores"): até 3, quadradas. Vazio nos
   *  outros layouts, que usam `photoUrl`. */
  photos?: string[] | null;
  /** Preço em centavos na data-base do guia; null = ainda sem preço. */
  priceCents: number | null;
  url?: string | null;
  supplier?: string | null;
  note?: string | null;
  /** Dado de demonstração — substituído pela curadoria real no painel. */
  exemplo?: boolean;
  order: number;
}

/** Card numerado dentro de uma página do guia (ex.: os 4 passos do "Como usar"). */
export interface GuidePageCard {
  n: string;
  title: string;
  text: string;
  /** Imagem opcional do card (sem imagem / topo / fundo 50%). */
  image?: CardImage | null;
}

/** Callout discreto "Dica da Helô". `label` é opcional (padrão: "Dica da Helô"),
 *  para nunca renomear o conteúdo salvo silenciosamente. */
export interface GuideDica {
  label?: string | null;
  body: string;
}

/** Uma linha da tabela de medidas (item · medida mínima · significado prático). */
export interface MeasureRow {
  item: string;
  min: string;
  meaning: string;
}

/** Tabela de medidas de uma página do guia: rótulos das 3 colunas + linhas +
 *  uma dica opcional (renderizada como callout abaixo da tabela). */
export interface GuidePageMeasures {
  columns: { item: string; min: string; meaning: string };
  rows: MeasureRow[];
  tip?: GuideDica | null;
}

/** Textos editoriais (fixos) da tela "Meu projeto". Só rótulos/instruções — os
 *  dados do projeto (itens, valores, totais) continuam dinâmicos por usuária.
 *  `finNote` aceita o token {data}, trocado pela data-base dos preços. */
export interface ProjectTexts {
  howTitle?: string | null;
  howText?: string | null;
  moodTitle?: string | null;
  moodEmpty?: string | null;
  finTitle?: string | null;
  finEmpty?: string | null;
  totalLabel?: string | null;
  finNote?: string | null;
}

/**
 * Página de conteúdo do guia (Visão geral, Quem somos, Como usar, Medidas,
 * Cronograma). `ready=false` marca texto provisório até o oficial chegar.
 * `cards` e `closing` são opcionais: parágrafos, depois cards, depois a citação.
 * `measures` guarda a tabela de medidas (quando a página tiver uma).
 * `backgroundUrl` é a imagem de fundo opcional (padrão: sem imagem).
 */
export interface GuidePage {
  slug: string;
  title: string;
  eyebrow?: string | null;
  paragraphs: string[];
  cards?: GuidePageCard[] | null;
  closing?: string | null;
  measures?: GuidePageMeasures | null;
  /** Textos editoriais da tela especial "Meu projeto" (só nessa página). */
  project?: ProjectTexts | null;
  backgroundUrl?: string | null;
  /** Opacidade da foto de fundo (0 a 1). Ausente = padrão. */
  backgroundOpacity?: number | null;
  ready: boolean;
  order: number;
}

/** Perfil exibido no guia (pré-visualização até o link por cliente entrar). */
export interface GuestProfile {
  motherName: string;
  babyName: string;
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
  /** Card avulso, destacado (fundo vinho): a "Dica da Helô" do item. */
  dicaHelo?: string | null;
  /** Imagem opcional do card "Quando usar" (mesmos 3 modos: sem/topo/fundo). */
  quandoUsarImg?: CardImage | null;
  /** Imagem opcional do card "Quando não usar". */
  quandoNaoImg?: CardImage | null;
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
  /** Ausente = "faixas". */
  layout?: ItemLayout | null;
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
  /** Capa do guia (Collection Nº 01). Opcionais: há fallback no app. */
  collection?: string | null;
  coverTitle?: string | null;
  coverSub?: string | null;
  /** Data-base dos preços do catálogo, exibida no Meu Projeto. */
  precoDataBase?: string | null;
  /** Imagem do card "Prefere que a gente cuide de tudo?" (topo ou fundo),
   *  com as mesmas opacidades dos demais cards. */
  bumpImage?: CardImage | null;
  /** Textos do mesmo card, editáveis no painel. Vazio = usa o texto padrão. */
  bump?: BumpTexts | null;
}

/** Textos do card "Prefere que a gente cuide de tudo?" (Meu projeto e itens).
 *  Todos opcionais: o que ficar em branco cai no texto padrão do guia. */
export interface BumpTexts {
  kicker?: string | null;
  title?: string | null;
  /** Corpo do card: um parágrafo por linha em branco. */
  body?: string[] | null;
  cta?: string | null;
}

/* ------------------------------------------------------------------ *
 *  CMS da landing — a Helô edita textos e fotos sem depender de dev.
 * ------------------------------------------------------------------ */

/** Imagem opcional de um card, configurável por card no painel.
 *  mode: "none" (padrão) · "top" (foto no topo) · "background" (fundo). */
export type CardImageMode = "none" | "top" | "background";
export interface CardImage {
  url?: string | null;
  mode?: CardImageMode;
  /** Texto alternativo (usado no modo "top"; vazio = decorativa). */
  alt?: string | null;
  /** Frase escrita sobre a faixa do topo (opcional). */
  caption?: string | null;
  /** Opacidade da IMAGEM (nunca do texto), de 0 a 1. Ausente = padrão do modo:
   *  topo = 1 (sem opacidade) · fundo = 0,5. Mantém cards antigos como estão. */
  opacity?: number | null;
}

/** Opacidades oferecidas no painel, por modo (o que a cliente escolhe).
 *  Mesmo trio em toda parte — 90%, 80% e 50% —; no topo cabe também a foto
 *  cheia, que é o padrão de quem só quer a faixa de imagem. */
export const TOP_OPACITIES = [1, 0.9, 0.8, 0.5] as const;
export const BG_OPACITIES = [0.9, 0.8, 0.5] as const;
/** Fundo de página inteira (guia e páginas próprias da landing). */
export const PAGE_OPACITIES = [1, 0.9, 0.8, 0.5] as const;
/** Padrão de cada modo quando o card não tem opacidade salva. */
export const DEFAULT_TOP_OPACITY = 1;
export const DEFAULT_BG_OPACITY = 0.5;
export const DEFAULT_PAGE_OPACITY = 0.5;

/** Uma foto do Portfólio (carrossel da landing). */
export interface PortfolioPhoto {
  url: string;
  alt?: string | null;
}

/** Seção "Portfólio" da landing: textos + as fotos do carrossel. */
export interface PortfolioContent {
  eyebrow?: string | null;
  title?: string | null;
  lead?: string | null;
  photos: PortfolioPhoto[];
}

export interface ServiceCard {
  tag: string;
  title: string;
  desc: string;
  bullets: string[];
  foot?: string | null;
  featured?: boolean;
  featuredLabel?: string | null;
  /** Rótulo e destino do botão "conheça mais" (leva à página do serviço). */
  ctaLabel?: string | null;
  ctaHref?: string | null;
  /** Imagem opcional do card (sem imagem / topo / fundo 50%). */
  image?: CardImage | null;
}

/** Página institucional simples (Sobre nós, Curadoria Assinada, etc.). */
export interface SitePage {
  eyebrow?: string | null;
  title: string;
  paragraphs: string[];
  /** Foto de fundo da página (opcional). */
  photo?: string | null;
  /** Opacidade da foto de fundo (0 a 1). Ausente = padrão. */
  photoOpacity?: number | null;
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

  /* ---- Landing v2 (doc "Alterações Landing Page") ---- */
  // Fundos (fotos do estúdio)
  sobrePhoto?: string | null;
  sobrePhotoOpacity?: number | null;
  contatoPhoto?: string | null;
  contatoPhotoOpacity?: number | null;
  // Fundo do Início (hero): foto opcional + opacidade da foto (nunca do texto).
  heroPhoto?: string | null;
  heroPhotoOpacity?: number | null;
  // Seção "Portfólio" (carrossel), logo antes do Contato.
  portfolio?: PortfolioContent | null;
  // Card do produto digital, dentro de "Como trabalhamos"
  produtoDigital?: ServiceCard | null;
  // Contato — dados de atendimento (todos editáveis no painel)
  whatsapp?: string | null;      // ex.: (11) 93063-9390
  whatsappHref?: string | null;  // ex.: https://wa.me/5511930639390
  horario?: string | null;       // ex.: 9h30 às 17h30
  email?: string | null;
  instagram?: string | null;     // URL
  facebook?: string | null;      // URL
  // Páginas próprias abertas pelos botões (em branco, editáveis)
  sobrePage?: SitePage | null;
  curadoriaPage?: SitePage | null;
  projetoPage?: SitePage | null;
  digitalPage?: SitePage | null;
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
