-- Create table for comments
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  issue_id uuid references issues(id) on delete cascade,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Enable RLS for comments
alter table comments enable row level security;

-- Policies for Comments
create policy "Enable all access for all users" on comments
  for all using (true) with check (true);

-- Add deleted_at to issues and users if not exists (idempotent)
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'issues' and column_name = 'deleted_at') then
    alter table issues add column deleted_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'deleted_at') then
    alter table users add column deleted_at timestamptz;
  end if;
end $$;
