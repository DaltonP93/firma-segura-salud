
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
  page?: number;
}

export interface PDFTemplate {
  name: string;
  fileName: string;
  fileUrl?: string;
}

export interface PDFEditorProps {
  onSave?: (fields: PDFField[], pdfFile: File, templateName?: string) => void;
  onCancel?: () => void;
  initialFields?: PDFField[];
  initialTemplate?: PDFTemplate;
  mode?: 'create' | 'edit';
}
