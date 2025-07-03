import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Edit, Trash2, Eye } from 'lucide-react';
import PDFEditor from './PDFEditor';
import { PDFField } from './pdf/PDFFieldTypes';

export interface PDFTemplate {
  id: string;
  name: string;
  fileName: string;
  fields: PDFField[];
  createdAt: Date;
  updatedAt: Date;
  fileSize: number;
  fileUrl?: string;
}

interface PDFTemplateBuilderProps {
  templates: PDFTemplate[];
  onCreateTemplate: (template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<PDFTemplate>) => void;
  onDeleteTemplate: (templateId: string) => void;
}

const PDFTemplateBuilder = ({ 
  templates, 
  onCreateTemplate, 
  onUpdateTemplate, 
  onDeleteTemplate 
}: PDFTemplateBuilderProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PDFTemplate | null>(null);

  const handleCreateTemplate = (fields: PDFField[], pdfFile: File, templateName?: string) => {
    const newTemplate = {
      name: templateName || pdfFile.name.replace('.pdf', ''),
      fileName: pdfFile.name,
      fields,
      fileSize: pdfFile.size
    };

    onCreateTemplate(newTemplate);
    setIsCreating(false);
    
    toast({
      title: "Plantilla PDF Creada",
      description: `La plantilla "${newTemplate.name}" ha sido creada exitosamente`,
    });
  };

  const handleUpdateTemplate = (fields: PDFField[], pdfFile: File | null, templateName?: string) => {
    if (!editingTemplate) return;

    const updates: Partial<PDFTemplate> = {
      fields,
      updatedAt: new Date()
    };

    if (templateName && templateName !== editingTemplate.name) {
      updates.name = templateName;
    }

    if (pdfFile) {
      updates.fileName = pdfFile.name;
      updates.fileSize = pdfFile.size;
    }

    onUpdateTemplate(editingTemplate.id, updates);
    setEditingTemplate(null);
    
    toast({
      title: "Plantilla Actualizada",
      description: `La plantilla "${editingTemplate.name}" ha sido actualizada`,
    });
  };

  const handleDeleteTemplate = (template: PDFTemplate) => {
    onDeleteTemplate(template.id);
    toast({
      title: "Plantilla Eliminada",
      description: `La plantilla "${template.name}" ha sido eliminada`,
      variant: "destructive",
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isCreating) {
    return (
      <PDFEditor
        mode="create"
        onSave={handleCreateTemplate}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (editingTemplate) {
    return (
      <PDFEditor
        mode="edit"
        initialFields={editingTemplate.fields}
        initialTemplate={{
          name: editingTemplate.name,
          fileName: editingTemplate.fileName,
          fileUrl: editingTemplate.fileUrl
        }}
        onSave={handleUpdateTemplate}
        onCancel={() => setEditingTemplate(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-primary">Plantillas PDF Interactivas</CardTitle>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas PDF</h3>
              <p className="text-gray-500 mb-4">
                Crea tu primera plantilla PDF interactiva para generar documentos con campos editables
              </p>
              <Button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Plantilla
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-500" />
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <p><strong>Archivo:</strong> {template.fileName}</p>
                        <p><strong>Campos:</strong> {template.fields.length}</p>
                        <p><strong>Tamaño:</strong> {formatFileSize(template.fileSize)}</p>
                        <p><strong>Creado:</strong> {template.createdAt.toLocaleDateString()}</p>
                        {template.updatedAt && (
                          <p><strong>Actualizado:</strong> {template.updatedAt.toLocaleDateString()}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.fields.slice(0, 3).map((field) => (
                          <Badge key={field.id} variant="outline" className="text-xs">
                            {field.type}
                          </Badge>
                        ))}
                        {template.fields.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.fields.length - 3} más
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingTemplate(template)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTemplate(template)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFTemplateBuilder;
