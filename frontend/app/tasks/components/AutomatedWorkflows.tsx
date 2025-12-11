import React, { useState } from "react";
import { Plus, MoreVertical, Pause, Play, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateAutomationRuleModal, { AutomationRule } from "@/components/tasks/CreateAutomationRuleModal";
import AssignContactsToWorkflowModal from "@/components/tasks/AssignContactsToWorkflowModal";

export interface Workflow {
  id: string;
  name: string;
  contactCount: string;
  status: "Active" | "Paused";
}

interface AutomatedWorkflowsProps {
  workflows: Workflow[];
  onCreateRule?: (rule: AutomationRule) => void;
  onToggleRule?: (id: string) => void;
  onDeleteRule?: (id: string) => void;
  onAssignContacts?: (workflowId: string, contactIds: number[]) => Promise<void>;
  assignedContactCounts?: Record<string, number>;
}

export default function AutomatedWorkflows({
  workflows,
  onCreateRule,
  onToggleRule,
  onDeleteRule,
  onAssignContacts,
  assignedContactCounts = {},
}: AutomatedWorkflowsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningWorkflowId, setAssigningWorkflowId] = useState<string | null>(null);

  const handleCreateRule = (rule: AutomationRule) => {
    if (onCreateRule) {
      onCreateRule(rule);
    }
  };

  const handleAssignContacts = async (workflowId: string, contactIds: number[]) => {
    if (onAssignContacts) {
      await onAssignContacts(workflowId, contactIds);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Flujos automatizados</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          data-testid="open-create-rule"
          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva regla
        </Button>
      </div>
      <div className="space-y-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="p-4" data-testid={`workflow-card-${workflow.id}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
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
              {(onToggleRule || onDeleteRule) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      data-testid={`workflow-menu-${workflow.id}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onAssignContacts && (
                      <DropdownMenuItem
                        onClick={() => setAssigningWorkflowId(workflow.id)}
                        className="cursor-pointer"
                        data-testid={`workflow-assign-contacts-${workflow.id}`}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Asignar contactos
                      </DropdownMenuItem>
                    )}
                    {onToggleRule && (
                      <DropdownMenuItem
                        onClick={() => onToggleRule(workflow.id)}
                        className="cursor-pointer"
                        data-testid={`workflow-toggle-${workflow.id}`}
                      >
                        {workflow.status === "Active" ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    {onDeleteRule && (
                      <DropdownMenuItem
                        onClick={() => onDeleteRule(workflow.id)}
                        className="cursor-pointer text-red-600"
                        data-testid={`workflow-delete-${workflow.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-xs text-blue-600">
              {assignedContactCounts[workflow.id] !== undefined
                ? `${assignedContactCounts[workflow.id]} contacto${assignedContactCounts[workflow.id] !== 1 ? "s" : ""} en secuencia`
                : workflow.contactCount}
            </p>
          </Card>
        ))}
      </div>

      <CreateAutomationRuleModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateRule={handleCreateRule}
      />

      {assigningWorkflowId && (
        <AssignContactsToWorkflowModal
          open={!!assigningWorkflowId}
          onOpenChange={(open) => !open && setAssigningWorkflowId(null)}
          workflowId={assigningWorkflowId}
          workflowName={workflows.find((w) => w.id === assigningWorkflowId)?.name || ""}
          onAssign={handleAssignContacts}
        />
      )}
    </div>
  );
}

