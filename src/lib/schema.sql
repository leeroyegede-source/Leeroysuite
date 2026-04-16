
-- Enable extensions
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- 1. Users Table (Updated to match db.ts)
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  name text,         -- Matches db.ts
  role text default 'user',   -- Matches db.ts
  status text default 'active', -- Matches db.ts
  password text,     -- Matches db.ts
  disabled_features text[] default '{}', -- Matches db.ts
  avatar_url text,
  billing_address jsonb,
  payment_method jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Fix for existing users table if it uses full_name
do $$
begin
    if exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'full_name') then
        alter table users rename column full_name to name;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'name') then
        alter table users add column name text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'role') then
        alter table users add column role text default 'user';
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'status') then
        alter table users add column status text default 'active';
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'password') then
        alter table users add column password text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'disabled_features') then
        alter table users add column disabled_features text[] default '{}';
    end if;
end $$;

alter table users enable row level security;

-- Password Reset Tokens
create table if not exists reset_tokens (
    id uuid default uuid_generate_v4() primary key,
    email text references users(email) on delete cascade,
    otp text not null,
    expires_at timestamptz not null,
    created_at timestamptz default now()
);
alter table reset_tokens enable row level security;



-- 2. User Balances
create table if not exists user_balances (
    email text primary key references users(email) on delete cascade,
    balance int default 0,
    updated_at timestamptz default now()
);
alter table user_balances enable row level security;

-- 3. Token Logs
create table if not exists token_logs (
    id uuid default uuid_generate_v4() primary key,
    email text references users(email) on delete cascade,
    amount int,
    action text,
    feature text,
    timestamp timestamptz default now()
);
alter table token_logs enable row level security;

-- 4. System Settings
create table if not exists system_settings (
    id int primary key,
    default_tokens int,
    ai_limits jsonb,
    payment_enabled boolean,
    payment_gateway text default 'stripe',
    stripe_public_key text,
    stripe_secret_key text,
    paypal_client_id text,
    paypal_client_secret text,
    paypal_mode text default 'sandbox',

    site_name text,
    site_url text,
    smtp_config jsonb,
    metadata jsonb,
    updated_at timestamptz default now()
);

-- Fix for existing system_settings table
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'system_settings' and column_name = 'site_name') then
        alter table system_settings add column site_name text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'system_settings' and column_name = 'site_url') then
        alter table system_settings add column site_url text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'system_settings' and column_name = 'smtp_config') then
        alter table system_settings add column smtp_config jsonb;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'system_settings' and column_name = 'updated_at') then
        alter table system_settings add column updated_at timestamptz default now();
    end if;
    -- Payment gateway columns
    if not exists (select 1 from information_schema.columns where table_name = 'system_settings' and column_name = 'payment_gateway') then
        alter table system_settings add column payment_gateway text default 'stripe';
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'system_settings' and column_name = 'paypal_client_id') then
        alter table system_settings add column paypal_client_id text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'system_settings' and column_name = 'paypal_client_secret') then
        alter table system_settings add column paypal_client_secret text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'system_settings' and column_name = 'paypal_mode') then
        alter table system_settings add column paypal_mode text default 'sandbox';
    end if;




end $$;

alter table system_settings enable row level security;

-- 5. Pricing Plans
create table if not exists pricing_plans (
    id text primary key,
    name text,
    price int,
    tokens int,
    interval text,
    features text[],
    ai_tools text[] default '{}',
    is_active boolean
);

-- Fix for existing pricing_plans table
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'pricing_plans' and column_name = 'ai_tools') then
        alter table pricing_plans add column ai_tools text[] default '{}';
    end if;
end $$;

alter table pricing_plans enable row level security;

-- 6. Payments
create table if not exists payments (
    id text primary key,
    user_id uuid references users(id),
    user_email text,
    plan_id text references pricing_plans(id),
    amount int,
    status text,
    payment_gateway text default 'stripe',
    created_at timestamptz default now()
);

-- Fix for existing payments table
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'payments' and column_name = 'payment_gateway') then
        alter table payments add column payment_gateway text default 'stripe';
    end if;
end $$;

alter table payments enable row level security;

-- 7. Subscriptions (referenced in getUserPlan)
create table if not exists subscriptions (
    id text primary key,
    user_email text references users(email),
    plan_id text references pricing_plans(id),
    status text,
    created_at timestamptz default now()
);
alter table subscriptions enable row level security;

-- 8. Websites
create table if not exists websites (
    id uuid default uuid_generate_v4() primary key,
    user_email text references users(email) on delete cascade,
    name text,
    code text,
    messages jsonb,
    preview_image text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Fix for existing websites table
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'websites' and column_name = 'user_email') then
        -- Add user_email column
        alter table websites add column user_email text;
        
        -- Try to populate user_email from user_id if it exists
        if exists (select 1 from information_schema.columns where table_name = 'websites' and column_name = 'user_id') then
            update websites w set user_email = u.email from users u where w.user_id = u.id;
        end if;
        
        -- Add foreign key
        alter table websites add constraint websites_user_email_fkey foreign key (user_email) references users(email) on delete cascade;
    end if;

    -- Drop old user_id and its constraint if they exist
    if exists (select 1 from information_schema.columns where table_name = 'websites' and column_name = 'user_id') then
        -- We don't drop it immediately to avoid data loss if migration fails, 
        -- but for this project's style we can be bold or just leave it.
        -- Let's drop the constraint at least to stop the error.
        alter table websites drop constraint if exists websites_user_id_fkey;
    end if;
end $$;

alter table websites enable row level security;



-- 9. Documents (RAG)
create table if not exists documents (
  id uuid default uuid_generate_v4() primary key,
  user_email text references users(email) on delete cascade,
  name text not null,
  status text not null check (status in ('processing', 'completed', 'error')) default 'processing',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_documents_user on documents(user_email);
alter table documents enable row level security;

-- 10. Document Chunks (RAG)
create table if not exists document_chunks (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references documents(id) on delete cascade,
  content text,
  embedding vector(768),
  fts tsvector generated always as (to_tsvector('english', content)) stored,
  created_at timestamptz default now()
);

-- Ensure columns exist for older installations
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='document_chunks' and column_name='fts') then
    alter table document_chunks add column fts tsvector generated always as (to_tsvector('english', content)) stored;
  end if;
end $$;

create index if not exists idx_document_chunks_fts on document_chunks using gin(fts);
drop index if exists idx_document_chunks_embedding;
create index if not exists idx_document_chunks_embedding on document_chunks using hnsw (embedding vector_cosine_ops);
alter table document_chunks enable row level security;


-- 11. Languages (i18n)
create table if not exists languages (
    id uuid default uuid_generate_v4() primary key,
    code text unique not null,
    name text not null,
    direction text default 'ltr' check (direction in ('ltr', 'rtl')),
    is_enabled boolean default true,
    created_at timestamptz default now()
);
alter table languages enable row level security;

-- 12. Translations (i18n)
create table if not exists translations (
    id uuid default uuid_generate_v4() primary key,
    translation_key text not null,
    language_code text references languages(code) on delete cascade,
    value text not null default '',
    updated_at timestamptz default now(),
    unique(translation_key, language_code)
);
create index if not exists idx_translations_key on translations(translation_key);
create index if not exists idx_translations_lang on translations(language_code);
alter table translations enable row level security;

-- RLS Policies for i18n tables (allow service role full access)
do $$
begin
    if not exists (select 1 from pg_policies where tablename = 'languages' and policyname = 'Allow full access on languages') then
        create policy "Allow full access on languages" on languages for all using (true) with check (true);
    end if;
    if not exists (select 1 from pg_policies where tablename = 'translations' and policyname = 'Allow full access on translations') then
        create policy "Allow full access on translations" on translations for all using (true) with check (true);
    end if;
end $$;



-- 13. Matching Function
create or replace function match_document_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_email text
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
language plpgsql
stable
as $$
begin
  return query
    select
      dc.id,
      dc.document_id,
      dc.content,
      (1 - (dc.embedding <=> query_embedding))::float as similarity
    from document_chunks dc
    join documents d on d.id = dc.document_id
    where LOWER(d.user_email) = LOWER(p_user_email)
      and (1 - (dc.embedding <=> query_embedding)) > match_threshold
    order by dc.embedding <=> query_embedding
    limit match_count;
end;
$$;

-- Keyword search fallback
create or replace function keyword_search_chunks(
  query_text text,
  match_count int,
  p_user_email text
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
language plpgsql
stable
as $$
begin
  return query(
    select
      dc.id,
      dc.document_id,
      dc.content,
      ts_rank(dc.fts, websearch_to_tsquery('english', query_text)) as similarity
    from document_chunks dc
    join documents d on d.id = dc.document_id
    where LOWER(d.user_email) = LOWER(p_user_email)
    and dc.fts @@ websearch_to_tsquery('english', query_text)
    order by similarity desc
    limit match_count
  );
end;
$$;

-- 14. Meetings (AI Meeting - Real-time Video/Chat)
create table if not exists meetings (
    id text primary key,
    title text not null default 'Untitled Meeting',
    host_email text references users(email) on delete set null,
    status text default 'active' check (status in ('active', 'ended')),
    max_participants int default 8,
    created_at timestamptz default now(),
    ended_at timestamptz
);
create index if not exists idx_meetings_host on meetings(host_email);
create index if not exists idx_meetings_status on meetings(status);
alter table meetings enable row level security;

do $$
begin
    if not exists (select 1 from pg_policies where tablename = 'meetings' and policyname = 'Allow full access on meetings') then
        create policy "Allow full access on meetings" on meetings for all using (true) with check (true);
    end if;
end $$;
