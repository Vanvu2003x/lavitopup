ALTER TABLE topup_packages
ADD COLUMN sort_order INT DEFAULT 0 AFTER package_type;

UPDATE topup_packages
SET sort_order = 0
WHERE sort_order IS NULL;
