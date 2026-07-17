# Quarto da Helô

Plataforma do **Quarto da Helô** — estúdio criativo de arquitetura e curadoria assinada
para a primeira infância. Reúne a landing institucional e o **Guia digital** interativo,
tudo alimentado por um painel de conteúdo (nada é editado no código).

## Arquitetura

Next.js 14 (App Router) + TypeScript + Supabase.

- `/` — landing (Quem somos · Como trabalhamos · Guia digital · Contato).
- `/guia` — Guia digital interativo: o cliente decide item por item (quando usar, quando
  não, erro comum, efeito) e vê o **moodboard** se montar em tempo real.
- `/admin` — painel da Helô: estrutura do guia, situação do produto e blocos da landing.

O conteúdo vem do **Supabase** quando conectado. Sem as variáveis de ambiente, o app roda
inteiro sobre a estrutura semente (`src/data/seed.ts`) — nunca fica no ar quebrado. Ao
preencher as variáveis, o mesmo código passa a ler e gravar no banco.

### Conectar o backend

1. Criar um projeto no [Supabase](https://supabase.com).
2. Rodar `supabase/schema.sql` no SQL Editor (tabelas + políticas de acesso).
3. Definir as variáveis (ver `.env.example`) — localmente em `.env.local`, no Vercel em
   *Project Settings > Environment Variables*:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (somente servidor)

### Rodar local

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
```

## Padrão Lex

Segue a esteira padrão: **repo (GitHub) → deploy (Vercel) → suporte (widget) →
Engenheiro → aprovação**. O widget de suporte está embutido (`data-app="quartohelo"`),
então qualquer ajuste é relatado pela própria tela e o chamado chega ao hub.

## Estrutura

```
src/
  app/            rotas (/, /guia, /admin) + layout + globals.css
  data/seed.ts    estrutura inicial (vira carga do banco ao conectar)
  lib/            types, camada de conteúdo e cliente Supabase
supabase/         schema.sql (tabelas + RLS)
public/images/    identidade oficial (logo, estampas)
```
