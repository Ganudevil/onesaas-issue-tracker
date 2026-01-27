BEGIN;
SET session_replication_role = replica;
UPDATE tenant1.users SET id = '11b0c748-5164-40f9-b43f-c2427d7ab978' WHERE email = 'dinesh@futurescape.com';
UPDATE tenant1.issues SET created_by = '11b0c748-5164-40f9-b43f-c2427d7ab978' WHERE created_by = '6a8defb9-838a-4df6-b0fb-8ce2f47ca34c';
UPDATE tenant1.issues SET assigned_to = '11b0c748-5164-40f9-b43f-c2427d7ab978' WHERE assigned_to = '6a8defb9-838a-4df6-b0fb-8ce2f47ca34c';
UPDATE tenant1.comments SET created_by = '11b0c748-5164-40f9-b43f-c2427d7ab978' WHERE created_by = '6a8defb9-838a-4df6-b0fb-8ce2f47ca34c';
SET session_replication_role = origin;
COMMIT;
