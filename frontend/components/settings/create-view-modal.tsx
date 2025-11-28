"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, TrendingUp, Star, Calendar, Check, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

// Mocks
const AVAILABLE_TAGS = [
  "Enterprise",
  "Hot Lead",
  "Agency",
  "SaaS",
  "E-commerce",
  "VIP",
  "Demo Scheduled",
  "Cold",
  "Warm",
  "Interested",
  "Active",
  "Fintech",
  "Healthcare",
  "Education",
  "Marketing",
];

const STAGES = [
  {
    id: "lead",
    label: "Lead",
    icon: TrendingUp,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    id: "client",
    label: "Client",
    icon: Star,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    id: "follow-up",
    label: "Follow-up",
    icon: Calendar,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
];

interface ViewObject {
  name: string;
  desc: string;
  filters: {
    stages: string[];
    tags: string[];
    isDefault: boolean;
  };
}

interface CreateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (view: ViewObject) => void;
  editingView?: ViewObject | null; // <--- NUEVA PROP
}

export function CreateViewModal({
  isOpen,
  onClose,
  onSave,
  editingView,
}: CreateViewModalProps) {
  const isEditing = !!editingView; // Booleano para saber si editamos

  const [viewName, setViewName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDefault, setIsDefault] = useState(false);

  // Lógica de carga de datos (Reset o Populate)
  useEffect(() => {
    if (isOpen) {
      if (editingView) {
        // MODO EDICIÓN: Cargar datos existentes
        setViewName(editingView.name);
        setDescription(editingView.desc);
        setSelectedStages(editingView.filters?.stages || []);
        setSelectedTags(editingView.filters?.tags || []);
        setIsDefault(editingView.filters?.isDefault || false);
      } else {
        // MODO CREACIÓN: Resetear a limpio
        setViewName("");
        setDescription("");
        setSelectedStages([]);
        setSelectedTags([]);
        setIsDefault(false);
      }
    }
  }, [isOpen, editingView]);

  const toggleStage = (id: string) => {
    setSelectedStages((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (!viewName.trim()) return;

    const generatedDesc =
      description ||
      `Filters: ${
        selectedStages.length ? selectedStages.join(", ") : "All Stages"
      } ${selectedTags.length > 0 ? `+ ${selectedTags.length} Tags` : ""}`;

    onSave({
      name: viewName,
      desc: generatedDesc,
      filters: { stages: selectedStages, tags: selectedTags, isDefault },
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-700">
            <Eye className="h-5 w-5" />
            {isEditing ? "Edit View" : "Create Custom View"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Update your view filters."
              : "Define filters to quickly access specific contact segments."}
          </p>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="viewName">View Name *</Label>
              <Input
                id="viewName"
                placeholder="e.g., Hot Leads"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (optional)</Label>
              <Input
                id="desc"
                placeholder="Brief description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 my-1"></div>

          <div className="flex items-center gap-2 -mb-2.5">
            <Filter className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold text-gray-900 text-sm">
              Filters Configuration
            </h3>
          </div>

          {/* Filter by Stage */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Filter by Stage
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {STAGES.map((stage) => {
                const isSelected = selectedStages.includes(stage.id);
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.id}
                    onClick={() => toggleStage(stage.id)}
                    className={cn(
                      "cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:shadow-md select-none",
                      isSelected
                        ? `border-purple-500 ring-1 ring-purple-500 bg-purple-50/50`
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="flex w-full justify-between items-start">
                      <div className={cn("p-2 rounded-lg", stage.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div
                        className={cn(
                          "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-purple-600 border-purple-600"
                            : "border-gray-300"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-full">
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter by Tags */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Filter by Tags
            </Label>

            <div className="flex flex-wrap gap-2 p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                      isSelected
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2 border p-3 rounded-lg bg-gray-50/30">
            <input
              type="checkbox"
              id="defaultView"
              className="accent-purple-600 h-4 w-4 cursor-pointer"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <label
              htmlFor="defaultView"
              className="text-sm font-medium cursor-pointer"
            >
              Set as default view
            </label>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center gap-2 text-purple-900 font-semibold text-sm mb-1">
              <Eye className="h-4 w-4" /> View Summary
            </div>
            <p className="text-xs text-purple-700">
              <span className="font-semibold">Applied Filters: </span>
              {selectedStages.length > 0
                ? selectedStages.join(", ")
                : "All Stages"}
              {selectedTags.length > 0 ? ` + ${selectedTags.length} Tags` : ""}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!viewName.trim()}
          >
            {isEditing ? "Save Changes" : "Create View"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
