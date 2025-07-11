
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Users } from 'lucide-react';
import type { Beneficiary } from './SalesRequestForm';

interface BeneficiariesFormProps {
  beneficiaries: Beneficiary[];
  onBeneficiariesChange: (beneficiaries: Beneficiary[]) => void;
}

const relationshipTypes = [
  'Cónyuge',
  'Hijo/a',
  'Padre',
  'Madre',
  'Hermano/a',
  'Abuelo/a',
  'Nieto/a',
  'Tío/a',
  'Sobrino/a',
  'Primo/a',
  'Otro'
];

const BeneficiariesForm: React.FC<BeneficiariesFormProps> = ({
  beneficiaries,
  onBeneficiariesChange
}) => {
  const [newBeneficiary, setNewBeneficiary] = useState<Beneficiary>({
    description: '',
    relationship: '',
    dni: '',
    birth_date: '',
    phone: '',
    email: '',
    percentage: 0,
    is_primary: false,
    weight: 0,
    height: 0
  });

  const [isAdding, setIsAdding] = useState(false);

  const addBeneficiary = () => {
    if (!newBeneficiary.description || !newBeneficiary.relationship || newBeneficiary.percentage <= 0) {
      return;
    }

    const totalCurrentPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalCurrentPercentage + newBeneficiary.percentage > 100) {
      return;
    }

    const beneficiary: Beneficiary = {
      ...newBeneficiary,
      id: `temp-${Date.now()}`,
      is_primary: beneficiaries.length === 0 && newBeneficiary.percentage === 100
    };

    onBeneficiariesChange([...beneficiaries, beneficiary]);
    
    setNewBeneficiary({
      description: '',
      relationship: '',
      dni: '',
      birth_date: '',
      phone: '',
      email: '',
      percentage: 0,
      is_primary: false,
      weight: 0,
      height: 0
    });
    setIsAdding(false);
  };

  const removeBeneficiary = (index: number) => {
    const updated = beneficiaries.filter((_, i) => i !== index);
    onBeneficiariesChange(updated);
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: string | number | boolean) => {
    const updated = beneficiaries.map((beneficiary, i) => 
      i === index ? { ...beneficiary, [field]: value } : beneficiary
    );
    onBeneficiariesChange(updated);
  };

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
  const remainingPercentage = 100 - totalPercentage;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Beneficiarios ({beneficiaries.length})
        </CardTitle>
        <CardDescription>
          Agregue los beneficiarios de la póliza. El porcentaje total debe sumar 100%.
          <div className="mt-2">
            <Badge variant={remainingPercentage === 0 ? "default" : "secondary"}>
              Porcentaje asignado: {totalPercentage}% de 100%
            </Badge>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de Beneficiarios Existentes */}
        {beneficiaries.map((beneficiary, index) => (
          <div key={beneficiary.id || index} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm font-medium">Descripción</Label>
                  <Input
                    value={beneficiary.description}
                    onChange={(e) => updateBeneficiary(index, 'description', e.target.value)}
                    placeholder="Descripción del beneficiario"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Parentesco</Label>
                  <Select
                    value={beneficiary.relationship}
                    onValueChange={(value) => updateBeneficiary(index, 'relationship', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Porcentaje (%)</Label>
                  <Input
                    type="number"
                    value={beneficiary.percentage}
                    onChange={(e) => updateBeneficiary(index, 'percentage', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeBeneficiary(index)}
                className="ml-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-sm font-medium">DNI</Label>
                <Input
                  value={beneficiary.dni || ''}
                  onChange={(e) => updateBeneficiary(index, 'dni', e.target.value)}
                  placeholder="Documento de identidad"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  value={beneficiary.birth_date || ''}
                  onChange={(e) => updateBeneficiary(index, 'birth_date', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Teléfono</Label>
                <Input
                  value={beneficiary.phone || ''}
                  onChange={(e) => updateBeneficiary(index, 'phone', e.target.value)}
                  placeholder="Número de teléfono"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Peso (kg)</Label>
                <Input
                  type="number"
                  value={beneficiary.weight || ''}
                  onChange={(e) => updateBeneficiary(index, 'weight', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Altura (cm)</Label>
                <Input
                  type="number"
                  value={beneficiary.height || ''}
                  onChange={(e) => updateBeneficiary(index, 'height', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Formulario para Agregar Nuevo Beneficiario */}
        {isAdding && (
          <div className="border-2 border-dashed border-primary rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-sm font-medium">Descripción *</Label>
                <Input
                  value={newBeneficiary.description}
                  onChange={(e) => setNewBeneficiary({...newBeneficiary, description: e.target.value})}
                  placeholder="Descripción del beneficiario"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Parentesco *</Label>
                <Select
                  value={newBeneficiary.relationship}
                  onValueChange={(value) => setNewBeneficiary({...newBeneficiary, relationship: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Porcentaje * (Disponible: {remainingPercentage}%)
                </Label>
                <Input
                  type="number"
                  value={newBeneficiary.percentage}
                  onChange={(e) => setNewBeneficiary({...newBeneficiary, percentage: parseFloat(e.target.value) || 0})}
                  min="0"
                  max={remainingPercentage}
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-sm font-medium">DNI</Label>
                <Input
                  value={newBeneficiary.dni || ''}
                  onChange={(e) => setNewBeneficiary({...newBeneficiary, dni: e.target.value})}
                  placeholder="Documento de identidad"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  value={newBeneficiary.birth_date || ''}
                  onChange={(e) => setNewBeneficiary({...newBeneficiary, birth_date: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Teléfono</Label>
                <Input
                  value={newBeneficiary.phone || ''}
                  onChange={(e) => setNewBeneficiary({...newBeneficiary, phone: e.target.value})}
                  placeholder="Número de teléfono"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Peso (kg)</Label>
                <Input
                  type="number"
                  value={newBeneficiary.weight || ''}
                  onChange={(e) => setNewBeneficiary({...newBeneficiary, weight: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Altura (cm)</Label>
                <Input
                  type="number"
                  value={newBeneficiary.height || ''}
                  onChange={(e) => setNewBeneficiary({...newBeneficiary, height: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={addBeneficiary} size="sm">
                Agregar Beneficiario
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAdding(false)}
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Botón para Agregar Beneficiario */}
        {!isAdding && remainingPercentage > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="w-full"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Agregar Beneficiario
          </Button>
        )}

        {remainingPercentage === 0 && beneficiaries.length > 0 && (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Beneficiarios completos (100% asignado)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BeneficiariesForm;
