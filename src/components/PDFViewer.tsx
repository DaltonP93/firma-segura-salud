
import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { useToast } from "@/hooks/use-toast";
import { configurePDFWorker } from './pdf/PDFWorkerConfig';
import PDFControls from './pdf/PDFControls';
import PDFDocument from './pdf/PDFDocument';
import { PDFWorkerLoadingState, PDFErrorState } from './pdf/PDFLoadingStates';

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
    return <PDFWorkerLoadingState className={className} />;
  }

  if (error) {
    return <PDFErrorState error={error} onRetry={handleRetry} className={className} />;
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <PDFControls
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        pageNumber={pageNumber}
        numPages={numPages}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
      />

      <PDFDocument
        file={file}
        pageNumber={pageNumber}
        scale={scale}
        rotation={rotation}
        width={width}
        height={height}
        isLoading={isLoading}
        error={error}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
      />
    </div>
  );
};

export default PDFViewer;
