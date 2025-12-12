package com.nocountry.backend.events;

import com.nocountry.backend.entity.CrmLead;
import org.springframework.context.ApplicationEvent;

public class LeadCreatedEvent extends ApplicationEvent {

    private final CrmLead lead;

    public LeadCreatedEvent(Object source, CrmLead lead) {
        super(source);
        this.lead = lead;
    }

    public CrmLead getLead() {
        return lead;
    }
}
