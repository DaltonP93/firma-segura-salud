
import { PDFEditorProps } from './pdf/PDFFieldTypes';
import PDFEditorLayout from './pdf/PDFEditorLayout';

const PDFEditor = ({ 
  onSave, 
  onCancel, 
  initialFields = [], 
  initialTemplate,
  mode = 'create' 
}: PDFEditorProps) => {
  return (
    <PDFEditorLayout
      onSave={onSave}
      onCancel={onCancel}
      initialFields={initialFields}
      initialTemplate={initialTemplate}
      mode={mode}
    />
  );
};

export default PDFEditor;
