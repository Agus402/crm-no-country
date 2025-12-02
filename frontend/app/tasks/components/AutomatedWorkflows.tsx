import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateAutomationRuleModal, { AutomationRule } from "@/components/tasks/CreateAutomationRuleModal";

export interface Workflow {
  id: string;
  name: string;
  contactCount: string;
  status: "Active" | "Paused";
}

interface AutomatedWorkflowsProps {
  workflows: Workflow[];
  onCreateRule?: (rule: AutomationRule) => void;
}

export default function AutomatedWorkflows({
  workflows,
  onCreateRule,
}: AutomatedWorkflowsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateRule = (rule: AutomationRule) => {
    if (onCreateRule) {
      onCreateRule(rule);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Automated Workflows</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Rule
        </Button>
      </div>
      <div className="space-y-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-sm">{workflow.name}</h3>
              <Badge
                variant="outline"
                className={
                  workflow.status === "Active"
                    ? "text-green-700 bg-green-50 border-green-200"
                    : "text-gray-700 bg-gray-50 border-gray-200"
                }
              >
                {workflow.status}
              </Badge>
            </div>
            <p className="text-xs text-blue-600">{workflow.contactCount}</p>
          </Card>
        ))}
      </div>

      <CreateAutomationRuleModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateRule={handleCreateRule}
      />
    </div>
  );
}

