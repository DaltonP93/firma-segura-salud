
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { PDFTemplate } from './PDFTemplateBuilder';
import PDFTemplateSelector from './pdf-generator/PDFTemplateSelector';
import ClientInfoForm from './pdf-generator/ClientInfoForm';
import DocumentFieldsForm from './pdf-generator/DocumentFieldsForm';
import GeneratorActions from './pdf-generator/GeneratorActions';
import EmptyState from './pdf-generator/EmptyState';

interface PDFDocumentGeneratorProps {
  templates: PDFTemplate[];
  onGenerateDocument: (templateId: string, fieldValues: Record<string, string>, clientInfo: any) => void;
}

const PDFDocumentGenerator = ({ templates, onGenerateDocument }: PDFDocumentGeneratorProps) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      // Initialize field values
      const initialValues: Record<string, string> = {};
      template.fields.forEach(field => {
        initialValues[field.id] = '';
      });
      setFieldValues(initialValues);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Por favor selecciona una plantilla",
        variant: "destructive",
      });
      return false;
    }

    if (!clientInfo.name || !clientInfo.email) {
      toast({
        title: "Error",
        description: "Por favor completa la información del cliente",
        variant: "destructive",
      });
      return false;
    }

    // Check required fields
    const requiredFields = selectedTemplate.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !fieldValues[field.id]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos Requeridos",
        description: `Por favor completa: ${missingFields.map(f => f.label).join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      await onGenerateDocument(selectedTemplate!.id, fieldValues, clientInfo);
      
      toast({
        title: "Documento Generado",
        description: "El documento PDF ha sido generado exitosamente",
      });

      // Reset form
      setFieldValues({});
      setClientInfo({ name: '', email: '', phone: '' });
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: "Error al generar el documento",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    
    toast({
      title: "Vista Previa",
      description: "Función de vista previa en desarrollo",
    });
  };

  if (templates.length === 0) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Generar Documento PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Generar Documento PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <PDFTemplateSelector
              templates={templates}
              onTemplateSelect={handleTemplateSelect}
            />

            {selectedTemplate && (
              <>
                <ClientInfoForm
                  clientInfo={clientInfo}
                  onClientInfoChange={setClientInfo}
                />

                <DocumentFieldsForm
                  fields={selectedTemplate.fields}
                  fieldValues={fieldValues}
                  onFieldValueChange={(fieldId, value) => 
                    setFieldValues(prev => ({ ...prev, [fieldId]: value }))
                  }
                />

                <GeneratorActions
                  templateName={selectedTemplate.name}
                  fieldsCount={selectedTemplate.fields.length}
                  onPreview={handlePreview}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFDocumentGenerator;
