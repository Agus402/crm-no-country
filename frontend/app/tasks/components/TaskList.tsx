import React, { useState } from "react";
import { Filter, ChevronDown, Clock, Bell, Check, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Task {
  id: string;
  title: string;
  contactName: string;
  contactInitials: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  dueTime: string;
  type: "message" | "email" | "call" | "follow-up-call" | "send-email" | "schedule-demo" | "send-proposal" | "client-onboarding" | "other";
  isAuto?: boolean;
  completed: boolean;
  description?: string;
  enableReminder?: boolean;
  isAutomated?: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
}

type FilterType = "all" | "pending" | "completed" | "automated";

export default function TaskList({ tasks, onToggleTask, onEditTask, onDeleteTask }: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getFilterLabel = (filterType: FilterType) => {
    switch (filterType) {
      case "all":
        return "Todas las tareas";
      case "pending":
        return "Pendientes";
      case "completed":
        return "Completadas";
      case "automated":
        return "Automatizadas";
      default:
        return "Todas las tareas";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case "pending":
        return !task.completed;
      case "completed":
        return task.completed;
      case "automated":
        return task.isAuto || task.isAutomated;
      case "all":
      default:
        return true;
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tus tareas</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-sm">
              <Filter className="h-4 w-4 mr-2" />
              {getFilterLabel(filter)}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuItem
              onClick={() => setFilter("all")}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>Todas las tareas</span>
                {filter === "all" && <Check className="h-4 w-4 text-purple-600" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter("pending")}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>Pendientes</span>
                {filter === "pending" && <Check className="h-4 w-4 text-purple-600" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter("completed")}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>Completadas</span>
                {filter === "completed" && <Check className="h-4 w-4 text-purple-600" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter("automated")}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>Automatizadas</span>
                {filter === "automated" && <Check className="h-4 w-4 text-purple-600" />}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 text-sm">
              No se encontraron tareas {filter !== "all" && `${getFilterLabel(filter).toLowerCase()} `}
            </p>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={`p-4 transition-all ${task.completed ? "opacity-60 bg-gray-50" : ""
                }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="h-4 w-4 mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <h3
                    className={`font-medium text-sm mb-2 ${task.completed ? "line-through text-gray-500" : ""
                      }`}
                  >
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>
                      {task.dueDate}, {task.dueTime}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{task.contactName}</span>
                    {task.isAuto && (
                      <>
                        <span className="mx-2">•</span>
                        <Badge variant="secondary" className="text-xs">
                          <Bell className="h-3 w-3 mr-1" />
                          Automatizada
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </Badge>
                  {(onEditTask || onDeleteTask) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEditTask && (
                          <DropdownMenuItem
                            onClick={() => onEditTask(task.id)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {onDeleteTask && (
                          <DropdownMenuItem
                            onClick={() => {
                              if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

