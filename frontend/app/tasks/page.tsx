"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingTasks from "./components/PendingTasks";
import CompletedTasks from "./components/CompletedTasks";
import AutomationRules from "./components/AutomationRules";
import CreateTaskModal, { NewTask } from "@/components/tasks/CreateTaskModal";

interface Task {
  id: string;
  title: string;
  contactName: string;
  contactInitials: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  dueTime: string;
  type: "message" | "email" | "call";
  isAuto?: boolean;
  completed: boolean;
  section: "today" | "upcoming";
  completedDate?: string;
  completedTime?: string;
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Follow up with Sarah Chen - Enterprise plan discussion",
      contactName: "Sarah Chen",
      contactInitials: "SC",
      priority: "high",
      dueDate: "Today",
      dueTime: "2:00 PM",
      type: "message",
      completed: false,
      section: "today",
    },
    {
      id: "2",
      title: "Send product demo link to Marcus Brown",
      contactName: "Marcus Brown",
      contactInitials: "MB",
      priority: "medium",
      dueDate: "Today",
      dueTime: "4:30 PM",
      type: "email",
      isAuto: true,
      completed: false,
      section: "today",
    },
    {
      id: "3",
      title: "Check payment status - Jessica Park",
      contactName: "Jessica Park",
      contactInitials: "JP",
      priority: "high",
      dueDate: "Tomorrow",
      dueTime: "10:00 AM",
      type: "message",
      completed: false,
      section: "upcoming",
    },
  ]);

  const handleCreateTask = (newTask: NewTask) => {
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
      section: "upcoming",
    };
    setTasks([...tasks, task]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const now = new Date();
          return {
            ...task,
            completed: !task.completed,
            completedDate: !task.completed ? now.toLocaleDateString() : undefined,
            completedTime: !task.completed ? now.toLocaleTimeString() : undefined,
          };
        }
        return task;
      })
    );
  };

  const handleButtonClick = () => {
    if (activeTab === "automation") {
      // TODO: Open automation rule modal
      console.log("Create new automation rule");
    } else {
      setShowCreateModal(true);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Tasks & Automation</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage follow-ups and automated workflows.
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
          onClick={handleButtonClick}
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === "automation" ? "New Rule" : "New Task"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Pending
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Completed
          </TabsTrigger>
          <TabsTrigger value="automation" className="text-xs sm:text-sm">
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingTasks tasks={pendingTasks} onToggleTask={handleToggleTask} />
        </TabsContent>

        <TabsContent value="completed">
          <CompletedTasks tasks={completedTasks} />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationRules />
        </TabsContent>
      </Tabs>

      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}

