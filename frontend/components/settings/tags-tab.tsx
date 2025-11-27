"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Eye } from "lucide-react";
import { CreateTagModal } from "@/components/settings/create-tag-modal";

// Datos iniciales
const initialTags = [
  { name: "Enterprise", count: 23, color: "bg-purple-300" }, 
  { name: "High Priority", count: 15, color: "bg-orange-300" },
  { name: "Demo Requested", count: 31, color: "bg-purple-300" },
  { name: "Paid", count: 42, color: "bg-green-300" },
  { name: "VIP", count: 8, color: "bg-orange-300" },
  { name: "Interested", count: 56, color: "bg-orange-300" },
];

const views = [
  { name: "High Priority Leads", desc: "Stage: Active Lead + Tag: High Priority", used: "2 hours ago" },
  { name: "VIP Clients", desc: "Stage: Client + Tag: VIP", used: "1 day ago" },
  { name: "Pending Demos", desc: "Tag: Demo Requested", used: "3 days ago" },
];

export function TagsTab() {
  const [tags, setTags] = useState(initialTags);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCreateTag = (newTag: { name: string; color: string }) => {
    setTags([...tags, { ...newTag, count: 0 }]); 
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* --- TAGS SECTION --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Contact Tags</CardTitle>
            <CardDescription>Organize contacts with custom tags</CardDescription>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <Tag className="h-4 w-4" /> New Tag
          </Button>

          <CreateTagModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleCreateTag} 
          />
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {tags.map((tag, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-card transition-all hover:shadow-sm">
                <div className="flex items-center gap-3">
                  {tag.color !== "bg-transparent" && (
                    <div 
                      className={`h-3 w-3 shrink-0 rounded-full ${tag.color.split(" ")[0]}`} 
                    />
                  )}
                  
                  <div>
                    <p className="font-medium text-sm text-gray-900">{tag.name}</p>
                    <p className="text-xs text-muted-foreground">{tag.count} contacts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2">Edit</Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-600">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* --- VIEWS SECTION --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Saved Views</CardTitle>
            <CardDescription>Quick access to filtered contact lists</CardDescription>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
             <Eye className="h-4 w-4" /> New View
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex flex-col gap-4"> 
            {views.map((view, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                        <p className="font-medium text-sm">{view.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{view.desc}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Last used {view.used}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2">Edit</Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-600">Delete</Button>
                    </div>
                </div>
            ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}