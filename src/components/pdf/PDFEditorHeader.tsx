
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { PDFTemplate } from './PDFFieldTypes';

interface PDFEditorHeaderProps {
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  pdfFile: File | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  mode: 'create' | 'edit';
  initialTemplate?: PDFTemplate;
}

const PDFEditorHeader = ({
  templateName,
  onTemplateNameChange,
  pdfFile,
  onFileUpload,
  mode,
  initialTemplate
}: PDFEditorHeaderProps) => {
  return (
    <div className="mb-6 space-y-4">
      <div>
        <Label htmlFor="template-name">Nombre de la Plantilla</Label>
        <Input
          id="template-name"
          value={templateName}
          onChange={(e) => onTemplateNameChange(e.target.value)}
          placeholder="Ingresa el nombre de la plantilla"
          className="mt-2"
        />
      </div>

      {mode === 'create' && (
        <div>
          <Label htmlFor="pdf-upload">Cargar Archivo PDF</Label>
          <div className="mt-2 flex items-center gap-4">
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={onFileUpload}
              className="flex-1"
            />
            <Button variant="outline" disabled={!pdfFile}>
              <Upload className="w-4 h-4 mr-2" />
              {pdfFile ? pdfFile.name : 'No hay archivo'}
            </Button>
          </div>
        </div>
      )}

      {mode === 'edit' && !pdfFile && (
        <div>
          <Label htmlFor="pdf-upload-edit">Cambiar Archivo PDF (Opcional)</Label>
          <div className="mt-2 flex items-center gap-4">
            <Input
              id="pdf-upload-edit"
              type="file"
              accept=".pdf"
              onChange={onFileUpload}
              className="flex-1"
            />
            <span className="text-sm text-gray-500">
              Archivo actual: {initialTemplate?.fileName || 'No disponible'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFEditorHeader;
