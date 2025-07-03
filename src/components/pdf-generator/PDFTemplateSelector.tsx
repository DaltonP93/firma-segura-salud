
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from 'lucide-react';
import type { PDFTemplate } from '../PDFTemplateBuilder';

interface PDFTemplateSelectorProps {
  templates: PDFTemplate[];
  onTemplateSelect: (templateId: string) => void;
}

const PDFTemplateSelector = ({ templates, onTemplateSelect }: PDFTemplateSelectorProps) => {
  return (
    <div>
      <Label>Seleccionar Plantilla PDF</Label>
      <Select onValueChange={onTemplateSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una plantilla PDF" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {template.name} ({template.fields.length} campos)
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PDFTemplateSelector;
