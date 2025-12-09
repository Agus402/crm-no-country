"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DATE_FORMATS, TIME_ZONES } from "@/components/settings/data";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";

export function PreferencesTab() {
  const [isEditing, setIsEditing] = useState(false);

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
            <Button variant="outline">Exportar contactos (CSV)</Button>
            <Button variant="outline">Exportar mensajes (PDF)</Button>
            <Button variant="outline">Exportar todos los datos</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
