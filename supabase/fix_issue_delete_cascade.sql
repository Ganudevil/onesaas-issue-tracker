-- Drop valid constraints if they exist
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_issue_id_fkey;

-- Re-add constraint with ON DELETE CASCADE
-- This ensures that when an issue is deleted, its comments are also deleted automatically.
ALTER TABLE comments
ADD CONSTRAINT comments_issue_id_fkey
FOREIGN KEY (issue_id)
REFERENCES issues(id)
ON DELETE CASCADE;
