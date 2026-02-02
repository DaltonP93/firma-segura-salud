-- ===========================================
-- ESQUEMA COMPLETO DE BASE DE DATOS - SISTEMA DE SEGUROS
-- ===========================================

-- 1. ENUMS
-- ===========================================

-- Roles de aplicación
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'supervisor', 'user');

-- Estados de solicitud de venta
CREATE TYPE public.sales_status AS ENUM ('draft', 'pending_health_declaration', 'pending_signature', 'completed', 'rejected', 'cancelled');

-- Estados de documentos
CREATE TYPE public.document_status AS ENUM ('draft', 'pending', 'sent', 'opened', 'signed', 'completed', 'rejected', 'expired');

-- Estados de firmante
CREATE TYPE public.signer_status AS ENUM ('pending', 'sent', 'opened', 'signed', 'declined', 'expired');

-- Tipos de documento template
CREATE TYPE public.template_type AS ENUM ('contrato', 'anexo', 'declaracion', 'poliza', 'otro');

-- Tipos de notificación
CREATE TYPE public.notification_type AS ENUM ('email', 'sms', 'whatsapp', 'push');

-- Estados de notificación
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');

-- Tipos de eventos de documento
CREATE TYPE public.document_event_type AS ENUM ('created', 'sent', 'opened', 'signed', 'declined', 'expired', 'reminded', 'completed');

-- Niveles de prioridad
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- ===========================================
-- 2. TABLA DE PERFILES
-- ===========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  username TEXT,
  phone TEXT,
  company TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 3. TABLA DE ROLES DE USUARIO (Seguridad)
-- ===========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- ===========================================
-- 4. PLANES DE SEGURO
-- ===========================================
CREATE TABLE public.insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  coverage_amount DECIMAL(12,2),
  monthly_premium DECIMAL(12,2),
  annual_premium DECIMAL(12,2),
  coverage_details JSONB DEFAULT '{}',
  benefits JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 5. TIPOS DE EMPRESA/COMPAÑÍA
-- ===========================================
CREATE TABLE public.company_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 6. PREGUNTAS DE SALUD
-- ===========================================
CREATE TABLE public.health_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'boolean',
  options JSONB DEFAULT '[]',
  category TEXT,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  help_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 7. PLANTILLAS DE DOCUMENTOS
-- ===========================================
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type template_type DEFAULT 'contrato',
  content TEXT,
  description TEXT,
  fields JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 8. PLANTILLAS PDF
-- ===========================================
CREATE TABLE public.pdf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_name TEXT,
  file_url TEXT,
  file_size INTEGER DEFAULT 0,
  fields JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 9. SOLICITUDES DE VENTA
-- ===========================================
CREATE TABLE public.sales_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_dni TEXT,
  client_birth_date DATE,
  client_address TEXT,
  client_occupation TEXT,
  client_income DECIMAL(12,2),
  client_marital_status TEXT,
  policy_type TEXT,
  insurance_plan_id UUID REFERENCES public.insurance_plans(id),
  coverage_amount DECIMAL(12,2),
  monthly_premium DECIMAL(12,2),
  template_id UUID REFERENCES public.document_templates(id),
  medical_exams_required BOOLEAN DEFAULT false,
  agent_notes TEXT,
  priority_level priority_level DEFAULT 'medium',
  source TEXT,
  notes TEXT,
  status sales_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- ===========================================
-- 10. BENEFICIARIOS
-- ===========================================
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_request_id UUID REFERENCES public.sales_requests(id) ON DELETE CASCADE,
  description TEXT,
  relationship TEXT,
  dni TEXT,
  birth_date DATE,
  phone TEXT,
  email TEXT,
  address TEXT,
  percentage DECIMAL(5,2) DEFAULT 100,
  is_primary BOOLEAN DEFAULT false,
  price DECIMAL(12,2),
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 11. DECLARACIONES DE SALUD
-- ===========================================
CREATE TABLE public.health_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_request_id UUID REFERENCES public.sales_requests(id) ON DELETE CASCADE UNIQUE,
  answers JSONB DEFAULT '{}',
  additional_notes TEXT,
  is_complete BOOLEAN DEFAULT false,
  requires_medical_review BOOLEAN DEFAULT false,
  medical_review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 12. DOCUMENTOS GENERADOS
-- ===========================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number TEXT UNIQUE,
  sales_request_id UUID REFERENCES public.sales_requests(id),
  template_id UUID REFERENCES public.document_templates(id),
  pdf_template_id UUID REFERENCES public.pdf_templates(id),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  policy_type TEXT,
  template_type template_type DEFAULT 'contrato',
  content TEXT,
  metadata JSONB DEFAULT '{}',
  document_url TEXT,
  signature_url TEXT,
  signed_pdf_url TEXT,
  shareable_link TEXT,
  status document_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 13. SOLICITUDES DE FIRMA
-- ===========================================
CREATE TABLE public.signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  status document_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 14. FIRMANTES
-- ===========================================
CREATE TABLE public.signers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_request_id UUID REFERENCES public.signature_requests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'signer',
  signing_order INTEGER DEFAULT 1,
  access_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  expires_at TIMESTAMPTZ,
  access_attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  is_expired BOOLEAN DEFAULT false,
  signature_data TEXT,
  signature_type TEXT DEFAULT 'electronic',
  status signer_status DEFAULT 'pending',
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  signed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  reminded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 15. CAMPOS DE FIRMA EN DOCUMENTOS
-- ===========================================
CREATE TABLE public.signature_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  signer_id UUID REFERENCES public.signers(id),
  field_type TEXT DEFAULT 'signature',
  label TEXT,
  page_number INTEGER DEFAULT 1,
  x_position DECIMAL(10,4),
  y_position DECIMAL(10,4),
  width DECIMAL(10,4),
  height DECIMAL(10,4),
  is_required BOOLEAN DEFAULT true,
  is_filled BOOLEAN DEFAULT false,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 16. EVENTOS DE DOCUMENTOS
-- ===========================================
CREATE TABLE public.document_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  signature_request_id UUID REFERENCES public.signature_requests(id),
  signer_id UUID REFERENCES public.signers(id),
  event_type document_event_type NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 17. LOGS DE NOTIFICACIONES
-- ===========================================
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_request_id UUID REFERENCES public.signature_requests(id),
  signer_id UUID REFERENCES public.signers(id),
  document_id UUID REFERENCES public.documents(id),
  user_id UUID REFERENCES auth.users(id),
  notification_type notification_type NOT NULL,
  recipient TEXT,
  message_content TEXT,
  status notification_status DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 18. NOTIFICACIONES DE USUARIO
-- ===========================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  category TEXT DEFAULT 'general',
  details TEXT,
  action_url TEXT,
  action_text TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 19. CONFIGURACIÓN DEL SISTEMA
-- ===========================================
CREATE TABLE public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- 20. LOGS DE AUDITORÍA
-- ===========================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- FUNCIONES AUXILIARES
-- ===========================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_token_valid(token_value TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.signers
    WHERE access_token = token_value
      AND (expires_at IS NULL OR expires_at > now())
      AND access_attempts < max_attempts
      AND is_expired = false
  )
$$;

CREATE OR REPLACE FUNCTION public.increment_access_attempts(token_value TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.signers
  SET access_attempts = access_attempts + 1,
      updated_at = now()
  WHERE access_token = token_value
$$;

CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  year_suffix TEXT;
  sequence_num INTEGER;
BEGIN
  year_suffix := TO_CHAR(now(), 'YYYY');
  SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(request_number, '[^0-9]', '', 'g'), '')::INTEGER), 0) + 1 INTO sequence_num
  FROM public.sales_requests
  WHERE request_number LIKE 'SOL-' || year_suffix || '-%';
  new_number := 'SOL-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := generate_request_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_request_number
  BEFORE INSERT ON public.sales_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_request_number();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_requests_updated_at BEFORE UPDATE ON public.sales_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_declarations_updated_at BEFORE UPDATE ON public.health_declarations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_signature_requests_updated_at BEFORE UPDATE ON public.signature_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_signers_updated_at BEFORE UPDATE ON public.signers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON public.document_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pdf_templates_updated_at BEFORE UPDATE ON public.pdf_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insurance_plans_updated_at BEFORE UPDATE ON public.insurance_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- HABILITAR RLS
-- ===========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- POLÍTICAS RLS - PROFILES
-- ===========================================
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- USER_ROLES
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- INSURANCE_PLANS
CREATE POLICY "insurance_plans_select" ON public.insurance_plans FOR SELECT USING (is_active = true);
CREATE POLICY "insurance_plans_insert" ON public.insurance_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "insurance_plans_update" ON public.insurance_plans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "insurance_plans_delete" ON public.insurance_plans FOR DELETE TO authenticated USING (true);

-- COMPANY_TYPES
CREATE POLICY "company_types_select" ON public.company_types FOR SELECT USING (is_active = true);
CREATE POLICY "company_types_insert" ON public.company_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "company_types_update" ON public.company_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "company_types_delete" ON public.company_types FOR DELETE TO authenticated USING (true);

-- HEALTH_QUESTIONS
CREATE POLICY "health_questions_select" ON public.health_questions FOR SELECT USING (is_active = true);
CREATE POLICY "health_questions_insert" ON public.health_questions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "health_questions_update" ON public.health_questions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "health_questions_delete" ON public.health_questions FOR DELETE TO authenticated USING (true);

-- DOCUMENT_TEMPLATES
CREATE POLICY "document_templates_select" ON public.document_templates FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "document_templates_insert" ON public.document_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "document_templates_update" ON public.document_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "document_templates_delete" ON public.document_templates FOR DELETE TO authenticated USING (true);

-- PDF_TEMPLATES
CREATE POLICY "pdf_templates_select" ON public.pdf_templates FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "pdf_templates_insert" ON public.pdf_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pdf_templates_update" ON public.pdf_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "pdf_templates_delete" ON public.pdf_templates FOR DELETE TO authenticated USING (true);

-- SALES_REQUESTS
CREATE POLICY "sales_requests_select" ON public.sales_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "sales_requests_insert" ON public.sales_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "sales_requests_update" ON public.sales_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "sales_requests_delete" ON public.sales_requests FOR DELETE TO authenticated USING (created_by = auth.uid());

-- BENEFICIARIES
CREATE POLICY "beneficiaries_select" ON public.beneficiaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "beneficiaries_insert" ON public.beneficiaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "beneficiaries_update" ON public.beneficiaries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "beneficiaries_delete" ON public.beneficiaries FOR DELETE TO authenticated USING (true);

-- HEALTH_DECLARATIONS
CREATE POLICY "health_declarations_select" ON public.health_declarations FOR SELECT TO authenticated USING (true);
CREATE POLICY "health_declarations_insert" ON public.health_declarations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "health_declarations_update" ON public.health_declarations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "health_declarations_delete" ON public.health_declarations FOR DELETE TO authenticated USING (true);

-- DOCUMENTS
CREATE POLICY "documents_select" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "documents_insert" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "documents_update" ON public.documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "documents_delete" ON public.documents FOR DELETE TO authenticated USING (created_by = auth.uid());

-- SIGNATURE_REQUESTS
CREATE POLICY "signature_requests_select" ON public.signature_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "signature_requests_insert" ON public.signature_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "signature_requests_update" ON public.signature_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "signature_requests_delete" ON public.signature_requests FOR DELETE TO authenticated USING (true);

-- SIGNERS (público para acceso por token)
CREATE POLICY "signers_select_public" ON public.signers FOR SELECT USING (true);
CREATE POLICY "signers_insert" ON public.signers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "signers_update_public" ON public.signers FOR UPDATE USING (true);
CREATE POLICY "signers_delete" ON public.signers FOR DELETE TO authenticated USING (true);

-- SIGNATURE_FIELDS
CREATE POLICY "signature_fields_select" ON public.signature_fields FOR SELECT TO authenticated USING (true);
CREATE POLICY "signature_fields_insert" ON public.signature_fields FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "signature_fields_update" ON public.signature_fields FOR UPDATE TO authenticated USING (true);
CREATE POLICY "signature_fields_delete" ON public.signature_fields FOR DELETE TO authenticated USING (true);

-- DOCUMENT_EVENTS
CREATE POLICY "document_events_select" ON public.document_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_events_insert" ON public.document_events FOR INSERT WITH CHECK (true);

-- NOTIFICATION_LOGS
CREATE POLICY "notification_logs_select" ON public.notification_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "notification_logs_insert" ON public.notification_logs FOR INSERT TO authenticated WITH CHECK (true);

-- NOTIFICATIONS
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- SYSTEM_CONFIG
CREATE POLICY "system_config_select_public" ON public.system_config FOR SELECT USING (is_public = true);
CREATE POLICY "system_config_select_auth" ON public.system_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "system_config_insert" ON public.system_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "system_config_update" ON public.system_config FOR UPDATE TO authenticated USING (true);

-- AUDIT_LOGS
CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ===========================================
-- ÍNDICES
-- ===========================================
CREATE INDEX idx_sales_requests_status ON public.sales_requests(status);
CREATE INDEX idx_sales_requests_created_by ON public.sales_requests(created_by);
CREATE INDEX idx_sales_requests_created_at ON public.sales_requests(created_at DESC);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_created_by ON public.documents(created_by);
CREATE INDEX idx_signers_access_token ON public.signers(access_token);
CREATE INDEX idx_signers_signature_request ON public.signers(signature_request_id);
CREATE INDEX idx_beneficiaries_sales_request ON public.beneficiaries(sales_request_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_document_events_document ON public.document_events(document_id);

-- ===========================================
-- DATOS INICIALES
-- ===========================================
INSERT INTO public.insurance_plans (name, description, coverage_amount, monthly_premium) VALUES
('Plan Básico', 'Cobertura básica de salud', 50000, 99.99),
('Plan Familiar', 'Cobertura para toda la familia', 100000, 199.99),
('Plan Premium', 'Cobertura completa con beneficios adicionales', 250000, 399.99);

INSERT INTO public.health_questions (question, question_type, category, sort_order) VALUES
('¿Padece alguna enfermedad crónica?', 'boolean', 'general', 1),
('¿Ha sido hospitalizado en los últimos 5 años?', 'boolean', 'historial', 2),
('¿Toma medicamentos de forma regular?', 'boolean', 'medicamentos', 3),
('¿Tiene alguna alergia conocida?', 'boolean', 'alergias', 4),
('¿Ha tenido cirugías previas?', 'boolean', 'historial', 5),
('¿Fuma o ha fumado en los últimos 2 años?', 'boolean', 'habitos', 6),
('¿Consume alcohol regularmente?', 'boolean', 'habitos', 7),
('¿Realiza actividades físicas de alto riesgo?', 'boolean', 'habitos', 8);