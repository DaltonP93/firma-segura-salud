
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Layers, Edit } from 'lucide-react';
import type { Contract, Template } from '@/pages/Index';

interface ContractFormProps {
  onSubmit: (contract: Omit<Contract, 'id' | 'status' | 'createdAt'>) => void;
  templates: Template[];
}

const ContractForm = ({ onSubmit, templates }: ContractFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientIdNumber: '',
    policyType: '',
    coverage: '',
    premium: '',
    deductible: '',
    beneficiaries: '',
    startDate: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    
    if (template) {
      // Reset form for new template
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientIdNumber: '',
        policyType: template.name,
        coverage: '',
        premium: '',
        deductible: '',
        beneficiaries: '',
        startDate: '',
        notes: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Por favor selecciona una plantilla",
        variant: "destructive",
      });
      return;
    }

    if (!formData.clientName || !formData.clientEmail) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        policyType: formData.policyType,
        templateId: selectedTemplate.id,
        templateType: selectedTemplate.type,
      });

      toast({
        title: "Documento Generado",
        description: `El documento para ${formData.clientName} ha sido creado exitosamente usando la plantilla "${selectedTemplate.name}"`,
      });

      // Reset form
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientIdNumber: '',
        policyType: '',
        coverage: '',
        premium: '',
        deductible: '',
        beneficiaries: '',
        startDate: '',
        notes: ''
      });
      setSelectedTemplate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al generar el documento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'contrato': return <FileText className="w-5 h-5" />;
      case 'anexo': return <Layers className="w-5 h-5" />;
      case 'declaracion': return <Edit className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contrato': return 'Contrato';
      case 'anexo': return 'Anexo';
      case 'declaracion': return 'Declaración Jurada';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Generar Nuevo Documento</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas disponibles</h3>
              <p className="text-gray-500">Crea plantillas en la pestaña "Templates" para poder generar documentos</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Label htmlFor="templateSelect">Seleccionar Plantilla</Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Elige una plantilla para generar el documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          {getTemplateIcon(template.type)}
                          <span>{template.name}</span>
                          <span className="text-gray-500">({getTypeLabel(template.type)})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Preview */}
              {selectedTemplate && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getTemplateIcon(selectedTemplate.type)}
                    <h3 className="font-semibold text-blue-900">{selectedTemplate.name}</h3>
                  </div>
                  <p className="text-blue-700 text-sm">
                    <strong>Tipo:</strong> {getTypeLabel(selectedTemplate.type)} | 
                    <strong> Campos:</strong> {selectedTemplate.fields.length} | 
                    <strong> Creado:</strong> {selectedTemplate.createdAt.toLocaleDateString()}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form for selected template */}
      {selectedTemplate && (
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              Completar Información del Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Cliente</h3>
                  
                  <div>
                    <Label htmlFor="clientName">Nombre Completo *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      placeholder="Nombre completo del cliente"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientEmail">Correo Electrónico *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      placeholder="email@ejemplo.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientPhone">Teléfono</Label>
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientAddress">Dirección</Label>
                    <Input
                      id="clientAddress"
                      value={formData.clientAddress}
                      onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientIdNumber">Número de Identificación</Label>
                    <Input
                      id="clientIdNumber"
                      value={formData.clientIdNumber}
                      onChange={(e) => handleInputChange('clientIdNumber', e.target.value)}
                      placeholder="CC o Pasaporte"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Específica</h3>
                  
                  {/* Dynamic fields based on template */}
                  {selectedTemplate.fields.map((field) => (
                    <div key={field.id}>
                      <Label htmlFor={field.id}>
                        {field.label} {field.required && '*'}
                      </Label>
                      {field.type === 'select' ? (
                        <Select onValueChange={(value) => handleInputChange(field.name, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={`Seleccionar ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'textarea' ? (
                        <Textarea
                          id={field.id}
                          placeholder={field.label}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={field.id}
                          type={field.type}
                          placeholder={field.label}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}

                  <div>
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observaciones o condiciones especiales"
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg"
              >
                {isLoading ? 'Generando Documento...' : `Generar ${getTypeLabel(selectedTemplate.type)}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractForm;
