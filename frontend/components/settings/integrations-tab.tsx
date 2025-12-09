"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, Eye, EyeOff, Loader2, ExternalLink } from "lucide-react";
import { integrationConfigService, WhatsAppCredentials } from "@/services/integration-config.service";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function IntegrationsTab() {
  const { user } = useAuth();

  // --- WHATSAPP ---
  const [editWhatsApp, setEditWhatsApp] = useState(false);
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(true);
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [whatsappConfigId, setWhatsappConfigId] = useState<number | null>(null);
  const [showApiToken, setShowApiToken] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);

  const [whatsappForm, setWhatsappForm] = useState<WhatsAppCredentials>({
    apiToken: "",
    baseUrl: "",
    verifyToken: "",
  });

  const [whatsappBackup, setWhatsappBackup] = useState<WhatsAppCredentials>(whatsappForm);

  // El estado "connected" depende de que las credenciales estén completas
  const isWhatsAppConnected = Boolean(
    whatsappConfigId &&
    whatsappForm.apiToken &&
    whatsappForm.baseUrl &&
    whatsappForm.verifyToken
  );

  // Cargar configuración de WhatsApp
  useEffect(() => {
    loadWhatsAppConfig();
  }, []);

  const loadWhatsAppConfig = async () => {
    try {
      setLoadingWhatsApp(true);
      const config = await integrationConfigService.getByType('WHATSAPP');
      if (config) {
        setWhatsappConfigId(config.id);
        const credentials = integrationConfigService.parseWhatsAppCredentials(config.credentials);
        if (credentials) {
          setWhatsappForm(credentials);
          setWhatsappBackup(credentials);
        }
      }
    } catch (error) {
      toast.error("Error al cargar la configuración de WhatsApp", {
        description: "No se pudo obtener la configuración guardada."
      });
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  const handleWhatsAppEdit = () => {
    setWhatsappBackup(whatsappForm);
    setEditWhatsApp(true);
  };

  const handleWhatsAppCancel = () => {
    setWhatsappForm(whatsappBackup);
    setEditWhatsApp(false);
  };

  const validateWhatsAppForm = (): boolean => {
    if (!whatsappForm.apiToken.trim()) {
      toast.error("Token de API requerido", {
        description: "Por favor ingresa el token de acceso de la API de WhatsApp."
      });
      return false;
    }
    if (!whatsappForm.baseUrl.trim()) {
      toast.error("URL Base requerida", {
        description: "Por favor ingresa la URL base de la API (con tu Phone Number ID)."
      });
      return false;
    }
    if (!whatsappForm.baseUrl.startsWith("https://")) {
      toast.error("URL Base inválida", {
        description: "La URL debe comenzar con https://"
      });
      return false;
    }
    if (!whatsappForm.verifyToken.trim()) {
      toast.error("Token de Verificación requerido", {
        description: "Por favor ingresa el token de verificación para el webhook."
      });
      return false;
    }
    return true;
  };

  const handleWhatsAppSave = async () => {
    if (!validateWhatsAppForm()) return;

    // Validar que el usuario tenga una cuenta asignada
    const accountId = user?.account?.id;
    if (!accountId) {
      toast.error("Error de cuenta", {
        description: "No se encontró la cuenta del usuario. Por favor recarga la página."
      });
      return;
    }

    try {
      setSavingWhatsApp(true);
      const credentials = integrationConfigService.serializeWhatsAppCredentials(whatsappForm);

      if (whatsappConfigId) {
        await integrationConfigService.update(whatsappConfigId, {
          integrationType: 'WHATSAPP',
          accountId,
          credentials,
          isConnected: true,
        });
      } else {
        const newConfig = await integrationConfigService.create({
          integrationType: 'WHATSAPP',
          accountId,
          credentials,
          isConnected: true,
        });
        setWhatsappConfigId(newConfig.id);
      }

      setEditWhatsApp(false);
      setWhatsappBackup(whatsappForm);
      toast.success("Configuración guardada", {
        description: "Las credenciales de WhatsApp Cloud API se guardaron correctamente."
      });
    } catch (error) {
      toast.error("Error al guardar", {
        description: "No se pudo guardar la configuración de WhatsApp. Verifica los datos e intenta nuevamente."
      });
    } finally {
      setSavingWhatsApp(false);
    }
  };

  const handleDisconnect = async () => {
    if (!whatsappConfigId) return;

    try {
      await integrationConfigService.delete(whatsappConfigId);
      setWhatsappConfigId(null);
      setWhatsappForm({ apiToken: "", baseUrl: "", verifyToken: "" });
      toast.success("WhatsApp desconectado", {
        description: "Se eliminó la configuración de WhatsApp Cloud API."
      });
    } catch (error) {
      toast.error("Error al desconectar", {
        description: "No se pudo eliminar la configuración de WhatsApp."
      });
    }
  };

  // --- EMAIL (mantener el código existente) ---
  const [editEmail, setEditEmail] = useState(false);

  const [emailForm, setEmailForm] = useState({
    smtp: "smtp.brevo.com",
    port: "587",
    email: "hello@startupcrm.com",
    apiKey: "",
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
                <CardDescription className="flex items-center gap-2">
                  Conecta tu cuenta de WhatsApp Business
                  <a
                    href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Documentación <ExternalLink className="h-3 w-3" />
                  </a>
                </CardDescription>
              </div>
            </div>

            {loadingWhatsApp ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : !editWhatsApp ? (
              <Button variant="outline" onClick={handleWhatsAppEdit}>
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleWhatsAppSave} disabled={savingWhatsApp}>
                  {savingWhatsApp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={handleWhatsAppCancel} disabled={savingWhatsApp}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="pt-3">
            <Badge className={isWhatsAppConnected ? "bg-green-500" : "bg-red-500"}>
              {isWhatsAppConnected ? "Conectado" : "Desconectado"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">

            {/* API Token */}
            <div className="space-y-2">
              <Label>Token de Acceso Permanente (API Token)</Label>
              <p className="text-xs text-muted-foreground">
                Obtenlo desde Meta for Developers → Tu App → WhatsApp → Configuración de la API
              </p>
              <div className="relative">
                <Input
                  type={showApiToken ? "text" : "password"}
                  value={whatsappForm.apiToken}
                  readOnly={!editWhatsApp}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, apiToken: e.target.value })}
                  className={!editWhatsApp ? "bg-gray-50 pr-10" : "pr-10"}
                  placeholder="EAALy6QaqIX8BO..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiToken((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                >
                  {showApiToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Base URL */}
            <div className="space-y-2">
              <Label>URL Base de la API (Phone Number ID)</Label>
              <p className="text-xs text-muted-foreground">
                Formato: https://graph.facebook.com/v22.0/TU_PHONE_NUMBER_ID
              </p>
              <Input
                value={whatsappForm.baseUrl}
                readOnly={!editWhatsApp}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, baseUrl: e.target.value })}
                className={!editWhatsApp ? "bg-gray-50" : ""}
                placeholder="https://graph.facebook.com/v22.0/899056756628357"
              />
            </div>

            {/* Verify Token */}
            <div className="space-y-2">
              <Label>Token de Verificación de Webhook</Label>
              <p className="text-xs text-muted-foreground">
                Token personalizado para verificar las solicitudes de webhook de Meta
              </p>
              <div className="relative">
                <Input
                  type={showVerifyToken ? "text" : "password"}
                  value={whatsappForm.verifyToken}
                  readOnly={!editWhatsApp}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, verifyToken: e.target.value })}
                  className={!editWhatsApp ? "bg-gray-50 pr-10" : "pr-10"}
                  placeholder="MI_TOKEN_SECRETO_2025"
                />
                <button
                  type="button"
                  onClick={() => setShowVerifyToken((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                >
                  {showVerifyToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Disconnect Button */}
          {isWhatsAppConnected && !editWhatsApp && (
            <div className="flex flex-col gap-2 pt-2 md:flex-row">
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="w-full md:w-auto text-red-500 hover:text-red-600 hover:border-red-300"
              >
                Desconectar
              </Button>
            </div>
          )}
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
                <CardDescription>Configura tu integración de email</CardDescription>
              </div>
            </div>

            {!editEmail ? (
              <Button variant="outline" onClick={handleEmailEdit}>
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEmailSave}>Guardar</Button>
                <Button size="sm" variant="outline" onClick={handleEmailCancel}>Cancelar</Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* SMTP */}
            <div className="space-y-2">
              <Label>Servidor SMTP</Label>
              <Input
                value={emailForm.smtp}
                readOnly={!editEmail}
                onChange={(e) => setEmailForm({ ...emailForm, smtp: e.target.value })}
                className={!editEmail ? "bg-gray-50" : ""}
              />
            </div>

            {/* Port */}
            <div className="space-y-2">
              <Label>Puerto</Label>
              <Input
                value={emailForm.port}
                readOnly={!editEmail}
                onChange={(e) => setEmailForm({ ...emailForm, port: e.target.value })}
                className={!editEmail ? "bg-gray-50" : ""}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Dirección de Email</Label>
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
