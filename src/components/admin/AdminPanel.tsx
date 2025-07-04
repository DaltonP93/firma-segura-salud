import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Palette, Building, FileText, Users, Settings } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import CustomizationManager from './CustomizationManager';
import CompanyTypesManager from './CompanyTypesManager';
import SectionCustomizer from './SectionCustomizer';
import UserManagement from './UserManagement';
import AdminOverviewStats from './AdminOverviewStats';
import AdminQuickActions from './AdminQuickActions';
import AdminRecentDocuments from './AdminRecentDocuments';

const AdminPanel = () => {
  const { isAdmin, isLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState('overview');
  const { contracts, templates, pdfTemplates } = useSupabaseData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
      {/* Header without Volver button */}
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuarios
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
          <AdminOverviewStats 
            contracts={contracts} 
            templates={templates} 
            pdfTemplates={pdfTemplates} 
          />
          <AdminQuickActions setActiveTab={setActiveTab} />
          <AdminRecentDocuments contracts={contracts} />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
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
