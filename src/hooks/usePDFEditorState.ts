
import { useState } from 'react';
import { PDFField } from '@/components/pdf/PDFFieldTypes';

interface PDFEditorStateProps {
  initialFields?: PDFField[];
  initialTemplate?: {
    name?: string;
    fileName?: string;
    fileUrl?: string;
  };
}

export const usePDFEditorState = ({ initialFields = [], initialTemplate }: PDFEditorStateProps = {}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialTemplate?.fileUrl || null);
  const [templateName, setTemplateName] = useState(initialTemplate?.name || '');
  const [fields, setFields] = useState<PDFField[]>(initialFields);
  const [selectedField, setSelectedField] = useState<PDFField | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState<PDFField['type'] | null>(null);

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

  return {
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
  };
};
