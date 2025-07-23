import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ClientDataForm from './forms/ClientDataForm';
import BeneficiariesForm from './forms/BeneficiariesForm';

export interface SalesRequest {
  id?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_dni?: string;
  client_birth_date?: string;
  client_address?: string;
  policy_type: string;
  insurance_plan_id?: string;
  template_id?: string; // Added template association
  client_occupation?: string;
  client_income?: number | null;
  client_marital_status?: string;
  medical_exams_required?: boolean;
  agent_notes?: string;
  priority_level?: string;
  source?: string;
  notes?: string;
  status: 'draft' | 'pending_health_declaration' | 'pending_signature' | 'completed' | 'rejected' | 'cancelled';
  coverage_amount?: number;
  monthly_premium?: number;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
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
  onSubmit: (requestData: SalesRequest, beneficiaries: Beneficiary[]) => Promise<void>;
  onCancel: () => void;
  initialData?: SalesRequest;
  isEditing?: boolean;
}

const SalesRequestForm = ({ onSubmit, onCancel, initialData, isEditing = false }: SalesRequestFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [insurancePlans, setInsurancePlans] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const [formData, setFormData] = useState<SalesRequest>({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_dni: '',
    client_birth_date: '',
    client_address: '',
    policy_type: '',
    insurance_plan_id: '',
    template_id: '',
    client_occupation: '',
    client_income: null,
    client_marital_status: '',
    medical_exams_required: false,
    agent_notes: '',
    priority_level: 'normal',
    source: 'direct',
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchInsurancePlans();
    fetchTemplates();
    if (initialData) {
      setFormData(initialData);
      // Also load beneficiaries if editing
      fetchBeneficiaries(initialData.id);
    }
  }, [initialData]);

  const fetchInsurancePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_plans')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setInsurancePlans(data || []);
    } catch (error) {
      console.error('Error fetching insurance plans:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchBeneficiaries = async (salesRequestId: string) => {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('sales_request_id', salesRequestId);

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.client_name || !formData.client_email || !formData.policy_type) {
        toast({
          title: "Error",
          description: "Por favor, complete todos los campos obligatorios.",
          variant: "destructive",
        });
        return;
      }

      await onSubmit(formData, beneficiaries);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Error al guardar la solicitud. Inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBeneficiary = (newBeneficiary: Beneficiary) => {
    setBeneficiaries([...beneficiaries, newBeneficiary]);
  };

  const removeBeneficiary = (id: string) => {
    setBeneficiaries(beneficiaries.filter((b) => b.id !== id));
  };

  const updateBeneficiary = (id: string, updatedBeneficiary: Beneficiary) => {
    setBeneficiaries(
      beneficiaries.map((b) => (b.id === id ? updatedBeneficiary : b))
    );
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">
          {isEditing ? 'Editar Solicitud de Venta' : 'Nueva Solicitud de Venta'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Data Form */}
          <ClientDataForm 
            formData={formData}
            setFormData={setFormData}
            insurancePlans={insurancePlans}
          />

          {/* Template Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Plantilla de Documento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template_id">Plantilla de Contrato</Label>
                <Select 
                  value={formData.template_id || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plantilla..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin plantilla</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Beneficiaries Form */}
          <BeneficiariesForm 
            beneficiaries={beneficiaries}
            addBeneficiary={addBeneficiary}
            removeBeneficiary={removeBeneficiary}
            updateBeneficiary={updateBeneficiary}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales sobre la solicitud..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Solicitud' : 'Crear Solicitud')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SalesRequestForm;
