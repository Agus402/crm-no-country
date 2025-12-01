"use client";

import React, { useState } from "react";
import { CheckCircle2, Mail, MessageSquare, Phone } from "lucide-react";

interface CompletedTask {
  id: string;
  title: string;
  contactName: string;
  completedDate: string;
  completedTime: string;
  type: "email" | "call" | "message";
}

export default function CompletedTasks() {
  const [completedTasks] = useState<CompletedTask[]>([
    {
      id: "1",
      title: "Send welcome email to David Liu",
      contactName: "David Liu",
      completedDate: "Nov 12",
      completedTime: "3:00 PM",
      type: "email",
    },
    {
      id: "2",
      title: "Follow up on pricing inquiry – Olivia Martinez",
      contactName: "Olivia Martinez",
      completedDate: "Nov 12",
      completedTime: "11:30 AM",
      type: "call",
    },
    {
      id: "3",
      title: "Send contract to James Wilson",
      contactName: "James Wilson",
      completedDate: "Nov 11",
      completedTime: "4:45 PM",
      type: "email",
    },
  ]);

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
      </div>

      <div className="space-y-3">
        {completedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No completed tasks yet</p>
          </div>
        ) : (
          completedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 line-through text-gray-500 break-words">
                    {task.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      {getTaskIcon(task.type)}
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {task.contactName}
                      </span>
                    </div>
                    <span className="text-gray-500 hidden sm:inline">•</span>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      Completed {task.completedDate}, {task.completedTime}
                    </span>
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

