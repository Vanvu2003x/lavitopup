ALTER TABLE games
ADD COLUMN sync_auto_reenable BOOLEAN DEFAULT false AFTER status;

ALTER TABLE topup_packages
ADD COLUMN sync_auto_reenable BOOLEAN DEFAULT false AFTER status;
