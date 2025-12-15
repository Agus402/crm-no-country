"use client";

import { useEffect, useState } from "react";
import { leadService } from "@/services/lead.service";
import { taskService } from "@/services/task.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Activity, Clock } from "lucide-react";

export function StatsCards() {
  const [totalContacts, setTotalContacts] = useState<string>("...");
  const [pendingTasksCount, setPendingTasksCount] = useState<string>("...");
  const [tasksDueTodayCount, setTasksDueTodayCount] = useState<number>(0);

  useEffect(() => {
    async function loadStats() {
      // 1. Cargar Contactos
      try {
        const leads = await leadService.getAll();
        setTotalContacts(leads.length.toString());
      } catch (error) {
        console.error("Error loading leads:", error);
        setTotalContacts("0");
      }

      // 2. Cargar Tareas Pendientes (Seguimientos)
      try {
        const allTasks = await taskService.getAll();
        const incompleteTasks = allTasks.filter(t => !t.completed);
        setPendingTasksCount(incompleteTasks.length.toString());

        // Cálculo de "Vencen hoy" 
        const now = new Date();
        const localTodayStr = now.toLocaleDateString('en-CA');
        const dueTodayCount = incompleteTasks.filter(t => {
          if (!t.dueDate) return false;
          const taskDateStr = t.dueDate.split('T')[0];
          return taskDateStr === localTodayStr;
        }).length;

        setTasksDueTodayCount(dueTodayCount);

      } catch (error) {
        console.error("Error loading tasks:", error);
        setPendingTasksCount("0");
        setTasksDueTodayCount(0);
      }
    }

    loadStats();
  }, []);

  const stats = [
    {
      title: "Contactos activos",
      value: totalContacts,
      change: "+12.5%", //  MOCKEADO 
      trend: "up",
      period: "desde el mes pasado",
      icon: Users,
    },
    {
      title: "Mensajes enviados",
      value: "1,284",
      change: "+8.2%",
      trend: "up",
      period: "desde la semana pasada",
      icon: MessageSquare,
    },
    {
      title: "Tasa de respuesta",
      value: "81%",
      change: "+6.1%",
      trend: "up",
      period: "desde la semana pasada",
      icon: Activity,
    },
    {
      title: "Seguimientos pendientes",
      value: pendingTasksCount,
      change: `${tasksDueTodayCount} vencen hoy`,
      trend: tasksDueTodayCount > 0 ? "neutral" : "up",
      period: "",
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span
                className={
                  stat.trend === "neutral"
                    ? "text-orange-500 font-medium"
                    : "text-green-500 font-medium"
                }
              >
                {stat.change}
              </span>{" "}
              {stat.period}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
