
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Palette, Building, Settings, Key, Zap } from 'lucide-react';

interface AdminQuickActionsProps {
  setActiveTab: (tab: string) => void;
}

const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({ setActiveTab }) => {
  const quickActions = [
    {
      title: "Gestionar Usuarios",
      description: "Crear, editar y administrar usuarios del sistema",
      icon: Users,
      action: () => setActiveTab('users'),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Configurar APIs",
      description: "Configurar servicios de email y WhatsApp",
      icon: Key,
      action: () => setActiveTab('api-config'),
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Personalización",
      description: "Configurar tema, colores y apariencia",
      icon: Palette,
      action: () => setActiveTab('customization'),
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Tipos de Empresa",
      description: "Administrar categorías de empresas",
      icon: Building,
      action: () => setActiveTab('company-types'),
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Secciones",
      description: "Personalizar secciones de la aplicación",
      icon: Settings,
      action: () => setActiveTab('sections'),
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Acciones Rápidas
        </CardTitle>
        <CardDescription>
          Accede rápidamente a las funciones de administración más utilizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={action.action}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
