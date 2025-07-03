
import { Button } from "@/components/ui/button";
import { Save } from 'lucide-react';

interface PDFEditorFooterProps {
  fieldsCount: number;
  onSave: () => void;
  onCancel?: () => void;
}

const PDFEditorFooter = ({ fieldsCount, onSave, onCancel }: PDFEditorFooterProps) => {
  return (
    <div className="flex justify-between items-center mt-6">
      <div className="text-sm text-gray-500">
        Campos creados: {fieldsCount}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSave} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Guardar Plantilla
        </Button>
      </div>
    </div>
  );
};

export default PDFEditorFooter;
