
-- Create sales_requests table
CREATE TABLE public.sales_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE DEFAULT ('REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('request_number_seq')::TEXT, 4, '0')),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_dni TEXT,
  client_birth_date DATE,
  client_address TEXT,
  policy_type TEXT NOT NULL,
  coverage_amount DECIMAL(12,2),
  monthly_premium DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_health_declaration', 'pending_signature', 'completed', 'rejected')),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create sequence for request numbers
CREATE SEQUENCE request_number_seq START 1;

-- Create beneficiaries table
CREATE TABLE public.beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sales_request_id UUID REFERENCES sales_requests(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  dni TEXT,
  birth_date DATE,
  phone TEXT,
  email TEXT,
  percentage DECIMAL(5,2) DEFAULT 100.00 CHECK (percentage > 0 AND percentage <= 100),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_questions table for dynamic health form
CREATE TABLE public.health_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'yes_no' CHECK (question_type IN ('yes_no', 'text', 'number', 'date', 'select')),
  options JSONB, -- For select type questions
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_declarations table
CREATE TABLE public.health_declarations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sales_request_id UUID REFERENCES sales_requests(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  is_complete BOOLEAN DEFAULT false,
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_data TEXT,
  signature_type TEXT DEFAULT 'digital',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales_documents table for file uploads
CREATE TABLE public.sales_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sales_request_id UUID REFERENCES sales_requests(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sales_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales_requests
CREATE POLICY "Users can create sales requests" 
  ON public.sales_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own sales requests" 
  ON public.sales_requests 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can update own sales requests" 
  ON public.sales_requests 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- RLS Policies for beneficiaries
CREATE POLICY "Users can manage beneficiaries for own sales requests" 
  ON public.beneficiaries 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM sales_requests 
    WHERE sales_requests.id = beneficiaries.sales_request_id 
    AND sales_requests.created_by = auth.uid()
  ));

-- RLS Policies for health_questions
CREATE POLICY "Everyone can view active health questions" 
  ON public.health_questions 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage health questions" 
  ON public.health_questions 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  ));

-- RLS Policies for health_declarations
CREATE POLICY "Users can manage health declarations for own sales requests" 
  ON public.health_declarations 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM sales_requests 
    WHERE sales_requests.id = health_declarations.sales_request_id 
    AND sales_requests.created_by = auth.uid()
  ));

-- RLS Policies for sales_documents
CREATE POLICY "Users can manage documents for own sales requests" 
  ON public.sales_documents 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM sales_requests 
    WHERE sales_requests.id = sales_documents.sales_request_id 
    AND sales_requests.created_by = auth.uid()
  ));

-- Insert default health questions
INSERT INTO public.health_questions (question_text, question_type, sort_order) VALUES
('¿Ha sido hospitalizado en los últimos 5 años?', 'yes_no', 1),
('¿Tiene alguna enfermedad crónica?', 'yes_no', 2),
('¿Toma algún medicamento de forma regular?', 'yes_no', 3),
('¿Ha tenido problemas cardíacos?', 'yes_no', 4),
('¿Ha tenido cáncer o tumores?', 'yes_no', 5),
('¿Tiene diabetes?', 'yes_no', 6),
('¿Fuma actualmente?', 'yes_no', 7),
('¿Consume alcohol regularmente?', 'yes_no', 8),
('Peso (kg)', 'number', 9),
('Altura (cm)', 'number', 10),
('¿Practica deportes de riesgo?', 'yes_no', 11),
('Observaciones adicionales', 'text', 12);
