
create extension if not exists pgcrypto;

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  uid text not null unique,
  display text not null,
  created timestamptz not null default now()
);

-- Groups
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created timestamptz not null default now()
);

create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (user_id, group_id)
);

-- Photos
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  uploaded_by uuid references users(id) on delete set null,
  display_name text,
  photo_url text not null,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_group_members_group on group_members (group_id);
create index if not exists idx_group_members_user on group_members (user_id);
create index if not exists idx_photos_group_created on photos (group_id, created_at desc);



