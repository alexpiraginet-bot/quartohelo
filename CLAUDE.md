# Quarto da Helô (quartohelo)

Site e **Guia Digital interativo** do estúdio Quarto da Helô (arquitetura, interiores e
curadoria para a primeira infância). É um produto de cliente: o conteúdo é dela, não nosso.

- **Stack:** Next.js 14 (App Router) + TypeScript + Supabase.
- **Deploy:** https://quartohelo.vercel.app (Vercel, automático na `main`).
- **Comandos:** `npm run dev` · `npm run build` · `npm run lint`.

## Mapa

| Caminho | O que é |
|---|---|
| `src/app/page.tsx` | Landing |
| `src/app/guia/` | O Guia Digital interativo (`GuiaApp.tsx`) |
| `src/app/admin/` | Painel de administração (hoje somente leitura) |
| `src/lib/content.ts` | Camada de leitura: Supabase com fallback para o seed |
| `src/lib/db/supabase.ts` | Cliente Supabase |
| `src/data/seed.ts` | Conteúdo semente (o site roda inteiro sem banco) |
| `src/app/layout.tsx` | Fontes, metadados e o `<script>` do widget de suporte |

## Banco (Supabase)

Tabelas com prefixo `qh_`, para conviverem no mesmo projeto sem colidir com outros sistemas:
`qh_site_content`, `qh_categories`, `qh_items`, `qh_suppliers`, `qh_guide_meta`.

`src/lib/content.ts` **nunca lança**: sem Supabase configurado, ou em qualquer falha de leitura,
ele cai para `src/data/seed.ts`. Ou seja, o site não fica no ar dependendo do banco. Ao mexer
nessa camada, **preserve esse fallback**.

## ⚠️ `vercel.json` é obrigatório

```json
{ "framework": "nextjs" }
```

Sem isso a Vercel detecta `framework: null`, serve os estáticos e **todas as rotas do App Router
dão 404**. Já aconteceu. Não remova.

## Voz da marca (regra do dono)

Conteúdo visível do site é comunicação da marca, em português do Brasil:

- **Não use travessões.**
- **Não escreva com cara de texto de IA** (nada de "mergulhe", "eleve", listas de três adjetivos,
  entusiasmo genérico). Frase curta, concreta, afetiva, com o vocabulário do estúdio.
- Texto novo de marca é sugestão até a cliente aprovar. Na dúvida, pergunte.

Isso vale para a interface e o conteúdo. Não vale para comentário de código.

## Informação comercial

Dados de precificação e estratégia de lançamento **não entram no repositório** (nem em código,
README, comentário ou PR). Se precisar de um valor, leia de configuração/banco.

## Suporte

O widget do LEX HUB roda aqui com `data-app="quartohelo"` (ver `src/app/layout.tsx`).

Política do dono para este app: **todo pedido de criação ou alteração vira chamado** para a
equipe aplicar (texto, foto, seção, página, cor, comportamento). A cliente não edita sozinha,
então o Atendente registra o pedido em vez de ensinar autosserviço. O fluxo é
`chamado → aprovação no WhatsApp → a equipe aplica`.

## Convenções

- **Idioma: português.** Commits, PRs, comentários e UI.
- Commit: título imperativo; corpo explicando **causa → correção**.
- Branch `claude/<assunto>`; PR **draft**; nunca commite segredo.
- **Não cite identificadores de modelo de IA** em commits, PRs, código ou docs.
- Antes de concluir: `npm run build` verde e conferência no deploy quando for visual.

## ⚠️ A máquina da sessão volta no tempo

A sessão roda numa máquina efêmera. Quando ela é reciclada, o disco volta para um instantâneo
antigo: o `HEAD` retrocede vários merges e os arquivos das entregas recentes somem. Isso não passa
pelo git, então **não aparece no reflog**.

O sintoma engana: o hook de parada acusa "alterações não commitadas" e pede um commit. Commitar
esse estado **reverteria em produção tudo que já foi mergeado**.

- **A verdade é o GitHub**, nunca o disco. Publique cedo, não acumule trabalho local.
- Antes de editar qualquer coisa, confira onde você está: `git log --oneline -1`.
- Diante de um aviso de "alterações não commitadas", compare o disco inteiro com o `origin/main`
  antes de commitar (índice temporário + `git read-tree` + `git add -A` + `git diff --cached`).
  Se o resultado for só remoção, o disco está velho.
- Conserto: `git fetch origin main && git checkout -f -B <ramo> origin/main`.
- `.claude/hooks/ressincroniza-checkout.sh` faz isso sozinho no início da sessão, e só quando não
  há commit local fora do `origin/main`.

## Pendências conhecidas

- Admin **gravável** (CRUD de categorias, itens, decisões, fornecedores e conteúdo da landing).
- Login por cliente + webhook da plataforma de vendas para provisionar conta.
- Analytics da jornada do Guia (escolhas por item, faixas, conclusão).
- Foto de fundo da primeira página aguardando material oficial da cliente.
