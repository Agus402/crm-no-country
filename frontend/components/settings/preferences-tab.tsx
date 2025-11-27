"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PreferencesTab() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* General Preferences */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-base">General Preferences</CardTitle>
            <CardDescription>Customize your CRM experience</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button 
                variant="outline" 
                className="w-full md:w-auto" 
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <Button size="sm" onClick={() => setIsEditing(false)}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input 
              defaultValue="Startup CRM Inc." 
              readOnly={!isEditing}
              className={!isEditing ? "bg-gray-50 text-gray-500 border-transparent shadow-none" : "bg-white"}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Time Zone</Label>
            <Input 
              defaultValue="(UTC-08:00) Pacific Time" 
              readOnly={!isEditing}
              className={!isEditing ? "bg-gray-50 text-gray-500 border-transparent shadow-none" : "bg-white"}
            />
          </div>

          <div className="space-y-2">
            <Label>Date Format</Label>
            <Input 
              defaultValue="MM/DD/YYYY" 
              readOnly={!isEditing}
              className={!isEditing ? "bg-gray-50 text-gray-500 border-transparent shadow-none" : "bg-white"}
            />
          </div> 
            </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Data</CardTitle>
          <CardDescription>Download your CRM data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">Export Contacts (CSV)</Button>
            <Button variant="outline">Export Messages (PDF)</Button>
            <Button variant="outline">Export All Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}