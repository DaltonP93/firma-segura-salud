
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PDFToolPalette from './pdf/PDFToolPalette';
import PDFFieldProperties from './pdf/PDFFieldProperties';
import PDFCanvas from './pdf/PDFCanvas';
import PDFEditorHeader from './pdf/PDFEditorHeader';
import PDFEditorFooter from './pdf/PDFEditorFooter';
import { PDFField, PDFEditorProps } from './pdf/PDFFieldTypes';

const PDFEditor = ({ 
  onSave, 
  onCancel, 
  initialFields = [], 
  initialTemplate,
  mode = 'create' 
}: PDFEditorProps) => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialTemplate?.fileUrl || null);
  const [templateName, setTemplateName] = useState(initialTemplate?.name || '');
  const [fields, setFields] = useState<PDFField[]>(initialFields);
  const [selectedField, setSelectedField] = useState<PDFField | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState<PDFField['type'] | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfUrl(null); // Clear existing URL when new file is uploaded
      setTemplateName(file.name.replace('.pdf', ''));
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
    if (!selectedTool) return;

    const rect = event.currentTarget.getBoundingClientRect();
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
    
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left - field.x,
        y: event.clientY - rect.top - field.y
      });
    }
  };

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !selectedField) return;

    const rect = event.currentTarget.getBoundingClientRect();
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
    if (!pdfFile && !pdfUrl && mode === 'create') {
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

    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la plantilla",
        variant: "destructive",
      });
      return;
    }

    onSave?.(fields, pdfFile!, templateName);
    toast({
      title: "Plantilla Guardada",
      description: "La plantilla PDF interactiva ha sido guardada exitosamente",
    });
  };

  const pdfSource = pdfFile || pdfUrl;

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            {mode === 'create' ? 'Crear Plantilla PDF Interactiva' : 'Editar Plantilla PDF'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PDFEditorHeader
            templateName={templateName}
            onTemplateNameChange={setTemplateName}
            pdfFile={pdfFile}
            onFileUpload={handleFileUpload}
            mode={mode}
            initialTemplate={initialTemplate}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tool Palette */}
            <div className="space-y-4">
              <PDFToolPalette
                selectedTool={selectedTool}
                onToolSelect={setSelectedTool}
              />
              
              <PDFFieldProperties
                selectedField={selectedField}
                onUpdateField={updateField}
                onDeleteField={deleteField}
              />
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-3">
              <PDFCanvas
                pdfSource={pdfSource}
                fields={fields}
                selectedField={selectedField}
                selectedTool={selectedTool}
                isDragging={isDragging}
                dragOffset={dragOffset}
                onCanvasClick={handleCanvasClick}
                onFieldMouseDown={handleFieldMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onPDFLoadSuccess={handlePDFLoadSuccess}
                mode={mode}
              />
            </div>
          </div>

          <PDFEditorFooter
            fieldsCount={fields.length}
            onSave={handleSave}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFEditor;
