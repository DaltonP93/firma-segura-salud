
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { SalesRequest } from '../SalesRequestForm';

interface ClientDataFormProps {
  formData: SalesRequest;
  setFormData: (data: SalesRequest | ((prev: SalesRequest) => SalesRequest)) => void;
  insurancePlans: any[];
}

const ClientDataForm: React.FC<ClientDataFormProps> = ({
  formData,
  setFormData,
  insurancePlans
}) => {
  const handleInputChange = (field: keyof SalesRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Información del Cliente</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_name">Nombre del Cliente *</Label>
          <Input
            id="client_name"
            value={formData.client_name}
            onChange={(e) => handleInputChange('client_name', e.target.value)}
            placeholder="Nombre completo del cliente"
            required
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
          <Label htmlFor="client_dni">DNI/Cédula</Label>
          <Input
            id="client_dni"
            value={formData.client_dni || ''}
            onChange={(e) => handleInputChange('client_dni', e.target.value)}
            placeholder="Documento de identidad"
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
          <Label htmlFor="client_address">Dirección</Label>
          <Input
            id="client_address"
            value={formData.client_address || ''}
            onChange={(e) => handleInputChange('client_address', e.target.value)}
            placeholder="Dirección completa"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="client_occupation">Ocupación</Label>
          <Input
            id="client_occupation"
            value={formData.client_occupation || ''}
            onChange={(e) => handleInputChange('client_occupation', e.target.value)}
            placeholder="Ocupación del cliente"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="client_income">Ingresos Mensuales</Label>
          <Input
            id="client_income"
            type="number"
            value={formData.client_income || ''}
            onChange={(e) => handleInputChange('client_income', parseFloat(e.target.value) || null)}
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
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Soltero/a</SelectItem>
              <SelectItem value="married">Casado/a</SelectItem>
              <SelectItem value="divorced">Divorciado/a</SelectItem>
              <SelectItem value="widowed">Viudo/a</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800">Información de la Póliza</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="policy_type">Tipo de Póliza *</Label>
          <Select 
            value={formData.policy_type} 
            onValueChange={(value) => handleInputChange('policy_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vida">Vida</SelectItem>
              <SelectItem value="salud">Salud</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="hogar">Hogar</SelectItem>
              <SelectItem value="empresarial">Empresarial</SelectItem>
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
              <SelectValue placeholder="Seleccionar plan..." />
            </SelectTrigger>
            <SelectContent>
              {insurancePlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.monthly_premium}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="coverage_amount">Monto de Cobertura</Label>
          <Input
            id="coverage_amount"
            type="number"
            value={formData.coverage_amount || ''}
            onChange={(e) => handleInputChange('coverage_amount', parseFloat(e.target.value) || undefined)}
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
            onChange={(e) => handleInputChange('monthly_premium', parseFloat(e.target.value) || undefined)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority_level">Nivel de Prioridad</Label>
          <Select 
            value={formData.priority_level || 'normal'} 
            onValueChange={(value) => handleInputChange('priority_level', value)}
          >
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
        
        <div className="space-y-2">
          <Label htmlFor="source">Fuente</Label>
          <Select 
            value={formData.source || 'direct'} 
            onValueChange={(value) => handleInputChange('source', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Directo</SelectItem>
              <SelectItem value="referral">Referido</SelectItem>
              <SelectItem value="online">En línea</SelectItem>
              <SelectItem value="phone">Teléfono</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="medical_exams_required"
            checked={formData.medical_exams_required || false}
            onCheckedChange={(checked) => handleInputChange('medical_exams_required', checked)}
          />
          <Label htmlFor="medical_exams_required">
            Se requieren exámenes médicos
          </Label>
        </div>
      </div>
    </div>
  );
};

export default ClientDataForm;
