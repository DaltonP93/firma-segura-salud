
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
  addBeneficiary: (beneficiary: Beneficiary) => void;
  removeBeneficiary: (id: string) => void;
  updateBeneficiary: (id: string, beneficiary: Beneficiary) => void;
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
  addBeneficiary,
  removeBeneficiary,
  updateBeneficiary
}) => {
  const [newBeneficiary, setNewBeneficiary] = useState<Beneficiary>({
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
  });

  const [isAdding, setIsAdding] = useState(false);

  const handleAddBeneficiary = () => {
    if (!newBeneficiary.description || !newBeneficiary.relationship) {
      return;
    }

    const beneficiary: Beneficiary = {
      ...newBeneficiary,
      id: `temp-${Date.now()}`,
      is_primary: beneficiaries.length === 0
    };

    addBeneficiary(beneficiary);
    
    setNewBeneficiary({
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
    });
    setIsAdding(false);
  };

  const handleRemoveBeneficiary = (id: string) => {
    removeBeneficiary(id);
  };

  const handleUpdateBeneficiary = (index: number, field: keyof Beneficiary, value: string | number | boolean) => {
    const beneficiary = beneficiaries[index];
    if (beneficiary?.id) {
      const updated = { ...beneficiary, [field]: value };
      updateBeneficiary(beneficiary.id, updated);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Beneficiarios ({beneficiaries.length})
        </CardTitle>
        <CardDescription>
          Agregue los beneficiarios de la póliza (opcional).
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
                    onChange={(e) => handleUpdateBeneficiary(index, 'description', e.target.value)}
                    placeholder="Descripción del beneficiario"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Parentesco</Label>
                  <Select
                    value={beneficiary.relationship}
                    onValueChange={(value) => handleUpdateBeneficiary(index, 'relationship', value)}
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
                  <Label className="text-sm font-medium">Precio</Label>
                  <Input
                    type="number"
                    value={beneficiary.price || ''}
                    onChange={(e) => handleUpdateBeneficiary(index, 'price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
              {beneficiary.id && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveBeneficiary(beneficiary.id!)}
                  className="ml-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-sm font-medium">DNI</Label>
                <Input
                  value={beneficiary.dni || ''}
                  onChange={(e) => handleUpdateBeneficiary(index, 'dni', e.target.value)}
                  placeholder="Documento de identidad"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  value={beneficiary.birth_date || ''}
                  onChange={(e) => handleUpdateBeneficiary(index, 'birth_date', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Teléfono</Label>
                <Input
                  value={beneficiary.phone || ''}
                  onChange={(e) => handleUpdateBeneficiary(index, 'phone', e.target.value)}
                  placeholder="Número de teléfono"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Peso (kg)</Label>
                <Input
                  type="number"
                  value={beneficiary.weight || ''}
                  onChange={(e) => handleUpdateBeneficiary(index, 'weight', parseFloat(e.target.value) || 0)}
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
                  onChange={(e) => handleUpdateBeneficiary(index, 'height', parseFloat(e.target.value) || 0)}
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
                <Label className="text-sm font-medium">Precio</Label>
                <Input
                  type="number"
                  value={newBeneficiary.price || ''}
                  onChange={(e) => setNewBeneficiary({...newBeneficiary, price: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
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
              <Button type="button" onClick={handleAddBeneficiary} size="sm">
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
        {!isAdding && (
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
      </CardContent>
    </Card>
  );
};

export default BeneficiariesForm;
