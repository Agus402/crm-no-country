import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, Zap, Copy, Shield } from "lucide-react";

export function IntegrationsTab() {
  return (
    <div className="space-y-6">
      {/* WhatsApp Integration */}
      <Card>
        <CardHeader className="flex flex-col items-start gap-4 space-y-0 pb-4 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base">WhatsApp Cloud API</CardTitle>
              <CardDescription>Connect your WhatsApp Business account</CardDescription>
            </div>
          </div>
          <Badge className="bg-green-500 hover:bg-green-600 w-fit">Connected</Badge>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Business Phone Number</Label>
              <Input defaultValue="+1 (555) 900-0000" readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input defaultValue="wa_12345678901234567" readOnly className="bg-gray-50" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5 pr-2">
              <Label>Enable automatic message sync</Label>
              <p className="text-xs text-muted-foreground">Sync messages every 5 minutes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col gap-2 pt-2 md:flex-row">
            <Button variant="outline" className="w-full md:w-auto">Reconnect</Button>
            <Button variant="outline" className="w-full text-red-500 hover:text-red-600 md:w-auto">Disconnect</Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Integration */}
      <Card>
        <CardHeader className="flex flex-col items-start gap-4 space-y-0 pb-4 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Email (SMTP / Brevo)</CardTitle>
              <CardDescription>Configure your email integration</CardDescription>
            </div>
          </div>
          <Badge className="bg-blue-600 hover:bg-blue-700 w-fit">Connected</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>SMTP Server</Label>
              <Input defaultValue="smtp.brevo.com" className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input defaultValue="587" className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input defaultValue="hello@startupcrm.com" className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" defaultValue="..............." className="bg-gray-50" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5 pr-2">
              <Label>Track email opens</Label>
              <p className="text-xs text-muted-foreground">Get notified when contacts open emails</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col gap-2 pt-2 md:flex-row">
            <Button variant="outline" className="w-full md:w-auto">Test Connection</Button>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 md:w-auto">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* API Access */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
          <div className="h-10 w-10 shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-base">API Access</CardTitle>
            <CardDescription>Integrate Startup CRM with your applications</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input defaultValue="sk_live_51JAbcDEF123456789..." readOnly className="bg-gray-50 font-mono truncate" />
              <Button variant="outline" size="icon" className="shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md flex items-center gap-2 text-sm text-muted-foreground">
             <Shield className="h-4 w-4 shrink-0" />
             <span>API requests this month: <strong>1,247</strong> / 10,000</span>
          </div>
          <Button variant="outline" className="w-full md:w-auto">View Documentation</Button>
        </CardContent>
      </Card>
    </div>
  );
}