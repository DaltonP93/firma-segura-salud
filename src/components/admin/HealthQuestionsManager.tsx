import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Heart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HealthQuestion {
  id: string;
  question: string;
  question_type: string;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  category: string | null;
  help_text: string | null;
  options: any;
  created_at: string;
}

const HealthQuestionsManager = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<HealthQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<HealthQuestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    question_type: 'boolean',
    is_required: true,
    is_active: true,
    category: '',
    help_text: '',
    options: null as any
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
      question: '',
      question_type: 'boolean',
      is_required: true,
      is_active: true,
      category: '',
      help_text: '',
      options: null
    });
    setEditingQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const questionData = {
        question: formData.question,
        question_type: formData.question_type,
        is_required: formData.is_required,
        is_active: formData.is_active,
        category: formData.category || null,
        help_text: formData.help_text || null,
        options: formData.options,
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
      question: question.question,
      question_type: question.question_type,
      is_required: question.is_required,
      is_active: question.is_active,
      category: question.category || '',
      help_text: question.help_text || '',
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
      'boolean': 'Sí/No',
      'text': 'Texto',
      'number': 'Número',
      'select': 'Selección',
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
                    <Label htmlFor="question">Texto de la Pregunta</Label>
                    <Textarea
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Ingresa el texto de la pregunta..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="boolean">Sí/No</SelectItem>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="select">Selección</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="historial">Historial Médico</SelectItem>
                          <SelectItem value="medicamentos">Medicamentos</SelectItem>
                          <SelectItem value="alergias">Alergias</SelectItem>
                          <SelectItem value="habitos">Hábitos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="help_text">Texto de Ayuda (opcional)</Label>
                    <Textarea
                      id="help_text"
                      value={formData.help_text}
                      onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
                      placeholder="Información adicional para el usuario..."
                    />
                  </div>

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
              <div className="text-center py-8 text-muted-foreground">
                No hay preguntas de salud configuradas
              </div>
            ) : (
              questions.map((question) => (
                <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{question.question}</h3>
                      <Badge variant={question.is_active ? "default" : "secondary"}>
                        {question.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                      {question.is_required && (
                        <Badge variant="outline">Obligatoria</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tipo: {getQuestionTypeLabel(question.question_type)} | Orden: {question.sort_order}
                      {question.category && ` | Categoría: ${question.category}`}
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