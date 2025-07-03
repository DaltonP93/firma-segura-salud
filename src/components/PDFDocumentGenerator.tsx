import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Send, Calendar, Edit, Type } from 'lucide-react';
import type { PDFTemplate } from './PDFTemplateBuilder';
import type { PDFField } from './pdf/PDFFieldTypes';

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

  const updateFieldValue = (fieldId: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleGenerate = () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Por favor selecciona una plantilla",
        variant: "destructive",
      });
      return;
    }

    if (!clientInfo.name || !clientInfo.email) {
      toast({
        title: "Error",
        description: "Por favor completa la información del cliente",
        variant: "destructive",
      });
      return;
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
      return;
    }

    onGenerateDocument(selectedTemplate.id, fieldValues, clientInfo);
    
    toast({
      title: "Documento Generado",
      description: "El documento PDF ha sido generado exitosamente",
    });

    // Reset form
    setFieldValues({});
    setClientInfo({ name: '', email: '', phone: '' });
  };

  const getFieldIcon = (type: PDFField['type']) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'textarea': return <Type className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'signature': return <Edit className="w-4 h-4" />;
      case 'email': return <Type className="w-4 h-4" />;
      case 'phone': return <Type className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const renderField = (field: PDFField) => {
    const value = fieldValues[field.id] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
          />
        );
      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case 'phone':
        return (
          <Input
            type="tel"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case 'signature':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Edit className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Click para firmar</p>
          </div>
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Generar Documento PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <Label>Seleccionar Plantilla PDF</Label>
              <Select onValueChange={handleTemplateSelect}>
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

            {selectedTemplate && (
              <>
                {/* Client Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información del Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="clientName">Nombre Completo *</Label>
                        <Input
                          id="clientName"
                          value={clientInfo.name}
                          onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientEmail">Email *</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          value={clientInfo.email}
                          onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="juan@ejemplo.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientPhone">Teléfono</Label>
                        <Input
                          id="clientPhone"
                          type="tel"
                          value={clientInfo.phone}
                          onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Document Fields */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Campos del Documento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTemplate.fields.map((field) => (
                        <div key={field.id}>
                          <Label className="flex items-center gap-2">
                            {getFieldIcon(field.type)}
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                          </Label>
                          {renderField(field)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Plantilla: {selectedTemplate.name} • {selectedTemplate.fields.length} campos
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Vista Previa
                    </Button>
                    <Button onClick={handleGenerate} className="bg-primary hover:bg-primary/90">
                      <Download className="w-4 h-4 mr-2" />
                      Generar Documento
                    </Button>
                  </div>
                </div>
              </>
            )}

            {templates.length === 0 && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas PDF disponibles</h3>
                <p className="text-gray-500">Crea una plantilla PDF primero en la sección de plantillas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFDocumentGenerator;
