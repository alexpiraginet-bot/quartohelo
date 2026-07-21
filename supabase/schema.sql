-- Quarto da Helô — esquema do banco (Supabase / Postgres).
-- As tabelas usam prefixo qh_ porque coabitam com outro produto no mesmo
-- projeto Supabase. Leitura do conteúdo é pública (site + guia); escrita é só
-- pela service role (admin). Já está aplicado; este arquivo é a fonte fiel do
-- schema para reprovisionar quando precisar.

-- ------------------------- CONTEÚDO DO GUIA -------------------------
create table if not exists qh_categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  intro text,
  "order" int not null default 0
);

create table if not exists qh_items (
  id text primary key,
  category_id text references qh_categories(id) on delete cascade,
  slug text not null,
  name text not null,
  summary text,
  photo_url text,
  decision jsonb not null default '{}'::jsonb,   -- quandoUsar/quandoNao/erroComum/efeito/instalacao
  "order" int not null default 0,
  published boolean not null default true
);
create index if not exists qh_items_category_idx on qh_items(category_id);

create table if not exists qh_suppliers (
  id text primary key default gen_random_uuid()::text,
  item_id text references qh_items(id) on delete cascade,
  tier text not null check (tier in ('acessivel','medio','alto')),
  name text not null,
  url text,
  photo_url text,
  note text
);
create index if not exists qh_suppliers_item_idx on qh_suppliers(item_id);

-- ------------------------- CMS (landing + guia) -------------------------
-- Documentos únicos editados no admin (json flexível para a Helô mudar textos/fotos).
create table if not exists qh_site_content ( id text primary key, data jsonb not null );
create table if not exists qh_guide_meta   ( id text primary key, data jsonb not null );

-- ------------------------- GUIA v2 (Collection Nº 01) -------------------------
-- Páginas de conteúdo do menu (Sobre nós, Como usar, Antes de começar, Cronograma).
create table if not exists qh_guide_pages (
  slug text primary key,
  title text not null,
  eyebrow text,
  paragraphs jsonb not null default '[]'::jsonb,
  ready boolean not null default false,      -- false = texto provisório
  "order" int not null default 0
);

-- Catálogo de opções por categoria: gênero × faixa, com foto e preço.
-- Ancorado por SLUG do item para a Helô preencher aos poucos pelo painel.
create table if not exists qh_product_options (
  id text primary key default gen_random_uuid()::text,
  item_slug text not null,
  genero text not null check (genero in ('menina','neutro','menino')),
  tier text not null check (tier in ('acessivel','medio','alto')),
  name text not null,
  photo_url text,
  price_cents int,                            -- null = valor em definição
  url text,
  supplier text,
  note text,
  exemplo boolean not null default false,     -- dado de demonstração
  "order" int not null default 0
);
create index if not exists qh_options_item_idx on qh_product_options(item_slug, genero, tier);

-- ------------------------- CLIENTES E JORNADA -------------------------
create table if not exists qh_clients (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  hotmart_transaction text,
  created_at timestamptz not null default now()
);
-- Personalização do guia por link (Fase 4): nome da mãe, do bebê e código de acesso.
alter table qh_clients add column if not exists mother_name text;
alter table qh_clients add column if not exists baby_name text;
alter table qh_clients add column if not exists access_code text unique;

-- A jornada personalizada: cada escolha da cliente vira o moodboard dela.
create table if not exists qh_client_choices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references qh_clients(id) on delete cascade,
  item_id text references qh_items(id) on delete cascade,
  supplier_id text,
  status text not null default 'escolhido' check (status in ('escolhido','pulado','duvida')),
  note text,
  updated_at timestamptz not null default now(),
  unique(client_id, item_id)
);
create index if not exists qh_choices_client_idx on qh_client_choices(client_id);

-- ------------------------- ANÁLISE -------------------------
create table if not exists qh_analytics_events (
  id bigint generated always as identity primary key,
  kind text not null,               -- ex.: 'view_landing', 'lead', 'guia_progresso'
  client_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists qh_analytics_kind_idx on qh_analytics_events(kind, created_at);

-- ------------------------- RLS -------------------------
-- Conteúdo é público para leitura; escrita só pela service role (bypassa RLS).
alter table qh_categories      enable row level security;
alter table qh_items           enable row level security;
alter table qh_suppliers       enable row level security;
alter table qh_site_content    enable row level security;
alter table qh_guide_meta      enable row level security;
alter table qh_guide_pages     enable row level security;
alter table qh_product_options enable row level security;

do $$ begin
  create policy "qh leitura publica" on qh_categories      for select using (true);
  create policy "qh leitura publica" on qh_items           for select using (true);
  create policy "qh leitura publica" on qh_suppliers       for select using (true);
  create policy "qh leitura publica" on qh_site_content    for select using (true);
  create policy "qh leitura publica" on qh_guide_meta      for select using (true);
  create policy "qh leitura publica" on qh_guide_pages     for select using (true);
  create policy "qh leitura publica" on qh_product_options for select using (true);
exception when duplicate_object then null; end $$;

-- qh_clients / qh_client_choices / qh_analytics_events ficam SEM policy pública:
-- só a service role (admin e rotas de servidor) acessa. RLS ligado, zero policy = negado a anon.
alter table qh_clients          enable row level security;
alter table qh_client_choices   enable row level security;
alter table qh_analytics_events enable row level security;
