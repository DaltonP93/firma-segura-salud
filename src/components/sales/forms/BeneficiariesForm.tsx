import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Users } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

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

interface BeneficiariesFormProps {
  beneficiaries: Beneficiary[];
  onBeneficiariesChange: (beneficiaries: Beneficiary[]) => void;
}

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
    price: undefined,
    is_primary: false,
    weight: undefined,
    height: undefined
  });

  const addBeneficiary = () => {
    if (!newBeneficiary.description || !newBeneficiary.relationship) {
      return;
    }

    const beneficiary: Beneficiary = {
      ...newBeneficiary,
      id: Date.now().toString() // Temporary ID
    };

    onBeneficiariesChange([...beneficiaries, beneficiary]);
    
    // Reset form
    setNewBeneficiary({
      description: '',
      relationship: '',
      dni: '',
      birth_date: '',
      phone: '',
      email: '',
      price: undefined,
      is_primary: false,
      weight: undefined,
      height: undefined
    });
  };

  const removeBeneficiary = (id: string) => {
    onBeneficiariesChange(beneficiaries.filter(b => b.id !== id));
  };

  const updateBeneficiary = (id: string, updatedBeneficiary: Beneficiary) => {
    onBeneficiariesChange(
      beneficiaries.map(b => b.id === id ? { ...updatedBeneficiary, id } : b)
    );
  };

  const relationshipOptions = [
    { value: 'spouse', label: 'Cónyuge' },
    { value: 'child', label: 'Hijo/a' },
    { value: 'parent', label: 'Padre/Madre' },
    { value: 'sibling', label: 'Hermano/a' },
    { value: 'other', label: 'Otro' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Beneficiarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Beneficiaries */}
        {beneficiaries.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Beneficiarios Registrados</h4>
            {beneficiaries.map((beneficiary) => (
              <Card key={beneficiary.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h5 className="font-medium">{beneficiary.description}</h5>
                      <p className="text-sm text-gray-600">{beneficiary.relationship}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBeneficiary(beneficiary.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {beneficiary.dni && (
                      <div>
                        <span className="font-medium">DNI:</span> {beneficiary.dni}
                      </div>
                    )}
                    {beneficiary.birth_date && (
                      <div>
                        <span className="font-medium">Fecha de Nacimiento:</span> {beneficiary.birth_date}
                      </div>
                    )}
                    {beneficiary.phone && (
                      <div>
                        <span className="font-medium">Teléfono:</span> {beneficiary.phone}
                      </div>
                    )}
                    {beneficiary.email && (
                      <div>
                        <span className="font-medium">Email:</span> {beneficiary.email}
                      </div>
                    )}
                    {beneficiary.price && (
                      <div>
                        <span className="font-medium">Precio:</span> ${beneficiary.price}
                      </div>
                    )}
                    {beneficiary.is_primary && (
                      <div>
                        <span className="font-medium text-green-600">Beneficiario Principal</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Separator />

        {/* Add New Beneficiary Form */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Agregar Beneficiario</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beneficiary-name">Nombre Completo *</Label>
              <Input
                id="beneficiary-name"
                placeholder="Nombre del beneficiario"
                value={newBeneficiary.description}
                onChange={(e) => setNewBeneficiary(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary-relationship">Relación *</Label>
              <Select
                value={newBeneficiary.relationship}
                onValueChange={(value) => setNewBeneficiary(prev => ({ ...prev, relationship: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar relación" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary-dni">DNI/Cédula</Label>
              <Input
                id="beneficiary-dni"
                placeholder="Número de identificación"
                value={newBeneficiary.dni}
                onChange={(e) => setNewBeneficiary(prev => ({ ...prev, dni: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary-birth-date">Fecha de Nacimiento</Label>
              <Input
                id="beneficiary-birth-date"
                type="date"
                value={newBeneficiary.birth_date}
                onChange={(e) => setNewBeneficiary(prev => ({ ...prev, birth_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary-phone">Teléfono</Label>
              <Input
                id="beneficiary-phone"
                placeholder="Número de teléfono"
                value={newBeneficiary.phone}
                onChange={(e) => setNewBeneficiary(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary-email">Email</Label>
              <Input
                id="beneficiary-email"
                type="email"
                placeholder="Correo electrónico"
                value={newBeneficiary.email}
                onChange={(e) => setNewBeneficiary(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary-price">Precio/Monto</Label>
              <Input
                id="beneficiary-price"
                type="number"
                placeholder="0.00"
                value={newBeneficiary.price || ''}
                onChange={(e) => setNewBeneficiary(prev => ({ ...prev, price: parseFloat(e.target.value) || undefined }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="beneficiary-primary"
                  checked={newBeneficiary.is_primary || false}
                  onCheckedChange={(checked) => setNewBeneficiary(prev => ({ ...prev, is_primary: checked as boolean }))}
                />
                <Label htmlFor="beneficiary-primary">Beneficiario Principal</Label>
              </div>
            </div>
          </div>

          <Button 
            onClick={addBeneficiary}
            disabled={!newBeneficiary.description || !newBeneficiary.relationship}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Beneficiario
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeneficiariesForm;
