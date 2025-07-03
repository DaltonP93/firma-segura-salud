
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from 'lucide-react';
import { PDFField } from './PDFFieldTypes';

interface PDFFieldPropertiesProps {
  selectedField: PDFField | null;
  onUpdateField: (fieldId: string, updates: Partial<PDFField>) => void;
  onDeleteField: (fieldId: string) => void;
}

const PDFFieldProperties = ({ selectedField, onUpdateField, onDeleteField }: PDFFieldPropertiesProps) => {
  if (!selectedField) return null;

  return (
    <div className="border-t pt-4 space-y-3">
      <h4 className="font-medium">Propiedades del Campo</h4>
      <div>
        <Label>Etiqueta</Label>
        <Input
          value={selectedField.label}
          onChange={(e) => onUpdateField(selectedField.id, { label: e.target.value })}
        />
      </div>
      <div>
        <Label>Placeholder</Label>
        <Input
          value={selectedField.placeholder || ''}
          onChange={(e) => onUpdateField(selectedField.id, { placeholder: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedField.required}
          onChange={(e) => onUpdateField(selectedField.id, { required: e.target.checked })}
        />
        <Label>Campo Requerido</Label>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDeleteField(selectedField.id)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Eliminar Campo
      </Button>
    </div>
  );
};

export default PDFFieldProperties;
