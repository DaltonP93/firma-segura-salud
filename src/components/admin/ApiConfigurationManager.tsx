import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, MessageCircle, Key, Settings, Save, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiConfig {
  service_name: string;
  service_type: string;
  api_key: string;
  additional_config: any;
  is_active: boolean;
}

const ApiConfigurationManager = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Local state for form values
  const [emailConfig, setEmailConfig] = useState<ApiConfig>({
    service_name: 'resend',
    service_type: 'email',
    api_key: '',
    additional_config: { from_email: '', from_name: '' },
    is_active: false
  });

  const [whatsappConfig, setWhatsappConfig] = useState<ApiConfig>({
    service_name: 'whatsapp_business',
    service_type: 'whatsapp',
    api_key: '',
    additional_config: { phone_number_id: '', template_namespace: '' },
    is_active: false
  });

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      // Use system_config table to store API configurations
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .in('key', ['api_config_resend', 'api_config_whatsapp']);

      if (error) throw error;
      
      data?.forEach((config) => {
        if (config.key === 'api_config_resend' && config.value) {
          setEmailConfig(config.value as unknown as ApiConfig);
        }
        if (config.key === 'api_config_whatsapp' && config.value) {
          setWhatsappConfig(config.value as unknown as ApiConfig);
        }
      });
    } catch (error) {
      console.error('Error fetching API configurations:', error);
      // Don't show error toast as configs might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async (configKey: string, config: ApiConfig) => {
    setSaving(configKey);
    try {
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key: configKey,
          value: config as any,
          category: 'api',
          is_public: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        title: "Configuración Guardada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const EmailConfigForm = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Configuración de Email (Resend)</h3>
          </div>
          <Badge variant={emailConfig.is_active ? "default" : "secondary"}>
            {emailConfig.is_active ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
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
              value={emailConfig.api_key}
              onChange={(e) => setEmailConfig({...emailConfig, api_key: e.target.value})}
              placeholder="re_..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="from-email">Email del Remitente</Label>
            <Input
              id="from-email"
              type="email"
              value={emailConfig.additional_config?.from_email || ''}
              onChange={(e) => setEmailConfig({
                ...emailConfig, 
                additional_config: {...emailConfig.additional_config, from_email: e.target.value}
              })}
              placeholder="noreply@tudominio.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="from-name">Nombre del Remitente</Label>
            <Input
              id="from-name"
              value={emailConfig.additional_config?.from_name || ''}
              onChange={(e) => setEmailConfig({
                ...emailConfig, 
                additional_config: {...emailConfig.additional_config, from_name: e.target.value}
              })}
              placeholder="Sistema de Firmas"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="email-active"
              checked={emailConfig.is_active}
              onCheckedChange={(checked) => setEmailConfig({...emailConfig, is_active: checked})}
            />
            <Label htmlFor="email-active">Activar servicio de email</Label>
          </div>

          <Button onClick={() => saveConfiguration('api_config_resend', emailConfig)} disabled={saving === 'api_config_resend'}>
            {saving === 'api_config_resend' ? (
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

  const WhatsAppConfigForm = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Configuración de WhatsApp Business</h3>
          </div>
          <Badge variant={whatsappConfig.is_active ? "default" : "secondary"}>
            {whatsappConfig.is_active ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
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
              value={whatsappConfig.api_key}
              onChange={(e) => setWhatsappConfig({...whatsappConfig, api_key: e.target.value})}
              placeholder="EAAxxxxxx..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-number-id">Phone Number ID</Label>
            <Input
              id="phone-number-id"
              value={whatsappConfig.additional_config?.phone_number_id || ''}
              onChange={(e) => setWhatsappConfig({
                ...whatsappConfig, 
                additional_config: {...whatsappConfig.additional_config, phone_number_id: e.target.value}
              })}
              placeholder="123456789..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-namespace">Template Namespace</Label>
            <Input
              id="template-namespace"
              value={whatsappConfig.additional_config?.template_namespace || ''}
              onChange={(e) => setWhatsappConfig({
                ...whatsappConfig, 
                additional_config: {...whatsappConfig.additional_config, template_namespace: e.target.value}
              })}
              placeholder="tu_namespace"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="whatsapp-active"
              checked={whatsappConfig.is_active}
              onCheckedChange={(checked) => setWhatsappConfig({...whatsappConfig, is_active: checked})}
            />
            <Label htmlFor="whatsapp-active">Activar servicio de WhatsApp</Label>
          </div>

          <Button onClick={() => saveConfiguration('api_config_whatsapp', whatsappConfig)} disabled={saving === 'api_config_whatsapp'}>
            {saving === 'api_config_whatsapp' ? (
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6" />
            Configuración de APIs
          </h2>
          <p className="text-muted-foreground">
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
              <EmailConfigForm />
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
              <WhatsAppConfigForm />
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
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Resend</p>
                  <p className="text-sm text-muted-foreground">Servicio de Email</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {emailConfig.api_key ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <Badge variant={emailConfig.is_active && emailConfig.api_key ? "default" : "secondary"}>
                  {emailConfig.is_active && emailConfig.api_key ? "Configurado" : "Pendiente"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">WhatsApp Business</p>
                  <p className="text-sm text-muted-foreground">Servicio de WhatsApp</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {whatsappConfig.api_key ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <Badge variant={whatsappConfig.is_active && whatsappConfig.api_key ? "default" : "secondary"}>
                  {whatsappConfig.is_active && whatsappConfig.api_key ? "Configurado" : "Pendiente"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiConfigurationManager;