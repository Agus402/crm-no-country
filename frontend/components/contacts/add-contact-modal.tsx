"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, UserPlus, MessageCircle, Mail, Pencil } from "lucide-react";

export interface NewContactData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  channel: "WhatsApp" | "Email";
  stage: string;
  tags: string[];
}

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: NewContactData) => void;
  contactToEdit?: NewContactData | null;
}

const SUGGESTED_TAGS = [
  "Empresarial",
  "Alta prioridad",
  "Demo solicitada",
  "VIP",
  "Pagado",
  "Interesado",
  "Onboarding",
  "Reunión programada",
];

const defaultFormData: NewContactData = {
  name: "",
  email: "",
  phone: "",
  channel: "WhatsApp",
  stage: "Active Lead",
  tags: [],
};

export function AddContactModal({
  isOpen,
  onClose,
  onSave,
  contactToEdit,
}: AddContactModalProps) {
  const [formData, setFormData] = useState<NewContactData>(defaultFormData);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [tagInput, setTagInput] = useState("");

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

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = () => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    let hasError = false;

    if (!formData.name.trim()) {
      newErrors.name = "El nombre completo es obligatorio.";
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //VALIDACION PARA EL MAIL
    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio.";
      hasError = true;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Por favor, ingresa un correo válido.";
      hasError = true;
    }



    const phoneRegex = /^[+]?[\d\s\-()]*$/;
    // Sacamos todo lo que no sea número para contar la longitud real
    const phoneDigits = formData.phone.replace(/\D/g, '');

    if (formData.phone.trim()) {
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "El formato contiene caracteres inválidos.";
        hasError = true;
      }
      // Mínimo 7 (ej: +683 4000), Máximo 15 (Estándar E.164)
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
                placeholder="john@example.com"
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
            <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-10">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="space-y-3 mt-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribir etiqueta personalizada..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (tagInput) addTag(tagInput);
                    }
                  }}
                  className="h-9"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (tagInput) addTag(tagInput);
                  }}
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="text-xs border rounded-full px-2 py-1 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> {tag}
                  </button>
                ))}
              </div>
            </div>
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