
import { FileText } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="text-center py-8">
      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay plantillas PDF disponibles
      </h3>
      <p className="text-gray-500">
        Crea una plantilla PDF primero en la sección de plantillas
      </p>
    </div>
  );
};

export default EmptyState;
