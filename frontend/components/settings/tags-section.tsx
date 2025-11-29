"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { CreateTagModal } from "@/components/settings/create-tag-modal";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal"; 
import { INITIAL_TAGS } from "@/components/settings/data";

export function TagsSection() {
  const [tags, setTags] = useState(INITIAL_TAGS);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);

  const handleCreateTag = (newTag: any) => {
    setTags([...tags, { ...newTag, count: 0 }]);
    setTagModalOpen(false);
  };

  const handleUpdateTag = (updatedTag: any) => {
    if (editingTagIndex === null) return;
    const updatedList = [...tags];
    updatedList[editingTagIndex] = { ...updatedList[editingTagIndex], ...updatedTag };
    setTags(updatedList);
    setEditingTagIndex(null);
    setTagModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedTagIndex !== null) {
      setTags(tags.filter((_, i) => i !== selectedTagIndex));
    }
    setOpenDelete(false);
    setSelectedTagIndex(null);
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
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-card transition-all hover:shadow-sm">
                 <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 shrink-0 rounded-full ${tag.color.split(" ")[0]}`} />
                    <div>
                        <p className="font-medium text-sm text-gray-900">{tag.name}</p>
                        <p className="text-xs text-muted-foreground">{tag.count} contacts</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setEditingTagIndex(i); setTagModalOpen(true); }}>Edit</Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-600" onClick={() => { setSelectedTagIndex(i); setOpenDelete(true); }}>Delete</Button>
                 </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateTagModal
        isOpen={tagModalOpen}
        onClose={() => {
          setEditingTagIndex(null);
          setTagModalOpen(false);
        }}
        onSave={editingTagIndex === null ? handleCreateTag : handleUpdateTag}
        editingTag={editingTagIndex !== null ? tags[editingTagIndex] : null}
      />

      <ConfirmDeleteModal
        open={openDelete}
        title="Delete Tag"
        message="Are you sure you want to delete this tag"
        onCancel={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}