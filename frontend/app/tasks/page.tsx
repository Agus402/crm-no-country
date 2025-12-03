"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateTaskModal, { NewTask } from "@/components/tasks/CreateTaskModal";
import StatsCards from "./components/StatsCards";
import TaskList, { Task } from "./components/TaskList";
import SmartReminders, { Reminder } from "./components/SmartReminders";
import AutomatedWorkflows, { Workflow } from "./components/AutomatedWorkflows";
import { AutomationRule } from "@/components/tasks/CreateAutomationRuleModal";
import { taskService, TaskDTO, Priority } from "@/services/task.service";

// Helper function to convert TaskDTO to Task
function mapTaskDTOToTask(dto: TaskDTO): Task {
  const dueDate = new Date(dto.dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  
  let dueDateStr = "";
  if (taskDate.getTime() === today.getTime()) {
    dueDateStr = "Today";
  } else if (taskDate.getTime() === today.getTime() + 86400000) {
    dueDateStr = "Tomorrow";
  } else {
    dueDateStr = dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const dueTimeStr = dueDate.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    minute: "2-digit",
    hour12: true 
  });

  const initials = dto.crmLeadDTO.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    id: dto.id.toString(),
    title: dto.title,
    contactName: dto.crmLeadDTO.name,
    contactInitials: initials,
    priority: dto.priority.toLowerCase() as "high" | "medium" | "low",
    dueDate: dueDateStr,
    dueTime: dueTimeStr,
    type: "other" as const,
    completed: dto.completed,
    description: dto.description || undefined,
  };
}

export default function TasksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from backend
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const taskDTOs = await taskService.getAll();
        const mappedTasks = taskDTOs.map(mapTaskDTOToTask);
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

  const reminders: Reminder[] = [
    { id: "1", text: "John Martinez hasn't responded in 3 days", time: "2 hours ago" },
    { id: "2", text: "Emma Wilson opened your email 3 times", time: "4 hours ago" },
    { id: "3", text: "Demo scheduled with Michael Chen in 2 days", time: "1 day ago" },
    { id: "4", text: "5 leads need follow-up this week", time: "1 day ago" },
  ];

  const [workflows, setWorkflows] = useState<Workflow[]>([
    { id: "1", name: "Lead Nurture Sequence", contactCount: "5 contacts in sequence", status: "Active" },
    { id: "2", name: "Inactive Lead Re-engagement", contactCount: "12 contacts in sequence", status: "Active" },
    { id: "3", name: "Client Onboarding", contactCount: "0 contacts in sequence", status: "Paused" },
  ]);

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

      const taskDTO: {
        title: string;
        description?: string;
        dueDate: string;
        priority: Priority;
        crmLead_Id: number;
      } = {
        title: newTask.title,
        description: newTask.description,
        dueDate: dueDateTime,
        priority: newTask.priority.toUpperCase() as Priority,
        crmLead_Id: newTask.contactId,
      };

      const createdTask = await taskService.create(taskDTO);
      const mappedTask = mapTaskDTOToTask(createdTask);
      setTasks([...tasks, mappedTask]);
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err instanceof Error ? err.message : "Error al crear la tarea");
      throw err;
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const taskId = parseInt(id);
      const updatedTask = await taskService.toggleComplete(taskId);
      const mappedTask = mapTaskDTOToTask(updatedTask);
      setTasks(
        tasks.map((task) => (task.id === id ? mappedTask : task))
      );
    } catch (err) {
      console.error("Error toggling task:", err);
      setError(err instanceof Error ? err.message : "Error al actualizar la tarea");
    }
  };

  const handleCreateRule = (rule: AutomationRule) => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: rule.name,
      contactCount: "0 contacts in sequence",
      status: "Active",
    };
    setWorkflows([...workflows, newWorkflow]);
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const automatedTasks = tasks.filter((t) => t.isAuto);
  const dueTodayTasks = tasks.filter((t) => t.dueDate === "Today" && !t.completed);

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
          <h1 className="text-2xl font-semibold mb-1">Tasks & Reminders</h1>
          <p className="text-gray-600 text-sm">
            Manage your follow-ups and automated workflows
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards
        pendingCount={pendingTasks.length}
        completedCount={completedTasks.length}
        automatedCount={automatedTasks.length}
        dueTodayCount={dueTodayTasks.length}
      />

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Your Tasks */}
        <div className="lg:col-span-2">
          <TaskList tasks={tasks} onToggleTask={handleToggleTask} />
        </div>

        {/* Right Column - Smart Reminders & Automated Workflows */}
        <div className="space-y-6">
          <SmartReminders reminders={reminders} />
          <AutomatedWorkflows workflows={workflows} onCreateRule={handleCreateRule} />
        </div>
      </div>

      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}

