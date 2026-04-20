UPDATE usuarios SET created_at = NOW() WHERE created_at < '2000-01-01' OR created_at IS NULL;
UPDATE usuarios SET updated_at = NOW() WHERE updated_at < '2000-01-01' OR updated_at IS NULL;
UPDATE productos SET created_at = NOW() WHERE created_at < '2000-01-01' OR created_at IS NULL;
UPDATE productos SET updated_at = NOW() WHERE updated_at < '2000-01-01' OR updated_at IS NULL;
