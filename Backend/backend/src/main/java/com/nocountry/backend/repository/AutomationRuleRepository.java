package com.nocountry.backend.repository;

import com.nocountry.backend.entity.AutomationRule;
import com.nocountry.backend.enums.TriggerEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AutomationRuleRepository extends JpaRepository<AutomationRule, Long> {

    List<AutomationRule> findByTriggerEventAndIsActiveTrue(TriggerEvent triggerEvent);
}