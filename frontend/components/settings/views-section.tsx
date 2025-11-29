"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { CreateViewModal } from "@/components/settings/create-view-modal";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";
import { INITIAL_VIEWS } from "@/components/settings/data"; 

export function ViewsSection() {
  const [viewsList, setViewsList] = useState(INITIAL_VIEWS);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingViewIndex, setEditingViewIndex] = useState<number | null>(null);
  
  // Delete states
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedViewIndex, setSelectedViewIndex] = useState<number | null>(null);

  const handleCreateView = (newView: any) => {
    setViewsList([{ ...newView, used: "Just now" }, ...viewsList]);
    setViewModalOpen(false);
  };

  const handleUpdateView = (updatedView: any) => {
    if (editingViewIndex === null) return;
    const updatedList = [...viewsList];
    updatedList[editingViewIndex] = { ...updatedList[editingViewIndex], ...updatedView };
    setViewsList(updatedList);
    setEditingViewIndex(null);
    setViewModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedViewIndex !== null) {
      setViewsList(viewsList.filter((_, i) => i !== selectedViewIndex));
    }
    setOpenDelete(false);
    setSelectedViewIndex(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Saved Views</CardTitle>
            <CardDescription>Quick access to filtered contact lists</CardDescription>
          </div>
          <Button 
            onClick={() => {
                setEditingViewIndex(null);
                setViewModalOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <Eye className="h-4 w-4" /> New View
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            {viewsList.map((view, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{view.name}</p>
                    {view.filters?.isDefault && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{view.desc}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Last used {view.used}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => {
                    setEditingViewIndex(i);
                    setViewModalOpen(true);
                  }}>Edit</Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-600" onClick={() => {
                    setSelectedViewIndex(i);
                    setOpenDelete(true);
                  }}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateViewModal 
        isOpen={viewModalOpen}
        onClose={() => {
            setEditingViewIndex(null);
            setViewModalOpen(false)
        }}
        onSave={editingViewIndex === null ? handleCreateView : handleUpdateView}
        editingView={editingViewIndex !== null ? viewsList[editingViewIndex] : null}
      />

      <ConfirmDeleteModal
        open={openDelete}
        title="Delete View"
        message="Are you sure you want to delete this saved view?"
        onCancel={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}