"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, Eye, EyeOff } from "lucide-react";

export function IntegrationsTab() {
  const [editWhatsApp, setEditWhatsApp] = useState<boolean>(false);
  const [editEmail, setEditEmail] = useState<boolean>(false);

  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  const [whatsappStatus, setWhatsappStatus] = useState<"connected" | "disconnected">("connected");

  const handleDisconnect = () => {
    setWhatsappStatus("disconnected");
  };

  const handleReconnect = () => {
    setWhatsappStatus("connected");
  };

  return (
    <div className="space-y-6">

      {/* WHATSAPP */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">WhatsApp Cloud API</CardTitle>
                <CardDescription>Connect your WhatsApp Business account</CardDescription>
              </div>
            </div>

            <div className="flex md:items-center">
              {!editWhatsApp ? (
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => setEditWhatsApp(true)}
                >
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2 w-full md:w-auto">
                  <Button size="sm" onClick={() => setEditWhatsApp(false)}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditWhatsApp(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* BADGE DE STATUS */}
          <div className="pt-3">
            <Badge
              className={
                whatsappStatus === "connected"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }
            >
              {whatsappStatus === "connected" ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Business Phone Number</Label>
              <Input
                defaultValue="+1 (555) 900-0000"
                readOnly={!editWhatsApp}
                className={!editWhatsApp ? "bg-gray-50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input
                defaultValue="wa_12345678901234567"
                readOnly={!editWhatsApp}
                className={!editWhatsApp ? "bg-gray-50" : ""}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label>Enable automatic message sync</Label>
              <p className="text-xs text-muted-foreground">Sync messages every minute</p>
            </div>
            <Switch defaultChecked disabled={!editWhatsApp} />
          </div>

          {/* BOTONES DE CONECTAR/DESCONECTAR */}
          <div className="flex flex-col gap-2 pt-2 md:flex-row">
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={handleReconnect}
            >
              Reconnect
            </Button>

            <Button
              variant="outline"
              className="w-full text-red-500 hover:text-red-600 md:w-auto"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* EMAIL */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Email (SMTP / Brevo)</CardTitle>
                <CardDescription>Configure your email integration</CardDescription>
              </div>
            </div>

            {!editEmail ? (
              <Button variant="outline" className="w-full md:w-auto" onClick={() => setEditEmail(true)}>
                Edit
              </Button>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <Button size="sm" onClick={() => setEditEmail(false)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditEmail(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div className="space-y-2">
              <Label>SMTP Server</Label>
              <Input
                defaultValue="smtp.brevo.com"
                readOnly={!editEmail}
                className={!editEmail ? "bg-gray-50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                defaultValue="587"
                readOnly={!editEmail}
                className={!editEmail ? "bg-gray-50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                defaultValue="hello@startupcrm.com"
                readOnly={!editEmail}
                className={!editEmail ? "bg-gray-50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  defaultValue="2x9bAjD7Pw8LkH92YtF0QsDm"
                  readOnly={!editEmail}
                  className={!editEmail ? "bg-gray-50 pr-10" : "pr-10"}
                />

                <button
                  type="button"
                  onClick={() => setShowApiKey((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
