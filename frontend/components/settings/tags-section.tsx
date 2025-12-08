"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Tag as TagIcon } from "lucide-react"; 
import { CreateTagModal } from "@/components/settings/create-tag-modal";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal"; 
import { tagService, TagData } from "@/services/tag.service";

export function TagsSection() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Modales
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Estados de Selección (Ahora usamos ID o el Objeto entero, no el índice)
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [tagToDeleteId, setTagToDeleteId] = useState<number | null>(null);

  // 1. Cargar Tags al montar
  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await tagService.getAll();
      setTags(data);
    } catch (error) {
      console.error("Failed to load tags", error);
      // toast.error("Error loading tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // 2. Crear Tag
  const handleCreateTag = async (newTagData: { name: string; color: string }) => {
    try {
      // Optimistic update o recarga
      await tagService.create(newTagData);
      await fetchTags(); // Recargamos para obtener el ID correcto del server
      setTagModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // 3. Editar Tag
  const handleUpdateTag = async (updatedData: { name: string; color: string }) => {
    if (!editingTag || !editingTag.id) return;

    try {
      await tagService.update(editingTag.id, updatedData);
      
      // Actualización local para UI inmediata
      setTags(tags.map(t => (t.id === editingTag.id ? { ...t, ...updatedData } : t)));
      setEditingTag(null);
      setTagModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // 4. Eliminar Tag
  const confirmDelete = async () => {
    if (tagToDeleteId !== null) {
      try {
        await tagService.delete(tagToDeleteId);
        setTags(tags.filter((t) => t.id !== tagToDeleteId));
      } catch (error) {
        console.error(error);
      }
    }
    setOpenDelete(false);
    setTagToDeleteId(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Contact Tags</CardTitle>
            <CardDescription>Organize contacts with custom tags</CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingTag(null);
              setTagModalOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <TagIcon className="h-4 w-4" /> New Tag
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : tags.length === 0 ? (
             <div className="text-center py-8 text-gray-500 text-sm">
                No tags found. Create one to get started.
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-4 border rounded-lg bg-card transition-all hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    {/* Renderizado de color seguro: si viene vacio ponemos gris */}
                    <div className={`h-3 w-3 shrink-0 rounded-full ${tag.color || "bg-gray-300"}`} />
                    <div>
                      <p className="font-medium text-sm text-gray-900">{tag.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2" 
                        onClick={() => { 
                            setEditingTag(tag); 
                            setTagModalOpen(true); 
                        }}
                    >
                        Edit
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-red-500 hover:text-red-600" 
                        onClick={() => { 
                            setTagToDeleteId(tag.id!); 
                            setOpenDelete(true); 
                        }}
                    >
                        Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTagModal
        isOpen={tagModalOpen}
        onClose={() => {
          setEditingTag(null);
          setTagModalOpen(false);
        }}
        // Decidimos qué función ejecutar según si hay un tag en edición o no
        onSave={editingTag ? handleUpdateTag : handleCreateTag}
        editingTag={editingTag}
      />

      <ConfirmDeleteModal
        open={openDelete}
        title="Delete Tag"
        message="Are you sure you want to delete this tag? This action cannot be undone."
        onCancel={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}