
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Trash2 } from 'lucide-react';
import { PDFTemplate } from '../PDFTemplateBuilder';

interface PDFTemplateCardProps {
  template: PDFTemplate;
  onEdit: (template: PDFTemplate) => void;
  onDelete: (template: PDFTemplate) => void;
}

const PDFTemplateCard = ({ template, onEdit, onDelete }: PDFTemplateCardProps) => {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          <CardTitle className="text-lg">{template.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <p><strong>Archivo:</strong> {template.fileName}</p>
            <p><strong>Campos:</strong> {template.fields.length}</p>
            <p><strong>Tamaño:</strong> {formatFileSize(template.fileSize)}</p>
            <p><strong>Creado:</strong> {template.createdAt.toLocaleDateString()}</p>
            {template.updatedAt && (
              <p><strong>Actualizado:</strong> {template.updatedAt.toLocaleDateString()}</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {template.fields.slice(0, 3).map((field) => (
              <Badge key={field.id} variant="outline" className="text-xs">
                {field.type}
              </Badge>
            ))}
            {template.fields.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.fields.length - 3} más
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(template)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(template)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFTemplateCard;
