
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { templatesService } from '@/services/templatesService';
import { useToast } from '@/hooks/use-toast';
import BeneficiariesForm from './BeneficiariesForm';
import type { SalesRequestWithDetails } from './SalesRequestsList';
import type { Template } from '@/pages/Index';

export interface SalesRequest {
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_dni?: string;
  client_birth_date?: string;
  client_address?: string;
  client_occupation?: string;
  client_income?: number;
  client_marital_status?: string;
  policy_type: string;
  insurance_plan_id?: string;
  template_id?: string;
  coverage_amount?: number;
  monthly_premium?: number;
  medical_exams_required?: boolean;
  agent_notes?: string;
  priority_level?: string;
  source?: string;
  notes?: string;
  status: 'draft' | 'pending_health_declaration' | 'pending_signature' | 'completed' | 'rejected';
}

export interface Beneficiary {
  id?: string;
  sales_request_id?: string;
  description: string;
  relationship: string;
  dni?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  price?: number;
  is_primary?: boolean;
  weight?: number;
  height?: number;
}

interface SalesRequestFormProps {
  onSubmit: (request: SalesRequest, beneficiaries: Beneficiary[]) => void;
  onCancel: () => void;
  initialData?: SalesRequestWithDetails;
  isEditing?: boolean;
}

const SalesRequestForm: React.FC<SalesRequestFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Form state
  const [formData, setFormData] = useState<SalesRequest>({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_dni: '',
    client_birth_date: '',
    client_address: '',
    client_occupation: '',
    client_income: 0,
    client_marital_status: '',
    policy_type: '',
    insurance_plan_id: '',
    template_id: '',
    coverage_amount: 0,
    monthly_premium: 0,
    medical_exams_required: false,
    agent_notes: '',
    priority_level: 'normal',
    source: 'direct',
    notes: '',
    status: 'draft',
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  useEffect(() => {
    fetchTemplates();
    
    if (initialData) {
      setFormData({
        client_name: initialData.client_name,
        client_email: initialData.client_email,
        client_phone: initialData.client_phone || '',
        client_dni: initialData.client_dni || '',
        client_birth_date: initialData.client_birth_date || '',
        client_address: initialData.client_address || '',
        client_occupation: (initialData as any).client_occupation || '',
        client_income: (initialData as any).client_income || 0,
        client_marital_status: (initialData as any).client_marital_status || '',
        policy_type: initialData.policy_type,
        insurance_plan_id: (initialData as any).insurance_plan_id || '',
        template_id: initialData.template_id || '',
        coverage_amount: initialData.coverage_amount || 0,
        monthly_premium: initialData.monthly_premium || 0,
        medical_exams_required: (initialData as any).medical_exams_required || false,
        agent_notes: (initialData as any).agent_notes || '',
        priority_level: (initialData as any).priority_level || 'normal',
        source: (initialData as any).source || 'direct',
        notes: initialData.notes || '',
        status: initialData.status === 'cancelled' ? 'rejected' : initialData.status,
      });
    }
  }, [initialData]);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const templatesData = await templatesService.fetchTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Error al cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleInputChange = (field: keyof SalesRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.client_email || !formData.policy_type) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData, beneficiaries);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name">Nombre Completo *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="client_email">Email *</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => handleInputChange('client_email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="client_phone">Teléfono</Label>
              <Input
                id="client_phone"
                value={formData.client_phone}
                onChange={(e) => handleInputChange('client_phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="client_dni">DNI/Cédula</Label>
              <Input
                id="client_dni"
                value={formData.client_dni}
                onChange={(e) => handleInputChange('client_dni', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="client_birth_date">Fecha de Nacimiento</Label>
              <Input
                id="client_birth_date"
                type="date"
                value={formData.client_birth_date}
                onChange={(e) => handleInputChange('client_birth_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="client_occupation">Ocupación</Label>
              <Input
                id="client_occupation"
                value={formData.client_occupation}
                onChange={(e) => handleInputChange('client_occupation', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="client_address">Dirección</Label>
            <Textarea
              id="client_address"
              value={formData.client_address}
              onChange={(e) => handleInputChange('client_address', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Policy Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Póliza</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="policy_type">Tipo de Póliza *</Label>
              <Select value={formData.policy_type} onValueChange={(value) => handleInputChange('policy_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de póliza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Seguro de Vida Individual">Seguro de Vida Individual</SelectItem>
                  <SelectItem value="Seguro de Vida Familiar">Seguro de Vida Familiar</SelectItem>
                  <SelectItem value="Seguro de Salud">Seguro de Salud</SelectItem>
                  <SelectItem value="Seguro de Accidentes">Seguro de Accidentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="template_id">Plantilla de Documento</Label>
              <Select 
                value={formData.template_id} 
                onValueChange={(value) => handleInputChange('template_id', value)}
                disabled={loadingTemplates}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="coverage_amount">Monto de Cobertura</Label>
              <Input
                id="coverage_amount"
                type="number"
                value={formData.coverage_amount}
                onChange={(e) => handleInputChange('coverage_amount', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="monthly_premium">Prima Mensual</Label>
              <Input
                id="monthly_premium"
                type="number"
                value={formData.monthly_premium}
                onChange={(e) => handleInputChange('monthly_premium', Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="medical_exams_required"
              checked={formData.medical_exams_required}
              onCheckedChange={(checked) => handleInputChange('medical_exams_required', checked)}
            />
            <Label htmlFor="medical_exams_required">Exámenes médicos requeridos</Label>
          </div>
        </CardContent>
      </Card>

      {/* Beneficiaries */}
      <BeneficiariesForm
        beneficiaries={beneficiaries}
        onBeneficiariesChange={setBeneficiaries}
      />

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority_level">Nivel de Prioridad</Label>
              <Select value={formData.priority_level} onValueChange={(value) => handleInputChange('priority_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="source">Fuente</Label>
              <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Directo</SelectItem>
                  <SelectItem value="referral">Referido</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="phone">Teléfono</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Notas adicionales sobre la solicitud..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Crear'} Solicitud
        </Button>
      </div>
    </form>
  );
};

export default SalesRequestForm;
