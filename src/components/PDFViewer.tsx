
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Enhanced PDF.js worker configuration with better error handling
const configurePDFWorker = () => {
  // Check if worker is already configured
  if (pdfjs.GlobalWorkerOptions.workerSrc) {
    console.log('PDF worker already configured');
    return;
  }

  try {
    // Primary worker source - use CDN for better reliability
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    console.log('PDF worker configured with CDN source');
  } catch (error) {
    console.warn('Failed to set primary PDF worker, trying fallback');
    try {
      // Fallback to unpkg
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      console.log('PDF worker configured with unpkg fallback');
    } catch (fallbackError) {
      console.error('Failed to configure PDF worker:', fallbackError);
      // Last resort - legacy worker
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;
      console.log('PDF worker configured with legacy fallback');
    }
  }
};

// Initialize worker configuration immediately
configurePDFWorker();

interface PDFViewerProps {
  file: File | string;
  onLoadSuccess?: (pdf: any) => void;
  onLoadError?: (error: Error) => void;
  className?: string;
  width?: number;
  height?: number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  file,
  onLoadSuccess,
  onLoadError,
  className = '',
  width,
  height
}) => {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [workerRetryCount, setWorkerRetryCount] = useState<number>(0);

  // Reset state when file changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    setWorkerRetryCount(0);
    setPageNumber(1);
    console.log('PDF file changed, resetting state');
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', { numPages, file: typeof file === 'string' ? file : file.name });
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
    setWorkerRetryCount(0);
    onLoadSuccess?.({ numPages });
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    
    const errorMessage = error.message || 'Error desconocido al cargar PDF';
    setError(errorMessage);
    
    // Determine user-friendly error message
    let userMessage = "No se pudo cargar el archivo PDF.";
    let shouldRetry = false;
    
    if (errorMessage.includes('fetch') || errorMessage.includes('CORS') || errorMessage.includes('NetworkError')) {
      userMessage = "Error de conexión al cargar el PDF. Verificando configuración...";
      shouldRetry = true;
    } else if (errorMessage.includes('Invalid PDF') || errorMessage.includes('PDF header')) {
      userMessage = "El archivo no es un PDF válido o está corrupto.";
    } else if (errorMessage.includes('worker') || errorMessage.includes('Worker')) {
      userMessage = "Error al cargar el visualizador de PDF. Reconfigurando...";
      shouldRetry = true;
    } else if (errorMessage.includes('security') || errorMessage.includes('blocked')) {
      userMessage = "Error de seguridad al cargar el PDF. Cambiando configuración...";
      shouldRetry = true;
    }
    
    toast({
      title: "Error cargando PDF",
      description: userMessage,
      variant: "destructive",
    });
    
    // Auto-retry for certain errors
    if (shouldRetry && retryCount < 2) {
      setTimeout(() => {
        handleRetry();
      }, 1000);
    }
    
    onLoadError?.(error);
  };

  const handleRetry = () => {
    if (retryCount >= 2) {
      toast({
        title: "Múltiples errores",
        description: "No se pudo cargar el PDF después de varios intentos. Intenta con otro archivo o recarga la página.",
        variant: "destructive",
      });
      return;
    }

    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setError(null);
    
    // Try different worker configuration on retry
    if (workerRetryCount === 0) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      setWorkerRetryCount(1);
    } else if (workerRetryCount === 1) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;
      setWorkerRetryCount(2);
    }
    
    console.log(`Retrying PDF load (attempt ${retryCount + 1}) with worker:`, pdfjs.GlobalWorkerOptions.workerSrc);
    
    toast({
      title: "Reintentando...",
      description: `Intento ${retryCount + 1} de 2`,
    });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  if (error && retryCount >= 2) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-red-500 text-center max-w-md">
          <p className="font-semibold mb-2">Error al cargar el PDF</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Recargar página
            </Button>
            <Button 
              onClick={() => {
                setError(null);
                setRetryCount(0);
                setWorkerRetryCount(0);
                setIsLoading(true);
              }}
              variant="outline"
              size="sm"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* PDF Controls */}
      <div className="flex items-center justify-between mb-4 p-2 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
          <Button size="sm" variant="outline" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleRotate}>
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
        
        {numPages > 0 && (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {pageNumber} de {numPages}
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto border rounded-lg bg-white">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Cargando PDF...</span>
          </div>
        )}
        
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Cargando PDF...</span>
            </div>
          }
          error={
            <div className="flex items-center justify-center p-8 text-red-500">
              <span>Error al cargar el PDF</span>
            </div>
          }
          options={{
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
          }}
        >
          {!isLoading && !error && (
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              width={width}
              height={height}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Cargando página...</span>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-4 text-red-500">
                  <span>Error al cargar la página</span>
                </div>
              }
            />
          )}
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
