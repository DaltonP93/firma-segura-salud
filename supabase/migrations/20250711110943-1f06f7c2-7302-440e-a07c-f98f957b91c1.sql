-- Add missing fields to sales_requests table
ALTER TABLE public.sales_requests 
ADD COLUMN client_occupation text,
ADD COLUMN client_income numeric,
ADD COLUMN client_marital_status text,
ADD COLUMN medical_exams_required boolean DEFAULT false,
ADD COLUMN agent_notes text,
ADD COLUMN priority_level text DEFAULT 'normal',
ADD COLUMN source text DEFAULT 'direct';

-- Add weight and height to beneficiaries table and rename name to description
ALTER TABLE public.beneficiaries 
ADD COLUMN weight numeric,
ADD COLUMN height numeric,
ADD COLUMN description text;

-- Update existing name data to description before dropping name column
UPDATE public.beneficiaries SET description = name WHERE description IS NULL;

-- Make description NOT NULL after copying data
ALTER TABLE public.beneficiaries 
ALTER COLUMN description SET NOT NULL;

-- Drop the old name column
ALTER TABLE public.beneficiaries 
DROP COLUMN name;

-- Create insurance_plans table
CREATE TABLE public.insurance_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  policy_type text NOT NULL,
  min_coverage_amount numeric DEFAULT 0,
  max_coverage_amount numeric,
  min_premium numeric DEFAULT 0,
  max_premium numeric,
  age_restrictions jsonb DEFAULT '{"min_age": 18, "max_age": 70}'::jsonb,
  coverage_details jsonb DEFAULT '{}'::jsonb,
  requirements jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

-- Enable RLS on insurance_plans
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for insurance_plans
CREATE POLICY "Everyone can view active insurance plans"
ON public.insurance_plans
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage insurance plans"
ON public.insurance_plans
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'super_admin')
));

-- Add trigger for insurance_plans updated_at
CREATE TRIGGER update_insurance_plans_updated_at
BEFORE UPDATE ON public.insurance_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update health_questions with the 28 specific questions
DELETE FROM public.health_questions;

INSERT INTO public.health_questions (question_text, question_type, is_required, sort_order) VALUES
('¿Padece usted de alguna enfermedad o dolencia actualmente?', 'yes_no', true, 1),
('¿Ha sido usted hospitalizado, operado o sometido a tratamiento médico en los últimos 5 años?', 'yes_no', true, 2),
('¿Padece o ha padecido de enfermedades del corazón, arterias, venas o presión arterial?', 'yes_no', true, 3),
('¿Padece o ha padecido de diabetes, enfermedades de los riñones, hígado o sistema digestivo?', 'yes_no', true, 4),
('¿Padece o ha padecido de enfermedades del sistema nervioso, mental o psiquiátrico?', 'yes_no', true, 5),
('¿Padece o ha padecido de cáncer, tumores o enfermedades de la sangre?', 'yes_no', true, 6),
('¿Padece o ha padecido de enfermedades del sistema respiratorio?', 'yes_no', true, 7),
('¿Padece o ha padecido de enfermedades de los huesos, músculos o articulaciones?', 'yes_no', true, 8),
('¿Padece o ha padecido de enfermedades de la piel?', 'yes_no', true, 9),
('¿Padece o ha padecido de enfermedades de los ojos o problemas de visión?', 'yes_no', true, 10),
('¿Padece o ha padecido de enfermedades del oído o problemas de audición?', 'yes_no', true, 11),
('¿Ha tenido algún accidente o lesión importante?', 'yes_no', true, 12),
('¿Consume tabaco regularmente?', 'yes_no', true, 13),
('¿Consume alcohol con frecuencia?', 'yes_no', true, 14),
('¿Practica deportes de riesgo o actividades peligrosas?', 'yes_no', true, 15),
('¿Tiene antecedentes familiares de enfermedades hereditarias?', 'yes_no', true, 16),
('¿Está embarazada actualmente?', 'yes_no', false, 17),
('¿Toma algún medicamento de forma regular?', 'yes_no', true, 18),
('¿Ha consultado a algún médico en los últimos 12 meses?', 'yes_no', true, 19),
('¿Ha sido rechazado, modificado o cancelado algún seguro anteriormente?', 'yes_no', true, 20),
('¿Tiene alguna discapacidad física o mental?', 'yes_no', true, 21),
('¿Viaja frecuentemente a países de alto riesgo?', 'yes_no', true, 22),
('¿Trabaja en actividades de alto riesgo?', 'yes_no', true, 23),
('¿Ha estado en tratamiento psicológico o psiquiátrico?', 'yes_no', true, 24),
('¿Ha padecido de alguna enfermedad de transmisión sexual?', 'yes_no', true, 25),
('¿Tiene alguna alergia conocida?', 'yes_no', true, 26),
('¿Ha tenido problemas con drogas o sustancias controladas?', 'yes_no', true, 27),
('¿Hay algún otro aspecto de su salud que considere importante mencionar?', 'text', false, 28);

-- Add description fields for health questions that need it
ALTER TABLE public.health_questions 
ADD COLUMN show_description_when text DEFAULT null;

-- Update questions that should show description field when answered "yes"
UPDATE public.health_questions 
SET show_description_when = 'yes' 
WHERE question_type = 'yes_no' AND sort_order <= 27;