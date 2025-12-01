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
  // --- WHATSAPP ---
  const [editWhatsApp, setEditWhatsApp] = useState(false);

  const [whatsappForm, setWhatsappForm] = useState({
    phone: "+1 (555) 900-0000",
    accountId: "wa_12345678901234567",
    autoSync: true,
  });

  const [whatsappBackup, setWhatsappBackup] = useState(whatsappForm);

  const handleWhatsAppEdit = () => {
    setWhatsappBackup(whatsappForm); 
    setEditWhatsApp(true);
  };

  const handleWhatsAppCancel = () => {
    setWhatsappForm(whatsappBackup); 
    setEditWhatsApp(false);
  };

  const handleWhatsAppSave = () => {
    setEditWhatsApp(false);
  };

  // Status connect/disconnect
  const [whatsappStatus, setWhatsappStatus] = useState<"connected" | "disconnected">("connected");

  const handleDisconnect = () => setWhatsappStatus("disconnected");
  const handleReconnect = () => setWhatsappStatus("connected");

  // --- EMAIL ---
  const [editEmail, setEditEmail] = useState(false);

  const [emailForm, setEmailForm] = useState({
    smtp: "smtp.brevo.com",
    port: "587",
    email: "hello@startupcrm.com",
    apiKey: "2x9bAjD7Pw8LkH92YtF0QsDm",
  });

  const [emailBackup, setEmailBackup] = useState(emailForm);

  const handleEmailEdit = () => {
    setEmailBackup(emailForm);
    setEditEmail(true);
  };

  const handleEmailCancel = () => {
    setEmailForm(emailBackup);
    setEditEmail(false);
  };

  const handleEmailSave = () => {
    setEditEmail(false);
  };

  const [showApiKey, setShowApiKey] = useState(false);

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

            {!editWhatsApp ? (
              <Button variant="outline" onClick={handleWhatsAppEdit}>
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleWhatsAppSave}>Save</Button>
                <Button size="sm" variant="outline" onClick={handleWhatsAppCancel}>Cancel</Button>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="pt-3">
            <Badge className={whatsappStatus === "connected" ? "bg-green-500" : "bg-red-500"}>
              {whatsappStatus === "connected" ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Phone */}
            <div className="space-y-2">
              <Label>Business Phone Number</Label>
              <Input
                value={whatsappForm.phone}
                readOnly={!editWhatsApp}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, phone: e.target.value })}
                className={!editWhatsApp ? "bg-gray-50" : ""}
              />
            </div>

            {/* Account ID */}
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input
                value={whatsappForm.accountId}
                readOnly={!editWhatsApp}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, accountId: e.target.value })}
                className={!editWhatsApp ? "bg-gray-50" : ""}
              />
            </div>
          </div>

          {/* Switch */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <Label>Enable automatic message sync</Label>
              <p className="text-xs text-muted-foreground">Sync messages every minute</p>
            </div>

            <Switch
              checked={whatsappForm.autoSync}
              disabled={!editWhatsApp}
              onCheckedChange={(v) => setWhatsappForm({ ...whatsappForm, autoSync: v })}
            />
          </div>

          {/* Connect / Disconnect */}
          <div className="flex flex-col gap-2 pt-2 md:flex-row">
            <Button variant="outline" onClick={handleReconnect} className="w-full md:w-auto">
              Reconnect
            </Button>

            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full md:w-auto text-red-500"
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
              <Button variant="outline" onClick={handleEmailEdit}>
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEmailSave}>Save</Button>
                <Button size="sm" variant="outline" onClick={handleEmailCancel}>Cancel</Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* SMTP */}
            <div className="space-y-2">
              <Label>SMTP Server</Label>
              <Input
                value={emailForm.smtp}
                readOnly={!editEmail}
                onChange={(e) => setEmailForm({ ...emailForm, smtp: e.target.value })}
                className={!editEmail ? "bg-gray-50" : ""}
              />
            </div>

            {/* Port */}
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                value={emailForm.port}
                readOnly={!editEmail}
                onChange={(e) => setEmailForm({ ...emailForm, port: e.target.value })}
                className={!editEmail ? "bg-gray-50" : ""}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                value={emailForm.email}
                readOnly={!editEmail}
                onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                className={!editEmail ? "bg-gray-50" : ""}
              />
            </div>

            {/* API KEY */}
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={emailForm.apiKey}
                  readOnly={!editEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, apiKey: e.target.value })}
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
