import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function PreferencesTab() {
  return (
    <div className="space-y-6">
      {/* General Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General Preferences</CardTitle>
          <CardDescription>Customize your CRM experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input defaultValue="Startup CRM Inc." className="bg-gray-50" />
          </div>
          
          <div className="space-y-2">
            <Label>Time Zone</Label>
            <Input defaultValue="(UTC-08:00) Pacific Time" className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label>Date Format</Label>
            <Input defaultValue="MM/DD/YYYY" className="bg-gray-50" />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable analytics tracking</Label>
              <p className="text-xs text-muted-foreground">Help us improve with anonymous usage data</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact view</Label>
              <p className="text-xs text-muted-foreground">Show more content in less space</p>
            </div>
            <Switch />
          </div>
          
          <div className="pt-4">
            <Button className="bg-purple-600 hover:bg-purple-700">Save Preferences</Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Data</CardTitle>
          <CardDescription>Download your CRM data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">Export Contacts (CSV)</Button>
            <Button variant="outline">Export Messages (PDF)</Button>
            <Button variant="outline">Export All Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}