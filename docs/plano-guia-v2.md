# Plano — Guia Digital v2 · "Collection Nº 01"

> Análise da estrutura atual do projeto + plano de implementação das mudanças
> pedidas no documento de orientações do guia digital (Google Docs, jul/2026).
> Este arquivo é o mapa de trabalho: cada fase abaixo vira um PR.

---

## 1. Raio-X do projeto hoje

**Stack:** Next.js 14 (App Router) + TypeScript + Supabase. Sem framework de UI
(CSS próprio em `globals.css`, fontes Fraunces + Jost, paleta vinho/creme do
Brand Book). Deploy na Vercel. Typecheck limpo.

| Rota | O que é hoje |
|---|---|
| `/` | Landing institucional (herói, quem somos, serviços, bloco do guia, contato). Conteúdo vem do CMS (`qh_site_content`). |
| `/guia` | Guia interativo em **página única**: 6 categorias agrupadas (Mobiliário, Têxteis, Iluminação, Organização, Adornos, Extras) → itens com "decisão" (quando usar / quando não / erro comum / efeito / instalação) → fornecedores por faixa. Moodboard lateral **de texto** (nome do item), progresso em %, escolhas salvas em `localStorage`. |
| `/admin` | Painel somente-leitura: estado do backend, estrutura do guia, blocos da landing. Edição gravável ainda não existe. |

**Camada de dados** (`src/lib/content.ts`): porta única de leitura. Com Supabase
lê as tabelas `qh_*`; sem ele (ou em falha), cai para o seed
(`src/data/seed.ts`) — o site nunca quebra.

**Modelo atual:** `Category → Item → Supplier(tier)` + documentos JSON
(`qh_site_content`, `qh_guide_meta`). Tabelas de cliente/jornada
(`qh_clients`, `qh_client_choices`) já existem no schema, ainda sem uso no app.

**O que o modelo atual NÃO tem** (e o documento pede): páginas de conteúdo do
guia, variação por gênero, opções de produto com foto + preço, personalização
por cliente (nome do bebê / da mãe), menu lateral, análise financeira.

---

## 2. O que o documento pede (requisitos numerados)

Transcrição fiel → requisito rastreável. "R" = requisito.

### Entrada e identidade
- **R1 — Página de entrada:** capa "DO CONCEITO AO ÚLTIMO DETALHE: O guia
  completo para montar o quarto do seu bebê" (Collection Nº 01). Fundo: brasão
  **ou** vídeo de móbile com música.
- **R2 — Nome do bebê na barra superior**, definido ANTES de a mãe acessar o
  link (ou seja: link personalizado por cliente).
- **R3 — Avatar:** trocar a "bola com M" pelo **brasão da Helô** (fundo vinho,
  letra clara) ou manter inicial da mãe.
- **R4 — Saudação "OLÁ, [NOME DA MÃE]"**, também pré-configurada por link.

### Navegação
- **R5 — Menu lateral desde a primeira página** (referência visual: "Foto 1"
  do documento — recebida, ver §4a). Ao lado do menu, a área principal mostra o
  conteúdo da página inicial do guia.
- **R6 — Categorias de conteúdo no menu:**
  1. Sobre nós (conteúdo da pág. 3 do guia original)
  2. Introdução — Como usar esse guia (pág. 4)
  3. Antes de começar (págs. 5 e 6)
  4. Cronograma de montagem (pág. 7)
  5. **MEU PROJETO**
- **R7 — 22 categorias de produto no menu (itens 6–27):** Papel de parede,
  Berço, Cama auxiliar, Cômoda, Armário, Poltrona de amamentação, Mesa lateral,
  Tapete, Cortina, Enxoval berço, Enxoval cama, Almofadas decorativas, Almofada
  de amamentação, Trocador, Porta treco, Arandelas, Abajur, Pendente, Kit
  higiene, Adornos, Mala maternidade, Bolsa de passeio.

### Dentro de cada categoria de produto
- **R8 — Gênero clicável:** MENINA · NEUTRO · MENINO. Ao escolher, abrem as
  **9 opções** do item.
- **R9 — 3 faixas de preço SEMPRE visíveis na mesma página** (sem passo
  "escolha sua faixa"): linha 1 = 3 mais caros, linha 2 = 3 intermediários,
  linha 3 = 3 mais acessíveis.
- **R10 — Check de escolha:** marcar uma opção manda a **foto** dela para o
  moodboard do "Meu Projeto" e o **preço** para a análise financeira.

### Meu Projeto
- **R11 — Moodboard automático** preenchido com as fotos das escolhas.
- **R12 — Análise financeira:** valor item a item + soma total automática.
- **R13 — Preços editáveis:** aviso de que os preços têm data-base; a cliente
  pode alterar manualmente o valor no "Meu Projeto" **ou** na própria categoria
  (sincroniza nos dois sentidos).
- **R14 — Explicação de como funciona** no topo da aba Meu Projeto.

---

## 3. Gap analysis — do que existe para o que precisa existir

| Requisito | Hoje | Mudança |
|---|---|---|
| R1 capa | Não existe (guia abre direto na lista) | Nova tela de entrada com identidade da coleção |
| R2/R4 nomes | Não existe cliente no fluxo | Link personalizado `/guia/[código]` lendo `qh_clients` (+ campos nome do bebê / da mãe) |
| R3 brasão | Não existe avatar | Componente avatar com brasão oficial (asset já existe em `public/images`) |
| R5 menu lateral | Página única com scroll | Novo layout duas colunas: menu fixo + painel de conteúdo |
| R6 páginas de conteúdo | Não existem | Nova entidade `GuidePage` (título + conteúdo rico) editável no admin |
| R7 22 categorias | 6 grupos → 25 itens (sem Papel de parede e Enxoval cama; com itens que saem do menu) | Reestruturar seed/tabelas para as 22 categorias do documento (mantendo os grupos como separadores visuais do menu) |
| R8 gênero | Não existe | Nova dimensão `genero: menina/neutro/menino` nas opções de produto |
| R9 faixas visíveis | Fornecedor por faixa aparece ao clicar na faixa | Grade 3×3 sempre visível, ordenada caro → acessível |
| R10 opções com foto/preço | `Supplier` tem nome/url/foto, sem preço | Nova entidade `ProductOption` (foto, preço, link, fornecedor, gênero, faixa) |
| R11 moodboard de fotos | Moodboard de nomes | Moodboard com as fotos das opções escolhidas |
| R12–R13 financeiro | Não existe | Tabela financeira com soma + override de preço por cliente (localStorage → Supabase) |
| R14 explicação | Não existe | Bloco fixo no topo do Meu Projeto |

**Decisão de arquitetura que isso implica:** o coração da mudança é o modelo de
dados. Hoje a unidade é "item com fornecedores indicados"; o documento pede
"item com **9 opções concretas de produto** (foto + preço) por gênero". A
entidade `Supplier` evolui para `ProductOption`:

```
ProductOption {
  id, itemId,
  genero: 'menina' | 'neutro' | 'menino',
  tier:   'alto' | 'medio' | 'acessivel',
  nome, foto, precoCents, url, fornecedor, observacao
}
```

A "decisão" (quando usar / quando não / erro comum / efeito / instalação) — o
ouro do produto segundo o material da marca — **permanece** em cada categoria,
acima da grade de opções. O formato atual foi aprovado no documento ("Pode
manter esse formato, que está bom").

---

## 4a. Referência visual do menu lateral ("Foto 1" — recebida em 21/07/2026)

Frame de vídeo (15/07/2026) do protótipo inicial que serviu de referência para
a Helô. O que ele define e vamos seguir:

**Sidebar (coluna esquerda, fundo escuro):**
- Logo "Helô" em script no topo.
- Itens de menu com ícone pequeno + rótulo; item ativo com realce (fundo
  destacado). No protótipo: Visão geral · Meu projeto · Cronograma · Moodboard
  · Lista de compras · Orçamento · Fornecedores · Helô AI.
- Rodapé fixo: avatar circular com a inicial da cliente ("M") + nome completo
  ("Marina Albuquerque"). É a "bola com a letra M" citada no documento (R3) —
  aqui entra o brasão da Helô ou a inicial, conforme definição pendente.

**Área de conteúdo (coluna direita, fundo creme):**
- Título grande serifado (ex.: "Lista de compras") — casa com a Fraunces já
  usada no site.
- Abas de filtro com contadores: "Todos · 24", "Aprovados", "Em análise",
  "Pendentes".
- Lista de produtos em linhas: nome (ex.: Berço Lume, Poltrona Nuvem, Pendente
  orgânico, Tapete Trama Areia) + etiqueta da categoria à direita (Mobiliário,
  Iluminação, Têxteis).

**Como conciliar protótipo × documento de orientações:**
- **Estrutura do menu: manda o documento** (Sobre nós, Introdução, Antes de
  começar, Cronograma, MEU PROJETO + 22 categorias de produto). O protótipo é
  anterior às orientações.
- **Estilo visual: manda o protótipo** (sidebar escura com ícones e avatar no
  rodapé, conteúdo creme serifado, abas com contadores).
- Conceitos do protótipo absorvidos pelo documento: "Moodboard" e "Orçamento"
  viraram partes internas do MEU PROJETO; "Lista de compras" vira a visão de
  status das escolhas — os estados Aprovado / Em análise / Pendente do
  protótipo mapeiam bem para os atuais escolhido / em dúvida / sem decisão.
- Entradas do protótipo SEM correspondente no documento: "Fornecedores" (visão
  transversal) e "Helô AI". Ficam fora das fases 1–5; anotadas como ideias a
  validar com a Helô depois do lançamento.

---

## 4. Plano de implementação por fases

Cada fase é um PR independente, com o site sempre funcional (padrão do repo:
seed primeiro, banco depois).

### Fase 1 — Esqueleto novo do guia: menu lateral + capa
- Tela de entrada (R1) com título da coleção e fundo com brasão (vídeo/música
  fica atrás de flag até termos o arquivo).
- Layout duas colunas com menu lateral fixo (R5): páginas de conteúdo (R6),
  Meu Projeto, e as 22 categorias (R7) com separadores por grupo.
- Nova entidade `GuidePage` no seed com placeholders claros ("conteúdo em
  preparação") até recebermos os textos das págs. 3–7 do guia original.
- Responsivo: no celular o menu vira gaveta (hambúrguer).

### Fase 2 — Categoria de produto: gênero + grade 3×3
- Tipos e seed: `ProductOption` com gênero, faixa, foto, preço (R8–R10).
- UI da categoria: decisão no topo, seletor Menina/Neutro/Menino, grade com as
  3 linhas de faixa sempre visíveis, card de opção com foto, nome, preço e
  check "escolher".
- Placeholders elegantes para opções ainda não cadastradas.

### Fase 3 — Meu Projeto: moodboard de fotos + financeiro
- Moodboard automático com fotos (R11).
- Tabela financeira: item a item, total, edição manual de valor com sincronia
  nos dois sentidos e aviso de data-base (R12–R13).
- Bloco "como funciona" no topo (R14).
- Persistência em `localStorage` (mesmo padrão atual), pronta para migrar para
  `qh_client_choices`.

### Fase 4 — Personalização por cliente
- Rota `/guia/[código]`: barra superior com nome do bebê, "OLÁ, [MÃE]" e avatar
  com brasão (R2–R4).
- Campos novos em `qh_clients` (nome da mãe, nome do bebê, código do link).
- Sem código → experiência genérica atual (demo/preview continua funcionando).

### Fase 5 — Banco + admin gravável
- Migração SQL: `qh_guide_pages`, `qh_product_options` (+ colunas de cliente),
  carga do seed.
- Admin: CRUD de opções por categoria/gênero/faixa, edição das páginas de
  conteúdo, criação de cliente com geração de link personalizado.

---

## 5. Pendências — estado em 21/07/2026

1. ~~"Foto 1" do menu lateral~~ **Recebida** (frame do protótipo, ver §4a). O
   menu v2 foi construído seguindo esse estilo, melhorado.
2. **Conteúdo das páginas do guia original** (págs. 3–7): por orientação em
   áudio (21/07), os textos JÁ EXISTEM no guia original e serão enviados/colados
   depois. Até lá as páginas rodam com texto provisório marcado
   ("Texto provisório") e serão editáveis pelo painel.
3. **Catálogo de opções:** por orientação em áudio (21/07), a Helô quer
   preencher ELA MESMA, aos poucos (fotos, nomes, preços), por uma área de
   edição fácil e leiga. A estrutura já está pronta (grade 3×3 por gênero com
   espaços "Em curadoria"); o editor leigo no painel é o PRÓXIMO passo, com
   prioridade máxima.
4. **Vídeo do móbile com música** (se for a escolha para a capa). A capa atual
   usa o brasão sobre o vinho — aprovada como caminho até o vídeo existir.
5. ~~Definição R3 (brasão × inicial)~~ **Resolvida na prática:** o brasão
   oficial chegou em PDF (8 variações de cor) e foi adotado no avatar e na
   capa. Trocar para a inicial da mãe é um ajuste simples se ela preferir.

---

## 6. Execução — diário

### 21/07/2026 — Fundação do Guia v2 entregue (Fases 1–3 em uma base só)

No ar na branch `claude/project-initial-analysis-gi6lmx`:

- **Capa de entrada** (R1): brasão creme sobre vinho, "Do conceito ao último
  detalhe", Collection Nº 01, botão Entrar (lembrada por dispositivo).
- **Menu lateral** (R5–R7) no estilo do protótipo, melhorado: logo script,
  Visão geral, 4 páginas do guia, MEU PROJETO com contador, 22 categorias em 4
  grupos com progresso por grupo (0/7…), pontos de status por item, barra "N de
  22 decididos" e perfil com brasão no rodapé. No celular vira gaveta.
- **Página de categoria** (R8–R10): bloco "A decisão, pelo olhar da Helô",
  seletor Menina/Neutro/Menino (lembrado), grade com as 3 faixas SEMPRE
  visíveis (alto → médio → acessível), 3 espaços por faixa com card de foto,
  preço e "Escolher"; espaços vazios mostram "Em curadoria". Navegação
  anterior/próxima entre as 22 categorias.
- **Meu projeto** (R11–R14): explicação no topo, moodboard com as escolhas
  (foto quando houver; placeholder elegante até lá), análise financeira item a
  item com total automático, valor editável com um toque (ajuste manual
  persistido) e aviso da data-base dos preços.
- **Personalização de pré-visualização** (R2–R4): "Olá, Marina.", "Quarto da
  Aurora" na barra e avatar com brasão — a versão por link real é a Fase 4.
- **Dados**: tipos e seed reestruturados (22 categorias, 4 páginas, catálogo de
  opções por slug/gênero/faixa com exemplos marcados), `getGuiaData()` com
  fallback integral para o seed, tabelas novas no `supabase/schema.sql`
  (`qh_guide_pages`, `qh_product_options`, campos de cliente).
- **Brasão oficial** extraído do PDF (vinho + creme) em `public/images/`.
- Validado com build de produção + screenshots (desktop e mobile).

### 21/07/2026 (2ª entrega) — Painel editor leigo + analytics + melhorias aprovadas

Tudo no ar na branch, commit `eae0ac2`:

- **Editor leigo no `/admin`** (orientação dos áudios: "tudo editável"):
  - Login por senha do painel (`QH_ADMIN_SENHA`, cookie httpOnly). Sem senha,
    o painel fica em visualização e nada grava.
  - Edição das 4 páginas do guia (colar texto + marcar "texto oficial").
  - Edição dos textos de decisão das 22 categorias (quando usar, quando não,
    erro comum, efeito, instalação).
  - CRUD de opções por gênero × faixa: foto (upload direto para o Supabase
    Storage, bucket `qh-fotos`), nome, preço, fornecedor, link. Adicionar,
    editar e excluir; até 3 por faixa (pode deixar menos). Áudio 3 (21/07):
    "editar a foto de cada berço, deletar campo, acrescentar campo, editar
    nome e preço" — atendido.
  - Botão "Preparar o banco": carga idempotente do seed, sem sobrescrever nada
    que ela já tenha editado.
- **Analytics próprio**: coleta anônima via `/api/evento` (visitas ao site e ao
  guia, entradas pela capa, escolhas de item, Meu Projeto, cliques em
  fornecedor, interesse na marcenaria) + dashboard "Acessos" no painel (cartões,
  funil do guia, série diária, itens mais escolhidos). Sem chave de gravação os
  eventos são descartados em silêncio (nunca quebra o site).
- **Order bump da marcenaria** (melhoria aprovada): bloco no Meu Projeto +
  versão compacta em Armário e Cômoda, com evento de interesse e CTA que abre a
  conversa.
- **Cronograma vivo** (melhoria aprovada): a mãe informa a data prevista da
  chegada na página Cronograma; as janelas ganham datas reais, cruzadas com as
  decisões dela ("você está aqui", "janela passada — priorize", ✓ concluída), e
  a Visão geral mostra a contagem de semanas.

### Ir ao ar — runbook (passos que exigem acesso humano)

O código está pronto e o app já roda (lendo do seed). Para ligar banco ao vivo,
editor gravável e analytics, faltam passos que só quem tem as credenciais faz —
o ambiente de dev não consegue religar infra nem gravar segredos na Vercel:

1. **Supabase — religar o projeto** `txdxtwmvehrzwharvgda` ("Novo"), que está
   pausado (INACTIVE). Dashboard → Restore/Resume.
2. **Supabase — criar as tabelas v2**: SQL Editor → colar e rodar
   `supabase/schema.sql` (idempotente; só cria o que falta, prefixo `qh_`).
3. **Vercel → Settings → Environment Variables** (Production):
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase → Project Settings → API → service_role (secret).
   - `QH_ADMIN_SENHA` = uma senha forte à escolha da Helô (libera o `/admin`).
   - Redeploy para aplicar.
4. **No `/admin`**: entrar com a senha → botão "Preparar o banco (1ª vez)" para
   carregar as 22 categorias, as 4 páginas e os exemplos. Pronto: editar à
   vontade e acompanhar os acessos.

Depois disso: Fase 4 (link por cliente com nome do bebê e da mãe) e o restante
das melhorias aprovadas (PDF do projeto, status de compra).

## 7. Riscos e cuidados

- **Peso de imagens:** 22 × 3 × 9 = até ~594 fotos de produto. Usar imagens
  otimizadas (Supabase Storage + tamanhos definidos) desde a Fase 2.
- **Preço com data-base:** gravar `precoBaseEm` junto do preço para o aviso do
  R13 ser automático.
- **Link pessoal sem login:** o código do link é o segredo (padrão Hotmart de
  área de membros simples). Suficiente para o lançamento; login formal pode vir
  depois.
- **Compatibilidade:** a jornada salva hoje (`qh_guia_choices_v1`) muda de
  formato; como ainda não há clientes reais, versionamos a chave para v2 sem
  migração.
