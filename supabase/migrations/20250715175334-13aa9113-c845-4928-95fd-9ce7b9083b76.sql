
-- First, let's fix the health_questions table constraint to allow the question types we need
ALTER TABLE public.health_questions 
DROP CONSTRAINT IF EXISTS health_questions_question_type_check;

-- Add a new constraint that allows all the question types we need
ALTER TABLE public.health_questions 
ADD CONSTRAINT health_questions_question_type_check 
CHECK (question_type IN ('yes_no', 'yes_no_description', 'text', 'number', 'select', 'multiple_select'));

-- Let's also make sure the sort_order has a proper default
ALTER TABLE public.health_questions 
ALTER COLUMN sort_order SET DEFAULT 0;
