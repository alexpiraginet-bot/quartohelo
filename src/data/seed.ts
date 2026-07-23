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
        dicaHelo:
          "Antes de comprar qualquer berço, marque suas dimensões no chão com fita crepe. Em seguida, verifique se haverá pelo menos 60 cm de circulação livre em uma das laterais para garantir conforto e praticidade no uso diário. Se a sua intenção é conseguir colocar o bebê no berço pelos dois lados, faça essa verificação em ambas as laterais, e não apenas em uma delas. Esse simples exercício ajuda a visualizar o espaço que o móvel realmente ocupará no ambiente e evita um dos erros mais frequentes — e mais caros — na montagem do quartinho: descobrir, após a compra, que o berço ficou desproporcional para o espaço ou comprometeu a circulação do ambiente.",
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
    slug: "visao-geral",
    title: "Visão geral",
    eyebrow: "Bem-vinda ao seu guia · Collection Nº 01",
    paragraphs: [
      "DO CONCEITO AO ÚLTIMO DETALHE: O guia completo para montar o quarto do seu bebê.",
      "A beleza é a forma mais pura de cuidado e o primeiro cenário de uma vida merece ser impecável.",
      "Aqui você encontrará o método, o critério e o olhar da Helô para você executar com primor.",
    ],
    ready: true,
    order: 0,
  },
  {
    slug: "sobre-nos",
    title: "Quem somos",
    eyebrow: "Quarto da Helô",
    paragraphs: [
      "O Quarto da Helô é um estúdio criativo especializado em arquitetura infantil que entrega curadoria refinada e direção estética e criativa.",
      "Acreditamos que a beleza é a forma mais pura de cuidado e que o primeiro cenário de uma vida merece ser impecável.",
      "Sabemos que montar o quarto do seu bebê envolve centenas de decisões. Nós existimos para que nenhuma delas pese sobre você. Assumimos o peso das decisões e devolvemos a você a leveza de esperar, sonhar e se encantar.",
      "É assim que atuamos.",
      "Vamos além do projeto. No nosso Projeto Conceito e na Curadoria Assinada, conduzimos cada definição diretamente com os fornecedores: modelos, acabamentos, cores, tecidos e bordados, escolhidos um a um. Você não precisa decidir nada sozinha, cada detalhe chega até você já pensado, resolvido e em harmonia com o todo.",
      "Unimos solidez técnica e estética contemporânea para que o primeiro cenário de vida do seu filho seja um reflexo de primor, cuidado e absoluta confiança no processo.",
      "Aqui no nosso guia completo para montar o quarto do seu bebê, fazemos uma curadoria prévia para você. Para cada item do quarto, reunimos opções cuidadosamente selecionadas, todas filtradas pelo olhar criterioso da Helô e organizadas por faixa de investimento, para que você escolha com liberdade, sem abrir mão da curadoria realizada pelo Quarto da Helô.",
      "Assim, você não parte do zero nem se perde entre mil opções. Recebe apenas o que já passou pelo nosso crivo, e monta um quarto bonito, coerente e cheio de significado, do seu jeito e no seu tempo, com a segurança e o olhar de quem é apaixonado por cuidar dos mínimos detalhes e já pensou em cada um deles por você.",
    ],
    closing: "Enquanto cuidamos de todos os detalhes, você vive a melhor parte: a espera.",
    ready: true,
    order: 1,
  },
  {
    slug: "como-usar",
    title: "Como usar este guia",
    eyebrow: "Introdução — como usar",
    paragraphs: [
      "Este guia foi construído para ser lido como um manual de decisão, não como uma lista de compras. Cada item do quarto do bebê tem sua própria seção: o momento certo de comprar, o que evitar, o erro mais comum e três fornecedores curados com rigor estético e técnico.",
    ],
    cards: [
      {
        n: "01",
        title: "Escolha sua variação",
        text: "Este guia tem três versões: Menina, Menino e Neutro. Cada uma tem curadoria de fornecedores e referências estéticas específicas para a paleta do ambiente.",
      },
      {
        n: "02",
        title: "Siga o cronograma",
        text: "O cronograma nas páginas seguintes mostra o momento exato de comprar cada item. Sem correria de última hora e sem tirar a magia de um momento tão especial.",
      },
      {
        n: "03",
        title: "Aplique a curadoria",
        text: "Escolha dentre 3 fornecedores indicados por item: alto investimento, médio e acessível. Todos selecionados com rigor técnico e estético. Você escolhe, a Helô já filtrou.",
      },
      {
        n: "04",
        title: "Use o checklist",
        text: "No final do guia há uma página de checklist com todos os itens. Imprima-a e vá marcando à medida que for executando. É o seu mapa de progresso.",
      },
    ],
    closing:
      "O critério já foi aplicado. O filtro já existe. O que resta é a leveza da escolha para que o primeiro cenário de vida do seu filho seja um reflexo de primor, personalidade, cuidado e absoluta confiança no processo.",
    ready: true,
    order: 2,
  },
  {
    slug: "antes-de-comecar",
    title: "Orientações sobre Medidas e Circulação",
    eyebrow: "Antes de começar: A parte técnica que deve ser resolvida antes de qualquer escolha estética",
    paragraphs: [
      "A parte técnica que ninguém te conta — e que deve ser resolvida antes de qualquer escolha estética.",
    ],
    measures: {
      columns: { item: "Item", min: "Medida mínima", meaning: "O que isso significa na prática" },
      rows: [
        { item: "Circulação geral", min: "mínimo 60 cm", meaning: "Espaço mínimo para caminhar confortavelmente entre móveis. Abaixo disso, o quarto parece apertado mesmo que seja grande." },
        { item: "Abertura de gaveta (cômoda)", min: "80 a 90 cm", meaning: "Frente à cômoda, garanta pelo menos 80 a 90 cm livres para abrir gavetas sem colidir com outro móvel e manuseá-la." },
        { item: "Entre berço e parede", min: "60 cm", meaning: "O ideal é ter acesso ao bebê pelos dois lados do berço, facilitando o dia a dia. Caso o espaço seja menor, é possível optar pelo acesso por apenas um lado." },
        { item: "Altura do trocador", min: "85 a 90 cm", meaning: "Depende da altura dos pais. Meça a altura do seu cotovelo dobrado — o trocador deve ficar 5 cm abaixo." },
        { item: "Profundidade do trocador", min: "50 a 60 cm", meaning: "Mínimo de segurança para que o bebê não corra risco de cair." },
        { item: "Berço (tamanho padrão)", min: "70 × 140 cm", meaning: "Sempre verifique o modelo do seu berço (padrão americano ou nacional) antes de comprar o colchão. Lembre também de verificar se o modelo possui certificação do INMETRO." },
        { item: "Poltrona de amamentação", min: "80 × 85 cm", meaning: "Mais 30 cm laterais para repousar o braço e para a movimentação. Lembre-se de que poltronas com balanço precisam de 50 cm atrás." },
        { item: "Abertura de porta", min: "—", meaning: "Cuidado: verifique se nenhum móvel obstrui a abertura total da porta." },
      ],
      tip: {
        label: "Dica da Helô",
        body: "Antes de comprar qualquer móvel: use fita crepe no chão para marcar as dimensões exatas do móvel que pretende comprar. Caminhe ao redor. Simule a abertura de gaveta. Esse exercício de 10 minutos evita arrependimentos que podem custar caro!",
      },
    },
    ready: true,
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
  {
    slug: "meu-projeto",
    title: "Meu projeto",
    eyebrow: "O seu quarto, escolha a escolha",
    paragraphs: [],
    project: {
      howTitle: "Como funciona",
      howText:
        "Tudo que você marca nas categorias aparece aqui na hora: a foto compõe o seu moodboard e o valor entra na análise financeira, somado automaticamente. Toque em qualquer valor para ajustar — o ajuste vale só para o seu projeto.",
      moodTitle: "Moodboard",
      moodEmpty: "Seu moodboard ainda está em branco. Comece pelas categorias no menu — cada escolha aparece aqui na hora.",
      finTitle: "Análise financeira",
      finEmpty: "Os valores das suas escolhas aparecem aqui, item a item e somados.",
      totalLabel: "Total do projeto",
      finNote:
        "Os valores têm como base os preços de {data}. Se algo mudou no fornecedor, toque no valor e ajuste — o total recalcula na hora.",
    },
    ready: true,
    order: 99,
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
  heroEyebrow: "Arquitetura · Interiores · Curadoria · Produção",
  heroTitleHtml: "O primeiro cenário de uma vida merece ser <i>impecável</i>.",
  heroSub: "Quarto da Helô: onde cada detalhe acolhe a infância.",
  heroCats: ["Arquitetura", "Interiores", "Curadoria", "Produção"],
  quemEyebrow: "Sobre nós",
  quemTitleHtml: "",
  quemParagraphs: [
    "O Quarto da Helô é um estúdio criativo especializado em arquitetura infantil que entrega curadoria refinada e direção estética e criativa.",
    "Acreditamos que a beleza é a forma mais pura de cuidado e que o primeiro cenário de uma vida merece ser impecável.",
    "Sabemos que montar o quarto do seu bebê envolve centenas de decisões. Nós existimos para que nenhuma delas pese sobre você. Assumimos o peso das decisões e devolvemos a você a leveza de esperar, sonhar e se encantar.",
    "É assim que atuamos.",
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
      ctaLabel: "Conheça o Projeto Conceito",
      ctaHref: "/projeto-conceito",
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
      ctaLabel: "Conheça a Curadoria Assinada",
      ctaHref: "/curadoria-assinada",
    },
  ],
  guiaEyebrow: "Guia digital",
  guiaTitle: "O Fim da Dúvida.",
  guiaKicker: "Do conceito ao último detalhe",
  guiaText:
    "Um sistema de decisão estética para montar o quarto do seu bebê com escolhas seguras, bonitas e coerentes. Aqui você encontra o método, o critério e o olhar da Helô para executar com primor.",
  contatoEyebrow: "Contato",
  contatoTitleHtml: "Atendimento <i>personalizado</i>.",
  contatoLead: "Fale conosco através do nosso WhatsApp.",
  footerTagline: "Arquitetura · Interiores · Curadoria · Produção — primeira infância",

  /* ---- Landing v2 ---- */
  sobrePhoto: "/images/estudio-sobre.jpg",
  contatoPhoto: "/images/estudio-contato.jpg",
  produtoDigital: {
    tag: "Produto digital",
    title: "O Fim da Dúvida",
    desc:
      "O guia interativo para montar o quarto do seu bebê com escolhas seguras, bonitas e coerentes — o método, o critério e o olhar da Helô, do conceito ao último detalhe.",
    bullets: [
      "22 categorias, das estruturais aos adornos",
      "Curadoria por faixa de investimento, com preço e link",
      "Cronograma de montagem mês a mês e Meu Projeto",
    ],
    ctaLabel: "Conhecer o produto digital",
    ctaHref: "/produto-digital",
  },
  whatsapp: "(11) 93063-9390",
  whatsappHref: "https://wa.me/5511930639390",
  horario: "9h30 às 17h30",
  email: "",
  instagram: "",
  facebook: "",
  sobrePage: null,
  curadoriaPage: {
    eyebrow: "Como trabalhamos",
    title: "Curadoria Assinada",
    paragraphs: ["Conteúdo em breve — a Helô preenche esta página pelo painel."],
    photo: null,
  },
  projetoPage: {
    eyebrow: "Como trabalhamos",
    title: "Projeto Conceito",
    paragraphs: ["Conteúdo em breve — a Helô preenche esta página pelo painel."],
    photo: null,
  },
  digitalPage: {
    eyebrow: "Produto digital",
    title: "O Fim da Dúvida",
    paragraphs: [
      "O guia interativo do Quarto da Helô para montar o quarto do seu bebê com escolhas seguras, bonitas e coerentes.",
      "Do conceito ao último detalhe: método, critério e o olhar da Helô, com curadoria por faixa de investimento e cronograma de montagem.",
    ],
    photo: null,
  },
};
