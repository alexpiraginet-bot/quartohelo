-- Quarto da Helô — esquema do banco (Supabase / Postgres).
-- Rode isto no SQL Editor do projeto Supabase depois de criá-lo.
-- Leitura do conteúdo é pública (site + guia); escrita é só pela service role (admin).

-- ------------------------- CONTEÚDO DO GUIA -------------------------
create table if not exists categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  intro text,
  "order" int not null default 0
);

create table if not exists items (
  id text primary key,
  category_id text references categories(id) on delete cascade,
  slug text not null,
  name text not null,
  summary text,
  photo_url text,
  decision jsonb not null default '{}'::jsonb,   -- quandoUsar/quandoNao/erroComum/efeito/instalacao
  "order" int not null default 0,
  published boolean not null default true
);
create index if not exists items_category_idx on items(category_id);

create table if not exists suppliers (
  id text primary key default gen_random_uuid()::text,
  item_id text references items(id) on delete cascade,
  tier text not null check (tier in ('acessivel','medio','alto')),
  name text not null,
  url text,
  photo_url text,
  note text
);
create index if not exists suppliers_item_idx on suppliers(item_id);

-- ------------------------- CMS (landing + guia) -------------------------
-- Documentos únicos editados no admin (json flexível para a Helô mudar textos/fotos).
create table if not exists site_content ( id text primary key, data jsonb not null );
create table if not exists guide_meta   ( id text primary key, data jsonb not null );

-- ------------------------- CLIENTES E JORNADA -------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  hotmart_transaction text,
  created_at timestamptz not null default now()
);

-- A jornada personalizada: cada escolha da cliente vira o moodboard dela.
create table if not exists client_choices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  item_id text references items(id) on delete cascade,
  supplier_id text,
  status text not null default 'escolhido' check (status in ('escolhido','pulado','duvida')),
  note text,
  updated_at timestamptz not null default now(),
  unique(client_id, item_id)
);
create index if not exists choices_client_idx on client_choices(client_id);

-- ------------------------- ANÁLISE -------------------------
create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  kind text not null,               -- ex.: 'view_landing', 'lead', 'guia_progresso'
  client_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analytics_kind_idx on analytics_events(kind, created_at);

-- ------------------------- RLS -------------------------
-- Conteúdo é público para leitura; escrita só pela service role (bypassa RLS).
alter table categories   enable row level security;
alter table items        enable row level security;
alter table suppliers    enable row level security;
alter table site_content enable row level security;
alter table guide_meta   enable row level security;

do $$ begin
  create policy "leitura pública" on categories   for select using (true);
  create policy "leitura pública" on items        for select using (true);
  create policy "leitura pública" on suppliers    for select using (true);
  create policy "leitura pública" on site_content for select using (true);
  create policy "leitura pública" on guide_meta   for select using (true);
exception when duplicate_object then null; end $$;

-- clients / client_choices / analytics_events ficam SEM policy pública:
-- só a service role (admin e rotas de servidor) acessa. RLS ligado, zero policy = negado a anon.
alter table clients          enable row level security;
alter table client_choices   enable row level security;
alter table analytics_events enable row level security;
