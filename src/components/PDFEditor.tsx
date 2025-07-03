
import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Type, Calendar, Edit, Trash2, Save, Download } from 'lucide-react';
import PDFViewer from './PDFViewer';

export interface PDFField {
  id: string;
  type: 'text' | 'textarea' | 'date' | 'signature' | 'email' | 'phone';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  placeholder?: string;
  value?: string;
}

interface PDFEditorProps {
  onSave?: (fields: PDFField[], pdfFile: File) => void;
  onCancel?: () => void;
  initialFields?: PDFField[];
  mode?: 'create' | 'edit';
}

const PDFEditor = ({ onSave, onCancel, initialFields = [], mode = 'create' }: PDFEditorProps) => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fields, setFields] = useState<PDFField[]>(initialFields);
  const [selectedField, setSelectedField] = useState<PDFField | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState<PDFField['type'] | null>(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      toast({
        title: "PDF Cargado",
        description: "El archivo PDF se ha cargado correctamente",
      });
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo PDF válido",
        variant: "destructive",
      });
    }
  };

  const handlePDFLoadSuccess = (pdf: any) => {
    console.log('PDF loaded successfully:', pdf);
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (!selectedTool || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newField: PDFField = {
      id: `field-${Date.now()}`,
      type: selectedTool,
      label: `${selectedTool} Field`,
      x,
      y,
      width: 120,
      height: selectedTool === 'textarea' ? 60 : 30,
      required: false,
      placeholder: `Enter ${selectedTool}...`
    };

    setFields(prev => [...prev, newField]);
    setSelectedField(newField);
    setSelectedTool(null);
  };

  const handleFieldMouseDown = (event: React.MouseEvent, field: PDFField) => {
    event.stopPropagation();
    setSelectedField(field);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left - field.x,
        y: event.clientY - rect.top - field.y
      });
    }
  };

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !selectedField || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = event.clientX - rect.left - dragOffset.x;
    const newY = event.clientY - rect.top - dragOffset.y;

    setFields(prev => prev.map(field => 
      field.id === selectedField.id 
        ? { ...field, x: Math.max(0, newX), y: Math.max(0, newY) }
        : field
    ));
  }, [isDragging, selectedField, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const updateField = (fieldId: string, updates: Partial<PDFField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleSave = () => {
    if (!pdfFile && mode === 'create') {
      toast({
        title: "Error",
        description: "Por favor carga un archivo PDF primero",
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

    onSave?.(fields, pdfFile!);
    toast({
      title: "Plantilla Guardada",
      description: "La plantilla PDF interactiva ha sido guardada exitosamente",
    });
  };

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

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            {mode === 'create' ? 'Crear Plantilla PDF Interactiva' : 'Editar Plantilla PDF'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mode === 'create' && (
            <div className="mb-6">
              <Label htmlFor="pdf-upload">Cargar Archivo PDF</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button variant="outline" disabled={!pdfFile}>
                  <Upload className="w-4 h-4 mr-2" />
                  {pdfFile ? pdfFile.name : 'No hay archivo'}
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tool Palette */}
            <div className="space-y-4">
              <h3 className="font-semibold">Herramientas de Campo</h3>
              <div className="space-y-2">
                {(['text', 'textarea', 'email', 'phone', 'date', 'signature'] as const).map((tool) => (
                  <Button
                    key={tool}
                    variant={selectedTool === tool ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTool(tool)}
                    className="w-full justify-start"
                  >
                    {getFieldIcon(tool)}
                    <span className="ml-2 capitalize">{tool}</span>
                  </Button>
                ))}
              </div>

              {selectedField && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium">Propiedades del Campo</h4>
                  <div>
                    <Label>Etiqueta</Label>
                    <Input
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Placeholder</Label>
                    <Input
                      value={selectedField.placeholder || ''}
                      onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                    />
                    <Label>Campo Requerido</Label>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteField(selectedField.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Campo
                  </Button>
                </div>
              )}
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[600px] bg-gray-50 relative">
                {pdfFile ? (
                  <div
                    ref={canvasRef}
                    className="relative bg-white shadow-lg rounded overflow-hidden cursor-crosshair"
                    onClick={handleCanvasClick}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    {/* PDF Viewer */}
                    <PDFViewer
                      file={pdfFile}
                      onLoadSuccess={handlePDFLoadSuccess}
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
                        onMouseDown={(e) => handleFieldMouseDown(e, field)}
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
                    <p>Carga un archivo PDF para comenzar</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Campos creados: {fields.length}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" />
                Guardar Plantilla
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFEditor;
