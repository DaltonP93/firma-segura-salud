
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageCircle, Key, Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiConfig {
  id: string;
  service_name: string;
  service_type: string;
  api_key: string | null;
  additional_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ApiConfigurationManager = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('api_configurations')
        .select('*')
        .order('service_name');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching API configurations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (configId: string, updates: Partial<ApiConfig>) => {
    setSaving(configId);
    try {
      const { error } = await supabase
        .from('api_configurations')
        .update(updates)
        .eq('id', configId);

      if (error) throw error;

      await fetchConfigurations();
      toast({
        title: "Configuración Actualizada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const EmailConfigForm = ({ config }: { config: ApiConfig }) => {
    const [apiKey, setApiKey] = useState(config.api_key || '');
    const [fromEmail, setFromEmail] = useState(config.additional_config?.from_email || '');
    const [fromName, setFromName] = useState(config.additional_config?.from_name || '');
    const [isActive, setIsActive] = useState(config.is_active);

    const handleSave = () => {
      updateConfiguration(config.id, {
        api_key: apiKey,
        additional_config: {
          ...config.additional_config,
          from_email: fromEmail,
          from_name: fromName,
        },
        is_active: isActive,
      });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Configuración de Email (Resend)</h3>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para configurar el servicio de email, necesitas una cuenta en Resend.com y generar una API key.
            También debes verificar tu dominio en Resend antes de enviar emails.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="resend-api-key">API Key de Resend</Label>
            <Input
              id="resend-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="re_..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="from-email">Email del Remitente</Label>
            <Input
              id="from-email"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="noreply@tudominio.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="from-name">Nombre del Remitente</Label>
            <Input
              id="from-name"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Sistema de Firmas"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="email-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="email-active">Activar servicio de email</Label>
          </div>

          <Button onClick={handleSave} disabled={saving === config.id}>
            {saving === config.id ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const WhatsAppConfigForm = ({ config }: { config: ApiConfig }) => {
    const [apiKey, setApiKey] = useState(config.api_key || '');
    const [phoneNumberId, setPhoneNumberId] = useState(config.additional_config?.phone_number_id || '');
    const [templateNamespace, setTemplateNamespace] = useState(config.additional_config?.template_namespace || '');
    const [isActive, setIsActive] = useState(config.is_active);

    const handleSave = () => {
      updateConfiguration(config.id, {
        api_key: apiKey,
        additional_config: {
          ...config.additional_config,
          phone_number_id: phoneNumberId,
          template_namespace: templateNamespace,
        },
        is_active: isActive,
      });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Configuración de WhatsApp Business</h3>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para configurar WhatsApp Business API, necesitas una cuenta de WhatsApp Business,
            configurar tu aplicación en Meta Developers y obtener los tokens necesarios.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp-api-key">Access Token de WhatsApp</Label>
            <Input
              id="whatsapp-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="EAAxxxxxx..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-number-id">Phone Number ID</Label>
            <Input
              id="phone-number-id"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="123456789..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-namespace">Template Namespace</Label>
            <Input
              id="template-namespace"
              value={templateNamespace}
              onChange={(e) => setTemplateNamespace(e.target.value)}
              placeholder="tu_namespace"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="whatsapp-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="whatsapp-active">Activar servicio de WhatsApp</Label>
          </div>

          <Button onClick={handleSave} disabled={saving === config.id}>
            {saving === config.id ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const emailConfig = configs.find(c => c.service_name === 'resend');
  const whatsappConfig = configs.find(c => c.service_name === 'whatsapp_business');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6" />
            Configuración de APIs
          </h2>
          <p className="text-gray-600">
            Configura los servicios externos para notificaciones y comunicaciones
          </p>
        </div>
      </div>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Servicio de Email</CardTitle>
              <CardDescription>
                Configura el servicio de email para enviar invitaciones de firma y notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailConfig ? (
                <EmailConfigForm config={emailConfig} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontró configuración de email</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Servicio de WhatsApp</CardTitle>
              <CardDescription>
                Configura WhatsApp Business API para enviar notificaciones por WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {whatsappConfig ? (
                <WhatsAppConfigForm config={whatsappConfig} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontró configuración de WhatsApp</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Estado de los Servicios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {configs.map((config) => (
              <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {config.service_type === 'email' ? (
                    <Mail className="w-5 h-5 text-blue-600" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium capitalize">{config.service_name}</p>
                    <p className="text-sm text-gray-500">
                      {config.service_type === 'email' ? 'Servicio de Email' : 'Servicio de WhatsApp'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {config.api_key ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <Badge variant={config.is_active && config.api_key ? "default" : "secondary"}>
                    {config.is_active && config.api_key ? "Configurado" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiConfigurationManager;
