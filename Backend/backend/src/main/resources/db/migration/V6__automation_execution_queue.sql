-- Create execution queue table for scheduled automation executions
CREATE TABLE automation_execution_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    automation_rule_id BIGINT NOT NULL,
    lead_id BIGINT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    status ENUM('PENDING', 'EXECUTING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    executed_at DATETIME,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at DATETIME,
    CONSTRAINT fk_queue_automation_rule 
        FOREIGN KEY (automation_rule_id) 
        REFERENCES automation_rule(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_queue_crm_lead 
        FOREIGN KEY (lead_id) 
        REFERENCES crm_lead(id) 
        ON DELETE CASCADE
);

-- Add indexes for efficient queue processing
CREATE INDEX idx_queue_status_scheduled ON automation_execution_queue(status, scheduled_at);
CREATE INDEX idx_queue_rule ON automation_execution_queue(automation_rule_id);
CREATE INDEX idx_queue_lead ON automation_execution_queue(lead_id);
