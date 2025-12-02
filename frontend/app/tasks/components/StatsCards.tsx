import React from "react";
import { Clock, CheckCircle2, Bell, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardsProps {
  pendingCount: number;
  completedCount: number;
  automatedCount: number;
  dueTodayCount: number;
}

export default function StatsCards({
  pendingCount,
  completedCount,
  automatedCount,
  dueTodayCount,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 border-l-4 border-l-purple-500">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Tasks</p>
            <p className="text-2xl font-semibold">{pendingCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-l-4 border-l-green-500">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-semibold">{completedCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Automated</p>
            <p className="text-2xl font-semibold">{automatedCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-l-4 border-l-orange-500">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <CalendarClock className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Today</p>
            <p className="text-2xl font-semibold">{dueTodayCount}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

