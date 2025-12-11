"use client";

import React, { useState, useEffect } from "react";
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
  Search,
} from "lucide-react";
import { contactService, CrmLeadDTO } from "@/services/contact.service";
import { TaskDTO, Priority } from "@/services/task.service";

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskDTO | null;
  onUpdateTask: (id: number, task: {
    title: string;
    description?: string;
    dueDate: string;
    priority: Priority;
    taskType: "MESSAGE" | "EMAIL";
    crmLead_Id: number;
  }) => void;
}

type TaskType = "follow-up-call" | "send-email" | "schedule-demo" | "send-proposal" | "client-onboarding" | "other";

export default function EditTaskModal({
  open,
  onOpenChange,
  task,
  onUpdateTask,
}: EditTaskModalProps) {
  const [contacts, setContacts] = useState<CrmLeadDTO[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [formData, setFormData] = useState<{
    title: string;
    contactId: number;
    priority: "high" | "medium" | "low";
    dueDate: string;
    dueTime: string;
    description: string;
    type: TaskType;
  }>({
    title: "",
    contactId: 0,
    priority: "medium",
    dueDate: "",
    dueTime: "",
    description: "",
    type: "follow-up-call",
  });

  // Load contacts and populate form when modal opens or task changes
  useEffect(() => {
    if (open) {
      const loadContacts = async () => {
        try {
          setIsLoadingContacts(true);
          const contactsData = await contactService.getAll();
          setContacts(contactsData);
        } catch (error) {
          console.error("Error loading contacts:", error);
        } finally {
          setIsLoadingContacts(false);
        }
      };
      loadContacts();
    } else {
      // Reset contacts and search when modal closes
      setContacts([]);
      setContactSearchQuery("");
    }
  }, [open]);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => {
    if (!contactSearchQuery) return true;
    const query = contactSearchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query)
    );
  });

  // Helper function to map backend taskType to frontend TaskType
  const mapBackendToFrontendType = (backendType: "MESSAGE" | "EMAIL"): TaskType => {
    // Since we can't know the exact original type, default to reasonable mappings
    if (backendType === "EMAIL") {
      return "send-email";
    }
    return "follow-up-call"; // Default for MESSAGE
  };

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      const dueDate = new Date(task.dueDate);
      const dateStr = dueDate.toISOString().split('T')[0];
      const timeStr = dueDate.toTimeString().slice(0, 5); // HH:mm format

      setFormData({
        title: task.title,
        contactId: task.crmLeadDTO?.id || 0,
        priority: task.priority.toLowerCase() as "high" | "medium" | "low",
        dueDate: dateStr,
        dueTime: timeStr,
        description: task.description || "",
        type: mapBackendToFrontendType(task.taskType || "MESSAGE"),
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contactId || !task) {
      alert("Por favor selecciona un contacto");
      return;
    }

    // Combine date and time in ISO format for backend
    let dueDateTime: string;
    if (formData.dueTime) {
      const [hours, minutes] = formData.dueTime.split(':');
      dueDateTime = `${formData.dueDate}T${hours}:${minutes}:00`;
    } else {
      dueDateTime = `${formData.dueDate}T00:00:00`;
    }

    // Map frontend task type to backend TaskType enum
    // Backend only supports MESSAGE and EMAIL
    const mapTaskType = (type: string): "MESSAGE" | "EMAIL" => {
      if (type === "send-email" || type === "follow-up-call") {
        return "EMAIL";
      }
      return "MESSAGE"; // Default to MESSAGE for other types
    };
    
    onUpdateTask(task.id, {
      title: formData.title,
      description: formData.description,
      dueDate: dueDateTime,
      priority: formData.priority.toUpperCase() as Priority,
      taskType: mapTaskType(formData.type),
      crmLead_Id: formData.contactId,
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

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[90vw] md:max-w-[650px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            <DialogTitle className="text-base sm:text-lg">Edit Task</DialogTitle>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Update task details and information.
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
              Assign to Contact <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.contactId.toString()}
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  contactId: parseInt(value)
                });
                setContactSearchQuery(""); // Reset search when contact is selected
              }}
              disabled={isLoadingContacts}
            >
              <SelectTrigger id="contact" className="text-sm">
                <SelectValue placeholder={isLoadingContacts ? "Cargando contactos..." : "Select a contact"} />
              </SelectTrigger>
              <SelectContent 
                position="popper" 
                className="max-h-[200px] z-[9999] p-0"
                sideOffset={4}
                align="start"
              >
                {/* Search input */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar contacto..."
                      value={contactSearchQuery}
                      onChange={(e) => {
                        e.stopPropagation();
                        setContactSearchQuery(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>
                
                {/* Contact list */}
                <div className="max-h-[150px] overflow-y-auto">
                  {isLoadingContacts ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Cargando contactos...</div>
                  ) : contacts.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">No hay contactos disponibles</div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">No se encontraron contactos</div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <SelectItem 
                        key={contact.id} 
                        value={contact.id.toString()}
                        onSelect={() => setContactSearchQuery("")}
                      >
                        {contact.name} {contact.email ? `(${contact.email})` : ""}
                      </SelectItem>
                    ))
                  )}
                </div>
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
              Update Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

