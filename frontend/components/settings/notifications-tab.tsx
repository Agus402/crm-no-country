import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function NotificationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preferencias de notificaciones</CardTitle>
        <CardDescription>Elige cómo quieres recibir notificaciones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label className="text-sm font-medium leading-none">Notificaciones de nuevos mensajes</Label>
            <p className="text-xs text-muted-foreground">Recibe notificaciones cuando lleguen nuevos mensajes</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label className="text-sm font-medium leading-none">Recordatorios de tareas</Label>
            <p className="text-xs text-muted-foreground">Recibe recordatorios de tareas próximas</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label className="text-sm font-medium leading-none">Actualizaciones de contactos</Label>
            <p className="text-xs text-muted-foreground">Notificar cuando los contactos cambien de etapa</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label className="text-sm font-medium leading-none">Alertas de automatización</Label>
            <p className="text-xs text-muted-foreground">Recibe notificaciones cuando se ejecuten automatizaciones</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
}