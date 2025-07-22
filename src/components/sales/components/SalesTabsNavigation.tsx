
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SalesTabsNavigationProps {
  viewingRequest: boolean;
  editingRequest: boolean;
  healthDeclarationRequest: boolean;
}

const SalesTabsNavigation: React.FC<SalesTabsNavigationProps> = ({
  viewingRequest,
  editingRequest,
  healthDeclarationRequest
}) => {
  return (
    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
      <TabsTrigger value="list">Lista</TabsTrigger>
      <TabsTrigger value="create">Crear</TabsTrigger>
      <TabsTrigger value="view" disabled={!viewingRequest}>Ver Detalles</TabsTrigger>
      <TabsTrigger value="edit" disabled={!editingRequest}>Editar</TabsTrigger>
      <TabsTrigger value="health-declaration" disabled={!healthDeclarationRequest}>
        Declaración
      </TabsTrigger>
    </TabsList>
  );
};

export default SalesTabsNavigation;
