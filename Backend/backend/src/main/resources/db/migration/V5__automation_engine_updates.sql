-- Add channel and is_active columns to email_template for WhatsApp support
ALTER TABLE email_template 
ADD COLUMN channel ENUM('EMAIL', 'WHATSAPP') NOT NULL DEFAULT 'EMAIL',
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Make type column nullable (optional categorization)
ALTER TABLE email_template MODIFY COLUMN type VARCHAR(50) NULL;

-- Create index for efficient lookups
CREATE INDEX idx_template_channel ON email_template(channel, is_active);

-- Add wait_days and wait_hours to automation_rule for scheduling
ALTER TABLE automation_rule 
ADD COLUMN wait_days INT DEFAULT 0,
ADD COLUMN wait_hours INT DEFAULT 0;
