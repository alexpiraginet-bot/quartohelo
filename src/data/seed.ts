// Seed = a ESTRUTURA inicial do Quarto da Helô, destilada do material oficial
// (branding + documento de produto + orientações do Guia Digital v2). Serve dois papéis:
//   1. o app funciona 100% sobre este seed enquanto o banco não tem a estrutura v2;
//   2. quando o banco for provisionado, este seed vira a carga inicial das tabelas.
// Conteúdo (decisões, opções com foto e preço, textos das páginas) é preenchido
// e editado pela Helô no painel, aos poucos — a estrutura já fica pronta aqui.

import type { Category, GuideMeta, GuidePage, GuestProfile, Item, ProductOption, SiteContent } from "@/lib/types";

let seq = 0;
const uid = (p: string) => `${p}-${(++seq).toString(36)}`;

function item(categoryId: string, name: string, extra: Partial<Item> = {}, order = 0): Item {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    id: uid("item"),
    categoryId,
    slug,
    name,
    summary: extra.summary ?? null,
    photoUrl: extra.photoUrl ?? null,
    decision: extra.decision ?? {},
    suppliers: extra.suppliers ?? [],
    order,
    published: true,
  };
}

function cat(slug: string, name: string, intro: string, order: number, names: (string | Item)[]): Category {
  const id = `cat-${slug}`;
  return {
    id,
    slug,
    name,
    intro,
    order,
    items: names.map((n, i) => (typeof n === "string" ? item(id, n, {}, i) : { ...n, categoryId: id, order: i })),
  };
}

// As 22 categorias do menu (itens 6–27 do documento de orientações), na ordem
// exata do documento, agrupadas em 4 blocos que viram separadores do menu.
export const seedCategories: Category[] = [
  cat("estrutura", "Estrutura & móveis", "A base do quarto: o que sustenta a rotina e a estética.", 1, [
    item("cat-estrutura", "Papel de parede", {
      summary: "O plano de fundo que define a atmosfera de todo o quarto.",
      decision: {
        quandoUsar: "Quando você quer dar identidade ao quarto sem depender só de objetos: o papel amarra paleta, clima e estilo de uma vez.",
        quandoNao: "Evite estampas grandes e saturadas em quartos pequenos ou com muitos móveis à vista: o ambiente perde o descanso visual.",
        erroComum: "Aplicar sem preparar a parede. Massa corrida e superfície lisa vêm antes: imperfeições marcam o papel e estragam o efeito.",
        efeito: "É a primeira leitura do quarto. Tudo que entrar depois dialoga com ele.",
        instalacao: "Prepare a parede (lixada, selada e seca) e confira o rendimento dos rolos com sobra para casar a estampa.",
      },
    }),
    item("cat-estrutura", "Berço", {
      summary: "A peça central e a primeira decisão de proporção do quarto.",
      decision: {
        quandoUsar: "Quando você quer uma peça que acompanhe o crescimento (modelos que viram mini-cama ganham anos de uso).",
        quandoNao: "Evite o berço super dimensionado em quartos pequenos: ele engole a circulação e desequilibra a composição.",
        erroComum: "Escolher pela foto e ignorar a altura do estrado e a distância entre as ripas (segurança + praticidade na troca).",
        efeito: "Define o eixo visual do quarto. Tudo se organiza a partir dele.",
      },
    }),
    "Cama auxiliar",
    "Cômoda",
    "Armário",
    item("cat-estrutura", "Poltrona de amamentação", {
      summary: "O ponto de conforto das madrugadas.",
      decision: {
        quandoUsar: "Priorize apoio de braço na altura certa e opção com balanço quando o espaço permite.",
        erroComum: "Escolher pela beleza sem testar o encosto e a profundidade do assento.",
        efeito: "É onde a mãe passa as horas mais silenciosas. Conforto aqui é cuidado.",
        instalacao: "Reserve um apoio para os pés ao lado — muda tudo nas sessões longas.",
      },
    }),
    "Mesa lateral",
  ]),
  cat("texteis", "Têxteis", "O que traz maciez, cor e a textura que a foto não entrega.", 2, [
    "Tapete",
    "Cortina",
    "Enxoval berço",
    "Enxoval cama",
    "Almofadas decorativas",
    "Almofada de amamentação",
    "Trocador",
    "Porta-treco",
  ]),
  cat("iluminacao", "Iluminação", "A luz decide a atmosfera do quarto — de dia e, principalmente, à noite.", 3, [
    item("cat-iluminacao", "Arandelas", {
      summary: "A luz de apoio ao lado do berço, para as horas silenciosas.",
      decision: {
        quandoUsar: "Luz amarela acolhe e prepara o sono; escolha a temperatura certa para a troca de madrugada.",
        quandoNao: "Branco frio ao lado do berço atrapalha o sono do bebê e deixa o ambiente clínico.",
        erroComum: "Posicionar a arandela no ponto que ofusca quem amamenta.",
        efeito: "Define a sensação do quarto à noite, quando cada detalhe importa mais.",
        instalacao: "Deixe o ponto elétrico previsto antes do acabamento da parede.",
      },
    }),
    "Abajur",
    "Pendente",
  ]),
  cat("complementos", "Complementos", "Os detalhes que completam o quarto — e a chegada.", 4, [
    "Kit higiene",
    "Adornos",
    "Mala maternidade",
    "Bolsa de passeio",
  ]),
];

/* ------------------------------------------------------------------ *
 *  Páginas de conteúdo do guia (menu 1–4). Texto PROVISÓRIO (ready:false):
 *  o oficial está nas páginas 3–7 do guia original e entra pelo painel.
 * ------------------------------------------------------------------ */
export const seedGuidePages: GuidePage[] = [
  {
    slug: "sobre-nos",
    title: "Sobre nós",
    eyebrow: "Quarto da Helô",
    paragraphs: [
      "O Quarto da Helô é um estúdio criativo especializado em quartos da primeira infância: arquitetura, interiores, curadoria e produção com direção estética e criativa.",
      "Acreditamos que a beleza é a forma mais pura de cuidado, e que o primeiro cenário de uma vida merece ser impecável.",
      "Este guia carrega o nosso olhar: o método, o critério e o cuidado que colocamos em cada decisão de um quarto — agora nas suas mãos.",
    ],
    ready: false,
    order: 1,
  },
  {
    slug: "como-usar",
    title: "Introdução — como usar este guia",
    eyebrow: "Comece por aqui",
    paragraphs: [
      "O guia é organizado por categorias, na ordem em que as decisões devem acontecer: da estrutura aos complementos. Em cada categoria você encontra a nossa orientação de DECISÃO — quando usar, quando não usar, o erro mais comum e o efeito no quarto.",
      "Escolha a variação do seu quarto (menina, neutro ou menino) e veja as opções curadas em três faixas de investimento, sempre visíveis lado a lado.",
      "Ao marcar uma opção, ela entra automaticamente no seu MEU PROJETO: a foto vai para o moodboard e o valor entra na análise financeira. Você acompanha o quarto inteiro se montando, escolha a escolha.",
    ],
    ready: false,
    order: 2,
  },
  {
    slug: "antes-de-comecar",
    title: "Antes de começar",
    eyebrow: "Preparação",
    paragraphs: [
      "Meça o quarto antes de qualquer compra: largura das paredes, altura, posição de janelas, portas e pontos elétricos. As medidas decidem mais do que o gosto.",
      "Defina a faixa de investimento total antes de se apaixonar por peças isoladas — o guia existe para o conjunto fechar com harmonia, sem sustos.",
      "Comece pelas decisões estruturais (papel de parede, berço, marcenaria) e deixe adornos e detalhes para o final: eles respondem ao que já estiver definido.",
    ],
    ready: false,
    order: 3,
  },
  {
    slug: "cronograma",
    title: "Cronograma de montagem",
    eyebrow: "O tempo certo de cada coisa",
    paragraphs: [
      "Cada quarto tem seu ritmo, mas a ordem importa: estrutura e revestimentos primeiro, móveis sob medida e peças de maior prazo em seguida, têxteis e enxoval na sequência, adornos e detalhes por último.",
      "Atenção aos prazos de produção: berço, marcenaria e peças personalizadas costumam levar de 30 a 90 dias. O cronograma oficial da Helô, com as janelas ideais por trimestre, entra nesta página em breve.",
    ],
    ready: false,
    order: 4,
  },
];

/* ------------------------------------------------------------------ *
 *  Catálogo de opções — ESTRUTURA pronta para a Helô preencher no painel
 *  (fotos, nomes, preços, aos poucos). Abaixo, um conjunto pequeno de
 *  EXEMPLOS (exemplo:true) só para visualizar a grade 3×3, o moodboard e o
 *  financeiro funcionando. São substituídos pela curadoria real.
 * ------------------------------------------------------------------ */
let opSeq = 0;
function opt(
  itemSlug: string,
  genero: ProductOption["genero"],
  tier: ProductOption["tier"],
  name: string,
  priceCents: number | null,
  order: number,
): ProductOption {
  return {
    id: `opt-${(++opSeq).toString(36)}`,
    itemSlug,
    genero,
    tier,
    name,
    photoUrl: null,
    priceCents,
    url: null,
    supplier: null,
    note: "Exemplo para visualização — substitua pela curadoria real no painel.",
    exemplo: true,
    order,
  };
}

export const seedProductOptions: ProductOption[] = [
  // Berço · Neutro — grade completa de exemplo (3 faixas × 3 opções)
  opt("berco", "neutro", "alto", "Berço Lume", 890000, 0),
  opt("berco", "neutro", "alto", "Berço Alcova", 740000, 1),
  opt("berco", "neutro", "alto", "Berço Ninho Real", 680000, 2),
  opt("berco", "neutro", "medio", "Berço Nuvem", 390000, 0),
  opt("berco", "neutro", "medio", "Berço Vime & Linho", 320000, 1),
  opt("berco", "neutro", "medio", "Berço Aurora", 285000, 2),
  opt("berco", "neutro", "acessivel", "Berço Essencial", 169000, 0),
  opt("berco", "neutro", "acessivel", "Berço Trama", 145000, 1),
  opt("berco", "neutro", "acessivel", "Berço Base", 119000, 2),
  // Poltrona de amamentação · Neutro — uma opção por faixa, para o moodboard compor
  opt("poltrona-de-amamentacao", "neutro", "alto", "Poltrona Nuvem", 520000, 0),
  opt("poltrona-de-amamentacao", "neutro", "medio", "Poltrona Balanço Linho", 290000, 0),
  opt("poltrona-de-amamentacao", "neutro", "acessivel", "Poltrona Serena", 175000, 0),
];

/** Perfil de pré-visualização (a personalização real por link é a Fase 4). */
export const seedGuestProfile: GuestProfile = {
  motherName: "Marina",
  babyName: "Aurora",
};

export const seedGuide: GuideMeta = {
  name: "O Fim da Dúvida",
  tagline: "Guia de Decisão Estética para o quarto do seu bebê",
  promise: "Você nunca mais vai travar na frente de uma decisão do quarto do seu bebê.",
  priceCents: null, // exibição pública só quando a Helô confirmar no admin
  hotmartUrl: null,
  status: "lista_espera",
  collection: "Collection Nº 01",
  coverTitle: "Do conceito ao último detalhe",
  coverSub: "O guia completo para montar o quarto do seu bebê.",
  precoDataBase: "julho de 2026",
};

// Landing — cópia oficial da marca (editável no admin). Segue o tom das 4 vozes:
// acolhedor, especialista, inspirador, educativo. Sem travessão de IA.
export const seedSite: SiteContent = {
  heroEyebrow: "Estúdio criativo · Primeira infância",
  heroTitleHtml: "Arquitetura, Interiores, Curadoria e Produção <i>infantil</i>.",
  heroSub: "Com bossa, afeto e primor em cada detalhe. O primeiro cenário de uma vida merece ser impecável.",
  heroCats: ["Arquitetura", "Interiores", "Curadoria", "Produção"],
  quemEyebrow: "Quem somos",
  quemTitleHtml: "A beleza é a forma mais<br>pura de cuidado.",
  quemParagraphs: [
    "O Quarto da Helô é um estúdio criativo especializado em arquitetura infantil que entrega arquitetura, interiores, curadoria e produção com direção estética e criativa.",
    "Acreditamos que a beleza é a forma mais pura de cuidado, e que o primeiro cenário de uma vida merece ser impecável.",
    "Sabemos que montar o quarto do seu bebê envolve centenas de decisões. Nós existimos para que nenhuma delas pese sobre você. Assumimos o peso das decisões e devolvemos a você a leveza de esperar, sonhar e se encantar.",
    "Vamos além do projeto. Conduzimos cada definição diretamente com os fornecedores: modelos, acabamentos, cores, tecidos e bordados, escolhidos um a um. Você não precisa decidir nada sozinha, cada detalhe chega até você já pensado, resolvido e em harmonia com o todo.",
    "Unimos solidez técnica e estética contemporânea para que o primeiro cenário de vida do seu filho seja um reflexo de primor, cuidado e absoluta confiança no processo.",
  ],
  quemClose: "Enquanto cuidamos de todos os detalhes, você vive a melhor parte: a espera.",
  trabalhoEyebrow: "Como trabalhamos",
  trabalhoTitle: "Dois caminhos, o mesmo primor.",
  trabalhoLead:
    "Do conceito ao último detalhe, com direção estética centralizada. Você escolhe a profundidade do envolvimento e nós conduzimos o resto.",
  services: [
    {
      tag: "Entrega integral",
      title: "Projeto Conceito",
      desc: "Arquitetura e curadoria integradas em um único processo, um ambiente coeso, funcional e visualmente consistente em todos os níveis.",
      bullets: [
        "Projeto de arquitetura: layout, iluminação, marcenaria e organização do espaço",
        "Estudo de layout com planta baixa e material técnico para aprovação",
        "Definição completa do conceito estético do quarto",
        "Moodboard com direcionamento visual do ambiente",
        "Curadoria completa e detalhada de todos os elementos",
        "Imagens 3D para visualização do ambiente final",
      ],
      featured: true,
      featuredLabel: "Integração total entre arquitetura e curadoria",
    },
    {
      tag: "Definição estética",
      title: "Curadoria Assinada",
      desc: "A definição estética completa do ambiente, com direcionamento claro e seguro para que todas as escolhas nasçam com coerência e harmonia.",
      bullets: [
        "Definição do conceito estético do quarto",
        "Moodboard com paleta, materiais, estampas e atmosfera",
        "Curadoria completa dos elementos, do papel de parede aos têxteis e adornos",
        "Indicação de fornecedores alinhados à proposta, com diferentes faixas de investimento",
        "Intermediação direta: modelos, acabamentos, cores, bordados e tecidos, um a um",
      ],
      foot: "Você conduz com autonomia, a partir de um direcionamento claro e estruturado.",
    },
  ],
  guiaEyebrow: "Guia digital",
  guiaTitle: "O Fim da Dúvida.",
  guiaKicker: "Do conceito ao último detalhe",
  guiaText:
    "Um sistema de decisão estética para montar o quarto do seu bebê com escolhas seguras, bonitas e coerentes. Aqui você encontra o método, o critério e o olhar da Helô para executar com primor.",
  contatoEyebrow: "Contato",
  contatoTitleHtml: "Vamos criar juntas o primeiro<br>cenário dessa vida.",
  contatoLead:
    "Conte sobre o seu quarto. Toque no botão de conversa aqui na tela e a gente começa por ali, com calma e cuidado.",
  footerTagline: "Arquitetura · Interiores · Curadoria · Produção — primeira infância",
};
