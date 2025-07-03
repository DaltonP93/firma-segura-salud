
import { Card, CardContent } from "@/components/ui/card";
import PDFEditor from './PDFEditor';
import PDFTemplateHeader from './pdf/PDFTemplateHeader';
import PDFTemplateGrid from './pdf/PDFTemplateGrid';
import PDFTemplateEmptyState from './pdf/PDFTemplateEmptyState';
import { usePDFTemplateActions } from '@/hooks/usePDFTemplateActions';
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
  const {
    isCreating,
    editingTemplate,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    startCreating,
    cancelCreating,
    startEditing,
    cancelEditing
  } = usePDFTemplateActions({
    onCreateTemplate,
    onUpdateTemplate,
    onDeleteTemplate
  });

  if (isCreating) {
    return (
      <PDFEditor
        mode="create"
        onSave={handleCreateTemplate}
        onCancel={cancelCreating}
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
        onCancel={cancelEditing}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0">
        <PDFTemplateHeader onCreateTemplate={startCreating} />
        <CardContent>
          {templates.length === 0 ? (
            <PDFTemplateEmptyState onCreateTemplate={startCreating} />
          ) : (
            <PDFTemplateGrid
              templates={templates}
              onEditTemplate={startEditing}
              onDeleteTemplate={handleDeleteTemplate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFTemplateBuilder;
