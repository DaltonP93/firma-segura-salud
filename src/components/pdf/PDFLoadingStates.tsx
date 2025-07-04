
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PDFLoadingStatesProps {
  isWorkerReady: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

export const PDFWorkerLoadingState: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <Loader2 className="w-8 h-8 animate-spin mb-2" />
    <p>Configurando visor PDF...</p>
  </div>
);

export const PDFErrorState: React.FC<{ error: string; onRetry: () => void; className?: string }> = ({ 
  error, 
  onRetry, 
  className = '' 
}) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <div className="text-red-500 text-center max-w-md">
      <p className="font-semibold mb-2">Error al cargar el PDF</p>
      <p className="text-sm text-gray-600 mb-4">{error}</p>
      <div className="flex gap-2 justify-center">
        <Button 
          onClick={onRetry}
          variant="outline"
          size="sm"
        >
          Reintentar
        </Button>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Recargar página
        </Button>
      </div>
    </div>
  </div>
);

export const PDFDocumentLoadingState = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin mr-2" />
    <span>Cargando PDF...</span>
  </div>
);

export const PDFPageLoadingState = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="w-6 h-6 animate-spin mr-2" />
    <span>Cargando página...</span>
  </div>
);

export const PDFPageErrorState = () => (
  <div className="flex items-center justify-center p-4 text-red-500">
    <span>Error al cargar la página</span>
  </div>
);
