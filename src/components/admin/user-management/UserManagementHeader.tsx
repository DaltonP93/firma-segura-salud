
import React from 'react';
import { Button } from "@/components/ui/button";
import { Users, Plus } from 'lucide-react';

interface UserManagementHeaderProps {
  onCreateUser: () => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ onCreateUser }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Gestión de Usuarios
        </h2>
        <p className="text-gray-600">Administra usuarios, roles y permisos del sistema</p>
      </div>
      
      <Button onClick={onCreateUser}>
        <Plus className="w-4 h-4 mr-2" />
        Crear Usuario
      </Button>
    </div>
  );
};

export default UserManagementHeader;
