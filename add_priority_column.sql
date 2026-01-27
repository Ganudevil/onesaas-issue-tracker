BEGIN;
ALTER TABLE tenant1.issues ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE tenant2.issues ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
COMMIT;
