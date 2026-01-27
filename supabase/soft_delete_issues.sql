-- Add deleted_at column to issues
ALTER TABLE issues ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_issues_deleted_at ON issues(deleted_at);

-- Create a view for easy access to "Trash" in Supabase
CREATE OR REPLACE VIEW issues_trash AS
SELECT * FROM issues WHERE deleted_at IS NOT NULL;
