
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, Palette, Building, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CustomizationManager from './CustomizationManager';
import CompanyTypesManager from './CompanyTypesManager';
import SectionCustomizer from './SectionCustomizer';

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user has admin role (this will be enhanced with actual role checking)
  const isAdmin = true; // Placeholder - will be replaced with actual role checking

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acceso Restringido</CardTitle>
            <CardDescription className="text-center">
              No tienes permisos para acceder al panel de administración
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona la personalización y configuración del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-500">Admin</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="customization" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Personalización
          </TabsTrigger>
          <TabsTrigger value="company-types" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Tipos de Empresa
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Secciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuraciones Activas</CardTitle>
                <CardDescription>Temas y personalizaciones en uso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">3</div>
                <p className="text-sm text-gray-500">Configuraciones activas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipos de Empresa</CardTitle>
                <CardDescription>Categorías configuradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">6</div>
                <p className="text-sm text-gray-500">Tipos disponibles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Secciones Personalizadas</CardTitle>
                <CardDescription>Áreas modificadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">12</div>
                <p className="text-sm text-gray-500">Secciones configuradas</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Acciones comunes de administración</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setActiveTab('customization')}
                  className="justify-start"
                  variant="outline"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Crear Nueva Personalización
                </Button>
                <Button 
                  onClick={() => setActiveTab('company-types')}
                  className="justify-start"
                  variant="outline"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Gestionar Tipos de Empresa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customization">
          <CustomizationManager />
        </TabsContent>

        <TabsContent value="company-types">
          <CompanyTypesManager />
        </TabsContent>

        <TabsContent value="sections">
          <SectionCustomizer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
