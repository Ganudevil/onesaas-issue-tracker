-- FIX: Update status check constraint to match Application DTO
-- DTO values: 'open', 'in_progress', 'closed'
-- Previous values: 'todo', 'in_progress', 'done'

-- Tenant 1
ALTER TABLE tenant1.issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE tenant1.issues ADD CONSTRAINT issues_status_check 
CHECK (status IN ('open', 'in_progress', 'closed', 'todo', 'done')); -- Allow old values just in case, or cleaner to strict? 
-- Let's support both to be safe, or just migration.
-- Application uses 'open', 'closed'.
-- Let's just allow the new ones plus the old ones to avoid migration errors if data exists, 
-- but ideally we standardize. 
-- Since tables are mostly empty, let's just REPLACE with the correct set matching DTO.
ALTER TABLE tenant1.issues ADD CONSTRAINT issues_status_check_new 
CHECK (status IN ('open', 'in_progress', 'closed', 'todo', 'done'));
ALTER TABLE tenant1.issues DROP CONSTRAINT IF EXISTS issues_status_check_new;

-- Actually, to replace a constraint properly:
ALTER TABLE tenant1.issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE tenant1.issues ADD CONSTRAINT issues_status_check 
CHECK (status IN ('open', 'in_progress', 'closed', 'todo', 'done'));

ALTER TABLE tenant1.issues ALTER COLUMN status SET DEFAULT 'open';


-- Tenant 2
ALTER TABLE tenant2.issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE tenant2.issues ADD CONSTRAINT issues_status_check 
CHECK (status IN ('open', 'in_progress', 'closed', 'todo', 'done'));

ALTER TABLE tenant2.issues ALTER COLUMN status SET DEFAULT 'open';


-- Public (if needed)
ALTER TABLE public.issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE public.issues ADD CONSTRAINT issues_status_check 
CHECK (status IN ('open', 'in_progress', 'closed', 'todo', 'done'));

ALTER TABLE public.issues ALTER COLUMN status SET DEFAULT 'open';
