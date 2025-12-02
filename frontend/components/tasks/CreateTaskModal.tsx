"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckSquare,
  Phone,
  Mail,
  Calendar,
  FileText,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: NewTask) => void;
}

type TaskType = "follow-up-call" | "send-email" | "schedule-demo" | "send-proposal" | "client-onboarding" | "other";

export interface NewTask {
  title: string;
  contactName: string;
  contactInitials: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  dueTime: string;
  type: TaskType;
  description?: string;
  enableReminder?: boolean;
  isAutomated?: boolean;
}

export default function CreateTaskModal({
  open,
  onOpenChange,
  onCreateTask,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState<NewTask>({
    title: "",
    contactName: "",
    contactInitials: "",
    priority: "medium",
    dueDate: "",
    dueTime: "",
    type: "follow-up-call",
    description: "",
    enableReminder: false,
    isAutomated: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate initials from contact name if not provided
    const initials =
      formData.contactInitials ||
      (formData.contactName
        ? formData.contactName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "");

    onCreateTask({
      ...formData,
      contactInitials: initials,
    });

    // Reset form
    setFormData({
      title: "",
      contactName: "",
      contactInitials: "",
      priority: "medium",
      dueDate: "",
      dueTime: "",
      type: "follow-up-call",
      description: "",
      enableReminder: false,
      isAutomated: false,
    });
    onOpenChange(false);
  };

  const taskTypes = [
    { value: "follow-up-call", label: "Follow-up Call", icon: Phone },
    { value: "send-email", label: "Send Email", icon: Mail },
    { value: "schedule-demo", label: "Schedule Demo", icon: Calendar },
    { value: "send-proposal", label: "Send Proposal", icon: FileText },
    { value: "client-onboarding", label: "Client Onboarding", icon: UserPlus },
    { value: "other", label: "Other", icon: MoreHorizontal },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[90vw] md:max-w-[650px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            <DialogTitle className="text-base sm:text-lg">Create New Task</DialogTitle>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Create a task to manage your follow-ups and workflow.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 mt-1 sm:mt-2 overflow-y-auto max-h-[calc(95vh-180px)] scrollbar-hide">
          {/* Task Title */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="title" className="text-xs sm:text-sm font-medium">
              Task Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Follow up with client about proposal"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full text-sm"
            />
          </div>

          {/* Task Type */}
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Task Type <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
              {taskTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData({ 
                        ...formData, 
                        type: type.value as TaskType
                      })
                    }
                    className={`flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 py-1 sm:py-1.5 rounded-lg border transition-all text-[11px] sm:text-xs ${
                      formData.type === type.value
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <span className="truncate text-[10px] sm:text-xs">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assign to Contact */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="contact" className="text-xs sm:text-sm font-medium flex items-center gap-1">
              <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Assign to Contact
            </Label>
            <Select
              value={formData.contactName}
              onValueChange={(value) =>
                setFormData({ ...formData, contactName: value })
              }
            >
              <SelectTrigger id="contact" className="text-sm">
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="John Martinez">John Martinez</SelectItem>
                <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                <SelectItem value="Sofia Rodriguez">Sofia Rodriguez</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Priority
            </Label>
            <div className="flex gap-1 sm:gap-2">
              {["low", "medium", "high"].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      priority: priority as "low" | "medium" | "high",
                    })
                  }
                  className={`flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-sm font-medium transition-all ${
                    formData.priority === priority
                      ? priority === "high"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : priority === "medium"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-400 bg-gray-50 text-gray-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="dueDate" className="text-xs sm:text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
                className="w-full text-sm"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="dueTime" className="text-xs sm:text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Time
              </Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) =>
                  setFormData({ ...formData, dueTime: e.target.value })
                }
                className="w-full text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="description" className="text-xs sm:text-sm font-medium">
              Description (optional)
            </Label>
            <textarea
              id="description"
              placeholder="Add details..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={1}
              className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-xs sm:text-sm"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reminder"
                checked={formData.enableReminder}
                onChange={(e) =>
                  setFormData({ ...formData, enableReminder: e.target.checked })
                }
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="reminder" className="text-xs sm:text-sm font-medium cursor-pointer flex items-center gap-1">
                <span className="text-red-500">🔔</span>
                Enable Reminder
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="automated"
                checked={formData.isAutomated}
                onChange={(e) =>
                  setFormData({ ...formData, isAutomated: e.target.checked })
                }
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="automated" className="text-xs sm:text-sm font-medium cursor-pointer">
                Make this an automated task
              </Label>
            </div>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-1.5 sm:gap-3 pt-1 sm:pt-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            >
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

