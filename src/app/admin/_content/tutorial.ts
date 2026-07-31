/* Conteúdo da aba Tutorial do painel.
 *
 * COMO MANTER: este arquivo é a fonte única da ajuda que a Helô lê. A cada
 * entrega que mexer no painel (campo novo, tela nova, botão que mudou de
 * lugar), atualize a tarefa correspondente aqui no mesmo commit. Se a ajuda
 * ficar velha, ela atrapalha mais do que ajuda.
 *
 * COMO ESCREVER: uma tarefa é algo que a Helô quer fazer ("trocar a foto do
 * portfólio"), não um recurso do sistema. Passo curto, na ordem em que ela
 * clica, com o nome exato do que aparece na tela entre aspas. Sem jargão.
 */

export interface TutorialStep {
  /** O passo, começando por um verbo. */
  text: string;
  /** Observação curta só quando evita um erro comum. */
  note?: string;
}

export interface TutorialTask {
  id: string;
  title: string;
  /** Uma linha dizendo o que muda no site quando ela faz isso. */
  result: string;
  /** Tela do painel onde a tarefa começa. */
  href: string;
  hrefLabel: string;
  steps: TutorialStep[];
}

export interface TutorialSection {
  id: string;
  title: string;
  intro: string;
  tasks: TutorialTask[];
}

/** Regras que valem para tudo, mostradas antes das tarefas. */
export const TUTORIAL_BASICS: TutorialStep[] = [
  {
    text: "Nada vai para o site enquanto você não clicar no botão de salvar daquela tela.",
    note: "Cada bloco tem o próprio botão. Salvar o Site não salva as Páginas do guia, e vice-versa.",
  },
  {
    text: "Depois de salvar, abra “Ver a Landing Page” ou “Ver o guia” no menu de cima para conferir.",
    note: "Abre em outra aba, então você não perde o que estava editando.",
  },
  {
    text: "Campo em branco costuma significar “usar o padrão” ou “não mostrar”.",
    note: "É assim que você tira uma frase do ar sem precisar da gente.",
  },
  {
    text: "As fotos são otimizadas sozinhas quando você anexa. Pode mandar a foto grande.",
  },
];

export const TUTORIAL: TutorialSection[] = [
  {
    id: "site",
    title: "Landing page",
    intro: "A página que abre em quartodahelo.com.",
    tasks: [
      {
        id: "texto-landing",
        title: "Trocar um texto da landing",
        result: "O texto muda na hora para quem abrir o site.",
        href: "/admin/site",
        hrefLabel: "Abrir Site (landing)",
        steps: [
          { text: "Entre em “Site (landing)”." },
          { text: "Procure o bloco pelo nome: Início, Sobre nós, Como trabalhamos, Portfólio, Contato ou Rodapé." },
          { text: "Escreva no campo." },
          { text: "Desça até o fim e clique em “Salvar o site”." },
        ],
      },
      {
        id: "foto-card",
        title: "Colocar foto num card de “Nossas entregas”",
        result: "A foto entra no card, no topo ou como fundo.",
        href: "/admin/site",
        hrefLabel: "Abrir Site (landing)",
        steps: [
          { text: "Em “Site (landing)”, vá até “Como trabalhamos” e escolha o card." },
          { text: "Em “Imagem do card”, escolha “Foto no topo” ou “Foto de fundo”." },
          { text: "Clique em “Anexar imagem” e escolha a foto." },
          {
            text: "Em “Opacidade da foto”, escolha 90%, 80% ou 50%.",
            note: "90% mostra a foto mais forte. 50% deixa mais suave. O texto do card não muda de cor.",
          },
          { text: "Clique em “Salvar o site”." },
        ],
      },
      {
        id: "portfolio",
        title: "Publicar fotos no Portfólio",
        result: "As fotos entram no carrossel, que passa sozinho e também pela seta.",
        href: "/admin/site",
        hrefLabel: "Abrir Site (landing)",
        steps: [
          { text: "Em “Site (landing)”, desça até “Portfólio”." },
          { text: "Clique em “+ adicionar foto”." },
          { text: "Clique em “Anexar imagem” e escolha a foto." },
          { text: "Se quiser, escreva a descrição da foto.", note: "Ajuda quem usa leitor de tela e aparece se a foto não carregar." },
          { text: "Use as setas ↑ ↓ para mudar a ordem em que elas aparecem." },
          { text: "Clique em “Salvar o site”." },
        ],
      },
      {
        id: "fundo-inicio",
        title: "Trocar a foto de fundo do Início",
        result: "A foto entra atrás do título da primeira tela.",
        href: "/admin/site",
        hrefLabel: "Abrir Site (landing)",
        steps: [
          { text: "Em “Site (landing)”, vá em “Início (hero)”." },
          { text: "Em “Foto de fundo do Início”, clique em “Anexar imagem”." },
          { text: "Escolha a opacidade.", note: "Quanto maior, mais a foto aparece. O título continua legível de qualquer jeito." },
          { text: "Clique em “Salvar o site”." },
          { text: "Para voltar ao fundo vinho, clique em “Remover” na foto e salve." },
        ],
      },
      {
        id: "whatsapp",
        title: "Mudar o WhatsApp ou o horário de atendimento",
        result: "Muda o número em todos os botões do site de uma vez.",
        href: "/admin/site",
        hrefLabel: "Abrir Site (landing)",
        steps: [
          { text: "Em “Site (landing)”, vá no bloco “Contato”." },
          { text: "Escreva o número em “WhatsApp”.", note: "Só o número. O link dos botões é montado sozinho a partir dele." },
          { text: "Ajuste “Horário de atendimento” se precisar." },
          { text: "Clique em “Salvar o site”." },
        ],
      },
    ],
  },
  {
    id: "guia",
    title: "Guia Digital",
    intro: "As páginas que a cliente lê dentro do guia.",
    tasks: [
      {
        id: "texto-guia",
        title: "Trocar o texto de uma página do guia",
        result: "O texto muda na hora na aba correspondente do guia.",
        href: "/admin/paginas",
        hrefLabel: "Abrir Páginas do guia",
        steps: [
          { text: "Entre em “Páginas do guia” e clique na página." },
          { text: "Escreva em “Texto da página”." },
          {
            text: "Deixe uma linha em branco entre um parágrafo e outro.",
            note: "Se começar a linha com um tracinho, ela vira item de lista com bolinha.",
          },
          { text: "Clique em “Salvar página”." },
        ],
      },
      {
        id: "fundo-pagina-guia",
        title: "Colocar foto de fundo numa página do guia",
        result: "A foto entra atrás do conteúdo daquela página.",
        href: "/admin/paginas",
        hrefLabel: "Abrir Páginas do guia",
        steps: [
          { text: "Abra a página em “Páginas do guia”." },
          { text: "Em “Imagem de fundo”, clique em “Anexar imagem”." },
          { text: "Escolha a opacidade da foto." },
          { text: "Clique em “Salvar página”." },
        ],
      },
      {
        id: "card-cuide",
        title: "Editar o card “Prefere que a gente cuide de tudo?”",
        result: "Muda o convite que aparece no Meu projeto e nas páginas de Armário e Cômoda.",
        href: "/admin/paginas/meu-projeto",
        hrefLabel: "Abrir Meu projeto",
        steps: [
          { text: "Entre em “Páginas do guia” e abra “Meu projeto”." },
          { text: "Desça até o bloco do card." },
          { text: "Ajuste a linha de cima, o título, o texto e o texto do botão." },
          { text: "Se quiser, escolha uma foto e a opacidade dela." },
          {
            text: "Clique em “Salvar card”.",
            note: "Campo deixado em branco volta ao texto padrão. Dá para limpar sem quebrar nada.",
          },
        ],
      },
    ],
  },
  {
    id: "catalogo",
    title: "Catálogo",
    intro: "Os itens do quarto e as opções de compra que a cliente vê.",
    tasks: [
      {
        id: "textos-item",
        title: "Escrever a decisão de um item",
        result: "Preenche o “Quando usar”, “Quando não usar” e a Dica da Helô daquele item.",
        href: "/admin/catalogo",
        hrefLabel: "Abrir Catálogo",
        steps: [
          { text: "Entre em “Catálogo” e clique no item." },
          { text: "Preencha os campos de texto." },
          { text: "Se quiser, coloque foto no “Quando usar” e no “Quando não usar”." },
          { text: "Clique em “Salvar textos”." },
        ],
      },
      {
        id: "opcoes",
        title: "Adicionar uma opção de produto",
        result: "Entra na grade de opções do item, na variação e na faixa escolhidas.",
        href: "/admin/catalogo",
        hrefLabel: "Abrir Catálogo",
        steps: [
          { text: "Entre em “Catálogo” e clique no item." },
          { text: "Escolha a variação: Menina, Neutro ou Menino." },
          { text: "Ache a faixa (alto padrão, médio, acessível) e use o quadro vazio." },
          { text: "Anexe a foto, escreva o nome, o preço e o link." },
          { text: "Clique em “Adicionar ao guia”.", note: "Cada faixa aceita até 3 opções. Para trocar, exclua uma antes." },
        ],
      },
    ],
  },
];

/** Quando algo não sai como ela esperava. */
export const TUTORIAL_TROUBLE: { q: string; a: string }[] = [
  {
    q: "Salvei e não mudou nada no site.",
    a: "Atualize a página do site com F5. Se ainda assim não mudar, confira se você clicou no botão de salvar daquele bloco: cada tela tem o seu.",
  },
  {
    q: "Escolhi a opacidade e a foto parece igual.",
    a: "A diferença entre 80% e 90% é sutil por natureza. Para uma mudança bem visível, compare 50% com 90%.",
  },
  {
    q: "Apaguei um texto sem querer.",
    a: "Escreva de novo e salve. Não existe desfazer por enquanto, então na dúvida copie o texto antes de apagar.",
  },
  {
    q: "A foto ficou torta ou cortada.",
    a: "O corte é automático para caber no espaço. Fotos na horizontal costumam funcionar melhor nos fundos e nos topos de card.",
  },
  {
    q: "Perdi o acesso ao painel.",
    a: "Fale com a gente pelo WhatsApp. A senha pode ser trocada na tela Início do painel, em “Trocar senha”.",
  },
];
