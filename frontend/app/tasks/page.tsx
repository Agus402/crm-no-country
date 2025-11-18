"use client";

import { useState } from "react";
import { Plus, Calendar, CheckCircle2, Circle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  contactName?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Llamar a Sarah Chen",
      description: "Seguimiento de propuesta enviada",
      dueDate: "2024-01-15",
      contactName: "Sarah Chen",
      completed: false,
      priority: "high",
    },
    {
      id: "2",
      title: "Enviar cotización a Marcus",
      description: "Preparar cotización personalizada",
      dueDate: "2024-01-16",
      contactName: "Marcus Brown",
      completed: false,
      priority: "medium",
    },
    {
      id: "3",
      title: "Reunión con equipo",
      description: "Revisión semanal de leads",
      dueDate: "2024-01-14",
      completed: true,
      priority: "low",
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Tasks</h1>
          <p className="text-gray-600">Gestiona tus recordatorios y seguimientos</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Hoy
        </Button>
      </div>

      {/* Tareas pendientes */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Pendientes ({pendingTasks.length})</h2>
        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border rounded-lg p-4 flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <button onClick={() => toggleTask(task.id)} className="mt-1">
                <Circle className="h-5 w-5 text-gray-400 hover:text-purple-600" />
              </button>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{task.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  {task.contactName && (
                    <span className="text-gray-500">Contacto: {task.contactName}</span>
                  )}
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tareas completadas */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Completadas ({completedTasks.length})</h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-50 border rounded-lg p-4 flex items-start gap-4 opacity-75"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium mb-1 line-through">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

