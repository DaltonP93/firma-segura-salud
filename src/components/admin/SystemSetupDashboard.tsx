
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Database, Key, Settings } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import SystemInitializer from './SystemInitializer';
import ApiConfigurationGuide from './ApiConfigurationGuide';
import ApiConfigurationManager from './ApiConfigurationManager';

interface SystemStatus {
  healthQuestions: boolean;
  insurancePlans: boolean;
  companyTypes: boolean;
  customization: boolean;
  emailConfig: boolean;
  whatsappConfig: boolean;
}

const SystemSetupDashboard = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    healthQuestions: false,
    insurancePlans: false,
    companyTypes: false,
    customization: false,
    emailConfig: false,
    whatsappConfig: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check master data
      const [healthQuestionsRes, insurancePlansRes, companyTypesRes, customizationRes] = await Promise.all([
        supabase.from('health_questions').select('id').limit(1),
        supabase.from('insurance_plans').select('id').limit(1),
        supabase.from('company_types').select('id').limit(1),
        supabase.from('app_customization').select('id').limit(1)
      ]);

      // Check API configurations
      const { data: apiConfigs } = await supabase
        .from('api_configurations')
        .select('service_name, api_key, is_active');

      const emailConfig = apiConfigs?.find(c => c.service_name === 'resend');
      const whatsappConfig = apiConfigs?.find(c => c.service_name === 'whatsapp_business');

      setSystemStatus({
        healthQuestions: (healthQuestionsRes.data?.length || 0) > 0,
        insurancePlans: (insurancePlansRes.data?.length || 0) > 0,
        companyTypes: (companyTypesRes.data?.length || 0) > 0,
        customization: (customizationRes.data?.length || 0) > 0,
        emailConfig: emailConfig?.api_key && emailConfig.is_active,
        whatsappConfig: whatsappConfig?.api_key && whatsappConfig.is_active,
      });
    } catch (error) {
      console.error('Error checking system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    const statuses = Object.values(systemStatus);
    const completed = statuses.filter(Boolean).length;
    // Email is required, WhatsApp is optional, so we calculate based on 5 required items
    const required = 5; // healthQuestions, insurancePlans, companyTypes, customization, emailConfig
    const requiredCompleted = [
      systemStatus.healthQuestions,
      systemStatus.insurancePlans,
      systemStatus.companyTypes,
      systemStatus.customization,
      systemStatus.emailConfig
    ].filter(Boolean).length;
    
    return (requiredCompleted / required) * 100;
  };

  const isSystemReady = () => {
    return systemStatus.healthQuestions && 
           systemStatus.insurancePlans && 
           systemStatus.companyTypes && 
           systemStatus.customization && 
           systemStatus.emailConfig;
  };

  if (loading) {
    return <div className="flex justify-center py-8">Cargando estado del sistema...</div>;
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración del Sistema
          </CardTitle>
          <CardDescription>
            Completa la configuración del sistema para un funcionamiento óptimo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Progreso del Sistema
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(completionPercentage)}% completado
              </span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
          </div>

          {isSystemReady() ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-800">
                ¡Sistema listo para usar! Todas las configuraciones esenciales están completas.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-800">
                Faltan algunas configuraciones para el funcionamiento completo.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-2 border rounded-lg">
              {systemStatus.healthQuestions ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">Preguntas de Salud</span>
            </div>

            <div className="flex items-center gap-2 p-2 border rounded-lg">
              {systemStatus.insurancePlans ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">Planes de Seguro</span>
            </div>

            <div className="flex items-center gap-2 p-2 border rounded-lg">
              {systemStatus.companyTypes ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">Tipos de Empresa</span>
            </div>

            <div className="flex items-center gap-2 p-2 border rounded-lg">
              {systemStatus.customization ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">Personalización</span>
            </div>

            <div className="flex items-center gap-2 p-2 border rounded-lg">
              {systemStatus.emailConfig ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">Email</span>
              <Badge variant="outline" className="text-xs">Requerido</Badge>
            </div>

            <div className="flex items-center gap-2 p-2 border rounded-lg">
              {systemStatus.whatsappConfig ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">WhatsApp</span>
              <Badge variant="secondary" className="text-xs">Opcional</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="master-data" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="master-data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Datos Maestros
          </TabsTrigger>
          <TabsTrigger value="api-guide" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Guía APIs
          </TabsTrigger>
          <TabsTrigger value="api-config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurar APIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="master-data">
          <SystemInitializer />
        </TabsContent>

        <TabsContent value="api-guide">
          <ApiConfigurationGuide />
        </TabsContent>

        <TabsContent value="api-config">
          <ApiConfigurationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSetupDashboard;
