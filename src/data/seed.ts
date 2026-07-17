// Seed = a ESTRUTURA inicial do Quarto da Helô, destilada do material oficial
// (branding + documento de produto). Serve dois papéis:
//   1. o app funciona 100% sobre este seed enquanto o Supabase não está conectado;
//   2. quando a Helô conecta o banco, este seed vira a carga inicial das tabelas.
// Conteúdo (decisões, fornecedores, fotos) é preenchido/editado pelo admin.

import type { Category, GuideMeta, Item, SiteContent } from "@/lib/types";

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

export const seedCategories: Category[] = [
  cat("mobiliario", "Mobiliário", "A base do quarto: o que sustenta a rotina e a estética.", 1, [
    item("cat-mobiliario", "Berço", {
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
    item("cat-mobiliario", "Poltrona de amamentação", {
      summary: "O ponto de conforto das madrugadas.",
      decision: {
        quandoUsar: "Priorize apoio de braço na altura certa e opção com balanço quando o espaço permite.",
        erroComum: "Escolher pela beleza sem testar o encosto e a profundidade do assento.",
        efeito: "É onde a mãe passa as horas mais silenciosas. Conforto aqui é cuidado.",
        instalacao: "Reserve um apoio para os pés ao lado — muda tudo nas sessões longas.",
      },
    }),
    "Mesa lateral",
    "Armário",
  ]),
  cat("texteis", "Têxteis", "O que traz maciez, cor e a textura que a foto não entrega.", 2, [
    "Cortina",
    "Tapete",
    "Almofadas decorativas",
    "Almofada de amamentação",
    "Enxoval do berço",
    "Mantas",
    "Trocador",
    "Porta-treco",
  ]),
  cat("iluminacao", "Iluminação", "A luz decide a atmosfera do quarto — de dia e, principalmente, à noite.", 3, [
    "Pendente",
    "Abajur",
    item("cat-iluminacao", "Arandela", {
      summary: "A luz de apoio ao lado do berço, para as horas silenciosas.",
      decision: {
        quandoUsar: "Luz amarela acolhe e prepara o sono; escolha a temperatura certa para a troca de madrugada.",
        quandoNao: "Branco frio ao lado do berço atrapalha o sono do bebê e deixa o ambiente clínico.",
        erroComum: "Posicionar a arandela no ponto que ofusca quem amamenta.",
        efeito: "Define a sensação do quarto à noite, quando cada detalhe importa mais.",
        instalacao: "Deixe o ponto elétrico previsto antes do acabamento da parede.",
      },
    }),
  ]),
  cat("organizacao", "Organização", "O que faz o quarto funcionar sem perder a beleza.", 4, [
    "Kit higiene",
    "Bandejas",
    "Organizadores de gaveta",
    "Caixas organizadoras",
  ]),
  cat("adornos", "Adornos", "Os detalhes que dão alma e identidade ao ambiente.", 5, [
    "Estantes",
    "Enfeites e objetos",
    "Composições de parede",
  ]),
  cat("extras", "Itens extras", "O que vai além do quarto, para a chegada e os primeiros passeios.", 6, [
    "Mala maternidade",
    "Bolsa de passeio",
    "Canguru",
  ]),
];

export const seedGuide: GuideMeta = {
  name: "O Fim da Dúvida",
  tagline: "Guia de Decisão Estética para o quarto do seu bebê",
  promise: "Você nunca mais vai travar na frente de uma decisão do quarto do seu bebê.",
  priceCents: null, // exibição pública só quando a Helô confirmar no admin
  hotmartUrl: null,
  status: "lista_espera",
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
