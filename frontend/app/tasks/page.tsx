"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingTasks from "./components/PendingTasks";
import CompletedTasks from "./components/CompletedTasks";
import AutomationRules from "./components/AutomationRules";

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Tasks & Automation</h1>
          <p className="text-gray-600">Manage follow-ups and automated workflows.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === "automation" ? "New Rule" : "New Task"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending Tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingTasks />
        </TabsContent>

        <TabsContent value="completed">
          <CompletedTasks />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationRules />
        </TabsContent>
      </Tabs>
    </div>
  );
}

