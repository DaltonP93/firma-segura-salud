-- =====================================================
-- FASE 1: Extensión del Modelo de Datos
-- Sistema de Ventas y Firma Digital
-- =====================================================

-- 1. Agregar columna 'engine' a pdf_templates
ALTER TABLE public.pdf_templates
ADD COLUMN IF NOT EXISTS engine text DEFAULT 'pdfbase' CHECK (engine IN ('hbs', 'docx', 'pdfbase'));

-- 2. Crear tabla template_versions para versionado de plantillas
CREATE TABLE public.template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.pdf_templates(id) ON DELETE CASCADE NOT NULL,
  version integer NOT NULL DEFAULT 1,
  storage_key text,
  engine_opts jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  UNIQUE(template_id, version)
);

-- 3. Crear tabla signature_areas para posicionamiento de firmas
CREATE TABLE public.signature_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_version_id uuid REFERENCES public.template_versions(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'vendor', 'witness')),
  kind text NOT NULL CHECK (kind IN ('electronic', 'digital')),
  page integer DEFAULT 1,
  x numeric NOT NULL,
  y numeric NOT NULL,
  width numeric NOT NULL,
  height numeric NOT NULL,
  is_required boolean DEFAULT true,
  label text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Crear tabla template_fields_config para campos con binding
CREATE TABLE public.template_fields_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_version_id uuid REFERENCES public.template_versions(id) ON DELETE CASCADE NOT NULL,
  field_key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'date', 'select', 'number', 'table', 'checkbox', 'textarea')),
  binding text,
  validation jsonb DEFAULT '{}',
  options jsonb DEFAULT '[]',
  default_value text,
  placeholder text,
  page integer DEFAULT 1,
  x numeric NOT NULL,
  y numeric NOT NULL,
  width numeric NOT NULL,
  height numeric NOT NULL,
  font_size integer DEFAULT 12,
  is_required boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5. Extender tabla documents con campos adicionales
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS sale_id uuid REFERENCES public.sales_requests(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sha256_hex text,
ADD COLUMN IF NOT EXISTS ready_for_sign boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS generated_at timestamptz,
ADD COLUMN IF NOT EXISTS template_version_id uuid REFERENCES public.template_versions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS field_values jsonb DEFAULT '{}';

-- 6. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON public.template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_active ON public.template_versions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_signature_areas_version ON public.signature_areas(template_version_id);
CREATE INDEX IF NOT EXISTS idx_template_fields_version ON public.template_fields_config(template_version_id);
CREATE INDEX IF NOT EXISTS idx_documents_sale_id ON public.documents(sale_id);
CREATE INDEX IF NOT EXISTS idx_documents_ready_for_sign ON public.documents(ready_for_sign) WHERE ready_for_sign = true;

-- 7. Habilitar RLS en nuevas tablas
ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_fields_config ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para template_versions
CREATE POLICY "template_versions_select" ON public.template_versions
  FOR SELECT USING (is_active = true);

CREATE POLICY "template_versions_insert" ON public.template_versions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "template_versions_update" ON public.template_versions
  FOR UPDATE USING (true);

CREATE POLICY "template_versions_delete" ON public.template_versions
  FOR DELETE USING (true);

-- 9. Políticas RLS para signature_areas
CREATE POLICY "signature_areas_select" ON public.signature_areas
  FOR SELECT USING (true);

CREATE POLICY "signature_areas_insert" ON public.signature_areas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "signature_areas_update" ON public.signature_areas
  FOR UPDATE USING (true);

CREATE POLICY "signature_areas_delete" ON public.signature_areas
  FOR DELETE USING (true);

-- 10. Políticas RLS para template_fields_config
CREATE POLICY "template_fields_config_select" ON public.template_fields_config
  FOR SELECT USING (true);

CREATE POLICY "template_fields_config_insert" ON public.template_fields_config
  FOR INSERT WITH CHECK (true);

CREATE POLICY "template_fields_config_update" ON public.template_fields_config
  FOR UPDATE USING (true);

CREATE POLICY "template_fields_config_delete" ON public.template_fields_config
  FOR DELETE USING (true);

-- 11. Función para crear versión inicial de template automáticamente
CREATE OR REPLACE FUNCTION public.create_initial_template_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.template_versions (template_id, version, storage_key, created_by)
  VALUES (NEW.id, 1, NEW.file_url, NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. Trigger para crear versión inicial cuando se crea un template
DROP TRIGGER IF EXISTS trigger_create_initial_template_version ON public.pdf_templates;
CREATE TRIGGER trigger_create_initial_template_version
  AFTER INSERT ON public.pdf_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.create_initial_template_version();