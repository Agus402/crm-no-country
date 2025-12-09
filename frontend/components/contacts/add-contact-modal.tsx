"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, UserPlus, MessageCircle, Mail, Pencil, Loader2 } from "lucide-react";
import { tagService, TagData } from "@/services/tag.service";

export interface NewContactData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  channel: "WhatsApp" | "Email";
  stage: string;
  tagIds: number[];
}

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: NewContactData) => void;
  contactToEdit?: NewContactData | null;
}

const defaultFormData: NewContactData = {
  name: "",
  email: "",
  phone: "",
  channel: "WhatsApp",
  stage: "Active Lead",
  tagIds: [],
};

export function AddContactModal({
  isOpen,
  onClose,
  onSave,
  contactToEdit,
}: AddContactModalProps) {
  const [formData, setFormData] = useState<NewContactData>(defaultFormData);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [availableTags, setAvailableTags] = useState<TagData[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // Cargar tags de la BD
  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  const loadTags = async () => {
    try {
      setLoadingTags(true);
      const tags = await tagService.getAll();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (contactToEdit) {
        setFormData(contactToEdit);
      } else {
        setFormData(defaultFormData);
      }
      setErrors({});
    }
  }, [isOpen, contactToEdit]);

  const handleInputChange = (field: keyof NewContactData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleSubmit = () => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    let hasError = false;

    if (!formData.name.trim()) {
      newErrors.name = "El nombre completo es obligatorio.";
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio.";
      hasError = true;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Por favor, ingresa un correo válido.";
      hasError = true;
    }

    const phoneRegex = /^[+]?[\d\s\-()]*$/;
    const phoneDigits = formData.phone.replace(/\D/g, '');

    if (formData.phone.trim()) {
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "El formato contiene caracteres inválidos.";
        hasError = true;
      }
      else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        newErrors.phone = "El número debe tener entre 7 y 15 dígitos válidos.";
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {contactToEdit ? (
              <>
                <Pencil className="h-5 w-5 text-purple-600" />
                Editar contacto
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-purple-600" />
                Agregar nuevo contacto
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
              Nombre completo *
            </Label>
            <Input
              id="name"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>
                Correo electrónico *
              </Label>
              <Input
                id="email"
                placeholder="juan@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className={errors.phone ? "text-red-500" : ""}>
                Teléfono
              </Label>
              <Input
                id="phone"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 font-medium">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Canal</Label>
              <Select
                value={formData.channel}
                onValueChange={(val: any) => handleInputChange("channel", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WhatsApp">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <span>WhatsApp</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>Email</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Etapa</Label>
              <Select
                value={formData.stage}
                onValueChange={(val) => handleInputChange("stage", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active Lead">Active Lead</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Etiquetas</Label>
            {loadingTags ? (
              <div className="flex items-center gap-2 p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">Cargando etiquetas...</span>
              </div>
            ) : availableTags.length === 0 ? (
              <div className="p-3 border rounded-md text-sm text-gray-500">
                No hay etiquetas disponibles. Puedes crearlas en Configuración → Etiquetas.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-10">
                {availableTags.map((tag) => {
                  const isSelected = formData.tagIds.includes(tag.id!);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id!)}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium transition-all
                        flex items-center gap-1
                        ${isSelected
                          ? 'ring-2 ring-offset-1 ring-purple-500'
                          : 'hover:opacity-80'
                        }
                      `}
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color,
                        borderColor: tag.color,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                      }}
                    >
                      {tag.name}
                      {isSelected && <X className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {contactToEdit ? "Guardar cambios" : "Agregar contacto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}