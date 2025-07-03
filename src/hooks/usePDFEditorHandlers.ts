
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PDFField } from '@/components/pdf/PDFFieldTypes';

interface PDFEditorHandlersProps {
  selectedTool: PDFField['type'] | null;
  setSelectedTool: (tool: PDFField['type'] | null) => void;
  setFields: React.Dispatch<React.SetStateAction<PDFField[]>>;
  setSelectedField: (field: PDFField | null) => void;
  setIsDragging: (dragging: boolean) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;
  selectedField: PDFField | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  setPdfFile: (file: File | null) => void;
  setPdfUrl: (url: string | null) => void;
  setTemplateName: (name: string) => void;
}

export const usePDFEditorHandlers = ({
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
}: PDFEditorHandlersProps) => {
  const { toast } = useToast();

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
  }, [isDragging, selectedField, dragOffset, setFields]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, [setIsDragging, setDragOffset]);

  return {
    handleFileUpload,
    handlePDFLoadSuccess,
    handleCanvasClick,
    handleFieldMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};
