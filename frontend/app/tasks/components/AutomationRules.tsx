"use client";

import React, { useState } from "react";
import { Bell, BellOff, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
            className={`bg-white border rounded-lg p-5 hover:shadow-md transition-shadow ${
              rule.status === "inactive" ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {rule.status === "active" ? (
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-green-600" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <BellOff className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{rule.name}</h3>
                  <Badge
                    variant={rule.status === "active" ? "default" : "secondary"}
                    className={
                      rule.status === "active"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : ""
                    }
                  >
                    {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium min-w-[60px]">
                      Trigger
                    </span>
                    <span className="text-gray-700">{rule.trigger}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium min-w-[60px]">
                      Action
                    </span>
                    <span className="text-gray-700">{rule.action}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRuleStatus(rule.id)}
                >
                  {rule.status === "active" ? (
                    <>
                      <BellOff className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-1" />
                      Activate
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

