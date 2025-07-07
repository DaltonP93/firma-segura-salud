
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { salesService } from '@/services/salesService';
import type { SalesRequestWithDetails } from './SalesRequestsList';

interface HealthQuestion {
  id: string;
  question_text: string;
  question_type: 'yes_no' | 'text' | 'number' | 'date' | 'select';
  options?: string[];
  is_required: boolean;
  sort_order: number;
}

interface HealthDeclarationFormProps {
  salesRequest: SalesRequestWithDetails;
  onSubmit: (answers: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}

const HealthDeclarationForm: React.FC<HealthDeclarationFormProps> = ({
  salesRequest,
  onSubmit,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [healthQuestions, setHealthQuestions] = useState<HealthQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questionsLoading, setQuestionsLoading] = useState(true);

  useEffect(() => {
    loadHealthQuestions();
  }, []);

  const loadHealthQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const questions = await salesService.fetchHealthQuestions();
      console.log('Health questions loaded:', questions);
      setHealthQuestions(questions);
    } catch (error) {
      console.error('Error loading health questions:', error);
      toast({
        title: "Error",
        description: "Error al cargar las preguntas de salud",
        variant: "destructive",
      });
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateAnswers = () => {
    const requiredQuestions = healthQuestions.filter(q => q.is_required);
    const missingAnswers = requiredQuestions.filter(q => 
      !answers[q.id] || (typeof answers[q.id] === 'string' && answers[q.id].trim() === '')
    );

    if (missingAnswers.length > 0) {
      toast({
        title: "Campos Requeridos",
        description: `Por favor complete todas las preguntas obligatorias (${missingAnswers.length} faltantes)`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAnswers()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(answers);
    } catch (error) {
      console.error('Error submitting health declaration:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question: HealthQuestion) => {
    const answerId = question.id;
    const currentValue = answers[answerId];

    switch (question.question_type) {
      case 'yes_no':
        return (
          <RadioGroup 
            value={currentValue || ''} 
            onValueChange={(value) => handleAnswerChange(answerId, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${answerId}-yes`} />
              <Label htmlFor={`${answerId}-yes`}>Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${answerId}-no`} />
              <Label htmlFor={`${answerId}-no`}>No</Label>
            </div>
          </RadioGroup>
        );

      case 'text':
        return (
          <Textarea
            value={currentValue || ''}
            onChange={(e) => handleAnswerChange(answerId, e.target.value)}
            placeholder="Escriba su respuesta..."
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleAnswerChange(answerId, parseFloat(e.target.value) || '')}
            placeholder="0"
            min="0"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={currentValue || ''}
            onChange={(e) => handleAnswerChange(answerId, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select
            value={currentValue || ''}
            onValueChange={(value) => handleAnswerChange(answerId, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una opción" />
            </SelectTrigger>
            <SelectContent>
              {(question.options || []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => handleAnswerChange(answerId, e.target.value)}
            placeholder="Escriba su respuesta..."
          />
        );
    }
  };

  if (questionsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-600">Cargando formulario de salud...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Declaración de Salud
          </CardTitle>
          <CardDescription>
            Complete la declaración de salud para el cliente: <strong>{salesRequest.client_name}</strong>
            <br />
            Solicitud: {salesRequest.request_number}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Información Importante</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Por favor responda todas las preguntas de manera honesta y completa. 
                  La información proporcionada será utilizada para evaluar la póliza de seguro.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {healthQuestions.map((question, index) => (
              <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  {question.question_text}
                  {question.is_required && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                
                {renderQuestion(question)}
                
                {/* Show warning for risky answers */}
                {question.question_type === 'yes_no' && answers[question.id] === 'yes' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Esta respuesta puede requerir información adicional o evaluación médica.
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Declaración y Consentimiento */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Declaración y Consentimiento
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>
                      Declaro que todas las respuestas proporcionadas en esta declaración de salud son 
                      verdaderas, completas y precisas al momento de completar este formulario.
                    </p>
                    <p>
                      Entiendo que cualquier información falsa, incompleta u omitida puede resultar en 
                      la anulación de la póliza de seguro o el rechazo de reclamos futuros.
                    </p>
                    <p>
                      Autorizo a la compañía de seguros a obtener información médica adicional si es 
                      necesario para la evaluación de esta solicitud.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Completar Declaración
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDeclarationForm;
