
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company text,
  plan text not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null check (char_length(name) between 1 and 120),
  business_name text check (char_length(business_name) <= 160),
  email text check (char_length(email) <= 255),
  website text check (char_length(website) <= 500),
  phone text check (char_length(phone) <= 40),
  notes text check (char_length(notes) <= 4000),
  created_at timestamptz not null default now()
);
create index on public.clients(user_id);
grant select, insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;
alter table public.clients enable row level security;
create policy "own clients" on public.clients for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.websites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  client_id uuid references public.clients(id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  url text not null check (char_length(url) between 4 and 500),
  created_at timestamptz not null default now(),
  unique (user_id, url)
);
create index on public.websites(user_id);
grant select, insert, update, delete on public.websites to authenticated;
grant all on public.websites to service_role;
alter table public.websites enable row level security;
create policy "own websites" on public.websites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  website_id uuid references public.websites(id) on delete cascade,
  url text not null,
  strategy text not null check (strategy in ('mobile','desktop')),
  performance int, accessibility int, seo int, best_practices int,
  lcp_ms numeric, cls numeric, tbt_ms numeric, fcp_ms numeric, si_ms numeric,
  field_data jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  diagnostics jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.audits(user_id, created_at desc);
create index on public.audits(website_id);
grant select, insert, delete on public.audits to authenticated;
grant all on public.audits to service_role;
alter table public.audits enable row level security;
create policy "own audits" on public.audits for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.audit_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  unique (audit_id)
);
grant select, insert, update, delete on public.audit_reports to authenticated;
grant all on public.audit_reports to service_role;
alter table public.audit_reports enable row level security;
create policy "own reports" on public.audit_reports for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.notification_preferences (
  user_id uuid primary key default auth.uid(),
  audit_complete boolean not null default true,
  weekly_summary boolean not null default false,
  product_updates boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.notification_preferences to authenticated;
grant all on public.notification_preferences to service_role;
alter table public.notification_preferences enable row level security;
create policy "own prefs" on public.notification_preferences for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  insert into public.notification_preferences (user_id) values (new.id) on conflict do nothing;
  return new;
end; $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
