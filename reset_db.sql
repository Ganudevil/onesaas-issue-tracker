-- RESET DATABASE SCRIPT
-- 1. Clean up
DROP SCHEMA IF EXISTS tenant1 CASCADE;
DROP SCHEMA IF EXISTS tenant2 CASCADE;

-- 2. Run Base Schema
-- Recreating schema for Multi-tenancy and RBAC
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS tenant_users;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS users;

-- 1. Tenants Table
CREATE TABLE tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Users Table
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  display_name text,
  role text DEFAULT 'viewer' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- 3. Tenant Users (RBAC Source of Truth)
CREATE TABLE tenant_users (
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  PRIMARY KEY (tenant_id, user_id)
);

-- 4. Issues Table (Tenant Scoped)
CREATE TABLE issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  assigned_to uuid REFERENCES users(id),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- 5. Comments Table
CREATE TABLE comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow all access for now (Backend guards will enforce logic)
CREATE POLICY "Allow All Tenants" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow All Users" ON users FOR ALL USING (true);
CREATE POLICY "Allow All TenantUsers" ON tenant_users FOR ALL USING (true);
CREATE POLICY "Allow All Issues" ON issues FOR ALL USING (true);
CREATE POLICY "Allow All Comments" ON comments FOR ALL USING (true);

-- Seed Data (Default Tenant & Admin)
INSERT INTO tenants (id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'Default Tenant');
-- Note: Replace UUID below with actual Keycloak User ID if known, otherwise this is a placeholder
INSERT INTO users (id, email, name, role) VALUES ('22222222-2222-2222-2222-222222222222', 'admin@example.com', 'Admin User', 'admin');
INSERT INTO tenant_users (tenant_id, user_id, role) VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'admin');

-- 3. Run Migrations (Create Tenant Schemas)
-- Create Schemas
create schema if not exists tenant1;
create schema if not exists tenant2;

-- Grant usage
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
-- drop constraints if they were copied (they aren't usually but just in case)
alter table tenant1.issues drop constraint if exists issues_created_by_fkey;
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

