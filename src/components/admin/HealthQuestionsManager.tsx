
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Move, Heart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HealthQuestion {
  id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  show_description_when?: string;
  options?: any;
  created_at: string;
  updated_at: string;
}

const HealthQuestionsManager = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<HealthQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<HealthQuestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'yes_no',
    is_required: true,
    is_active: true,
    show_description_when: '',
    options: null
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('health_questions')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching health questions:', error);
      toast({
        title: "Error",
        description: "Error al cargar las preguntas de salud",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type: 'yes_no',
      is_required: true,
      is_active: true,
      show_description_when: '',
      options: null
    });
    setEditingQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const questionData = {
        ...formData,
        sort_order: editingQuestion ? editingQuestion.sort_order : questions.length + 1
      };

      if (editingQuestion) {
        const { error } = await supabase
          .from('health_questions')
          .update(questionData)
          .eq('id', editingQuestion.id);

        if (error) throw error;

        toast({
          title: "Pregunta Actualizada",
          description: "La pregunta de salud ha sido actualizada exitosamente",
        });
      } else {
        const { error } = await supabase
          .from('health_questions')
          .insert([questionData]);

        if (error) throw error;

        toast({
          title: "Pregunta Creada",
          description: "La pregunta de salud ha sido creada exitosamente",
        });
      }

      await fetchQuestions();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Error",
        description: "Error al guardar la pregunta",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (question: HealthQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      is_required: question.is_required,
      is_active: question.is_active,
      show_description_when: question.show_description_when || '',
      options: question.options
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) return;

    try {
      const { error } = await supabase
        .from('health_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchQuestions();
      toast({
        title: "Pregunta Eliminada",
        description: "La pregunta ha sido eliminada exitosamente",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la pregunta",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('health_questions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      await fetchQuestions();
      toast({
        title: "Estado Actualizado",
        description: `La pregunta ha sido ${!currentStatus ? 'activada' : 'desactivada'}`,
      });
    } catch (error) {
      console.error('Error updating question status:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado de la pregunta",
        variant: "destructive",
      });
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'yes_no': 'Sí/No',
      'yes_no_description': 'Sí/No con Descripción',
      'text': 'Texto',
      'number': 'Número',
      'select': 'Selección',
      'multiple_select': 'Selección Múltiple'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Gestión de Preguntas de Salud
              </CardTitle>
              <CardDescription>
                Administra las preguntas de la declaración de salud
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Pregunta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta de Salud'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingQuestion ? 'Modifica los datos de la pregunta' : 'Crea una nueva pregunta para la declaración de salud'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question_text">Texto de la Pregunta</Label>
                    <Textarea
                      id="question_text"
                      value={formData.question_text}
                      onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                      placeholder="Ingresa el texto de la pregunta..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question_type">Tipo de Pregunta</Label>
                    <Select
                      value={formData.question_type}
                      onValueChange={(value) => setFormData({ ...formData, question_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes_no">Sí/No</SelectItem>
                        <SelectItem value="yes_no_description">Sí/No con Descripción</SelectItem>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="select">Selección</SelectItem>
                        <SelectItem value="multiple_select">Selección Múltiple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.question_type === 'yes_no_description') && (
                    <div className="space-y-2">
                      <Label htmlFor="show_description_when">Mostrar descripción cuando</Label>
                      <Select
                        value={formData.show_description_when}
                        onValueChange={(value) => setFormData({ ...formData, show_description_when: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Sí</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_required"
                        checked={formData.is_required}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                      />
                      <Label htmlFor="is_required">Obligatoria</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Activa</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingQuestion ? 'Actualizar' : 'Crear'} Pregunta
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay preguntas de salud configuradas
              </div>
            ) : (
              questions.map((question) => (
                <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{question.question_text}</h3>
                      <Badge variant={question.is_active ? "default" : "secondary"}>
                        {question.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                      {question.is_required && (
                        <Badge variant="outline">Obligatoria</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Tipo: {getQuestionTypeLabel(question.question_type)} | Orden: {question.sort_order}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(question.id, question.is_active)}
                    >
                      {question.is_active ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthQuestionsManager;
