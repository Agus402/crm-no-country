"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, MessageCircle, Loader2, UserPlus, Mail } from "lucide-react";
import { leadService, LeadData } from "@/services/lead.service";
import { conversationService, ConversationDTO } from "@/services/conversation.service";
import { contactService } from "@/services/contact.service";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface NewConversationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConversationCreated: (conversation: ConversationDTO) => void;
    existingConversations: ConversationDTO[];
}

export function NewConversationModal({
    open,
    onOpenChange,
    onConversationCreated,
    existingConversations,
}: NewConversationModalProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"select" | "create">("select");
    const [search, setSearch] = useState("");
    const [leads, setLeads] = useState<LeadData[]>([]);
    const [loadingLeads, setLoadingLeads] = useState(true);
    const [creatingConversation, setCreatingConversation] = useState(false);
    const [creatingLead, setCreatingLead] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");

    // Form para crear nuevo contacto
    const [newLeadForm, setNewLeadForm] = useState({
        name: "",
        phone: "",
        email: "",
        companyName: "",
    });

    // Cargar leads al abrir el modal
    useEffect(() => {
        if (open) {
            loadLeads();
        }
    }, [open]);

    const loadLeads = async () => {
        try {
            setLoadingLeads(true);
            const data = await leadService.getAll();
            setLeads(data);
        } catch (error) {
            toast.error("Error al cargar contactos");
        } finally {
            setLoadingLeads(false);
        }
    };

    const filteredLeads = leads.filter((lead) => {
        const searchLower = search.toLowerCase();
        return (
            lead.name?.toLowerCase().includes(searchLower) ||
            lead.phone?.includes(search) ||
            lead.email?.toLowerCase().includes(searchLower)
        );
    });

    const getInitials = (name: string) => {
        if (!name) return "??";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleSelectLead = async (lead: LeadData) => {
        // Validar que el lead tenga el dato de contacto necesario para el canal
        if (selectedChannel === "WHATSAPP" && !lead.phone) {
            toast.error("Este contacto no tiene teléfono", {
                description: "Para WhatsApp necesitas un número de teléfono",
            });
            return;
        }
        if (selectedChannel === "EMAIL" && !lead.email) {
            toast.error("Este contacto no tiene email", {
                description: "Para Email necesitas una dirección de correo",
            });
            return;
        }

        startConversationWithLead(lead);
    };

    const startConversationWithLead = async (lead: LeadData) => {
        try {
            setCreatingConversation(true);

            // Verificar si ya existe una conversación con este lead Y CANAL
            const existingConversation = existingConversations.find(
                c => c.lead?.id === lead.id && c.channel === selectedChannel
            );

            if (existingConversation) {
                onConversationCreated(existingConversation);
                onOpenChange(false);
                toast.info("Conversación existente", {
                    description: `Ya tienes una conversación por ${selectedChannel === "WHATSAPP" ? "WhatsApp" : "Email"} con ${lead.name}`,
                });
                return;
            }

            // Si no existe, crear una nueva
            const conversation = await conversationService.create({
                leadId: lead.id,
                channel: selectedChannel,
                assignedUserId: user?.id,
            });
            onConversationCreated(conversation);

            // Actualizar lista local de leads si no estaba
            setLeads(prev => {
                if (!prev.find(l => l.id === lead.id)) {
                    return [lead, ...prev];
                }
                return prev;
            });

            onOpenChange(false);

            // Reset forms
            setNewLeadForm({ name: "", phone: "", email: "", companyName: "" });

            toast.success("Conversación iniciada", {
                description: `Ahora puedes ${selectedChannel === "WHATSAPP" ? "chatear" : "enviar emails"} a ${lead.name}`,
            });
        } catch (error) {
            toast.error("Error al crear conversación", {
                description: error instanceof Error ? error.message : "Intenta nuevamente",
            });
        } finally {
            setCreatingConversation(false);
            setCreatingLead(false);
        }
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newLeadForm.name.trim()) {
            toast.error("Nombre requerido");
            return;
        }

        // Validaciones requeridas
        if (selectedChannel === "WHATSAPP" && !newLeadForm.phone.trim()) {
            toast.error("Teléfono requerido", { description: "Para WhatsApp se requiere teléfono" });
            return;
        }

        // Email siempre requerido ahora
        if (!newLeadForm.email.trim()) {
            toast.error("Email requerido", { description: "El email es obligatorio para crear el contacto" });
            return;
        }

        try {
            setCreatingLead(true);

            // Validar existencia previa usando contactService
            // NOTA: contactService.getAll acepta filtros (name, email)
            // Podríamos implementar una búsqueda mejor, pero por ahora esto funciona

            // Intentamos crear directamente. Si es duplicado, el backend nos dirá.

            const leadData: any = {
                name: newLeadForm.name.trim(),
                phone: newLeadForm.phone.trim() || undefined,
                email: newLeadForm.email.trim(),
                channel: selectedChannel,
                tagIds: [], // Enviar array vacío explícitamente por si acaso
                // Por ahora no enviamos account hasta tener claro el endpoint correcto
                // account: newLeadForm.companyName.trim() ? { companyName: newLeadForm.companyName.trim() } : undefined
            };

            let newLead;
            try {
                // Usamos contactService que está más completo
                newLead = await contactService.create(leadData);
            } catch (error: any) {
                const errorMessage = error instanceof Error ? error.message : String(error);

                // Si es error de duplicado (ID)
                if (errorMessage.includes("already exists") || errorMessage.includes("ya existe") || errorMessage.includes("constraint")) {
                    toast.info("El contacto ya existe, conectando...", {
                        description: "Detectamos que el contacto ya existe en la base de datos."
                    });

                    // Buscar el existente
                    const allContacts = await contactService.getAll();
                    const existing = allContacts.find(c =>
                        (leadData.email && c.email === leadData.email) ||
                        (leadData.phone && c.phone === leadData.phone)
                    );

                    if (existing) {
                        newLead = existing; // Usar el existente
                    } else {
                        throw new Error("El contacto existe pero no pudimos encontrarlo. Por favor búscalo manualmente.");
                    }
                } else {
                    throw error; // Relanzar otros errores
                }
            }

            if (newLead) {
                // Adapt CrmLeadDTO to LeadData (handle nulls)
                const leadForState: LeadData = {
                    ...newLead,
                    phone: newLead.phone || "",
                    status: newLead.status || "ACTIVE_LEAD",
                    account: newLead.account
                };
                await startConversationWithLead(leadForState);
            }

        } catch (error: any) {
            console.error("Error creating lead:", error);
            toast.error("Error al crear contacto", {
                description: `Detalle: ${error instanceof Error ? error.message : String(error)}`,
                duration: 5000
            });
            setCreatingLead(false);
        }
    };

    const resetAndClose = () => {
        setSearch("");
        setActiveTab("select");
        setNewLeadForm({ name: "", phone: "", email: "", companyName: "" });
        setSelectedChannel("WHATSAPP");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={resetAndClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {selectedChannel === "WHATSAPP" ? (
                            <MessageCircle className="h-5 w-5 text-green-600" />
                        ) : (
                            <Mail className="h-5 w-5 text-blue-600" />
                        )}
                        Nueva Conversación
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona un contacto y el canal de comunicación
                    </DialogDescription>
                </DialogHeader>

                {/* Channel Selector */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                    <button
                        onClick={() => setSelectedChannel("WHATSAPP")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${selectedChannel === "WHATSAPP"
                            ? "bg-white text-green-700 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                    </button>
                    <button
                        onClick={() => setSelectedChannel("EMAIL")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${selectedChannel === "EMAIL"
                            ? "bg-white text-blue-700 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <Mail className="h-4 w-4" />
                        Email
                    </button>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "select" | "create")}>
                    <TabsList className="w-full">
                        <TabsTrigger value="select" className="flex-1">
                            Seleccionar
                        </TabsTrigger>
                        <TabsTrigger value="create" className="flex-1">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Crear Nuevo
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB: Seleccionar Contacto */}
                    <TabsContent value="select" className="mt-4">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nombre, teléfono o email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <ScrollArea className="h-64">
                            {loadingLeads ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                                </div>
                            ) : filteredLeads.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No hay contactos</p>
                                    <Button
                                        variant="link"
                                        className="text-purple-600"
                                        onClick={() => setActiveTab("create")}
                                    >
                                        Crear un contacto nuevo
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredLeads.map((lead) => (
                                        <button
                                            key={lead.id}
                                            onClick={() => handleSelectLead(lead)}
                                            disabled={creatingConversation}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-purple-100 text-purple-700">
                                                    {getInitials(lead.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-sm">{lead.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {lead.phone || lead.email || "Sin datos de contacto"}
                                                </p>
                                            </div>
                                            {creatingConversation && (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* TAB: Crear Nuevo Contacto */}
                    <TabsContent value="create" className="mt-4">
                        <form onSubmit={handleCreateLead} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    placeholder="Juan Pérez"
                                    value={newLeadForm.name}
                                    onChange={(e) =>
                                        setNewLeadForm({ ...newLeadForm, name: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Teléfono (WhatsApp) *
                                </Label>
                                <Input
                                    id="phone"
                                    placeholder="+54 9 11 1234 5678"
                                    value={newLeadForm.phone}
                                    onChange={(e) =>
                                        setNewLeadForm({ ...newLeadForm, phone: e.target.value })
                                    }
                                />
                                <p className="text-xs text-slate-500">
                                    Incluye el código de país (ej: +54 para Argentina)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ejemplo@email.com"
                                    value={newLeadForm.email}
                                    onChange={(e) =>
                                        setNewLeadForm({ ...newLeadForm, email: e.target.value })
                                    }
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={resetAndClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    disabled={creatingLead}
                                >
                                    {creatingLead ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Plus className="h-4 w-4 mr-2" />
                                    )}
                                    Crear e Iniciar Chat
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
