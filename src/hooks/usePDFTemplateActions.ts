
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PDFTemplate } from '@/components/PDFTemplateBuilder';
import { PDFField } from '@/components/pdf/PDFFieldTypes';

interface UsePDFTemplateActionsProps {
  onCreateTemplate: (template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<PDFTemplate>) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const usePDFTemplateActions = ({
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate
}: UsePDFTemplateActionsProps) => {
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

  const startCreating = () => setIsCreating(true);
  const cancelCreating = () => setIsCreating(false);
  const startEditing = (template: PDFTemplate) => setEditingTemplate(template);
  const cancelEditing = () => setEditingTemplate(null);

  return {
    isCreating,
    editingTemplate,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    startCreating,
    cancelCreating,
    startEditing,
    cancelEditing
  };
};
