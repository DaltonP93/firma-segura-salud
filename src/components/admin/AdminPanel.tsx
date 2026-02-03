
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Palette, Building, Users, Settings, AlertTriangle, Key, Wrench } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import CustomizationManager from './CustomizationManager';
import CompanyTypesManager from './CompanyTypesManager';
import SectionCustomizer from './SectionCustomizer';
import UserManagement from './UserManagement';
import ApiConfigurationManager from './ApiConfigurationManager';
import SystemSetupDashboard from './SystemSetupDashboard';

const AdminPanel = () => {
  const { isAdmin, isSuperAdmin, isLoading, profile, error } = useUserProfile();
  const [activeTab, setActiveTab] = useState('setup');
  const { contracts, templates, pdfTemplates } = useSupabaseData();

  console.log('AdminPanel rendering - isLoading:', isLoading, 'isAdmin:', isAdmin, 'profile:', profile?.role, 'error:', error);

  if (isLoading) {
    console.log('AdminPanel showing loading state');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('AdminPanel error:', error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center gap-2 justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Error de Conexión
            </CardTitle>
            <CardDescription className="text-center">
              Hubo un problema al cargar tu perfil. Por favor, recarga la página o contacta al administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="mt-4"
            >
              Recargar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('AdminPanel - Access denied. User role:', profile?.role, 'isAdmin:', isAdmin);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acceso Restringido</CardTitle>
            <CardDescription className="text-center">
              No tienes permisos para acceder al panel de administración
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Tu rol actual: <strong>{profile?.role || 'usuario'}</strong></p>
            <p className="mt-2">Se requiere rol de administrador o super administrador</p>
            {profile?.role && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs">
                  Si crees que esto es un error, contacta al administrador del sistema.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('AdminPanel - Access granted. User role:', profile?.role, 'isSuperAdmin:', isSuperAdmin);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona la configuración del sistema</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Settings className="w-4 h-4" />
          <span>{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">Configuración</span>
          </TabsTrigger>
          <TabsTrigger value="api-config" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">APIs</span>
          </TabsTrigger>
          <TabsTrigger value="customization" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Personalización</span>
          </TabsTrigger>
          <TabsTrigger value="company-types" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span className="hidden sm:inline">Tipos Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Secciones</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Usuarios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <SystemSetupDashboard />
        </TabsContent>

        <TabsContent value="api-config">
          <ApiConfigurationManager />
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

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
