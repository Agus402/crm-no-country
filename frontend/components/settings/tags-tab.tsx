"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tag, Eye } from "lucide-react";
import { CreateTagModal } from "@/components/settings/create-tag-modal";
import { CreateViewModal } from "@/components/settings/create-view-modal";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";

// --- MOCKS INICIALES ---
const initialTags = [
  { name: "Enterprise", count: 23, color: "bg-purple-300 text-purple-700" },
  { name: "High Priority", count: 15, color: "bg-orange-300 text-orange-700" },
  { name: "Demo Requested", count: 31, color: "bg-purple-300 text-purple-700" },
  { name: "Paid", count: 42, color: "bg-green-300 text-green-700" },
  { name: "VIP", count: 8, color: "bg-orange-300 text-orange-700" },
  { name: "Interested", count: 56, color: "bg-orange-300 text-orange-700" },
];

// Actualizamos el mock para que tenga la estructura real con 'filters'
const initialViews = [
  {
    name: "High Priority Leads",
    desc: "Stage: Lead + Tag: High Priority",
    used: "2 hours ago",
    filters: { stages: ["lead"], tags: ["High Priority"], isDefault: false },
  },
  {
    name: "VIP Clients",
    desc: "Stage: Client + Tag: VIP",
    used: "1 day ago",
    filters: { stages: ["client"], tags: ["VIP"], isDefault: true },
  },
];

export function TagsTab() {
  // STATE: Tags
  const [tags, setTags] = useState(initialTags);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);

  // STATE: Views
  const [viewsList, setViewsList] = useState(initialViews);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingViewIndex, setEditingViewIndex] = useState<number | null>(null);

  // STATE: Delete (Compartido lógica, diferente estado para control fino)
  const [openDeleteTag, setOpenDeleteTag] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);

  const [openDeleteView, setOpenDeleteView] = useState(false);
  const [selectedViewIndex, setSelectedViewIndex] = useState<number | null>(
    null
  );

  // --- HANDLERS: TAGS ---
  const handleCreateTag = (newTag: { name: string; color: string }) => {
    setTags([...tags, { ...newTag, count: 0 }]);
    setTagModalOpen(false);
  };

  const handleUpdateTag = (updatedTag: { name: string; color: string }) => {
    if (editingTagIndex === null) return;
    const updatedList = [...tags];
    updatedList[editingTagIndex] = {
      ...updatedList[editingTagIndex],
      ...updatedTag,
    };
    setTags(updatedList);
    setEditingTagIndex(null);
    setTagModalOpen(false);
  };

  const confirmDeleteTag = () => {
    if (selectedTagIndex !== null) {
      setTags(tags.filter((_, i) => i !== selectedTagIndex));
    }
    setOpenDeleteTag(false);
    setSelectedTagIndex(null);
  };

  // --- HANDLERS: VIEWS ---

  // Crear nueva vista
  const handleCreateView = (newView: any) => {
    setViewsList([{ ...newView, used: "Just now" }, ...viewsList]);
    setViewModalOpen(false);
  };

  // Actualizar vista existente
  const handleUpdateView = (updatedView: any) => {
    if (editingViewIndex === null) return;
    const updatedList = [...viewsList];

    // Mantenemos el 'used' antiguo, actualizamos el resto
    updatedList[editingViewIndex] = {
      ...updatedList[editingViewIndex],
      ...updatedView,
    };

    setViewsList(updatedList);
    setEditingViewIndex(null);
    setViewModalOpen(false);
  };

  // Abrir modal editar vista
  const openEditViewModal = (index: number) => {
    setEditingViewIndex(index);
    setViewModalOpen(true);
  };

  // Abrir modal borrar vista
  const openDeleteViewModal = (index: number) => {
    setSelectedViewIndex(index);
    setOpenDeleteView(true);
  };

  // Confirmar borrar vista
  const confirmDeleteView = () => {
    if (selectedViewIndex !== null) {
      setViewsList(viewsList.filter((_, i) => i !== selectedViewIndex));
    }
    setOpenDeleteView(false);
    setSelectedViewIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* --- SECCION TAGS --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Contact Tags</CardTitle>
            <CardDescription>
              Organize contacts with custom tags
            </CardDescription>
          </div>

          <Button
            onClick={() => {
              setEditingTagIndex(null);
              setTagModalOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <Tag className="h-4 w-4" /> New Tag
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {tags.map((tag, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg bg-card transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 shrink-0 rounded-full ${
                      tag.color.split(" ")[0]
                    }`}
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {tag.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tag.count} contacts
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => {
                      setEditingTagIndex(i);
                      setTagModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTagIndex(i);
                      setOpenDeleteTag(true);
                    }}
                    className="h-8 px-2 text-red-500 hover:text-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* --- SECCION VIEWS --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Saved Views</CardTitle>
            <CardDescription>
              Quick access to filtered contact lists
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingViewIndex(null); // Asegurar que no editamos
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
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{view.name}</p>
                    {view.filters?.isDefault && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {view.desc}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Last used {view.used}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => openEditViewModal(i)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-red-500 hover:text-red-600"
                    onClick={() => openDeleteViewModal(i)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* --- MODALES --- */}

      {/* Modal Crear/Editar Tag */}
      <CreateTagModal
        isOpen={tagModalOpen}
        onClose={() => {
          setEditingTagIndex(null);
          setTagModalOpen(false);
        }}
        onSave={editingTagIndex === null ? handleCreateTag : handleUpdateTag}
        editingTag={editingTagIndex !== null ? tags[editingTagIndex] : null}
      />

      {/* Modal Crear/Editar View (CON DATA PASADA) */}
      <CreateViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setEditingViewIndex(null);
          setViewModalOpen(false);
        }}
        onSave={editingViewIndex === null ? handleCreateView : handleUpdateView}
        editingView={
          editingViewIndex !== null ? viewsList[editingViewIndex] : null
        }
      />

      {/* Confirmar Delete Tag */}
      <ConfirmDeleteModal
        open={openDeleteTag}
        title="Delete Tag"
        message="Are you sure you want to delete this tag?"
        onCancel={() => setOpenDeleteTag(false)}
        onConfirm={confirmDeleteTag}
      />

      {/* Confirmar Delete View (REUTILIZAMOS COMPONENTE) */}
      <ConfirmDeleteModal
        open={openDeleteView}
        title="Delete View"
        message="Are you sure you want to delete this  view?"
        onCancel={() => setOpenDeleteView(false)}
        onConfirm={confirmDeleteView}
      />
    </div>
  );
}
