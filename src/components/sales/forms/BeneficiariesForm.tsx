
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from 'lucide-react';
import type { Beneficiary } from '../SalesRequestForm';

interface BeneficiariesFormProps {
  beneficiaries: Beneficiary[];
  onBeneficiariesChange: (beneficiaries: Beneficiary[]) => void;
}

const BeneficiariesForm = ({ beneficiaries, onBeneficiariesChange }: BeneficiariesFormProps) => {
  const addBeneficiary = () => {
    const newBeneficiary: Beneficiary = {
      description: '',
      relationship: '',
      dni: '',
      birth_date: '',
      phone: '',
      email: '',
      price: 0,
      is_primary: false,
      weight: 0,
      height: 0
    };
    onBeneficiariesChange([...beneficiaries, newBeneficiary]);
  };

  const removeBeneficiary = (index: number) => {
    const updated = beneficiaries.filter((_, i) => i !== index);
    onBeneficiariesChange(updated);
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: any) => {
    const updated = beneficiaries.map((beneficiary, i) => 
      i === index ? { ...beneficiary, [field]: value } : beneficiary
    );
    onBeneficiariesChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Beneficiarios</CardTitle>
          <Button type="button" onClick={addBeneficiary} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Beneficiario
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {beneficiaries.map((beneficiary, index) => (
          <Card key={index} className="border-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Beneficiario {index + 1}</h4>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeBeneficiary(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`beneficiary-${index}-description`}>Nombre Completo *</Label>
                <Input
                  id={`beneficiary-${index}-description`}
                  value={beneficiary.description}
                  onChange={(e) => updateBeneficiary(index, 'description', e.target.value)}
                  placeholder="Nombre completo del beneficiario"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`beneficiary-${index}-relationship`}>Relación *</Label>
                <Select
                  value={beneficiary.relationship}
                  onValueChange={(value) => updateBeneficiary(index, 'relationship', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar relación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Cónyuge</SelectItem>
                    <SelectItem value="child">Hijo/a</SelectItem>
                    <SelectItem value="parent">Padre/Madre</SelectItem>
                    <SelectItem value="sibling">Hermano/a</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={`beneficiary-${index}-dni`}>DNI</Label>
                <Input
                  id={`beneficiary-${index}-dni`}
                  value={beneficiary.dni}
                  onChange={(e) => updateBeneficiary(index, 'dni', e.target.value)}
                  placeholder="Número de DNI"
                />
              </div>

              <div>
                <Label htmlFor={`beneficiary-${index}-birth_date`}>Fecha de Nacimiento</Label>
                <Input
                  id={`beneficiary-${index}-birth_date`}
                  type="date"
                  value={beneficiary.birth_date}
                  onChange={(e) => updateBeneficiary(index, 'birth_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor={`beneficiary-${index}-phone`}>Teléfono</Label>
                <Input
                  id={`beneficiary-${index}-phone`}
                  value={beneficiary.phone}
                  onChange={(e) => updateBeneficiary(index, 'phone', e.target.value)}
                  placeholder="Número de teléfono"
                />
              </div>

              <div>
                <Label htmlFor={`beneficiary-${index}-email`}>Email</Label>
                <Input
                  id={`beneficiary-${index}-email`}
                  type="email"
                  value={beneficiary.email}
                  onChange={(e) => updateBeneficiary(index, 'email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <Label htmlFor={`beneficiary-${index}-price`}>Monto de Cobertura</Label>
                <Input
                  id={`beneficiary-${index}-price`}
                  type="number"
                  value={beneficiary.price}
                  onChange={(e) => updateBeneficiary(index, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`beneficiary-${index}-primary`}
                  checked={beneficiary.is_primary}
                  onCheckedChange={(checked) => updateBeneficiary(index, 'is_primary', checked)}
                />
                <Label htmlFor={`beneficiary-${index}-primary`}>Beneficiario Principal</Label>
              </div>
            </CardContent>
          </Card>
        ))}

        {beneficiaries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay beneficiarios agregados. Haga clic en "Agregar Beneficiario" para comenzar.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BeneficiariesForm;
