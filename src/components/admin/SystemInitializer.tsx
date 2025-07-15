
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Play, AlertCircle, Database } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InitStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  error?: string;
}

const SystemInitializer = () => {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<InitStep[]>([
    {
      id: 'health_questions',
      title: 'Preguntas de Salud',
      description: 'Crear preguntas estándar para declaraciones de salud',
      completed: false
    },
    {
      id: 'insurance_plans',
      title: 'Planes de Seguro',
      description: 'Crear planes básicos de seguros de vida',
      completed: false
    },
    {
      id: 'company_types',
      title: 'Tipos de Empresa',
      description: 'Crear categorías de empresa por defecto',
      completed: false
    },
    {
      id: 'customization',
      title: 'Personalización',
      description: 'Configurar tema y personalización por defecto',
      completed: false
    }
  ]);

  const createHealthQuestions = async () => {
    // First check if questions already exist
    const { data: existingQuestions } = await supabase
      .from('health_questions')
      .select('id')
      .limit(1);

    if (existingQuestions && existingQuestions.length > 0) {
      console.log('Health questions already exist, skipping creation');
      return;
    }

    const questions = [
      {
        question_text: '¿Ha sido hospitalizado en los últimos 5 años?',
        question_type: 'yes_no',
        is_required: true,
        sort_order: 1
      },
      {
        question_text: '¿Padece alguna enfermedad crónica (diabetes, hipertensión, etc.)?',
        question_type: 'yes_no_description',
        is_required: true,
        sort_order: 2,
        show_description_when: 'yes'
      },
      {
        question_text: '¿Toma medicamentos de forma regular?',
        question_type: 'yes_no_description',
        is_required: true,
        sort_order: 3,
        show_description_when: 'yes'
      },
      {
        question_text: '¿Ha sido diagnosticado con cáncer, enfermedades cardíacas o neurológicas?',
        question_type: 'yes_no_description',
        is_required: true,
        sort_order: 4,
        show_description_when: 'yes'
      },
      {
        question_text: '¿Practica deportes de riesgo o actividades peligrosas?',
        question_type: 'yes_no_description',
        is_required: false,
        sort_order: 5,
        show_description_when: 'yes'
      }
    ];

    const { error } = await supabase
      .from('health_questions')
      .insert(questions);

    if (error) throw error;
  };

  const createInsurancePlans = async () => {
    // First check if plans already exist
    const { data: existingPlans } = await supabase
      .from('insurance_plans')
      .select('id')
      .limit(1);

    if (existingPlans && existingPlans.length > 0) {
      console.log('Insurance plans already exist, skipping creation');
      return;
    }

    const plans = [
      {
        name: 'Seguro Básico',
        policy_type: 'vida',
        description: 'Cobertura básica de vida con capital asegurado accesible',
        min_coverage_amount: 10000,
        max_coverage_amount: 100000,
        min_premium: 25,
        max_premium: 200,
        age_restrictions: { min_age: 18, max_age: 65 },
        coverage_details: {
          muerte_natural: '100% del capital asegurado',
          muerte_accidental: '200% del capital asegurado',
          invalidez_total: '100% del capital asegurado'
        },
        requirements: ['Declaración de salud', 'Identificación oficial']
      },
      {
        name: 'Seguro Premium',
        policy_type: 'vida',
        description: 'Cobertura completa con beneficios adicionales',
        min_coverage_amount: 50000,
        max_coverage_amount: 500000,
        min_premium: 100,
        max_premium: 800,
        age_restrictions: { min_age: 18, max_age: 70 },
        coverage_details: {
          muerte_natural: '100% del capital asegurado',
          muerte_accidental: '300% del capital asegurado',
          invalidez_total: '100% del capital asegurado',
          invalidez_parcial: 'Según tabla de valuación',
          gastos_funerarios: '5% del capital asegurado'
        },
        requirements: ['Declaración de salud', 'Examen médico', 'Identificación oficial']
      },
      {
        name: 'Seguro Familiar',
        policy_type: 'vida',
        description: 'Protección para toda la familia con cobertura múltiple',
        min_coverage_amount: 25000,
        max_coverage_amount: 250000,
        min_premium: 60,
        max_premium: 400,
        age_restrictions: { min_age: 25, max_age: 60 },
        coverage_details: {
          titular: '100% del capital asegurado',
          conyuge: '50% del capital asegurado',
          hijos: '25% del capital asegurado por hijo',
          gastos_educacion: '10% del capital para educación de hijos'
        },
        requirements: ['Declaración de salud familiar', 'Acta de matrimonio', 'Actas de nacimiento']
      }
    ];

    const { error } = await supabase
      .from('insurance_plans')
      .insert(plans);

    if (error) throw error;
  };

  const createCompanyTypes = async () => {
    // First check if company types already exist
    const { data: existingTypes } = await supabase
      .from('company_types')
      .select('id')
      .limit(1);

    if (existingTypes && existingTypes.length > 0) {
      console.log('Company types already exist, skipping creation');
      return;
    }

    const companyTypes = [
      {
        name: 'insurance',
        description: 'Compañías de Seguros',
        is_active: true
      },
      {
        name: 'financial',
        description: 'Servicios Financieros',
        is_active: true
      },
      {
        name: 'legal',
        description: 'Despachos Legales',
        is_active: true
      },
      {
        name: 'consulting',
        description: 'Consultoría',
        is_active: true
      },
      {
        name: 'real_estate',
        description: 'Bienes Raíces',
        is_active: true
      }
    ];

    const { error } = await supabase
      .from('company_types')
      .insert(companyTypes);

    if (error) throw error;
  };

  const createDefaultCustomization = async () => {
    // First check if customization already exists
    const { data: existingCustomization } = await supabase
      .from('app_customization')
      .select('id')
      .limit(1);

    if (existingCustomization && existingCustomization.length > 0) {
      console.log('App customization already exists, skipping creation');
      return;
    }

    const customization = {
      theme_name: 'default',
      app_title: 'Sistema de Gestión Documental Digital',
      app_subtitle: 'Crea plantillas, genera documentos PDF interactivos y gestiona firmas digitales',
      primary_color: '#3b82f6',
      secondary_color: '#64748b',
      accent_color: '#10b981',
      welcome_message: 'Bienvenido al sistema de gestión documental. Aquí puedes crear documentos, gestionar firmas y administrar tu negocio de manera eficiente.',
      footer_text: 'Sistema de Gestión Documental © 2025. Todos los derechos reservados.',
      is_active: true
    };

    const { error } = await supabase
      .from('app_customization')
      .insert([customization]);

    if (error) throw error;
  };

  const executeStep = async (stepId: string) => {
    try {
      switch (stepId) {
        case 'health_questions':
          await createHealthQuestions();
          break;
        case 'insurance_plans':
          await createInsurancePlans();
          break;
        case 'company_types':
          await createCompanyTypes();
          break;
        case 'customization':
          await createDefaultCustomization();
          break;
      }

      setSteps(prev => prev.map(step => 
        step.id === stepId 
          ? { ...step, completed: true, error: undefined }
          : step
      ));
    } catch (error) {
      console.error(`Error in step ${stepId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setSteps(prev => prev.map(step => 
        step.id === stepId 
          ? { ...step, error: errorMessage, completed: false }
          : step
      ));
      throw error;
    }
  };

  const initializeSystem = async () => {
    setIsInitializing(true);
    setProgress(0);

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        console.log(`Executing step: ${step.title}`);
        
        await executeStep(step.id);
        setProgress((i + 1) / steps.length * 100);
        
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Sistema Inicializado",
        description: "Se han creado todos los datos maestros correctamente",
      });
    } catch (error) {
      console.error('Error during initialization:', error);
      toast({
        title: "Error en la Inicialización",
        description: "Hubo un error al crear algunos datos. Revisa los detalles.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const hasErrors = steps.some(step => step.error);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Inicialización del Sistema
          </CardTitle>
          <CardDescription>
            Configura los datos maestros necesarios para el funcionamiento completo del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Progreso: {completedSteps} de {steps.length} completados
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : step.error ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                  {step.error && (
                    <p className="text-sm text-red-500 mt-1">{step.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {completedSteps === steps.length ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ¡Sistema inicializado correctamente! Todos los datos maestros han sido creados.
              </AlertDescription>
            </Alert>
          ) : (
            <Button 
              onClick={initializeSystem} 
              disabled={isInitializing}
              className="w-full"
            >
              {isInitializing ? (
                <>Inicializando...</>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Inicializar Sistema
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemInitializer;
