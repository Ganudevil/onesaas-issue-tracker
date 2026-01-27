-- Restore a specific issue from the Trash (by setting deleted_at to NULL)
-- Replace 'ISSUE_UUID_HERE' with the actual ID from the issues_trash view
UPDATE issues SET deleted_at = NULL WHERE id = 'ISSUE_UUID_HERE';
