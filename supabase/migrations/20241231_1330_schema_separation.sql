-- Create Schemas
create schema if not exists tenant1;
create schema if not exists tenant2;

-- Grant usage (if needed, simplified for this setup)
grant usage on schema tenant1 to postgres, anon, authenticated, service_role;
grant usage on schema tenant2 to postgres, anon, authenticated, service_role;

-- Tenant 1 Tables
create table if not exists tenant1.issues (
  like public.issues including all
);

create table if not exists tenant1.comments (
  like public.comments including all
);

-- Fix foreign keys for Tenant 1 (point to public.users)
alter table tenant1.issues drop constraint if exists issues_created_by_fkey; -- drop if copied
alter table tenant1.issues drop constraint if exists issues_assigned_to_fkey;
alter table tenant1.issues add constraint issues_created_by_fkey foreign key (created_by) references public.users(id);
alter table tenant1.issues add constraint issues_assigned_to_fkey foreign key (assigned_to) references public.users(id);

alter table tenant1.comments drop constraint if exists comments_issue_id_fkey;
alter table tenant1.comments drop constraint if exists comments_created_by_fkey;
alter table tenant1.comments add constraint comments_issue_id_fkey foreign key (issue_id) references tenant1.issues(id) on delete cascade;
alter table tenant1.comments add constraint comments_created_by_fkey foreign key (created_by) references public.users(id);

-- Enable RLS Tenant 1
alter table tenant1.issues enable row level security;
alter table tenant1.comments enable row level security;
create policy "Enable all access" on tenant1.issues for all using (true) with check (true);
create policy "Enable all access" on tenant1.comments for all using (true) with check (true);


-- Tenant 2 Tables (Identical Structure)
create table if not exists tenant2.issues (
  like public.issues including all
);
create table if not exists tenant2.comments (
  like public.comments including all
);

-- Fix foreign keys for Tenant 2
alter table tenant2.issues drop constraint if exists issues_created_by_fkey;
alter table tenant2.issues drop constraint if exists issues_assigned_to_fkey;
alter table tenant2.issues add constraint issues_created_by_fkey foreign key (created_by) references public.users(id);
alter table tenant2.issues add constraint issues_assigned_to_fkey foreign key (assigned_to) references public.users(id);

alter table tenant2.comments drop constraint if exists comments_issue_id_fkey;
alter table tenant2.comments drop constraint if exists comments_created_by_fkey;
alter table tenant2.comments add constraint comments_issue_id_fkey foreign key (issue_id) references tenant2.issues(id) on delete cascade;
alter table tenant2.comments add constraint comments_created_by_fkey foreign key (created_by) references public.users(id);

-- Enable RLS Tenant 2
alter table tenant2.issues enable row level security;
alter table tenant2.comments enable row level security;
create policy "Enable all access" on tenant2.issues for all using (true) with check (true);
create policy "Enable all access" on tenant2.comments for all using (true) with check (true);

-- Migrate Data (Tenant1 only, assuming existing data is for tenant1)
insert into tenant1.issues select * from public.issues where tenant_id = 'tenant1' or tenant_id = 'default-tenant';
insert into tenant1.comments select * from public.comments where issue_id in (select id from tenant1.issues);

-- (Optional) Clean public tables if desired, but keeping as backup is safer for now.
-- truncate table public.issues cascade; 
