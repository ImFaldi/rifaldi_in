create extension if not exists pgcrypto;

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text not null,
  location text not null,
  period text not null,
  type text not null,
  description text not null,
  description_en text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  date text not null,
  credential_id text not null unique,
  badge text not null default '🏅',
  gradient text not null default 'from-slate-500/15 to-slate-400/5',
  hover_border text not null default 'hover:border-slate-400/40',
  href text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  description text not null,
  description_en text,
  tags text[] not null default '{}',
  href text,
  repo text,
  gradient text not null default 'from-violet-600 via-indigo-600 to-blue-600',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_experiences_updated_at on public.experiences;
create trigger trg_experiences_updated_at
before update on public.experiences
for each row execute function public.set_updated_at();

drop trigger if exists trg_certifications_updated_at on public.certifications;
create trigger trg_certifications_updated_at
before update on public.certifications
for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.experiences enable row level security;
alter table public.certifications enable row level security;
alter table public.projects enable row level security;

-- Untuk akses public read-only (frontend), aktifkan kebijakan ini.
-- create policy "public_read_experiences" on public.experiences for select using (true);
-- create policy "public_read_certifications" on public.certifications for select using (true);
-- create policy "public_read_projects" on public.projects for select using (true);
