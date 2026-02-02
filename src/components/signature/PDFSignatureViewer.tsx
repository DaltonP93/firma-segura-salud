import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  Pen,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import '@/components/pdf/PDFWorkerConfig';

interface SignatureArea {
  id: string;
  role: string;
  kind: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  is_required: boolean;
  label?: string;
  signed?: boolean;
}

interface FieldConfig {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
}

interface PDFSignatureViewerProps {
  documentUrl: string;
  templateVersionId: string;
  fieldValues: Record<string, unknown>;
  currentRole: string;
  onSignatureCapture: (areaId: string, signatureData: string) => void;
  readOnly?: boolean;
}

const PDFSignatureViewer: React.FC<PDFSignatureViewerProps> = ({
  documentUrl,
  templateVersionId,
  fieldValues,
  currentRole,
  onSignatureCapture,
  readOnly = false
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [signatureAreas, setSignatureAreas] = useState<SignatureArea[]>([]);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [activeSignatureArea, setActiveSignatureArea] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (templateVersionId) {
      loadTemplateConfig();
    }
  }, [templateVersionId]);

  const loadTemplateConfig = async () => {
    try {
      // Load signature areas
      const { data: areasData, error: areasError } = await supabase
        .from('signature_areas')
        .select('*')
        .eq('template_version_id', templateVersionId)
        .order('sort_order');

      if (areasError) throw areasError;
      setSignatureAreas(areasData || []);

      // Load field configs
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('template_fields_config')
        .select('*')
        .eq('template_version_id', templateVersionId)
        .order('sort_order');

      if (fieldsError) throw fieldsError;
      
      // Map field values
      const fieldsWithValues = (fieldsData || []).map(field => ({
        ...field,
        value: fieldValues[field.field_key] as string || field.default_value || ''
      }));
      setFields(fieldsWithValues);
    } catch (error) {
      console.error('Error loading template config:', error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureCanvasRef.current || readOnly) return;
    setIsDrawing(true);
    
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleSignatureEnd = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!signatureCanvasRef.current) return;
    const ctx = signatureCanvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
    }
  };

  const saveSignature = () => {
    if (!signatureCanvasRef.current || !activeSignatureArea) return;
    const signatureData = signatureCanvasRef.current.toDataURL('image/png');
    onSignatureCapture(activeSignatureArea, signatureData);
    setActiveSignatureArea(null);
    clearSignature();
  };

  const renderPageOverlay = (pageNumber: number) => {
    const pageAreas = signatureAreas.filter(a => a.page === pageNumber);
    const pageFields = fields.filter(f => f.page === pageNumber);

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Render fields with values */}
        {pageFields.map(field => (
          <div
            key={field.id}
            className="absolute bg-blue-50/80 border border-blue-200 rounded px-1 text-sm"
            style={{
              left: `${field.x * scale}px`,
              top: `${field.y * scale}px`,
              width: `${field.width * scale}px`,
              height: `${field.height * scale}px`,
              fontSize: `${10 * scale}px`
            }}
          >
            {field.value || field.label}
          </div>
        ))}

        {/* Render signature areas */}
        {pageAreas.map(area => {
          const isMyArea = area.role === currentRole || area.role === 'client';
          const canSign = isMyArea && !area.signed && !readOnly;

          return (
            <div
              key={area.id}
              className={`absolute border-2 border-dashed rounded-lg transition-all ${
                area.signed 
                  ? 'border-green-500 bg-green-50/50' 
                  : canSign 
                    ? 'border-amber-500 bg-amber-50/50 cursor-pointer pointer-events-auto hover:bg-amber-100/50' 
                    : 'border-gray-300 bg-gray-50/50'
              }`}
              style={{
                left: `${area.x * scale}px`,
                top: `${area.y * scale}px`,
                width: `${area.width * scale}px`,
                height: `${area.height * scale}px`
              }}
              onClick={() => canSign && setActiveSignatureArea(area.id)}
            >
              <div className="absolute -top-5 left-0 flex items-center gap-1">
                <Badge 
                  variant={area.signed ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {area.label || area.role}
                </Badge>
                {area.signed && <CheckCircle className="w-3 h-3 text-green-500" />}
              </div>
              
              {canSign && !area.signed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Pen className="w-6 h-6 text-amber-600 opacity-50" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={scale >= 2.5}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            {currentPage} / {numPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="relative inline-block mx-auto shadow-lg">
          <Document
            file={documentUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }
          >
            <Page 
              pageNumber={currentPage} 
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
          {renderPageOverlay(currentPage)}
        </div>
      </div>

      {/* Signature Modal */}
      {activeSignatureArea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Capture su Firma</h3>
              <p className="text-sm text-muted-foreground">
                Dibuje su firma en el área de abajo con el mouse o toque
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
                <canvas
                  ref={signatureCanvasRef}
                  width={400}
                  height={150}
                  className="w-full cursor-crosshair touch-none"
                  onMouseDown={handleSignatureStart}
                  onMouseMove={handleSignatureMove}
                  onMouseUp={handleSignatureEnd}
                  onMouseLeave={handleSignatureEnd}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    handleSignatureStart({ clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent<HTMLCanvasElement>);
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    handleSignatureMove({ clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent<HTMLCanvasElement>);
                  }}
                  onTouchEnd={handleSignatureEnd}
                />
              </div>
              
              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={clearSignature}>
                  Limpiar
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setActiveSignatureArea(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveSignature}>
                    Guardar Firma
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PDFSignatureViewer;
