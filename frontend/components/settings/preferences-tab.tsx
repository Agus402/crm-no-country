"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DATE_FORMATS, TIME_ZONES } from "@/components/settings/data";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { generateContactsListPDF } from "@/utils/pdf-generator";
import { generateContactsCSV, generateMessagesCSV, generateAllDataCSV, MessageExportData } from "@/utils/csv-generator";
import { contactService } from "@/services/contact.service";
import { conversationService } from "@/services/conversation.service";
import { messageService } from "@/services/message.service";
import { Loader2, Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PreferencesTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "Startup CRM Inc.",
    timeZone: "(UTC-08:00) Pacific Time",
    dateFormat: "MM/DD/YYYY",
  });

  // Backup para restaurar al cancelar
  const [backupData, setBackupData] = useState(formData);

  const handleEdit = () => {
    setBackupData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(backupData);
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleExportContacts = async (format: 'pdf' | 'csv') => {
    try {
      setIsExporting(true);
      const contacts = await contactService.getAll();
      if (contacts.length === 0) {
        toast.error("No hay contactos para exportar.");
        return;
      }

      if (format === 'pdf') {
        generateContactsListPDF(contacts);
        toast.success("Se ha exportado la lista de contactos en PDF.");
      } else {
        generateContactsCSV(contacts);
        toast.success("Se ha exportado la lista de contactos en CSV.");
      }

    } catch (error) {
      console.error("Error exporting contacts:", error);
      toast.error("Error al exportar contactos.");
    } finally {
      setIsExporting(false);
    }
  }

  /* Export Messages CSV */
  const fetchAllMessages = async () => {
    const allConversations = await conversationService.getAll();
    if (allConversations.length === 0) return { messages: [], processedCount: 0 };

    let allMessages: MessageExportData[] = [];
    let processedCount = 0;

    for (const conv of allConversations) {
      try {
        const messages = await messageService.getByConversation(conv.id);

        const mappedMessages: MessageExportData[] = messages.map((m) => {
          const author = m.messageDirection === 'OUTBOUND'
            ? (conv.assignedUser?.name || 'Usuario')
            : (conv.lead?.name || 'Lead');

          const direction = m.messageDirection === 'OUTBOUND' ? 'Enviado' : 'Recibido';
          const content = m.content?.replace(/\n/g, " ") || '';
          const date = new Date(m.sentAt).toLocaleString();

          return {
            conversationId: conv.id,
            channel: conv.channel,
            leadName: conv.lead?.name || 'Desconocido',
            sentAt: date,
            author: author,
            direction: direction as 'Enviado' | 'Recibido',
            content: content
          };
        });

        allMessages = [...allMessages, ...mappedMessages];
      } catch (err) {
        console.warn(`Could not fetch messages for conversation ${conv.id}`, err);
      }
      processedCount++;
    }
    return { messages: allMessages, processedCount };
  };

  const handleExportMessagesCSV = async () => {
    try {
      setIsExporting(true);
      toast.info("Iniciando exportación de mensajes...");

      const { messages, processedCount } = await fetchAllMessages();

      if (messages.length === 0) {
        toast.error("No hay mensajes para exportar.");
        return;
      }

      generateMessagesCSV(messages);
      toast.success(`Se han exportado los mensajes de ${processedCount} conversaciones.`);
    } catch (error) {
      console.error("Error exporting messages:", error);
      toast.error("Error al exportar mensajes.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllData = async () => {
    try {
      setIsExporting(true);
      toast.info("Obteniendo todos los datos...");

      // 1. Fetch Contacts
      const contacts = await contactService.getAll();

      // 2. Fetch Messages
      const { messages } = await fetchAllMessages();

      if (contacts.length === 0 && messages.length === 0) {
        toast.error("No hay datos para exportar");
        return;
      }

      generateAllDataCSV(contacts, messages);
      toast.success("Se han exportado todos los datos exitosamente.");

    } catch (error) {
      console.error("Error exporting all data:", error);
      toast.error("Error al exportar todos los datos.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* General Preferences */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Preferencias generales</CardTitle>
            <CardDescription>Personaliza tu experiencia en el CRM</CardDescription>
          </div>

          {!isEditing ? (
            <Button variant="outline" onClick={handleEdit}>
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label>Nombre de la empresa</Label>
            <Input
              value={formData.companyName}
              readOnly={!isEditing}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className={
                !isEditing
                  ? "bg-gray-50  border-transparent shadow-none"
                  : "bg-white"
              }
            />
          </div>

          {/* Time Zone */}
          <div className="space-y-2">
            <Label>Zona horaria</Label>
            <Select
              disabled={!isEditing}
              value={formData.timeZone}
              onValueChange={(value) => setFormData({ ...formData, timeZone: value })}
            >
              <SelectTrigger
                className={
                  !isEditing
                    ? "bg-gray-50  border-transparent shadow-none"
                    : ""
                }
              >
                <SelectValue placeholder="Seleccionar zona horaria" />
              </SelectTrigger>

              <SelectContent>
                {TIME_ZONES.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <Label>Formato de fecha</Label>
            <Select
              disabled={!isEditing}
              value={formData.dateFormat}
              onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}
            >
              <SelectTrigger
                className={
                  !isEditing
                    ? "bg-gray-50  border-transparent shadow-none"
                    : ""
                }
              >
                <SelectValue placeholder="Seleccionar formato de fecha" />
              </SelectTrigger>

              <SelectContent>
                {DATE_FORMATS.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exportar datos</CardTitle>
          <CardDescription>Descarga los datos de tu CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  Exportar contactos
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleExportContacts('pdf')}>
                  Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportContacts('csv')}>
                  Exportar como CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleExportMessagesCSV} disabled={isExporting}>
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Exportar mensajes (CSV)
            </Button>
            <Button variant="outline" onClick={handleExportAllData} disabled={isExporting}>
              Exportar todos los datos (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
