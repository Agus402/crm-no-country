import React from "react";
import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reminder } from "@/services/smart-reminder.service";

interface SmartRemindersProps {
  reminders: Reminder[];
}

export default function SmartReminders({ reminders }: SmartRemindersProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Smart Reminders</h2>
        <Bell className="h-5 w-5 text-purple-600" />
      </div>
      <div className="space-y-3">
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <Card key={reminder.id} className="p-3">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">{reminder.text}</p>
                  <p className="text-xs text-gray-500">{reminder.time}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-4">
            <p className="text-sm text-gray-500 text-center">
              No hay smart reminders disponibles. Los reminders se generan automáticamente basándose en la actividad de tus leads.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

