import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Users, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BeneficiariesForm from './BeneficiariesForm';

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
  status?: 'draft' | 'pending_health_declaration' | 'pending_signature' | 'completed' | 'rejected';
  notes?: string;
  client_occupation?: string;
  client_income?: number;
  client_marital_status?: string;
  medical_exams_required?: boolean;
  agent_notes?: string;
  priority_level?: string;
  source?: string;
}

export interface Beneficiary {
  id?: string;
  description: string;
  relationship: string;
  dni?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  price?: number;
  is_primary: boolean;
  weight?: number;
  height?: number;
}

interface SalesRequestFormProps {
  onSubmit: (data: SalesRequest, beneficiaries: Beneficiary[]) => Promise<void>;
  onCancel?: () => void;
  initialData?: SalesRequest;
  isEditing?: boolean;
}

const policyTypes = [
  'Seguro de Vida Individual',
  'Seguro de Vida Familiar', 
  'Seguro de Accidentes Personales',
  'Seguro de Salud',
  'Seguro de Incapacidad',
  'Seguro Temporal',
  'Seguro Permanente'
];

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const SalesRequestForm: React.FC<SalesRequestFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [clientAge, setClientAge] = useState<number | null>(null);
  const [insurancePlans, setInsurancePlans] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<SalesRequest>({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_dni: '',
    client_birth_date: '',
    client_address: '',
    policy_type: '',
    insurance_plan_id: '',
    notes: '',
    client_occupation: '',
    client_income: 0,
    client_marital_status: '',
    medical_exams_required: false,
    agent_notes: '',
    priority_level: 'normal',
    source: 'direct',
    ...initialData
  });

  useEffect(() => {
    if (formData.client_birth_date) {
      const age = calculateAge(formData.client_birth_date);
      setClientAge(age);
    } else {
      setClientAge(null);
    }
  }, [formData.client_birth_date]);

  useEffect(() => {
    fetchInsurancePlans();
  }, []);

  const fetchInsurancePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_plans')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching insurance plans:', error);
        return;
      }

      setInsurancePlans(data || []);
    } catch (error) {
      console.error('Error fetching insurance plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.client_name || !formData.client_email || !formData.policy_type) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios (Nombre, Email, Tipo de Póliza)",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.client_email)) {
      toast({
        title: "Error",
        description: "Por favor ingrese un email válido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, beneficiaries);
    } catch (error) {
      console.error('Error submitting sales request:', error);
      toast({
        title: "Error",
        description: "Error al procesar la solicitud. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SalesRequest, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {isEditing ? 'Editar Solicitud de Venta' : 'Nueva Solicitud de Venta'}
          </CardTitle>
          <CardDescription>
            Complete la información del cliente y los detalles de la póliza
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Personal del Cliente */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4" />
                <h3 className="text-lg font-semibold">Información Personal</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Nombre Completo *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    placeholder="Nombre completo del cliente"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client_dni">DNI/Cédula *</Label>
                  <Input
                    id="client_dni"
                    value={formData.client_dni || ''}
                    onChange={(e) => handleInputChange('client_dni', e.target.value)}
                    placeholder="Número de documento"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_birth_date">
                    Fecha de Nacimiento *
                    {clientAge !== null && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({clientAge} años)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="client_birth_date"
                    type="date"
                    value={formData.client_birth_date || ''}
                    onChange={(e) => handleInputChange('client_birth_date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_phone">Teléfono *</Label>
                  <Input
                    id="client_phone"
                    value={formData.client_phone || ''}
                    onChange={(e) => handleInputChange('client_phone', e.target.value)}
                    placeholder="Número de teléfono"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="client_email">Email *</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => handleInputChange('client_email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="client_address">Dirección Completa *</Label>
                  <Textarea
                    id="client_address"
                    value={formData.client_address || ''}
                    onChange={(e) => handleInputChange('client_address', e.target.value)}
                    placeholder="Dirección completa del cliente"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_occupation">Ocupación *</Label>
                  <Input
                    id="client_occupation"
                    value={formData.client_occupation || ''}
                    onChange={(e) => handleInputChange('client_occupation', e.target.value)}
                    placeholder="Ocupación del cliente"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_income">Ingresos Mensuales</Label>
                  <Input
                    id="client_income"
                    type="number"
                    value={formData.client_income || ''}
                    onChange={(e) => handleInputChange('client_income', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_marital_status">Estado Civil</Label>
                  <Select
                    value={formData.client_marital_status || ''}
                    onValueChange={(value) => handleInputChange('client_marital_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione estado civil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soltero">Soltero(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viudo">Viudo(a)</SelectItem>
                      <SelectItem value="union_libre">Unión Libre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

            {/* Información del Plan */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4" />
                <h3 className="text-lg font-semibold">Información del Plan</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy_type">Tipo de Póliza *</Label>
                  <Select
                    value={formData.policy_type}
                    onValueChange={(value) => handleInputChange('policy_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo de póliza" />
                    </SelectTrigger>
                    <SelectContent>
                      {policyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_plan_id">Plan de Seguro</Label>
                  <Select
                    value={formData.insurance_plan_id || ''}
                    onValueChange={(value) => handleInputChange('insurance_plan_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {insurancePlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observaciones</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observaciones adicionales sobre la solicitud"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_notes">Notas del Agente</Label>
                <Textarea
                  id="agent_notes"
                  value={formData.agent_notes || ''}
                  onChange={(e) => handleInputChange('agent_notes', e.target.value)}
                  placeholder="Notas internas del agente"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="medical_exams_required"
                    checked={formData.medical_exams_required || false}
                    onChange={(e) => handleInputChange('medical_exams_required', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="medical_exams_required">Exámenes Médicos Requeridos</Label>
                </div>
              </div>
            </div>

            {/* Beneficiarios (Opcional) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4" />
                <h3 className="text-lg font-semibold">Beneficiarios (Opcional)</h3>
              </div>
              
              <BeneficiariesForm
                beneficiaries={beneficiaries}
                onBeneficiariesChange={setBeneficiaries}
              />
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Procesando...' : (isEditing ? 'Actualizar Solicitud' : 'Crear Solicitud')}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesRequestForm;