
-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de plantillas de documentos
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('contrato', 'anexo', 'declaracion')),
  content TEXT NOT NULL,
  fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de documentos generados
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  template_type TEXT,
  policy_type TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'opened', 'signed', 'completed')),
  field_values JSONB DEFAULT '{}'::jsonb,
  document_url TEXT,
  signature_url TEXT,
  shareable_link TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla de plantillas PDF
CREATE TABLE public.pdf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER DEFAULT 0,
  fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de firmas digitales
CREATE TABLE public.digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signature_data TEXT, -- Base64 encoded signature
  signature_type TEXT DEFAULT 'digital' CHECK (signature_type IN ('digital', 'electronic')),
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de actividad/logs
CREATE TABLE public.document_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_activity ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para document_templates
CREATE POLICY "Users can view all templates" ON public.document_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create templates" ON public.document_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON public.document_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Políticas RLS para documents
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = created_by);

-- Políticas RLS para pdf_templates
CREATE POLICY "Users can view active PDF templates" ON public.pdf_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create PDF templates" ON public.pdf_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own PDF templates" ON public.pdf_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Políticas RLS para digital_signatures
CREATE POLICY "Users can view signatures for own documents" ON public.digital_signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = digital_signatures.document_id 
      AND documents.created_by = auth.uid()
    )
  );

CREATE POLICY "Anyone can create signatures" ON public.digital_signatures
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para document_activity
CREATE POLICY "Users can view activity for own documents" ON public.document_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = document_activity.document_id 
      AND documents.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create activity logs" ON public.document_activity
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para nuevos usuarios
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crear función para generar números de documento únicos
CREATE OR REPLACE FUNCTION public.generate_document_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'DOC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('document_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia para números de documento
CREATE SEQUENCE IF NOT EXISTS document_number_seq START 1;

-- Crear bucket de storage para documentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdf-templates', 'pdf-templates', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para documentos
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
  );

CREATE POLICY "Users can update own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas de storage para plantillas PDF
CREATE POLICY "Users can upload PDF templates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pdf-templates' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view PDF templates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pdf-templates'
  );

-- Políticas de storage para firmas
CREATE POLICY "Anyone can upload signatures" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Anyone can view signatures" ON storage.objects
  FOR SELECT USING (bucket_id = 'signatures');
