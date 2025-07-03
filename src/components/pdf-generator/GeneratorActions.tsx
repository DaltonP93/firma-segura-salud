
import { Button } from "@/components/ui/button";
import { FileText, Download } from 'lucide-react';

interface GeneratorActionsProps {
  templateName?: string;
  fieldsCount: number;
  onPreview?: () => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

const GeneratorActions = ({ 
  templateName, 
  fieldsCount, 
  onPreview, 
  onGenerate, 
  isGenerating = false 
}: GeneratorActionsProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-500">
        {templateName && `Plantilla: ${templateName} • ${fieldsCount} campos`}
      </div>
      <div className="flex gap-2">
        {onPreview && (
          <Button variant="outline" onClick={onPreview} disabled={isGenerating}>
            <FileText className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
        )}
        <Button 
          onClick={onGenerate} 
          className="bg-primary hover:bg-primary/90"
          disabled={isGenerating}
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generando...' : 'Generar Documento'}
        </Button>
      </div>
    </div>
  );
};

export default GeneratorActions;
