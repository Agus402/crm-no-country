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

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: NewTask) => void;
}

export interface NewTask {
  title: string;
  contactName: string;
  contactInitials: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  dueTime: string;
  type: "message" | "email" | "call";
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
    type: "message",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate initials from contact name if not provided
    const initials =
      formData.contactInitials ||
      formData.contactName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

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
      type: "message",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Follow up with client about proposal"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                placeholder="e.g., John Doe"
                value={formData.contactName}
                onChange={(e) =>
                  setFormData({ ...formData, contactName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Task Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as "message" | "email" | "call",
                  })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  priority: value as "high" | "medium" | "low",
                })
              }
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time *</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) =>
                  setFormData({ ...formData, dueTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
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

