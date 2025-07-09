import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Save,
  X,
  MousePointer2,
  Hand,
  Type,
  Calendar,
  Edit,
  Mail,
  Phone
} from 'lucide-react';
import { PDFField } from './PDFFieldTypes';
import PDFViewer from '../PDFViewer';

interface AdvancedPDFEditorProps {
  pdfSource: File | string | null;
  initialFields?: PDFField[];
  onSave?: (fields: PDFField[], pdfFile: File, templateName: string) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  templateName?: string;
}

const AdvancedPDFEditor: React.FC<AdvancedPDFEditorProps> = ({
  pdfSource,
  initialFields = [],
  onSave,
  onCancel,
  mode = 'create',
  templateName: initialTemplateName = ''
}) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // PDF and UI state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [templateName, setTemplateName] = useState(initialTemplateName);
  
  // Tool and interaction state
  const [tool, setTool] = useState<'select' | 'hand' | PDFField['type']>('select');
  const [fields, setFields] = useState<PDFField[]>(initialFields);
  const [selectedField, setSelectedField] = useState<PDFField | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Seleccionar' },
    { id: 'hand', icon: Hand, label: 'Mano' },
    { id: 'text', icon: Type, label: 'Texto' },
    { id: 'email', icon: Mail, label: 'Email' },
    { id: 'phone', icon: Phone, label: 'Teléfono' },
    { id: 'date', icon: Calendar, label: 'Fecha' },
    { id: 'signature', icon: Edit, label: 'Firma' },
  ];

  const handlePDFLoad = useCallback((pdf: any) => {
    setPdfDoc(pdf);
    setTotalPages(pdf.numPages);
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (tool === 'select' || tool === 'hand') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    const newField: PDFField = {
      id: `field-${Date.now()}`,
      type: tool as PDFField['type'],
      label: `${tool} Field`,
      x,
      y,
      width: 120,
      height: tool === 'textarea' ? 60 : 30,
      required: false,
      placeholder: `Enter ${tool}...`,
      page: currentPage
    };

    setFields(prev => [...prev, newField]);
    setSelectedField(newField);
    setTool('select');
  }, [tool, zoom, currentPage]);

  const handleFieldMouseDown = useCallback((event: React.MouseEvent, field: PDFField) => {
    event.stopPropagation();
    setSelectedField(field);
    setIsDragging(true);
    
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (event.clientX - rect.left) / zoom - field.x,
        y: (event.clientY - rect.top) / zoom - field.y
      });
    }
  }, [zoom]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !selectedField) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const newX = (event.clientX - rect.left) / zoom - dragOffset.x;
    const newY = (event.clientY - rect.top) / zoom - dragOffset.y;

    setFields(prev => prev.map(field => 
      field.id === selectedField.id 
        ? { ...field, x: Math.max(0, newX), y: Math.max(0, newY) }
        : field
    ));
  }, [isDragging, selectedField, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const updateSelectedField = (updates: Partial<PDFField>) => {
    if (!selectedField) return;
    
    setFields(prev => prev.map(field => 
      field.id === selectedField.id ? { ...field, ...updates } : field
    ));
    setSelectedField(prev => prev ? { ...prev, ...updates } : null);
  };

  const deleteSelectedField = () => {
    if (!selectedField) return;
    
    setFields(prev => prev.filter(field => field.id !== selectedField.id));
    setSelectedField(null);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleSave = () => {
    if (!pdfSource || !templateName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la plantilla",
        variant: "destructive",
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un campo antes de guardar",
        variant: "destructive",
      });
      return;
    }

    const file = pdfSource instanceof File ? pdfSource : new File([], 'document.pdf');
    onSave?.(fields, file, templateName);
  };

  const currentPageFields = fields.filter(field => field.page === currentPage);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {mode === 'create' ? 'Crear Plantilla PDF' : 'Editar Plantilla PDF'}
            </h1>
            <div className="flex items-center gap-2">
              <Label htmlFor="template-name">Nombre:</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Nombre de la plantilla"
                className="w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar
            </Button>
            <Button onClick={onCancel} variant="outline">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-64 bg-white border-r p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Herramientas</h3>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((toolItem) => (
                <Button
                  key={toolItem.id}
                  variant={tool === toolItem.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTool(toolItem.id as any)}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <toolItem.icon className="w-4 h-4" />
                  <span className="text-xs">{toolItem.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Field Properties */}
          {selectedField && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Propiedades</h4>
              <div className="space-y-3">
                <div>
                  <Label>Etiqueta</Label>
                  <Input
                    value={selectedField.label}
                    onChange={(e) => updateSelectedField({ label: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label>Placeholder</Label>
                  <Input
                    value={selectedField.placeholder || ''}
                    onChange={(e) => updateSelectedField({ placeholder: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedField.required}
                    onChange={(e) => updateSelectedField({ required: e.target.checked })}
                  />
                  <Label>Requerido</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Ancho</Label>
                  <Input
                    type="number"
                    value={selectedField.width.toString()}
                    onChange={(e) => updateSelectedField({ width: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label>Alto</Label>
                  <Input
                    type="number"
                    value={selectedField.height.toString()}
                    onChange={(e) => updateSelectedField({ height: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
                </div>
                <Button onClick={deleteSelectedField} variant="destructive" size="sm">
                  Eliminar Campo
                </Button>
              </div>
            </div>
          )}

          {/* Fields List */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">
              Campos ({fields.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={`p-2 rounded border cursor-pointer ${
                    selectedField?.id === field.id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedField(field);
                    setCurrentPage(field.page || 1);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{field.label}</span>
                    <Badge variant="outline" className="text-xs">
                      Pág. {field.page || 1}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">{field.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={handleZoomOut} variant="outline" size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
              <Button onClick={handleZoomIn} variant="outline" size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button onClick={handleResetZoom} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handlePreviousPage} 
                variant="outline" 
                size="sm"
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">
                Página {currentPage} de {totalPages}
              </span>
              <Button 
                onClick={handleNextPage} 
                variant="outline" 
                size="sm"
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* PDF Canvas */}
          <div className="flex-1 overflow-auto p-4">
            <div 
              ref={canvasRef}
              className="relative bg-white shadow-lg rounded mx-auto"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: 'fit-content'
              }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {pdfSource && (
                <PDFViewer
                  file={pdfSource}
                  onLoadSuccess={handlePDFLoad}
                  className="pointer-events-none"
                  width={800}
                />
              )}

              {/* Field overlays for current page */}
              {currentPageFields.map((field) => (
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
                  onMouseDown={(e) => handleFieldMouseDown(e, field)}
                >
                  <div className="flex items-center justify-between p-1 text-xs">
                    <span className="truncate">{field.label}</span>
                    {field.required && <span className="text-red-500">*</span>}
                  </div>
                  
                  {/* Resize handles */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPDFEditor;