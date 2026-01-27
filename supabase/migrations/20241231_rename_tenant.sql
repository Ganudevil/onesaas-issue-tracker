-- Rename default-tenant to tenant1
UPDATE issues SET tenant_id = 'tenant1' WHERE tenant_id = 'default-tenant';
