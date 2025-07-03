
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Configure PDF.js worker with fallback
const configurePDFWorker = () => {
  const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  
  // Test if worker loads, fallback if needed
  const testWorker = new Worker(workerSrc);
  testWorker.onerror = () => {
    console.warn('Primary PDF worker failed, using fallback');
    // Fallback to unpkg if cdnjs fails
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  };
  testWorker.terminate();
};

// Initialize worker configuration
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

  // Reset state when file changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    setPageNumber(1);
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', { numPages });
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
    onLoadSuccess?.({ numPages });
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    
    const errorMessage = error.message || 'Error desconocido al cargar PDF';
    setError(errorMessage);
    
    // Show user-friendly error message
    let userMessage = "No se pudo cargar el archivo PDF.";
    if (errorMessage.includes('fetch')) {
      userMessage = "Error de conexión al cargar el PDF. Verifica tu conexión a internet.";
    } else if (errorMessage.includes('Invalid PDF')) {
      userMessage = "El archivo no es un PDF válido.";
    } else if (errorMessage.includes('worker')) {
      userMessage = "Error al cargar el visualizador de PDF. Intenta recargar la página.";
    }
    
    toast({
      title: "Error cargando PDF",
      description: userMessage,
      variant: "destructive",
    });
    
    onLoadError?.(error);
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setError(null);
      
      // Reconfigure worker on retry
      configurePDFWorker();
      
      toast({
        title: "Reintentando...",
        description: `Intento ${retryCount + 1} de 3`,
      });
    }
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

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-red-500 text-center max-w-md">
          <p className="font-semibold mb-2">Error al cargar el PDF</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            {retryCount < 3 && (
              <Button onClick={handleRetry} variant="outline">
                Reintentar ({retryCount + 1}/3)
              </Button>
            )}
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Recargar página
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
