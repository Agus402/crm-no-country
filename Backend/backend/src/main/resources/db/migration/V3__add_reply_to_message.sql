-- Add reply_to_message_id column for quoted/reply messages feature
ALTER TABLE message ADD COLUMN reply_to_message_id BIGINT NULL;

-- Add foreign key constraint to reference the original message
ALTER TABLE message 
    ADD CONSTRAINT fk_message_reply_to 
    FOREIGN KEY (reply_to_message_id) 
    REFERENCES message(id) 
    ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_message_reply_to ON message(reply_to_message_id);
