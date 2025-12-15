-- Create junction table for ManyToMany relationship between AutomationRule and CrmLead
CREATE TABLE automation_rule_lead (
    automation_rule_id BIGINT NOT NULL,
    lead_id BIGINT NOT NULL,
    PRIMARY KEY (automation_rule_id, lead_id),
    CONSTRAINT fk_automation_rule_lead_rule 
        FOREIGN KEY (automation_rule_id) 
        REFERENCES automation_rule(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_automation_rule_lead_lead 
        FOREIGN KEY (lead_id) 
        REFERENCES crm_lead(id) 
        ON DELETE CASCADE
);

-- Add indexes for faster lookups
CREATE INDEX idx_automation_rule_lead_rule ON automation_rule_lead(automation_rule_id);
CREATE INDEX idx_automation_rule_lead_lead ON automation_rule_lead(lead_id);
