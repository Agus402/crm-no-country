"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Filter, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactTable } from "@/components/contacts/contact-table";
import { ContactCard } from "@/components/contacts/contact-card";
import { AddContactModal, NewContactData } from "@/components/contacts/add-contact-modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { contactService, CrmLeadDTO } from "@/services/contact.service";
import { tagService, TagData } from "@/services/tag.service";
import { conversationService } from "@/services/conversation.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { generateContactsListPDF } from "@/utils/pdf-generator";

const STAGES = ["All Stages", "Active Lead", "Follow-up", "Client"];

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  return date.toLocaleDateString();
};

// Helper function to get initials
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function ContactPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<CrmLeadDTO[]>([]);
  const [allTags, setAllTags] = useState<TagData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<NewContactData | null>(null);

  // Load contacts and tags on mount
  useEffect(() => {
    loadContacts();
    loadTags();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactService.getAll();
      setContacts(data);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error(error instanceof Error ? error.message : "Error al cargar los contactos");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await tagService.getAll();
      setAllTags(tags);
    } catch (error) {
      console.error("Error loading tags:", error);
    }
  };

  // Helper to get tag info by ID
  const getTagsForContact = (tagIds: number[]): TagData[] => {
    if (!tagIds || tagIds.length === 0) return [];
    // Convertir a números para asegurar comparación correcta
    const numericTagIds = tagIds.map(id => Number(id));
    return allTags.filter(tag => tag.id !== undefined && numericTagIds.includes(Number(tag.id)));
  };

  const handleOpenCreate = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: CrmLeadDTO) => {
    // Convert CrmLeadDTO to NewContactData format
    setEditingContact({
      id: contact.id.toString(),
      name: contact.name,
      email: contact.email,
      phone: contact.phone || "",
      channel: contact.channel as "WhatsApp" | "Email",
      stage: contact.stage,
      tagIds: contact.tagIds || [],
    });
    setIsModalOpen(true);
  };

  const handleSaveContact = async (contactData: NewContactData) => {
    try {
      if (editingContact?.id) {
        // Update existing contact
        await contactService.update(Number(editingContact.id), {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || undefined,
          stage: contactData.stage,
          channel: contactData.channel,
          tagIds: contactData.tagIds,
        });
        toast.success("Contacto actualizado exitosamente");
      } else {
        // Create new contact
        await contactService.create({
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || undefined,
          stage: contactData.stage,
          channel: contactData.channel,
          tagIds: contactData.tagIds,
        });
        toast.success("Contacto creado exitosamente");
      }
      setIsModalOpen(false);
      await loadContacts(); // Reload contacts
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error(error instanceof Error ? error.message : "Error al guardar el contacto");
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este contacto?")) {
      return;
    }
    try {
      await contactService.delete(id);
      toast.success("Contacto eliminado exitosamente");
      await loadContacts(); // Reload contacts
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar el contacto");
    }
  };

  // Handle WhatsApp action - create or find conversation and navigate to messages
  const handleWhatsAppAction = async (contact: CrmLeadDTO) => {
    if (!contact.phone) {
      toast.error("Este contacto no tiene número de teléfono", {
        description: "Necesitas agregar un teléfono para usar WhatsApp"
      });
      return;
    }

    try {
      // Try to find existing conversation
      const existingConversation = await conversationService.findByLeadId(contact.id);
      
      if (existingConversation && existingConversation.channel === "WHATSAPP") {
        // Navigate to messages page with conversation selected
        router.push(`/messages?conversationId=${existingConversation.id}`);
        toast.success("Conversación abierta", {
          description: `Abriendo conversación de WhatsApp con ${contact.name}`
        });
      } else {
        // Create new conversation
        const newConversation = await conversationService.create({
          leadId: contact.id,
          channel: "WHATSAPP",
          assignedUserId: user?.id,
        });
        router.push(`/messages?conversationId=${newConversation.id}`);
        toast.success("Conversación creada", {
          description: `Nueva conversación de WhatsApp con ${contact.name}`
        });
      }
    } catch (error) {
      console.error("Error handling WhatsApp action:", error);
      toast.error("Error al crear conversación", {
        description: error instanceof Error ? error.message : "No se pudo crear la conversación"
      });
    }
  };

  // Handle Email action - create or find conversation and navigate to messages
  const handleEmailAction = async (contact: CrmLeadDTO) => {
    if (!contact.email) {
      toast.error("Este contacto no tiene email", {
        description: "Necesitas agregar un email para enviar correos"
      });
      return;
    }

    try {
      // Try to find existing conversation
      const existingConversation = await conversationService.findByLeadId(contact.id);
      
      if (existingConversation && existingConversation.channel === "EMAIL") {
        // Navigate to messages page with conversation selected
        router.push(`/messages?conversationId=${existingConversation.id}`);
        toast.success("Conversación abierta", {
          description: `Abriendo conversación de Email con ${contact.name}`
        });
      } else {
        // Create new conversation
        const newConversation = await conversationService.create({
          leadId: contact.id,
          channel: "EMAIL",
          assignedUserId: user?.id,
        });
        router.push(`/messages?conversationId=${newConversation.id}`);
        toast.success("Conversación creada", {
          description: `Nueva conversación de Email con ${contact.name}`
        });
      }
    } catch (error) {
      console.error("Error handling Email action:", error);
      toast.error("Error al crear conversación", {
        description: error instanceof Error ? error.message : "No se pudo crear la conversación"
      });
    }
  };

  // Handle Create Task action - navigate to tasks page with contact pre-selected
  const handleCreateTask = (contact: CrmLeadDTO) => {
    // Navigate to tasks page with contact ID in query params
    router.push(`/tasks?contactId=${contact.id}&contactName=${encodeURIComponent(contact.name)}`);
    toast.info("Redirigiendo a crear tarea", {
      description: `Se abrirá el formulario de tarea para ${contact.name}`
    });
  };

  const filteredContacts = contacts
    .map((contact) => {
      const mappedTags = getTagsForContact(contact.tagIds);
      return {
        ...contact,
        initials: getInitials(contact.name),
        lastContact: formatDate(contact.updatedAt || contact.createdAt),
        tags: mappedTags,
      };
    })
    .filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === "All Stages" || contact.stage === stageFilter;
      return matchesSearch && matchesStage;
    });

  const handleExportAll = () => {
    if (filteredContacts.length === 0) {
      toast.error("No hay contactos para exportar");
      return;
    }
    generateContactsListPDF(filteredContacts);
    toast.success("Lista de contactos exportada");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 p-4 md:px-8 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div><h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contactos</h1><p className="text-sm md:text-base text-gray-600 mt-1">Administra y segmenta tus contactos a través del embudo de ventas.</p></div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Buscar contactos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-3">
            <Button onClick={handleOpenCreate} className="bg-purple-600 hover:bg-purple-700 text-white col-span-2 lg:col-span-1">
              <UserPlus className="h-4 w-4 mr-2" /> Agregar contacto
            </Button>

            <AddContactModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveContact}
              contactToEdit={editingContact}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" className={stageFilter !== "All Stages" ? "bg-purple-50 border-purple-200 text-purple-700" : ""}><Filter className="h-4 w-4 mr-2" />{stageFilter === "All Stages" ? "Filtrar" : stageFilter}</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48"><DropdownMenuLabel>Filtrar por etapa</DropdownMenuLabel><DropdownMenuSeparator />{STAGES.map((stage) => (<DropdownMenuItem key={stage} onClick={() => setStageFilter(stage)} className="justify-between">{stage}{stageFilter === stage && <Check className="h-4 w-4 text-purple-600" />}</DropdownMenuItem>))}</DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={handleExportAll}><Download className="h-4 w-4 mr-2" /> Exportar</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:px-8 md:py-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Cargando contactos...</p>
          </div>
        ) : (
          <>
            <div className="hidden xl:block">
              <ContactTable 
                contacts={filteredContacts} 
                onEdit={handleOpenEdit} 
                onDelete={handleDeleteContact}
                onWhatsApp={handleWhatsAppAction}
                onEmail={handleEmailAction}
                onCreateTask={handleCreateTask}
              />
            </div>
            <div className="xl:hidden space-y-4">
              <p className="text-sm text-gray-500 mb-2">Mostrando {filteredContacts.length} contactos {stageFilter !== "All Stages" && ` en ${stageFilter}`}</p>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {filteredContacts.map(contact => (
                  <ContactCard 
                    key={contact.id} 
                    contact={contact as any} 
                    onEdit={handleOpenEdit} 
                    onDelete={handleDeleteContact}
                    onWhatsApp={handleWhatsAppAction}
                    onEmail={handleEmailAction}
                    onCreateTask={handleCreateTask}
                  />
                ))}
                {filteredContacts.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">No se encontraron contactos que coincidan con tus filtros.</div>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
