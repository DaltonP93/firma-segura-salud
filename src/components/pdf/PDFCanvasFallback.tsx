
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PDFCanvasFallbackProps {
  onRetry?: () => void;
  error?: string;
  mode: 'create' | 'edit';
}

const PDFCanvasFallback = ({ onRetry, error, mode }: PDFCanvasFallbackProps) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[600px] bg-gray-50 flex flex-col items-center justify-center">
      <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Error al cargar el visor PDF
      </h3>
      <p className="text-gray-500 text-center mb-4 max-w-md">
        {error || 'Hubo un problema al cargar el visualizador de PDF. Esto puede ser debido a problemas de conexión o configuración del navegador.'}
      </p>
      <div className="flex gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Reintentar
          </Button>
        )}
        <Button onClick={() => window.location.reload()} variant="outline">
          Recargar página
        </Button>
      </div>
      <div className="mt-6 text-sm text-gray-400 text-center">
        <p>Si el problema persiste:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Verifica tu conexión a internet</li>
          <li>Prueba con otro navegador</li>
          <li>Desactiva temporalmente bloqueadores de anuncios</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFCanvasFallback;
