
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface PDFTemplate {
  name: string;
  fileName: string;
  fileUrl?: string;
}

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

      {mode === 'edit' && (
        <div className="space-y-4">
          {initialTemplate && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Archivo actual: {initialTemplate.fileName}
                      </p>
                      <p className="text-xs text-blue-600">
                        Plantilla: {initialTemplate.name}
                      </p>
                    </div>
                  </div>
                  {initialTemplate.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(initialTemplate.fileUrl, '_blank')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
              {pdfFile && (
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Nuevo: {pdfFile.name}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFEditorHeader;
