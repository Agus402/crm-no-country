"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateTaskModal, { NewTask } from "@/components/tasks/CreateTaskModal";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import StatsCards from "./components/StatsCards";
import TaskList, { Task } from "./components/TaskList";
import SmartReminders from "./components/SmartReminders";
import AutomatedWorkflows, { Workflow } from "./components/AutomatedWorkflows";
import { AutomationRule } from "@/components/tasks/CreateAutomationRuleModal";
import { taskService, TaskDTO, Priority } from "@/services/task.service";
import { automationRuleService, AutomationRuleDTO, CreateUpdateAutomationRuleDTO, TriggerEvent } from "@/services/automation-rule.service";
import { smartReminderService, Reminder } from "@/services/smart-reminder.service";

// Helper function to convert TaskDTO to Task
function mapTaskDTOToTask(dto: TaskDTO): Task {
  const dueDate = new Date(dto.dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  let dueDateStr = "";
  if (taskDate.getTime() === today.getTime()) {
    dueDateStr = "Hoy";
  } else if (taskDate.getTime() === today.getTime() + 86400000) {
    dueDateStr = "Mañana";
  } else {
    dueDateStr = dueDate.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
  }

  const dueTimeStr = dueDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  // Handle null/undefined crmLeadDTO
  const contactName = dto.crmLeadDTO?.name || dto.assignedTo?.name || "Unknown Contact";
  const initials = contactName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    id: dto.id.toString(),
    title: dto.title,
    contactName: contactName,
    contactInitials: initials,
    priority: dto.priority.toLowerCase() as "high" | "medium" | "low",
    dueDate: dueDateStr,
    dueTime: dueTimeStr,
    type: "other" as const,
    completed: dto.completed,
    description: dto.description || undefined,
    isAuto: (dto as any).isAutomated ?? (dto as any).isAuto ?? false,
    isAutomated: (dto as any).isAutomated ?? false,
  };
}

export default function TasksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDTO | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskDTOs, setTaskDTOs] = useState<TaskDTO[]>([]); // Keep DTOs for editing
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRuleDTO[]>([]);

  // Load tasks from backend
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedTaskDTOs = await taskService.getAll();
        setTaskDTOs(loadedTaskDTOs);
        const mappedTasks = loadedTaskDTOs.map(mapTaskDTOToTask);
        setTasks(mappedTasks);
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError(err instanceof Error ? err.message : "Error al cargar las tareas");
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Load smart reminders from backend
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const loadedReminders = await smartReminderService.getAll();
        setReminders(loadedReminders);
      } catch (err) {
        console.error("Error loading smart reminders:", err);
        // Don't set error state here, just log it - reminders are not critical
      }
    };

    loadReminders();
  }, []);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [assignedContactCounts, setAssignedContactCounts] = useState<Record<string, number>>({});

  // Load automation rules from backend
  useEffect(() => {
    const loadAutomationRules = async () => {
      try {
        const rules = await automationRuleService.getAll();
        setAutomationRules(rules);
        
        // Load contact counts for each rule
        const counts: Record<string, number> = {};
        for (const rule of rules) {
          try {
            const contactIds = await automationRuleService.getAssignedContacts(rule.id);
            counts[rule.id.toString()] = contactIds.length;
          } catch (err) {
            console.error(`Error loading contacts for rule ${rule.id}:`, err);
            counts[rule.id.toString()] = 0;
          }
        }
        setAssignedContactCounts(counts);
        
        const mappedWorkflows: Workflow[] = rules.map(rule => ({
          id: rule.id.toString(),
          name: rule.name,
          contactCount: `${counts[rule.id.toString()] || 0} contacts in sequence`,
          status: rule.isActive ? "Active" : "Paused",
        }));
        setWorkflows(mappedWorkflows);
      } catch (err) {
        console.error("Error loading automation rules:", err);
        // Don't set error state here, just log it
      }
    };

    loadAutomationRules();
  }, []);

  const handleCreateTask = async (newTask: NewTask) => {
    try {
      // Combine date and time in ISO format for backend
      // Format: YYYY-MM-DDTHH:mm:ss
      let dueDateTime: string;
      if (newTask.dueTime) {
        // Convert time from HH:mm to proper format
        const [hours, minutes] = newTask.dueTime.split(':');
        dueDateTime = `${newTask.dueDate}T${hours}:${minutes}:00`;
      } else {
        dueDateTime = `${newTask.dueDate}T00:00:00`;
      }

      // Map frontend task type to backend TaskType enum
      // Backend only supports MESSAGE and EMAIL
      const mapTaskType = (type: string): "MESSAGE" | "EMAIL" => {
        if (type === "send-email" || type === "follow-up-call") {
          return "EMAIL";
        }
        return "MESSAGE"; // Default to MESSAGE for other types
      };

      const taskDTO: {
        title: string;
        description?: string;
        dueDate: string;
        priority: Priority;
        taskType: "MESSAGE" | "EMAIL";
        crmLead_Id: number;
        isAutomated?: boolean;
        enableReminder?: boolean;
      } = {
        title: newTask.title,
        description: newTask.description,
        dueDate: dueDateTime,
        priority: newTask.priority.toUpperCase() as Priority,
        taskType: mapTaskType(newTask.type),
        crmLead_Id: newTask.contactId,
        isAutomated: newTask.isAutomated || false,
        enableReminder: newTask.enableReminder || false,
      };

      const createdTask = await taskService.create(taskDTO);
      setTaskDTOs([...taskDTOs, createdTask]);
      const mappedTask = mapTaskDTOToTask(createdTask);
      setTasks([...tasks, mappedTask]);

      // Reload smart reminders and workflows if task was created with reminder or automated
      if (newTask.enableReminder || newTask.isAutomated) {
        // Reload smart reminders
        try {
          const loadedReminders = await smartReminderService.getAll();
          setReminders(loadedReminders);
        } catch (err) {
          console.error("Error reloading smart reminders:", err);
        }

        // Reload workflows if task was automated
        if (newTask.isAutomated) {
          try {
            const rules = await automationRuleService.getAll();
            const mappedWorkflows: Workflow[] = rules.map(rule => ({
              id: rule.id.toString(),
              name: rule.name,
              contactCount: "0 contacts in sequence",
              status: rule.isActive ? "Active" : "Paused",
            }));
            setWorkflows(mappedWorkflows);
          } catch (err) {
            console.error("Error reloading workflows:", err);
          }
        }
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err instanceof Error ? err.message : "Error al crear la tarea");
      throw err;
    }
  };

  const handleUpdateTask = async (id: number, taskDTO: {
    title: string;
    description?: string;
    dueDate: string;
    priority: Priority;
    taskType: "MESSAGE" | "EMAIL";
    crmLead_Id: number;
  }) => {
    try {
      const updatedTask = await taskService.update(id, taskDTO);
      setTaskDTOs(taskDTOs.map(t => t.id === id ? updatedTask : t));
      const mappedTask = mapTaskDTOToTask(updatedTask);
      setTasks(tasks.map(t => t.id === id.toString() ? mappedTask : t));
      setShowEditModal(false);
      setEditingTask(null);
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err instanceof Error ? err.message : "Error al actualizar la tarea");
      throw err;
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const taskId = parseInt(id);
      await taskService.delete(taskId);
      setTaskDTOs(taskDTOs.filter(t => t.id !== taskId));
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar la tarea");
    }
  };

  const handleEditTask = (id: string) => {
    const taskId = parseInt(id);
    const taskDTO = taskDTOs.find(t => t.id === taskId);
    if (taskDTO) {
      setEditingTask(taskDTO);
      setShowEditModal(true);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const taskId = parseInt(id);
      const updatedTask = await taskService.toggleComplete(taskId);
      setTaskDTOs(taskDTOs.map(t => t.id === taskId ? updatedTask : t));
      const mappedTask = mapTaskDTOToTask(updatedTask);
      setTasks(
        tasks.map((task) => (task.id === id ? mappedTask : task))
      );
    } catch (err) {
      console.error("Error toggling task:", err);
      setError(err instanceof Error ? err.message : "Error al actualizar la tarea");
    }
  };

  const handleCreateRule = async (rule: AutomationRule) => {
    try {
      // Map frontend trigger types to backend TriggerEvent enum
      const triggerMap: Record<string, TriggerEvent> = {
        "new-lead": "LEAD_CREATED",
        "demo-completed": "DEMO_COMPLETED",
        "no-response": "NO_RESPONSE_7_DAYS",
        "invoice-sent": "STAGE_CHANGED", // Map to closest match
        "contract-signed": "STAGE_CHANGED",
        "payment-received": "STAGE_CHANGED",
      };

      const triggerEvent = triggerMap[rule.trigger] || "LEAD_CREATED";

      // Convert actions to JSON string
      const actionsJson = JSON.stringify({
        waitDays: rule.waitDays,
        waitHours: rule.waitHours,
        actions: rule.actions.map(action => ({
          type: action.type,
          template: action.template || null,
        })),
      });

      const ruleDTO: CreateUpdateAutomationRuleDTO = {
        name: rule.name,
        triggerEvent,
        triggerValue: null,
        actions: actionsJson,
        isActive: true,
      };

      const createdRule = await automationRuleService.create(ruleDTO);

      // Reload workflows from backend
      const allRules = await automationRuleService.getAll();
      const mappedWorkflows: Workflow[] = allRules.map(rule => ({
        id: rule.id.toString(),
        name: rule.name,
        contactCount: "0 contacts in sequence", // This could be calculated from backend
        status: rule.isActive ? "Active" : "Paused",
      }));

      setAutomationRules(allRules);
      setWorkflows(mappedWorkflows);
    } catch (err) {
      console.error("Error creating automation rule:", err);
      setError(err instanceof Error ? err.message : "Error al crear la regla de automatización");
      throw err;
    }
  };

  const handleToggleRule = async (id: string) => {
    try {
      const ruleId = parseInt(id);
      const current = automationRules.find((r) => r.id === ruleId);
      if (!current) return;
      const payload: CreateUpdateAutomationRuleDTO = {
        name: current.name,
        triggerEvent: current.triggerEvent,
        triggerValue: current.triggerValue ?? null,
        actions: current.actions,
        isActive: !current.isActive,
      };
      const updated = await automationRuleService.update(ruleId, payload);
      const updatedRules = automationRules.map((r) => (r.id === ruleId ? updated : r));
      setAutomationRules(updatedRules);
      const mappedWorkflows: Workflow[] = updatedRules.map(rule => ({
        id: rule.id.toString(),
        name: rule.name,
        contactCount: "0 contacts in sequence",
        status: rule.isActive ? "Active" : "Paused",
      }));
      setWorkflows(mappedWorkflows);
    } catch (err) {
      console.error("Error toggling automation rule:", err);
      setError(err instanceof Error ? err.message : "Error al actualizar la regla");
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const ruleId = parseInt(id);
      await automationRuleService.delete(ruleId);
      const remaining = automationRules.filter((r) => r.id !== ruleId);
      setAutomationRules(remaining);
      
      // Update contact counts
      const counts: Record<string, number> = { ...assignedContactCounts };
      delete counts[id];
      setAssignedContactCounts(counts);
      
      const mappedWorkflows: Workflow[] = remaining.map(rule => ({
        id: rule.id.toString(),
        name: rule.name,
        contactCount: `${counts[rule.id.toString()] || 0} contacts in sequence`,
        status: rule.isActive ? "Active" : "Paused",
      }));
      setWorkflows(mappedWorkflows);
    } catch (err) {
      console.error("Error deleting automation rule:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar la regla");
    }
  };

  const handleAssignContacts = async (workflowId: string, contactIds: number[]) => {
    try {
      await automationRuleService.assignContacts(parseInt(workflowId), contactIds);
      // Update contact count for this workflow
      const newCounts = {
        ...assignedContactCounts,
        [workflowId]: contactIds.length,
      };
      setAssignedContactCounts(newCounts);
      
      // Update the workflow display
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === workflowId
            ? { ...w, contactCount: `${contactIds.length} contacts in sequence` }
            : w
        )
      );
    } catch (err) {
      console.error("Error assigning contacts:", err);
      throw err; // Re-throw to let the modal handle the error
    }
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  // Si el backend no marca las tareas automatizadas, usamos fallback al número de workflows
  const automatedTasks = tasks.filter((t) => t.isAuto || t.isAutomated);
  const automatedCount = automatedTasks.length > 0 ? automatedTasks.length : workflows.length;
  const dueTodayTasks = tasks.filter((t) => t.dueDate === "Hoy" && !t.completed);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Tareas y Recordatorios</h1>
          <p className="text-gray-600 text-sm">
            Administra tus seguimientos y flujos automatizados
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear tarea
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards
        pendingCount={pendingTasks.length}
        completedCount={completedTasks.length}
        automatedCount={automatedCount}
        dueTodayCount={dueTodayTasks.length}
      />

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Your Tasks */}
        <div className="lg:col-span-2">
          <TaskList
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>

        {/* Right Column - Smart Reminders & Automated Workflows */}
        <div className="space-y-6">
          <SmartReminders reminders={reminders} />
          <AutomatedWorkflows
            workflows={workflows}
            onCreateRule={handleCreateRule}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
            onAssignContacts={handleAssignContacts}
            assignedContactCounts={assignedContactCounts}
          />
        </div>
      </div>

      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateTask={handleCreateTask}
      />

      <EditTaskModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        task={editingTask}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
}

