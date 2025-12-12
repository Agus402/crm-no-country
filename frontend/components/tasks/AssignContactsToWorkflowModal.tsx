"use client";

import React, { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { contactService, CrmLeadDTO } from "@/services/contact.service";

interface AssignContactsToWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  workflowName: string;
  onAssign: (workflowId: string, contactIds: number[]) => Promise<void>;
  assignedContactIds?: number[];
}

export default function AssignContactsToWorkflowModal({
  open,
  onOpenChange,
  workflowId,
  workflowName,
  onAssign,
  assignedContactIds = [],
}: AssignContactsToWorkflowModalProps) {
  const [contacts, setContacts] = useState<CrmLeadDTO[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<Set<number>>(new Set(assignedContactIds));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load contacts when modal opens - exactly like CreateTaskModal
  useEffect(() => {
    if (open) {
      const loadContacts = async () => {
        try {
          setIsLoadingContacts(true);
          setError(null);
          const contactsData = await contactService.getAll();
          console.log("Contactos cargados:", contactsData.length);
          setContacts(contactsData);
          if (contactsData.length === 0) {
            setError("No se encontraron contactos. Ve a la sección de Contactos para crear algunos contactos primero.");
          }
        } catch (error: any) {
          console.error("Error loading contacts:", error);
          const errorMessage = error?.message || "Error al cargar los contactos. Por favor, intenta nuevamente.";
          setError(errorMessage);
          setContacts([]);
        } finally {
          setIsLoadingContacts(false);
        }
      };
      loadContacts();
    } else {
      // Reset contacts and search when modal closes
      setContacts([]);
      setSearchQuery("");
      setError(null);
    }
  }, [open]);

  // Update selected contacts when assignedContactIds changes (but only if modal is open)
  useEffect(() => {
    if (open && assignedContactIds.length > 0) {
      setSelectedContactIds(new Set(assignedContactIds));
    }
  }, [open, assignedContactIds]);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      (contact.phone && contact.phone.toLowerCase().includes(query))
    );
  });

  const handleToggleContact = (contactId: number) => {
    const newSelected = new Set(selectedContactIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContactIds(newSelected);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onAssign(workflowId, Array.from(selectedContactIds));
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning contacts:", error);
      // Error handling could be improved with a toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Asignar contactos a "{workflowName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar contacto por nombre, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Error message */}
          {error && !isLoadingContacts && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    const loadContacts = async () => {
                      try {
                        setIsLoadingContacts(true);
                        const contactsData = await contactService.getAll();
                        setContacts(contactsData);
                        if (contactsData.length === 0) {
                          setError("No se encontraron contactos. Ve a la sección de Contactos para crear algunos contactos primero.");
                        } else {
                          setError(null);
                        }
                      } catch (error: any) {
                        const errorMessage = error?.message || "Error al cargar los contactos. Por favor, intenta nuevamente.";
                        setError(errorMessage);
                        setContacts([]);
                      } finally {
                        setIsLoadingContacts(false);
                      }
                    };
                    loadContacts();
                  }}
                  className="ml-2 h-7 text-xs"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {/* Selected count */}
          {selectedContactIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {selectedContactIds.size} contacto{selectedContactIds.size !== 1 ? "s" : ""} seleccionado{selectedContactIds.size !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}

          {/* Contacts list */}
          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {isLoadingContacts ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Cargando contactos...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-red-600">
                {error}
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {searchQuery ? "No se encontraron contactos con ese criterio de búsqueda" : "No hay contactos disponibles. Crea contactos en la sección de Contactos."}
              </div>
            ) : (
              <div className="divide-y">
                {filteredContacts.map((contact) => {
                  const isSelected = selectedContactIds.has(contact.id);
                  return (
                    <div
                      key={contact.id}
                      onClick={() => handleToggleContact(contact.id)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? "bg-purple-50 border-l-4 border-l-purple-600" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? "bg-purple-600 border-purple-600"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {contact.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {contact.email}
                            {contact.phone && ` • ${contact.phone}`}
                          </p>
                        </div>
                        {contact.stage && (
                          <Badge variant="outline" className="text-xs">
                            {contact.stage}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedContactIds.size === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? "Guardando..." : `Asignar ${selectedContactIds.size} contacto${selectedContactIds.size !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

