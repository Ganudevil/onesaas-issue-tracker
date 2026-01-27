-- Add deleted_at column for soft deletion
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Optional: Index on deleted_at for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
