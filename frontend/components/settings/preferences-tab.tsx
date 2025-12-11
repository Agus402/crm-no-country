"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DATE_FORMATS, TIME_ZONES } from "@/components/settings/data";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { generateContactsListPDF } from "@/utils/pdf-generator";
import { contactService } from "@/services/contact.service";
import { conversationService } from "@/services/conversation.service";
import { messageService } from "@/services/message.service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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

  const handleExportContacts = async () => {
    try {
      setIsExporting(true);
      const contacts = await contactService.getAll();
      if (contacts.length === 0) {
        toast.error("No hay contactos para exportar.");
        return;
      }
      generateContactsListPDF(contacts);
      toast.success("Se ha exportado la lista de contactos.");
    } catch (error) {
      console.error("Error exporting contacts:", error);
      toast.error("Error al exportar contactos.");
    } finally {
      setIsExporting(false);
    }
  }

  /* Export Messages CSV */
  const handleExportMessagesCSV = async () => {
    try {
      setIsExporting(true);
      toast.info("Iniciando exportación de mensajes...");

      const allConversations = await conversationService.getAll();

      if (allConversations.length === 0) {
        toast.error("No hay conversaciones para exportar.");
        return;
      }

      // CSV Header
      let csvContent = "Conversación ID,Canal,Lead,Fecha Mensaje,Autor,Dirección,Contenido\n";

      // Fetch messages for each conversation
      // We process them in chunks to avoid overwhelming the server/browser
      let processedCount = 0;

      for (const conv of allConversations) {
        try {
          const messages = await messageService.getByConversation(conv.id);

          const convRows = messages.map((m) => {
            const author = m.messageDirection === 'OUTBOUND'
              ? (conv.assignedUser?.name || 'Usuario')
              : (conv.lead?.name || 'Lead');

            const direction = m.messageDirection === 'OUTBOUND' ? 'Enviado' : 'Recibido';
            const content = m.content?.replace(/"/g, '""').replace(/\n/g, " ") || ''; // Escape quotes and newlines
            const date = new Date(m.sentAt).toLocaleString().replace(/"/g, "");

            return `"${conv.id}","${conv.channel}","${conv.lead?.name || 'Desconocido'}","${date}","${author}","${direction}","${content}"`;
          }).join("\n");

          if (convRows) {
            csvContent += convRows + "\n";
          }
        } catch (err) {
          console.warn(`Could not fetch messages for conversation ${conv.id}`, err);
        }

        processedCount++;
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mensajes_crm_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Se han exportado los mensajes de ${processedCount} conversaciones.`);
    } catch (error) {
      console.error("Error exporting messages:", error);
      toast.error("Error al exportar mensajes.");
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
            <Button variant="outline" onClick={handleExportContacts} disabled={isExporting}>
              {isExporting ? "Exportando..." : "Exportar contactos (PDF)"}
            </Button>
            <Button variant="outline" onClick={handleExportMessagesCSV} disabled={isExporting}>
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Exportar mensajes (CSV)
            </Button>
            <Button variant="outline">Exportar todos los datos</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
