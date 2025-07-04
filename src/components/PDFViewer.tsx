
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Enhanced PDF.js worker configuration with multiple fallbacks
const configurePDFWorker = () => {
  // Only configure if not already set
  if (pdfjs.GlobalWorkerOptions.workerSrc) {
    return;
  }

  try {
    // Primary: Try CDN with specific version
    const cdnWorkerUrl = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    pdfjs.GlobalWorkerOptions.workerSrc = cdnWorkerUrl;
    console.log('PDF worker configured with unpkg CDN:', cdnWorkerUrl);
  } catch (error) {
    console.warn('Primary worker configuration failed, trying fallback:', error);
    
    // Fallback: Use alternative CDN
    try {
      const fallbackUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      pdfjs.GlobalWorkerOptions.workerSrc = fallbackUrl;
      console.log('PDF worker configured with fallback CDN:', fallbackUrl);
    } catch (fallbackError) {
      console.error('All worker configurations failed:', fallbackError);
      // Let the component handle the error gracefully
    }
  }
};

// Configure worker immediately when module loads
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
  const [workerReady, setWorkerReady] = useState<boolean>(false);

  // Check worker readiness on mount
  useEffect(() => {
    const checkWorker = () => {
      if (pdfjs.GlobalWorkerOptions.workerSrc) {
        setWorkerReady(true);
        console.log('PDF worker is ready');
      } else {
        console.warn('PDF worker not configured, attempting reconfiguration');
        configurePDFWorker();
        // Give it a moment to configure
        setTimeout(() => {
          setWorkerReady(!!pdfjs.GlobalWorkerOptions.workerSrc);
        }, 100);
      }
    };

    checkWorker();
  }, []);

  // Reset state when file changes
  useEffect(() => {
    if (workerReady) {
      setIsLoading(true);
      setError(null);
      setPageNumber(1);
      setNumPages(0);
      console.log('PDF file changed, resetting state');
    }
  }, [file, workerReady]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', { numPages, file: typeof file === 'string' ? file : file.name });
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    onLoadSuccess?.({ numPages });
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    
    let errorMessage = 'Error desconocido al cargar PDF';
    
    // Provide specific error messages based on error type
    if (error.message.includes('worker') || error.message.includes('Worker')) {
      errorMessage = 'Error de configuración del visor PDF. Intenta recargar la página.';
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      errorMessage = 'Error de conexión al cargar el PDF. Verifica tu conexión a internet.';
    } else if (error.message.includes('invalid') || error.message.includes('corrupt')) {
      errorMessage = 'El archivo PDF parece estar dañado o no es válido.';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    setError(errorMessage);
    
    // Show user-friendly error message
    toast({
      title: "Error cargando PDF",
      description: errorMessage,
      variant: "destructive",
    });
    
    onLoadError?.(error);
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

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Reconfigure worker before retry
    configurePDFWorker();
    setWorkerReady(!!pdfjs.GlobalWorkerOptions.workerSrc);
  };

  // Show loading state while worker is being configured
  if (!workerReady) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Configurando visor PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-red-500 text-center max-w-md">
          <p className="font-semibold mb-2">Error al cargar el PDF</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={handleRetry}
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
          error={null}
          options={{
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
            isEvalSupported: false,
            maxImageSize: 1024 * 1024
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
