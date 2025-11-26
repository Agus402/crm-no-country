"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogFooter,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, UserPlus, MessageCircle, Mail } from "lucide-react"; 

interface NewContactData {
  name: string;
  email: string;
  phone: string;
  channel: "WhatsApp" | "Email";
  stage: string;
  tags: string[];
}

interface AddContactModalProps {
  onAddContact: (contact: NewContactData) => void;
}

const SUGGESTED_TAGS = [
  "Enterprise",
  "High Priority",
  "Demo Requested",
  "VIP",
  "Paid",
  "Interested",
  "Onboarding",
  "Meeting Scheduled"
];

export function AddContactModal({ onAddContact }: AddContactModalProps) {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<NewContactData>({
    name: "",
    email: "",
    phone: "",
    channel: "WhatsApp",
    stage: "Active Lead",
    tags: [],
  });

  //  Estado para manejar los errores de validación
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const [tagInput, setTagInput] = useState("");

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
    // Lógica de Validación: Verificamos campos obligatorios
    const newErrors: { name?: string; email?: string } = {};
    let hasError = false;

    if (!formData.name.trim()) {
      newErrors.name = "El nombre completo es obligatorio.";
      hasError = true;
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    onAddContact(formData);

    setFormData({
      name: "",
      email: "",
      phone: "",
      channel: "WhatsApp",
      stage: "Active Lead",
      tags: [],
    });
    setErrors({}); 
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white col-span-2 lg:col-span-1">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-600" />
            Add New Contact
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a new contact in your CRM. Fill in the details below.
          </p>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Full Name con mensaje de error */}
          <div className="grid gap-2">
            <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={
                errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
              }
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email & Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className={errors.email ? "text-red-500" : ""}
              >
                Email *
              </Label>
              <Input
                id="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Channel & Stage Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Channel</Label>
              <Select
                value={formData.channel}
                onValueChange={(val: any) => handleInputChange("channel", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {/* 3. Iconos en las opciones */}
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
              <Label>Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(val) => handleInputChange("stage", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active Lead">Active Lead</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags Section */}
          <div className="grid gap-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-10">
              {formData.tags.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  No tags selected
                </span>
              )}
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
                  placeholder="Type custom tag..."
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
                  Add
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Add Contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
