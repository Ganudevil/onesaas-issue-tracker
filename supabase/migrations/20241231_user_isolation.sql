-- Create Users tables in tenants (copy structure from public)
create table if not exists tenant1.users (
  like public.users including all
);
create table if not exists tenant2.users (
  like public.users including all
);

-- Copy data (Seed)
insert into tenant1.users select * from public.users;
insert into tenant2.users select * from public.users;

-- Update Constraints in Tenant1
-- Issues -> Tenant1.Users
alter table tenant1.issues drop constraint if exists issues_created_by_fkey;
alter table tenant1.issues drop constraint if exists issues_assigned_to_fkey;
alter table tenant1.issues add constraint issues_created_by_fkey foreign key (created_by) references tenant1.users(id);
alter table tenant1.issues add constraint issues_assigned_to_fkey foreign key (assigned_to) references tenant1.users(id);

-- Comments -> Tenant1.Issues, Tenant1.Users
alter table tenant1.comments drop constraint if exists comments_created_by_fkey;
alter table tenant1.comments drop constraint if exists comments_issue_id_fkey;
-- (Reference must be local)
alter table tenant1.comments add constraint comments_issue_id_fkey foreign key (issue_id) references tenant1.issues(id) on delete cascade;
alter table tenant1.comments add constraint comments_created_by_fkey foreign key (created_by) references tenant1.users(id);


-- Update Constraints in Tenant2
-- Issues -> Tenant2.Users
alter table tenant2.issues drop constraint if exists issues_created_by_fkey;
alter table tenant2.issues drop constraint if exists issues_assigned_to_fkey;
alter table tenant2.issues add constraint issues_created_by_fkey foreign key (created_by) references tenant2.users(id);
alter table tenant2.issues add constraint issues_assigned_to_fkey foreign key (assigned_to) references tenant2.users(id);

-- Comments -> Tenant2.Users
alter table tenant2.comments drop constraint if exists comments_created_by_fkey;
alter table tenant2.comments drop constraint if exists comments_issue_id_fkey;
alter table tenant2.comments add constraint comments_issue_id_fkey foreign key (issue_id) references tenant2.issues(id) on delete cascade;
alter table tenant2.comments add constraint comments_created_by_fkey foreign key (created_by) references tenant2.users(id);

-- Enable RLS
alter table tenant1.users enable row level security;
alter table tenant2.users enable row level security;
create policy "Enable all access" on tenant1.users for all using (true) with check (true);
create policy "Enable all access" on tenant2.users for all using (true) with check (true);
