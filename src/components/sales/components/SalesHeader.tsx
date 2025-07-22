
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface SalesHeaderProps {
  onCreateNew: () => void;
}

const SalesHeader: React.FC<SalesHeaderProps> = ({ onCreateNew }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Registro de Ventas
        </h1>
        <p className="text-gray-600 mt-1">
          Gestione solicitudes de venta, beneficiarios y declaraciones de salud
        </p>
      </div>
      <Button 
        onClick={onCreateNew}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Nueva Solicitud
      </Button>
    </div>
  );
};

export default SalesHeader;
