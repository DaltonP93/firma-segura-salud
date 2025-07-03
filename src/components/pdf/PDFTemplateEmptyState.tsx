
import { Button } from "@/components/ui/button";
import { FileText, Plus } from 'lucide-react';

interface PDFTemplateEmptyStateProps {
  onCreateTemplate: () => void;
}

const PDFTemplateEmptyState = ({ onCreateTemplate }: PDFTemplateEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas PDF</h3>
      <p className="text-gray-500 mb-4">
        Crea tu primera plantilla PDF interactiva para generar documentos con campos editables
      </p>
      <Button onClick={onCreateTemplate} className="bg-primary hover:bg-primary/90">
        <Plus className="w-4 h-4 mr-2" />
        Crear Primera Plantilla
      </Button>
    </div>
  );
};

export default PDFTemplateEmptyState;
