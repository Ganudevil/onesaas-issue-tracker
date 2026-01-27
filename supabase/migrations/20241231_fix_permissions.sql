-- Grant privileges on tables in tenant1
grant all privileges on all tables in schema tenant1 to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema tenant1 to postgres, anon, authenticated, service_role;

-- Grant privileges on tables in tenant2
grant all privileges on all tables in schema tenant2 to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema tenant2 to postgres, anon, authenticated, service_role;

-- Ensure future tables get grants (Optional but good practice)
alter default privileges in schema tenant1 grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema tenant2 grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema tenant1 grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema tenant2 grant all on sequences to postgres, anon, authenticated, service_role;
