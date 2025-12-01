"use client";

import React, { useState } from "react";
import { Clock, Calendar, MessageSquare, Mail, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
}

export default function PendingTasks() {
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
    {
      id: "4",
      title: "Send onboarding materials to Emily Rodriguez",
      contactName: "Emily Rodriguez",
      contactInitials: "ER",
      priority: "medium",
      dueDate: "Tomorrow",
      dueTime: "2:00 PM",
      type: "email",
      isAuto: true,
      completed: false,
      section: "upcoming",
    },
    {
      id: "5",
      title: "Schedule meeting with Thomas Anderson",
      contactName: "Thomas Anderson",
      contactInitials: "TA",
      priority: "medium",
      dueDate: "Nov 15",
      dueTime: "9:00 AM",
      type: "email",
      completed: false,
      section: "upcoming",
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-pink-100 text-pink-700";
      case "medium":
        return "bg-orange-100 text-orange-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getInitialsColor = (initials: string) => {
    const colors = [
      "bg-purple-100 text-purple-700",
      "bg-blue-100 text-blue-700",
      "bg-green-100 text-green-700",
      "bg-orange-100 text-orange-700",
      "bg-pink-100 text-pink-700",
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "email":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "call":
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  const todayTasks = tasks.filter((t) => !t.completed && t.section === "today");
  const upcomingTasks = tasks.filter(
    (t) => !t.completed && t.section === "upcoming"
  );

  const renderTaskList = (taskList: Task[]) => {
    return taskList.map((task) => (
      <div
        key={task.id}
        className="bg-white border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTask(task.id)}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1 sm:mt-0 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-2 break-words">{task.title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getInitialsColor(
                  task.contactInitials
                )}`}
              >
                <span className="font-semibold">{task.contactInitials}</span>
                <span className="hidden xs:inline">{task.contactName}</span>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${getPriorityColor(task.priority)}`}
              >
                {task.priority}
              </Badge>
              {task.isAuto && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                  <Bell className="h-3 w-3 mr-1" />
                  Auto
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>
                {task.dueDate}, {task.dueTime}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end sm:justify-start pl-7 sm:pl-0">
          {getTaskIcon(task.type)}
          <Button
            variant="outline"
            size="sm"
            className="text-xs px-3 py-1 h-auto"
          >
            Start
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-8">
      {/* Due Today Section */}
      {todayTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-red-500" />
            <h2 className="font-semibold text-base">
              Due Today ({todayTasks.length})
            </h2>
          </div>
          <div className="space-y-3">{renderTaskList(todayTasks)}</div>
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-purple-500" />
            <h2 className="font-semibold text-base">
              Upcoming ({upcomingTasks.length})
            </h2>
          </div>
          <div className="space-y-3">{renderTaskList(upcomingTasks)}</div>
        </div>
      )}

      {todayTasks.length === 0 && upcomingTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No pending tasks</p>
        </div>
      )}
    </div>
  );
}

