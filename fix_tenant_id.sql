-- FIX: Make tenant_id nullable in issues table for all schemas

-- 1. Tenant 1
ALTER TABLE tenant1.issues ALTER COLUMN tenant_id DROP NOT NULL;

-- 2. Tenant 2
ALTER TABLE tenant2.issues ALTER COLUMN tenant_id DROP NOT NULL;

-- 3. Update public (optional, for consistency)
ALTER TABLE public.issues ALTER COLUMN tenant_id DROP NOT NULL;
