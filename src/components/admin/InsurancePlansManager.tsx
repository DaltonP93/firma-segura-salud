import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface InsurancePlan {
  id: string;
  name: string;
  description?: string;
  policy_type: string;
  min_coverage_amount: number;
  max_coverage_amount?: number;
  min_premium: number;
  max_premium?: number;
  age_restrictions: any;
  coverage_details: any;
  requirements: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

const InsurancePlansManager: React.FC = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InsurancePlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    policy_type: '',
    min_coverage_amount: 0,
    max_coverage_amount: 0,
    min_premium: 0,
    max_premium: 0,
    min_age: 18,
    max_age: 70,
    coverage_details: '',
    requirements: '',
    is_active: true
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading insurance plans:', error);
      toast({
        title: "Error",
        description: "Error al cargar los planes de seguro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      policy_type: '',
      min_coverage_amount: 0,
      max_coverage_amount: 0,
      min_premium: 0,
      max_premium: 0,
      min_age: 18,
      max_age: 70,
      coverage_details: '',
      requirements: '',
      is_active: true
    });
    setEditingPlan(null);
  };

  const openEditDialog = (plan: InsurancePlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      policy_type: plan.policy_type,
      min_coverage_amount: plan.min_coverage_amount,
      max_coverage_amount: plan.max_coverage_amount || 0,
      min_premium: plan.min_premium,
      max_premium: plan.max_premium || 0,
      min_age: (plan.age_restrictions as any)?.min_age || 18,
      max_age: (plan.age_restrictions as any)?.max_age || 70,
      coverage_details: JSON.stringify(plan.coverage_details, null, 2),
      requirements: Array.isArray(plan.requirements) ? plan.requirements.join('\n') : '',
      is_active: plan.is_active
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.policy_type) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const planData = {
        name: formData.name,
        description: formData.description || null,
        policy_type: formData.policy_type,
        min_coverage_amount: formData.min_coverage_amount,
        max_coverage_amount: formData.max_coverage_amount || null,
        min_premium: formData.min_premium,
        max_premium: formData.max_premium || null,
        age_restrictions: {
          min_age: formData.min_age,
          max_age: formData.max_age
        },
        coverage_details: formData.coverage_details ? JSON.parse(formData.coverage_details) : {},
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        is_active: formData.is_active
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('insurance_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Plan de seguro actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from('insurance_plans')
          .insert(planData);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Plan de seguro creado correctamente",
        });
      }

      setDialogOpen(false);
      resetForm();
      loadPlans();
    } catch (error) {
      console.error('Error saving insurance plan:', error);
      toast({
        title: "Error",
        description: "Error al guardar el plan de seguro",
        variant: "destructive",
      });
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este plan de seguro?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('insurance_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Plan de seguro eliminado correctamente",
      });
      
      loadPlans();
    } catch (error) {
      console.error('Error deleting insurance plan:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el plan de seguro",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Planes de Seguro</h2>
          <p className="text-muted-foreground">Gestione los planes de seguro disponibles</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Plan
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plan de Seguro' : 'Nuevo Plan de Seguro'}
              </DialogTitle>
              <DialogDescription>
                Complete la información del plan de seguro
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Plan *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nombre del plan"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy_type">Tipo de Póliza *</Label>
                  <Select
                    value={formData.policy_type}
                    onValueChange={(value) => setFormData({...formData, policy_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
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
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del plan"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_coverage">Cobertura Mínima</Label>
                  <Input
                    id="min_coverage"
                    type="number"
                    value={formData.min_coverage_amount}
                    onChange={(e) => setFormData({...formData, min_coverage_amount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_coverage">Cobertura Máxima</Label>
                  <Input
                    id="max_coverage"
                    type="number"
                    value={formData.max_coverage_amount}
                    onChange={(e) => setFormData({...formData, max_coverage_amount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_premium">Prima Mínima</Label>
                  <Input
                    id="min_premium"
                    type="number"
                    value={formData.min_premium}
                    onChange={(e) => setFormData({...formData, min_premium: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_premium">Prima Máxima</Label>
                  <Input
                    id="max_premium"
                    type="number"
                    value={formData.max_premium}
                    onChange={(e) => setFormData({...formData, max_premium: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_age">Edad Mínima</Label>
                  <Input
                    id="min_age"
                    type="number"
                    value={formData.min_age}
                    onChange={(e) => setFormData({...formData, min_age: parseInt(e.target.value) || 18})}
                    placeholder="18"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_age">Edad Máxima</Label>
                  <Input
                    id="max_age"
                    type="number"
                    value={formData.max_age}
                    onChange={(e) => setFormData({...formData, max_age: parseInt(e.target.value) || 70})}
                    placeholder="70"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage_details">Detalles de Cobertura (JSON)</Label>
                <Textarea
                  id="coverage_details"
                  value={formData.coverage_details}
                  onChange={(e) => setFormData({...formData, coverage_details: e.target.value})}
                  placeholder='{"muerte_accidental": true, "incapacidad": false}'
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos (uno por línea)</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  placeholder="Examen médico&#10;Edad entre 18-65 años&#10;No fumador"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Plan Activo</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  {editingPlan ? 'Actualizar Plan' : 'Crear Plan'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {plan.policy_type}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {plan.description && (
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cobertura:</span>
                  <span>
                    ${plan.min_coverage_amount.toLocaleString()}
                    {plan.max_coverage_amount && ` - $${plan.max_coverage_amount.toLocaleString()}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Prima:</span>
                  <span>
                    ${plan.min_premium.toLocaleString()}
                    {plan.max_premium && ` - $${plan.max_premium.toLocaleString()}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Edad:</span>
                  <span>{(plan.age_restrictions as any)?.min_age || 18} - {(plan.age_restrictions as any)?.max_age || 70} años</span>
                </div>
              </div>

              {Array.isArray(plan.requirements) && plan.requirements.length > 0 && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Requisitos:</span>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {plan.requirements.slice(0, 3).map((req, index) => (
                      <li key={index}>• {req}</li>
                    ))}
                    {plan.requirements.length > 3 && (
                      <li>• +{plan.requirements.length - 3} más...</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(plan)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deletePlan(plan.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No hay planes de seguro</h3>
          <p className="text-muted-foreground mb-4">Comience creando su primer plan de seguro</p>
          <Button onClick={() => {resetForm(); setDialogOpen(true)}}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Plan
          </Button>
        </div>
      )}
    </div>
  );
};

export default InsurancePlansManager;