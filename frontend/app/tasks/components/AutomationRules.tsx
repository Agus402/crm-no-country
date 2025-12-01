"use client";

import React, { useState } from "react";
import { Bell, BellOff, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EditAutomationRuleModal from "@/components/tasks/EditAutomationRuleModal";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "inactive";
}

export default function AutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: "1",
      name: "New Lead Welcome Sequence",
      trigger: "Contact added to 'Active Lead'",
      action: "Send welcome email after 5 minutes",
      status: "active",
    },
    {
      id: "2",
      name: "Demo Follow-up",
      trigger: "Demo completed",
      action: "Send WhatsApp follow-up after 24 hours",
      status: "active",
    },
    {
      id: "3",
      name: "Payment Reminder",
      trigger: "Invoice sent",
      action: "Send reminder email after 3 days",
      status: "active",
    },
    {
      id: "4",
      name: "Inactive Lead Re-engagement",
      trigger: "No response for 7 days",
      action: "Send re-engagement email",
      status: "inactive",
    },
  ]);

  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const toggleRuleStatus = (id: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              status: rule.status === "active" ? "inactive" : "active",
            }
          : rule
      )
    );
  };

  const handleEditClick = (rule: AutomationRule) => {
    setEditingRule(rule);
    setShowEditModal(true);
  };

  const handleSaveRule = (updatedRule: AutomationRule) => {
    setRules(
      rules.map((rule) =>
        rule.id === updatedRule.id ? updatedRule : rule
      )
    );
  };

  const activeRules = rules.filter((r) => r.status === "active");
  const inactiveRules = rules.filter((r) => r.status === "inactive");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Active Automation Rules</h2>
        <p className="text-sm text-gray-600">
          {activeRules.length} active rules • {inactiveRules.length} inactive
        </p>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-white border rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow ${
              rule.status === "inactive" ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-0.5 sm:mt-1 flex-shrink-0">
                {rule.status === "active" ? (
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                ) : (
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <BellOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="font-semibold text-sm sm:text-base break-words">
                    {rule.name}
                  </h3>
                  <Badge
                    variant={rule.status === "active" ? "default" : "secondary"}
                    className={
                      rule.status === "active"
                        ? "bg-green-100 text-green-700 hover:bg-green-100 w-fit"
                        : "w-fit"
                    }
                  >
                    {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-gray-500 font-medium sm:min-w-[60px]">
                      Trigger:
                    </span>
                    <span className="text-gray-700 break-words">{rule.trigger}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-gray-500 font-medium sm:min-w-[60px]">
                      Action:
                    </span>
                    <span className="text-gray-700 break-words">{rule.action}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRuleStatus(rule.id)}
                  className="w-full sm:w-auto text-xs"
                >
                  {rule.status === "active" ? (
                    <>
                      <BellOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Activate</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(rule)}
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="sm:hidden ml-2">Edit</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EditAutomationRuleModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        rule={editingRule}
        onSaveRule={handleSaveRule}
      />
    </div>
  );
}

