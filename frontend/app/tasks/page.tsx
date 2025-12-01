"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingTasks from "./components/PendingTasks";
import CompletedTasks from "./components/CompletedTasks";
import AutomationRules from "./components/AutomationRules";
import NewTaskModal from "./components/NewTaskModal";

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const handleNewButtonClick = () => {
    if (activeTab === "automation") {
      // TODO: Open New Rule modal when automation tab is active
      console.log("Open New Rule modal");
    } else {
      setIsNewTaskModalOpen(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">Tasks & Automation</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage follow-ups and automated workflows.</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
          onClick={handleNewButtonClick}
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === "automation" ? "New Rule" : "New Task"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto flex flex-wrap">
          <TabsTrigger value="pending" className="flex-1 sm:flex-none text-xs sm:text-sm">
            Pending Tasks
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 sm:flex-none text-xs sm:text-sm">
            Completed
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex-1 sm:flex-none text-xs sm:text-sm">
            Automation Rules
          </TabsTrigger>
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

      <NewTaskModal
        open={isNewTaskModalOpen}
        onOpenChange={setIsNewTaskModalOpen}
      />
    </div>
  );
}

