"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateTaskModal, { NewTask } from "@/components/tasks/CreateTaskModal";
import StatsCards from "./components/StatsCards";
import TaskList, { Task } from "./components/TaskList";
import SmartReminders, { Reminder } from "./components/SmartReminders";
import AutomatedWorkflows, { Workflow } from "./components/AutomatedWorkflows";

export default function TasksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Follow up with John Martinez about Enterprise plan",
      contactName: "John Martinez",
      contactInitials: "JM",
      priority: "high",
      dueDate: "Today",
      dueTime: "2:00 PM",
      type: "message",
      completed: false,
    },
    {
      id: "2",
      title: "Send pricing proposal to Emma Wilson",
      contactName: "Emma Wilson",
      contactInitials: "EW",
      priority: "high",
      dueDate: "Today",
      dueTime: "4:30 PM",
      type: "email",
      completed: false,
    },
    {
      id: "3",
      title: "Schedule demo with Michael Chen",
      contactName: "Michael Chen",
      contactInitials: "MC",
      priority: "medium",
      dueDate: "Tomorrow",
      dueTime: "10:00 AM",
      type: "call",
      completed: false,
    },
    {
      id: "4",
      title: "Check in with inactive leads",
      contactName: "Multiple contacts",
      contactInitials: "MC",
      priority: "low",
      dueDate: "Tomorrow",
      dueTime: "9:00 AM",
      type: "message",
      isAuto: true,
      completed: false,
    },
    {
      id: "5",
      title: "Send onboarding materials to Sofia Rodriguez",
      contactName: "Sofia Rodriguez",
      contactInitials: "SR",
      priority: "medium",
      dueDate: "Dec 12",
      dueTime: "2:00 PM",
      type: "email",
      completed: true,
    },
    {
      id: "6",
      title: "Weekly performance report",
      contactName: "Team",
      contactInitials: "TM",
      priority: "low",
      dueDate: "Dec 15",
      dueTime: "9:00 AM",
      type: "email",
      isAuto: true,
      completed: false,
    },
  ]);

  const reminders: Reminder[] = [
    { id: "1", text: "John Martinez hasn't responded in 3 days", time: "2 hours ago" },
    { id: "2", text: "Emma Wilson opened your email 3 times", time: "4 hours ago" },
    { id: "3", text: "Demo scheduled with Michael Chen in 2 days", time: "1 day ago" },
    { id: "4", text: "5 leads need follow-up this week", time: "1 day ago" },
  ];

  const workflows: Workflow[] = [
    { id: "1", name: "Lead Nurture Sequence", contactCount: "5 contacts in sequence", status: "Active" },
    { id: "2", name: "Inactive Lead Re-engagement", contactCount: "12 contacts in sequence", status: "Active" },
    { id: "3", name: "Client Onboarding", contactCount: "0 contacts in sequence", status: "Paused" },
  ];

  const handleCreateTask = (newTask: NewTask) => {
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
    };
    setTasks([...tasks, task]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            completed: !task.completed,
          };
        }
        return task;
      })
    );
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const automatedTasks = tasks.filter((t) => t.isAuto);
  const dueTodayTasks = tasks.filter((t) => t.dueDate === "Today" && !t.completed);

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
          <AutomatedWorkflows workflows={workflows} />
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

