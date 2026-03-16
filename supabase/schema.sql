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

alter table public.experiences
  add column if not exists status text not null default 'published',
  add column if not exists deleted_at timestamptz;

alter table public.experiences
  drop constraint if exists experiences_status_check;
alter table public.experiences
  add constraint experiences_status_check check (status in ('draft', 'review', 'published'));

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

alter table public.certifications
  add column if not exists status text not null default 'published',
  add column if not exists deleted_at timestamptz;

alter table public.certifications
  drop constraint if exists certifications_status_check;
alter table public.certifications
  add constraint certifications_status_check check (status in ('draft', 'review', 'published'));

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

alter table public.projects
  add column if not exists status text not null default 'published',
  add column if not exists deleted_at timestamptz;

alter table public.projects
  drop constraint if exists projects_status_check;
alter table public.projects
  add constraint projects_status_check check (status in ('draft', 'review', 'published'));

create table if not exists public.educations (
  id uuid primary key default gen_random_uuid(),
  degree text not null,
  institution text not null,
  location text not null,
  period text not null,
  description text not null,
  description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.educations
  add column if not exists status text not null default 'published',
  add column if not exists deleted_at timestamptz;

alter table public.educations
  drop constraint if exists educations_status_check;
alter table public.educations
  add constraint educations_status_check check (status in ('draft', 'review', 'published'));

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  slug text not null unique,
  excerpt text not null,
  excerpt_en text,
  content text not null,
  content_en text,
  cover_image text,
  read_time text not null default '5 min read',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blogs
  add column if not exists status text not null default 'published',
  add column if not exists deleted_at timestamptz;

alter table public.blogs
  drop constraint if exists blogs_status_check;
alter table public.blogs
  add constraint blogs_status_check check (status in ('draft', 'review', 'published'));

create table if not exists public.dashboard_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'editor',
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dashboard_users
  add column if not exists role text not null default 'editor';

alter table public.dashboard_users
  drop constraint if exists dashboard_users_role_check;
alter table public.dashboard_users
  add constraint dashboard_users_role_check check (role in ('admin', 'editor'));

create table if not exists public.dashboard_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.dashboard_users(id) on delete set null,
  user_email text,
  user_role text,
  action text not null,
  resource text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_dashboard_audit_logs_created_at
  on public.dashboard_audit_logs(created_at desc);

create index if not exists idx_dashboard_audit_logs_resource
  on public.dashboard_audit_logs(resource, created_at desc);

create index if not exists idx_dashboard_users_email
  on public.dashboard_users(email);

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

drop trigger if exists trg_educations_updated_at on public.educations;
create trigger trg_educations_updated_at
before update on public.educations
for each row execute function public.set_updated_at();

drop trigger if exists trg_blogs_updated_at on public.blogs;
create trigger trg_blogs_updated_at
before update on public.blogs
for each row execute function public.set_updated_at();

drop trigger if exists trg_dashboard_users_updated_at on public.dashboard_users;
create trigger trg_dashboard_users_updated_at
before update on public.dashboard_users
for each row execute function public.set_updated_at();

alter table public.experiences enable row level security;
alter table public.certifications enable row level security;
alter table public.projects enable row level security;
alter table public.educations enable row level security;
alter table public.blogs enable row level security;
alter table public.dashboard_users enable row level security;
alter table public.dashboard_audit_logs enable row level security;

-- Untuk akses public read-only (frontend), aktifkan kebijakan ini.
-- create policy "public_read_experiences" on public.experiences for select using (true);
-- create policy "public_read_certifications" on public.certifications for select using (true);
-- create policy "public_read_projects" on public.projects for select using (true);
-- create policy "public_read_educations" on public.educations for select using (true);
-- create policy "public_read_blogs" on public.blogs for select using (true);
