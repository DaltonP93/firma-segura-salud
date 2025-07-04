
import { useRef, useCallback, useState } from 'react';
import { Upload, Type, Calendar, Edit } from 'lucide-react';
import PDFViewer from '../PDFViewer';
import PDFCanvasFallback from './PDFCanvasFallback';
import { PDFField } from './PDFFieldTypes';

interface PDFCanvasProps {
  pdfSource: File | string | null;
  fields: PDFField[];
  selectedField: PDFField | null;
  selectedTool: PDFField['type'] | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  onCanvasClick: (event: React.MouseEvent) => void;
  onFieldMouseDown: (event: React.MouseEvent, field: PDFField) => void;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onPDFLoadSuccess: (pdf: any) => void;
  mode: 'create' | 'edit';
}

const PDFCanvas = ({
  pdfSource,
  fields,
  selectedField,
  selectedTool,
  isDragging,
  dragOffset,
  onCanvasClick,
  onFieldMouseDown,
  onMouseMove,
  onMouseUp,
  onPDFLoadSuccess,
  mode
}: PDFCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const getFieldIcon = (type: PDFField['type']) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'textarea': return <Type className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'signature': return <Edit className="w-4 h-4" />;
      case 'email': return <Type className="w-4 h-4" />;
      case 'phone': return <Type className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const handlePDFError = (error: Error) => {
    console.error('PDF Canvas error:', error);
    setPdfError(error.message);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setPdfError(null);
  };

  // Show fallback if there's a persistent PDF error
  if (pdfError && retryCount >= 2) {
    return (
      <PDFCanvasFallback 
        onRetry={handleRetry}
        error={pdfError}
        mode={mode}
      />
    );
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[600px] bg-gray-50 relative">
      {pdfSource ? (
        <div
          ref={canvasRef}
          className="relative bg-white shadow-lg rounded overflow-hidden cursor-crosshair"
          onClick={onCanvasClick}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          {/* PDF Viewer */}
          <PDFViewer
            file={pdfSource}
            onLoadSuccess={onPDFLoadSuccess}
            onLoadError={handlePDFError}
            className="min-h-[500px]"
            width={800}
          />

          {/* Field Overlays */}
          {fields.map((field) => (
            <div
              key={field.id}
              className={`absolute border-2 bg-blue-100 bg-opacity-50 cursor-move select-none z-10 ${
                selectedField?.id === field.id ? 'border-blue-500' : 'border-blue-300'
              }`}
              style={{
                left: field.x,
                top: field.y,
                width: field.width,
                height: field.height
              }}
              onMouseDown={(e) => onFieldMouseDown(e, field)}
            >
              <div className="flex items-center justify-between p-1 text-xs">
                {getFieldIcon(field.type)}
                <span className="truncate">{field.label}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Upload className="w-12 h-12 mb-4" />
          <p>
            {mode === 'edit' 
              ? 'Cargando PDF original o sube un nuevo archivo...' 
              : 'Carga un archivo PDF para comenzar'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFCanvas;
