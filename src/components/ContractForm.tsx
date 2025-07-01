
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Contract } from '@/pages/Index';

interface ContractFormProps {
  onSubmit: (contract: Omit<Contract, 'id' | 'status' | 'createdAt'>) => void;
}

const ContractForm = ({ onSubmit }: ContractFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientEmail || !formData.policyType) {
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
      });

      toast({
        title: "Contrato Creado",
        description: `El contrato para ${formData.clientName} ha sido creado exitosamente`,
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al crear el contrato",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Nuevo Contrato de Seguro Médico</CardTitle>
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
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información de la Póliza</h3>
              
              <div>
                <Label htmlFor="policyType">Tipo de Póliza *</Label>
                <Select value={formData.policyType} onValueChange={(value) => handleInputChange('policyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de póliza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="familiar">Familiar</SelectItem>
                    <SelectItem value="empresarial">Empresarial</SelectItem>
                    <SelectItem value="complementario">Complementario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="coverage">Cobertura</Label>
                <Select value={formData.coverage} onValueChange={(value) => handleInputChange('coverage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cobertura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basica">Básica</SelectItem>
                    <SelectItem value="intermedia">Intermedia</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="premium">Prima Mensual</Label>
                <Input
                  id="premium"
                  value={formData.premium}
                  onChange={(e) => handleInputChange('premium', e.target.value)}
                  placeholder="$150.000"
                />
              </div>

              <div>
                <Label htmlFor="deductible">Deducible</Label>
                <Input
                  id="deductible"
                  value={formData.deductible}
                  onChange={(e) => handleInputChange('deductible', e.target.value)}
                  placeholder="$500.000"
                />
              </div>

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
            <Label htmlFor="beneficiaries">Beneficiarios</Label>
            <Textarea
              id="beneficiaries"
              value={formData.beneficiaries}
              onChange={(e) => handleInputChange('beneficiaries', e.target.value)}
              placeholder="Lista de beneficiarios y porcentajes"
              rows={3}
            />
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
            {isLoading ? 'Creando Contrato...' : 'Crear Contrato'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContractForm;
