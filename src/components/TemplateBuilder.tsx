
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText, Layers, Edit } from 'lucide-react';
import type { Template, TemplateField } from '@/pages/Index';

interface TemplateBuilderProps {
  templates: Template[];
  onCreateTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => void;
}

const TemplateBuilder = ({ templates, onCreateTemplate }: TemplateBuilderProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as 'contrato' | 'anexo' | 'declaracion' | '',
    content: ''
  });
  const [fields, setFields] = useState<TemplateField[]>([]);

  const addField = () => {
    const newField: TemplateField = {
      id: `field-${Date.now()}`,
      name: '',
      type: 'text',
      label: '',
      required: false,
      options: []
    };
    setFields([...fields, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast({
        title: "Error",
        description: "Por favor completa el nombre y tipo de plantilla",
        variant: "destructive",
      });
      return;
    }

    onCreateTemplate({
      name: formData.name,
      type: formData.type as 'contrato' | 'anexo' | 'declaracion',
      content: formData.content,
      fields: fields
    });

    toast({
      title: "Plantilla Creada",
      description: `La plantilla "${formData.name}" ha sido creada exitosamente`,
    });

    // Reset form
    setFormData({ name: '', type: '', content: '' });
    setFields([]);
    setIsCreating(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contrato': return <FileText className="w-4 h-4" />;
      case 'anexo': return <Layers className="w-4 h-4" />;
      case 'declaracion': return <Edit className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
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
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-primary">Gestión de Plantillas</CardTitle>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-primary hover:bg-primary/90"
              disabled={isCreating}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <form onSubmit={handleSubmit} className="space-y-6 mb-8 p-6 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold">Crear Nueva Plantilla</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">Nombre de la Plantilla</Label>
                  <Input
                    id="templateName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Contrato de Seguro Médico Básico"
                  />
                </div>
                
                <div>
                  <Label htmlFor="templateType">Tipo de Documento</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contrato">Contrato</SelectItem>
                      <SelectItem value="anexo">Anexo</SelectItem>
                      <SelectItem value="declaracion">Declaración Jurada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="templateContent">Contenido Base de la Plantilla</Label>
                <Textarea
                  id="templateContent"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenido del documento con variables como {{clientName}}, {{clientEmail}}, etc."
                  rows={6}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Campos Personalizados</Label>
                  <Button type="button" variant="outline" onClick={addField}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Campo
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id} className="p-4 border rounded-lg bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                          <Label>Nombre del Campo</Label>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            placeholder="nombreCampo"
                          />
                        </div>
                        
                        <div>
                          <Label>Etiqueta</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            placeholder="Etiqueta visible"
                          />
                        </div>
                        
                        <div>
                          <Label>Tipo de Campo</Label>
                          <Select 
                            value={field.type} 
                            onValueChange={(value) => updateField(field.id, { type: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Teléfono</SelectItem>
                              <SelectItem value="date">Fecha</SelectItem>
                              <SelectItem value="select">Selección</SelectItem>
                              <SelectItem value="textarea">Texto Largo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Crear Plantilla
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setFormData({ name: '', type: '', content: '' });
                    setFields([]);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {templates.length === 0 && !isCreating ? (
            <div className="text-center py-12">
              <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas creadas</h3>
              <p className="text-gray-500">Crea tu primera plantilla para comenzar a generar documentos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.type)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-4">
                      <p><strong>Tipo:</strong> {getTypeLabel(template.type)}</p>
                      <p><strong>Campos:</strong> {template.fields.length}</p>
                      <p><strong>Creado:</strong> {template.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateBuilder;
