-- Create table for users (synced from Keycloak)
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  role text not null default 'viewer' check (role in ('admin', 'member', 'viewer')),
  display_name text,
  created_at timestamptz default now()
);

-- Create table for issues
create table if not exists issues (
  id uuid default gen_random_uuid() primary key,
  title text not null check (char_length(title) >= 3),
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  created_by uuid references users(id),
  assigned_to uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table issues enable row level security;
alter table users enable row level security;

-- Policies for Issues (Public/Anon access for demo stability without Service Role Key)
create policy "Enable all access for all users" on issues
  for all using (true) with check (true);

-- Policies for Users (Public/Anon access for demo stability)
create policy "Enable all access for all users" on users
  for all using (true) with check (true);
