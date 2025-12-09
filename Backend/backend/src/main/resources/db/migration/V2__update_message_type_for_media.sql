-- Migration script to update message_type column for multimedia support
-- Run this SQL in the MySQL database

-- Change message_type from ENUM to VARCHAR to support all message types
ALTER TABLE message MODIFY COLUMN message_type VARCHAR(20) NOT NULL;

-- If you want to keep ENUM (optional - use this instead of the above):
-- ALTER TABLE message MODIFY COLUMN message_type ENUM('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER', 'EMAIL') NOT NULL;
