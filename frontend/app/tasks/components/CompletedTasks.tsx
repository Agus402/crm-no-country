"use client";

import React from "react";
import { CheckCircle2, Mail, MessageSquare, Phone } from "lucide-react";

interface CompletedTask {
  id: string;
  title: string;
  contactName: string;
  completedDate?: string;
  completedTime?: string;
  type: "email" | "call" | "message";
}

interface CompletedTasksProps {
  tasks: CompletedTask[];
}

export default function CompletedTasks({ tasks }: CompletedTasksProps) {

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4 text-gray-500" />;
      case "call":
        return <Phone className="h-4 w-4 text-gray-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Recently Completed</h2>
        <p className="text-sm text-gray-600">{tasks.length} completed tasks</p>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No completed tasks yet</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="mt-0.5 sm:mt-1 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 line-through text-gray-500 break-words">
                    {task.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      {getTaskIcon(task.type)}
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {task.contactName}
                      </span>
                    </div>
                    {task.completedDate && task.completedTime && (
                      <>
                        <span className="text-gray-500 hidden sm:inline">•</span>
                        <span className="text-gray-500 text-xs sm:text-sm">
                          Completed {task.completedDate}, {task.completedTime}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.type === "email" && (
                    <button className="text-gray-400 hover:text-gray-600">
                      <Mail className="h-4 w-4" />
                    </button>
                  )}
                  {task.type === "call" && (
                    <button className="text-gray-400 hover:text-gray-600">
                      <Phone className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

