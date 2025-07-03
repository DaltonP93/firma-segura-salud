
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona la personalización y configuración del sistema</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-gray-500" />
        <span className="text-sm text-gray-500">Admin</span>
      </div>
    </div>
  );
};

export default AdminHeader;
