-- Drop existing constraints
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_assigned_to_fkey;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_created_by_fkey;

-- Re-add constraints with ON DELETE SET NULL
ALTER TABLE issues
ADD CONSTRAINT issues_assigned_to_fkey
FOREIGN KEY (assigned_to)
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE issues
ADD CONSTRAINT issues_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES users(id)
ON DELETE SET NULL;
