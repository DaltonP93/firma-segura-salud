
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CalendarIcon, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  coverage_amount?: number;
  monthly_premium?: number;
  status?: 'draft' | 'pending_health_declaration' | 'pending_signature' | 'completed' | 'rejected';
  notes?: string;
}

export interface Beneficiary {
  id?: string;
  name: string;
  relationship: string;
  dni?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  percentage: number;
  is_primary: boolean;
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

const SalesRequestForm: React.FC<SalesRequestFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [formData, setFormData] = useState<SalesRequest>({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_dni: '',
    client_birth_date: '',
    client_address: '',
    policy_type: '',
    coverage_amount: 0,
    monthly_premium: 0,
    notes: '',
    ...initialData
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.client_email || !formData.policy_type) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (beneficiaries.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un beneficiario",
        variant: "destructive",
      });
      return;
    }

    const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage !== 100) {
      toast({
        title: "Error",
        description: `El porcentaje total de beneficiarios debe ser 100% (actual: ${totalPercentage}%)`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, beneficiaries);
      toast({
        title: "Éxito",
        description: isEditing ? "Solicitud actualizada correctamente" : "Solicitud de venta creada correctamente",
      });
    } catch (error) {
      console.error('Error submitting sales request:', error);
      toast({
        title: "Error",
        description: "Error al procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SalesRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Cliente */}
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
                <Label htmlFor="client_dni">DNI/Cédula</Label>
                <Input
                  id="client_dni"
                  value={formData.client_dni || ''}
                  onChange={(e) => handleInputChange('client_dni', e.target.value)}
                  placeholder="Documento de identidad"
                />
              </div>

              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="client_phone">Teléfono</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone || ''}
                  onChange={(e) => handleInputChange('client_phone', e.target.value)}
                  placeholder="Número de teléfono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_birth_date">Fecha de Nacimiento</Label>
                <Input
                  id="client_birth_date"
                  type="date"
                  value={formData.client_birth_date || ''}
                  onChange={(e) => handleInputChange('client_birth_date', e.target.value)}
                />
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_address">Dirección</Label>
              <Textarea
                id="client_address"
                value={formData.client_address || ''}
                onChange={(e) => handleInputChange('client_address', e.target.value)}
                placeholder="Dirección completa del cliente"
                rows={2}
              />
            </div>

            {/* Información de la Póliza */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coverage_amount">Monto de Cobertura</Label>
                <Input
                  id="coverage_amount"
                  type="number"
                  value={formData.coverage_amount || ''}
                  onChange={(e) => handleInputChange('coverage_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_premium">Prima Mensual</Label>
                <Input
                  id="monthly_premium"
                  type="number"
                  value={formData.monthly_premium || ''}
                  onChange={(e) => handleInputChange('monthly_premium', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
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

            {/* Beneficiarios */}
            <BeneficiariesForm
              beneficiaries={beneficiaries}
              onBeneficiariesChange={setBeneficiaries}
            />

            {/* Botones de Acción */}
            <div className="flex gap-4 pt-4">
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
