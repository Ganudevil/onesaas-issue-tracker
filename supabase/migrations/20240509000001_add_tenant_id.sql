-- Add tenant_id to issues table
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default-tenant';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_issues_tenant_id ON issues(tenant_id);

-- Update RLS to check tenant_id (Optional enhancement, currently we rely on Backend Filtering)
-- For now, we just add the column to support the architecture.
