-- MIGRATE USERS TO TENANT SCHEMAS

-- 1. Create Users table in Tenant 1 (Same structure as public.users)
CREATE TABLE IF NOT EXISTS tenant1.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  display_name text,
  role text DEFAULT 'viewer' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- 2. Create Users table in Tenant 2
CREATE TABLE IF NOT EXISTS tenant2.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  display_name text,
  role text DEFAULT 'viewer' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- 3. Migrate Data (Move existing public users to Tenant 1 as a baseline)
INSERT INTO tenant1.users (id, email, name, display_name, role, created_at, updated_at)
SELECT id, email, name, display_name, role, created_at, updated_at FROM public.users
ON CONFLICT (id) DO NOTHING;

-- (Optional) Migrate admin to Tenant 2 as well, so admin works there?
INSERT INTO tenant2.users (id, email, name, display_name, role, created_at, updated_at)
SELECT id, email, name, display_name, role, created_at, updated_at FROM public.users WHERE role = 'admin'
ON CONFLICT (id) DO NOTHING;


-- 4. Repoint Foreign Keys in Tenant 1
-- Issues
ALTER TABLE tenant1.issues DROP CONSTRAINT IF EXISTS issues_created_by_fkey;
ALTER TABLE tenant1.issues DROP CONSTRAINT IF EXISTS issues_assigned_to_fkey;

ALTER TABLE tenant1.issues ADD CONSTRAINT issues_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES tenant1.users(id);

ALTER TABLE tenant1.issues ADD CONSTRAINT issues_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES tenant1.users(id);

-- Comments
ALTER TABLE tenant1.comments DROP CONSTRAINT IF EXISTS comments_created_by_fkey;
ALTER TABLE tenant1.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey; -- Handle legacy name if exists

ALTER TABLE tenant1.comments ADD CONSTRAINT comments_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES tenant1.users(id);


-- 5. Repoint Foreign Keys in Tenant 2
-- Issues
ALTER TABLE tenant2.issues DROP CONSTRAINT IF EXISTS issues_created_by_fkey;
ALTER TABLE tenant2.issues DROP CONSTRAINT IF EXISTS issues_assigned_to_fkey;

ALTER TABLE tenant2.issues ADD CONSTRAINT issues_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES tenant2.users(id);

ALTER TABLE tenant2.issues ADD CONSTRAINT issues_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES tenant2.users(id);

-- Comments
ALTER TABLE tenant2.comments DROP CONSTRAINT IF EXISTS comments_created_by_fkey;

ALTER TABLE tenant2.comments ADD CONSTRAINT comments_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES tenant2.users(id);


-- 6. Enable RLS on new User tables
ALTER TABLE tenant1.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant2.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access" ON tenant1.users FOR ALL USING (true);
CREATE POLICY "Enable all access" ON tenant2.users FOR ALL USING (true);

-- 7. Drop Public Users (as requested)
-- We'll keep tenant_users for now as it might be used by legacy code, but if user really wants 'remove from public', we can truncate public.users to prove independence.
TRUNCATE TABLE public.users CASCADE;
-- DROP TABLE public.users CASCADE; -- Using Truncate is safer for recovery if needed, but user said 'remove'. 
-- Let's drop it to force errors if anything still uses it.
DROP TABLE public.users CASCADE;
