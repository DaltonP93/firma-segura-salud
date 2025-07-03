
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Palette, Building, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminQuickActionsProps {
  setActiveTab: (tab: string) => void;
}

const AdminQuickActions = ({ setActiveTab }: AdminQuickActionsProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>Acciones comunes de administración</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => setActiveTab('users')}
            className="justify-start"
            variant="outline"
          >
            <Users className="w-4 h-4 mr-2" />
            Gestionar Usuarios
          </Button>
          <Button 
            onClick={() => setActiveTab('customization')}
            className="justify-start"
            variant="outline"
          >
            <Palette className="w-4 h-4 mr-2" />
            Personalizar Aplicación
          </Button>
          <Button 
            onClick={() => setActiveTab('company-types')}
            className="justify-start"
            variant="outline"
          >
            <Building className="w-4 h-4 mr-2" />
            Gestionar Tipos de Empresa
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="justify-start"
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Ir a Gestión de Documentos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
