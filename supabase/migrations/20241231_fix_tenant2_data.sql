-- Move misplaced tenant2 issues from public to tenant2 schema
insert into tenant2.issues 
select * from public.issues where tenant_id = 'tenant2';

-- Move related comments (if any)
insert into tenant2.comments
select * from public.comments 
where issue_id in (select id from public.issues where tenant_id = 'tenant2');

-- Cleanup public
delete from public.comments 
where issue_id in (select id from public.issues where tenant_id = 'tenant2');

delete from public.issues where tenant_id = 'tenant2';
