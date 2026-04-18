ALTER TABLE games
ADD COLUMN status VARCHAR(20) DEFAULT 'active' AFTER publisher;

UPDATE games
SET status = 'active'
WHERE status IS NULL OR status = '';
