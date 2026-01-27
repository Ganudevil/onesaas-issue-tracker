SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(c.oid) AS definition
FROM
    pg_constraint c
JOIN
    pg_namespace n ON n.oid = c.connamespace
WHERE
    conrelid = 'issues'::regclass
    AND contype = 'f';
