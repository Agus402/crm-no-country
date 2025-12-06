"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const AVAILABLE_COLORS = [
  { name: "Slate", bg: "bg-slate-300", text: "text-slate-700", border: "border-slate-200" },
  { name: "Red", bg: "bg-red-300", text: "text-red-700", border: "border-red-200" },
  { name: "Orange", bg: "bg-orange-300", text: "text-orange-700", border: "border-orange-200" },
  { name: "Amber", bg: "bg-amber-300", text: "text-amber-700", border: "border-amber-200" },
  { name: "Yellow", bg: "bg-yellow-300", text: "text-yellow-700", border: "border-yellow-200" },
  { name: "Lime", bg: "bg-lime-300", text: "text-lime-700", border: "border-lime-200" },
  { name: "Green", bg: "bg-green-300", text: "text-green-700", border: "border-green-200" },
  { name: "Emerald", bg: "bg-emerald-300", text: "text-emerald-700", border: "border-emerald-200" },
  { name: "Teal", bg: "bg-teal-300", text: "text-teal-700", border: "border-teal-200" },
  { name: "Cyan", bg: "bg-cyan-300", text: "text-cyan-700", border: "border-cyan-200" },
  { name: "Sky", bg: "bg-sky-300", text: "text-sky-700", border: "border-sky-200" },
  { name: "Blue", bg: "bg-blue-300", text: "text-blue-700", border: "border-blue-200" },
  { name: "Indigo", bg: "bg-indigo-300", text: "text-indigo-700", border: "border-indigo-200" },
  { name: "Violet", bg: "bg-violet-300", text: "text-violet-700", border: "border-violet-200" },
  { name: "Purple", bg: "bg-purple-300", text: "text-purple-700", border: "border-purple-200" },
  { name: "Fuchsia", bg: "bg-fuchsia-300", text: "text-fuchsia-700", border: "border-fuchsia-200" },
  { name: "Pink", bg: "bg-pink-300", text: "text-pink-700", border: "border-pink-200" },
  { name: "Rose", bg: "bg-rose-300", text: "text-rose-700", border: "border-rose-200" },
];

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tag: { name: string; color: string }) => void;
  editingTag?: { name: string; color: string } | null;
}

export function CreateTagModal({ isOpen, onClose, onSave, editingTag }: CreateTagModalProps) {
  const isEditing = !!editingTag;

  const initialColor = isEditing
    ? AVAILABLE_COLORS.find(c => editingTag.color.includes(c.bg)) || AVAILABLE_COLORS[0]
    : AVAILABLE_COLORS[0];

  const [tagName, setTagName] = useState(editingTag?.name || "");
  const [selectedColor, setSelectedColor] = useState(initialColor);

  useEffect(() => {
    if (editingTag) {
      setTagName(editingTag.name);
      const foundColor = AVAILABLE_COLORS.find(c => editingTag.color.includes(c.bg));
      setSelectedColor(foundColor || AVAILABLE_COLORS[0]);
    } else {
      setTagName("");
      setSelectedColor(AVAILABLE_COLORS[0]);
    }
  }, [editingTag, isOpen]);

  const handleSave = () => {
    if (!tagName.trim()) return;

    onSave({
      name: tagName,
      color: `${selectedColor.bg} ${selectedColor.text}`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          sm:max-w-[500px] 
          max-w-[90%]
          max-h-[85vh]
          overflow-y-auto
          px-4
        "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-purple-600" />
            {isEditing ? "Edit Tag" : "Create New Tag"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Tag name */}
          <div className="space-y-2">
            <Label htmlFor="tagName">Tag Name *</Label>
            <Input
              id="tagName"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <Label>Color</Label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all",
                    selectedColor.name === color.name
                      ? "border-purple-500 bg-purple-50/50"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  )}
                >
                  <div className={cn("w-full h-6 rounded-md mb-1", color.bg)}></div>
                  <span className="text-xs font-medium text-gray-600">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="h-16 border rounded-lg bg-gray-50/50 flex items-center justify-center border-dashed">
              {tagName ? (
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border",
                    selectedColor.bg,
                    selectedColor.text,
                    selectedColor.border
                  )}
                >
                  {tagName}
                </span>
              ) : (
                <span className="text-sm text-gray-400 italic">Enter a tag name to see preview</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSave}>
            {isEditing ? "Save Changes" : "Create Tag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
