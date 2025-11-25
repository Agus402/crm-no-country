import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function NotificationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label className="text-sm font-medium leading-none">New message notifications</Label>
            <p className="text-xs text-muted-foreground">Get notified when you receive new messages</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
             <Label className="text-sm font-medium leading-none">Task reminders</Label>
             <p className="text-xs text-muted-foreground">Receive reminders for upcoming tasks</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
             <Label className="text-sm font-medium leading-none">Daily summary email</Label>
             <p className="text-xs text-muted-foreground">Get a daily summary of your activity</p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
             <Label className="text-sm font-medium leading-none">Contact updates</Label>
             <p className="text-xs text-muted-foreground">Notify when contacts change stages</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
             <Label className="text-sm font-medium leading-none">Automation alerts</Label>
             <p className="text-xs text-muted-foreground">Get notified when automations trigger</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
}