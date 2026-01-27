-- Drop the permissive constraints (ON DELETE SET NULL)
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_assigned_to_fkey;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_created_by_fkey;

-- Re-add strict constraints (ON DELETE NO ACTION)
-- This will prevent deleting a user if they have assigned/created issues.
ALTER TABLE issues
ADD CONSTRAINT issues_assigned_to_fkey
FOREIGN KEY (assigned_to)
REFERENCES users(id);

ALTER TABLE issues
ADD CONSTRAINT issues_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES users(id);
