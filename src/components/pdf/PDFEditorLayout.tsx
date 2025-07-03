
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PDFToolPalette from './PDFToolPalette';
import PDFFieldProperties from './PDFFieldProperties';
import PDFCanvas from './PDFCanvas';
import PDFEditorHeader from './PDFEditorHeader';
import PDFEditorFooter from './PDFEditorFooter';
import { PDFField, PDFEditorProps } from './PDFFieldTypes';
import { usePDFEditorState } from '@/hooks/usePDFEditorState';
import { usePDFEditorHandlers } from '@/hooks/usePDFEditorHandlers';

interface PDFEditorLayoutProps extends PDFEditorProps {
  mode: 'create' | 'edit';
}

const PDFEditorLayout = ({ 
  onSave, 
  onCancel, 
  initialFields = [], 
  initialTemplate,
  mode = 'create' 
}: PDFEditorLayoutProps) => {
  const { toast } = useToast();
  
  const {
    pdfFile,
    setPdfFile,
    pdfUrl,
    setPdfUrl,
    templateName,
    setTemplateName,
    fields,
    setFields,
    selectedField,
    setSelectedField,
    isDragging,
    setIsDragging,
    dragOffset,
    setDragOffset,
    selectedTool,
    setSelectedTool,
    updateField,
    deleteField
  } = usePDFEditorState({ initialFields, initialTemplate });

  const {
    handleFileUpload,
    handlePDFLoadSuccess,
    handleCanvasClick,
    handleFieldMouseDown,
    handleMouseMove,
    handleMouseUp
  } = usePDFEditorHandlers({
    selectedTool,
    setSelectedTool,
    setFields,
    setSelectedField,
    setIsDragging,
    setDragOffset,
    selectedField,
    isDragging,
    dragOffset,
    setPdfFile,
    setPdfUrl,
    setTemplateName
  });

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

export default PDFEditorLayout;
