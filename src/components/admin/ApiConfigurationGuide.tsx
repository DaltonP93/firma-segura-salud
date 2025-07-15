
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail, MessageCircle, Key, CheckCircle, AlertCircle } from 'lucide-react';

const ApiConfigurationGuide = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Guía de Configuración de APIs
          </CardTitle>
          <CardDescription>
            Sigue esta guía paso a paso para configurar los servicios externos necesarios
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="resend" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resend" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email (Resend)
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp Business
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Configuración de Resend (Email)
                <Badge variant="outline">Requerido</Badge>
              </CardTitle>
              <CardDescription>
                Configura el servicio de email para enviar invitaciones de firma y notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Sin configurar el email, las invitaciones de firma se generarán como enlaces que deberás compartir manualmente.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                    Crear cuenta en Resend
                  </h4>
                  <p className="text-sm text-gray-600">
                    Ve a resend.com y crea una cuenta gratuita. El plan gratuito incluye 3,000 emails por mes.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://resend.com/signup" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ir a Resend
                    </a>
                  </Button>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                    Verificar dominio
                  </h4>
                  <p className="text-sm text-gray-600">
                    Para enviar emails desde tu dominio, necesitas verificarlo en Resend. Si no tienes dominio, puedes usar el dominio sandbox para pruebas.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Gestionar Dominios
                    </a>
                  </Button>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                    Generar API Key
                  </h4>
                  <p className="text-sm text-gray-600">
                    Crea una API key en tu dashboard de Resend. Esta key comenzará con "re_".
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Crear API Key
                    </a>
                  </Button>
                </div>

                <div className="border-l-4 border-green-500 pl-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Configurar en el sistema
                  </h4>
                  <p className="text-sm text-gray-600">
                    Ve a la pestaña "APIs" en el panel de administración y configura:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside ml-4 space-y-1">
                    <li>API Key de Resend (comienza con "re_")</li>
                    <li>Email del remitente (ej: noreply@tudominio.com)</li>
                    <li>Nombre del remitente (ej: Sistema de Firmas)</li>
                    <li>Activar el servicio</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Configuración de WhatsApp Business API
                <Badge variant="secondary">Opcional</Badge>
              </CardTitle>
              <CardDescription>
                Configura WhatsApp para enviar notificaciones por WhatsApp (opcional pero recomendado)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Nota:</strong> WhatsApp Business API requiere una cuenta de empresa y verificación. Es más complejo que email pero muy efectivo para notificaciones.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                    Cuenta de WhatsApp Business
                  </h4>
                  <p className="text-sm text-gray-600">
                    Necesitas una cuenta de WhatsApp Business verificada y configurar una aplicación en Meta for Developers.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://developers.facebook.com/docs/whatsapp/getting-started" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Guía de WhatsApp API
                    </a>
                  </Button>
                </div>

                <div className="border-l-4 border-green-500 pl-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                    Crear aplicación en Meta
                  </h4>
                  <p className="text-sm text-gray-600">
                    Crea una aplicación en Meta for Developers y configura WhatsApp Business API.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Meta for Developers
                    </a>
                  </Button>
                </div>

                <div className="border-l-4 border-green-500 pl-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                    Obtener credenciales
                  </h4>
                  <p className="text-sm text-gray-600">
                    Necesitarás obtener de tu aplicación de Meta:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside ml-4 space-y-1">
                    <li>Access Token (comienza con "EAA")</li>
                    <li>Phone Number ID</li>
                    <li>Template Namespace (opcional)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Configurar en el sistema
                  </h4>
                  <p className="text-sm text-gray-600">
                    Una vez que tengas las credenciales, configúralas en la pestaña "APIs" del panel de administración.
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alternativa más fácil:</strong> Si WhatsApp Business API es muy complejo, puedes usar servicios como Twilio, Vonage o similares que ofrecen APIs más simples para WhatsApp.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Pasos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Después de configurar las APIs:</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside ml-4 space-y-1">
              <li>Prueba el envío de invitaciones de firma</li>
              <li>Verifica que los emails lleguen correctamente</li>
              <li>Configura los planes de seguro según tu negocio</li>
              <li>Personaliza la apariencia de la aplicación</li>
              <li>Crea plantillas PDF para tus documentos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiConfigurationGuide;
