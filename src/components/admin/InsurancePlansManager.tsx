import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface InsurancePlan {
  id: string;
  name: string;
  description: string | null;
  coverage_amount: number | null;
  monthly_premium: number | null;
  annual_premium: number | null;
  coverage_details: any;
  benefits: any;
  requirements: any;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const InsurancePlansManager: React.FC = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InsurancePlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverage_amount: 0,
    monthly_premium: 0,
    annual_premium: 0,
    coverage_details: '',
    benefits: '',
    requirements: '',
    is_active: true,
    sort_order: 0
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
        .order('sort_order', { ascending: true });

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
      coverage_amount: 0,
      monthly_premium: 0,
      annual_premium: 0,
      coverage_details: '',
      benefits: '',
      requirements: '',
      is_active: true,
      sort_order: plans.length
    });
    setEditingPlan(null);
  };

  const openEditDialog = (plan: InsurancePlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      coverage_amount: plan.coverage_amount || 0,
      monthly_premium: plan.monthly_premium || 0,
      annual_premium: plan.annual_premium || 0,
      coverage_details: JSON.stringify(plan.coverage_details || {}, null, 2),
      benefits: Array.isArray(plan.benefits) ? plan.benefits.join('\n') : '',
      requirements: Array.isArray(plan.requirements) ? plan.requirements.join('\n') : '',
      is_active: plan.is_active,
      sort_order: plan.sort_order
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Por favor ingresa el nombre del plan",
        variant: "destructive",
      });
      return;
    }

    try {
      let coverageDetails = {};
      try {
        coverageDetails = formData.coverage_details ? JSON.parse(formData.coverage_details) : {};
      } catch {
        coverageDetails = {};
      }

      const planData = {
        name: formData.name,
        description: formData.description || null,
        coverage_amount: formData.coverage_amount || null,
        monthly_premium: formData.monthly_premium || null,
        annual_premium: formData.annual_premium || null,
        coverage_details: coverageDetails,
        benefits: formData.benefits.split('\n').filter(b => b.trim()),
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        is_active: formData.is_active,
        sort_order: formData.sort_order
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

  const toggleActive = async (plan: InsurancePlan) => {
    try {
      const { error } = await supabase
        .from('insurance_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Plan ${!plan.is_active ? 'activado' : 'desactivado'} correctamente`,
      });
      
      loadPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast({
        title: "Error",
        description: "Error al cambiar el estado del plan",
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
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plan de Seguro' : 'Nuevo Plan de Seguro'}
              </DialogTitle>
              <DialogDescription>
                Complete la información del plan de seguro
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="sort_order">Orden</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del plan"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coverage_amount">Monto de Cobertura</Label>
                  <Input
                    id="coverage_amount"
                    type="number"
                    value={formData.coverage_amount}
                    onChange={(e) => setFormData({...formData, coverage_amount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_premium">Prima Mensual</Label>
                  <Input
                    id="monthly_premium"
                    type="number"
                    value={formData.monthly_premium}
                    onChange={(e) => setFormData({...formData, monthly_premium: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual_premium">Prima Anual</Label>
                  <Input
                    id="annual_premium"
                    type="number"
                    value={formData.annual_premium}
                    onChange={(e) => setFormData({...formData, annual_premium: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Beneficios (uno por línea)</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData({...formData, benefits: e.target.value})}
                  placeholder="Cobertura de hospitalización&#10;Medicamentos incluidos&#10;Atención 24/7"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos (uno por línea)</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  placeholder="Examen médico&#10;Edad entre 18-65 años"
                  rows={3}
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
            </CardHeader>
            
            <CardContent className="space-y-3">
              {plan.description && (
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              )}
              
              <div className="space-y-2 text-sm">
                {plan.coverage_amount && (
                  <div className="flex justify-between">
                    <span>Cobertura:</span>
                    <span>${plan.coverage_amount.toLocaleString()}</span>
                  </div>
                )}
                
                {plan.monthly_premium && (
                  <div className="flex justify-between">
                    <span>Prima Mensual:</span>
                    <span>${plan.monthly_premium.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {Array.isArray(plan.benefits) && plan.benefits.length > 0 && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Beneficios:</span>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {plan.benefits.slice(0, 3).map((benefit: string, index: number) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                    {plan.benefits.length > 3 && (
                      <li>• +{plan.benefits.length - 3} más...</li>
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
                  variant={plan.is_active ? "secondary" : "default"}
                  onClick={() => toggleActive(plan)}
                >
                  {plan.is_active ? 'Desactivar' : 'Activar'}
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
    </div>
  );
};

export default InsurancePlansManager;