
-- Actualizar la tabla profiles para incluir roles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- Crear tabla de tipos de empresa
CREATE TABLE public.company_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de personalización de aplicación
CREATE TABLE public.app_customization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_type_id UUID REFERENCES public.company_types(id) ON DELETE CASCADE,
  theme_name TEXT NOT NULL DEFAULT 'default',
  logo_url TEXT,
  background_image_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#64748b',
  accent_color TEXT DEFAULT '#10b981',
  font_family TEXT DEFAULT 'Inter',
  app_title TEXT DEFAULT 'Sistema de Gestión Documental Digital',
  app_subtitle TEXT DEFAULT 'Crea plantillas, genera documentos PDF interactivos y gestiona firmas digitales',
  welcome_message TEXT,
  footer_text TEXT,
  custom_css TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de personalización de secciones
CREATE TABLE public.section_customization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_customization_id UUID REFERENCES public.app_customization(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  section_title TEXT,
  section_description TEXT,
  icon_name TEXT,
  background_color TEXT,
  text_color TEXT,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  custom_properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(app_customization_id, section_key)
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.company_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_customization ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para company_types
CREATE POLICY "Everyone can view active company types" ON public.company_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage company types" ON public.company_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Políticas RLS para app_customization
CREATE POLICY "Everyone can view active customizations" ON public.app_customization
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage customizations" ON public.app_customization
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Políticas RLS para section_customization
CREATE POLICY "Everyone can view section customizations" ON public.section_customization
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.app_customization 
      WHERE app_customization.id = section_customization.app_customization_id 
      AND app_customization.is_active = true
    )
  );

CREATE POLICY "Admin can manage section customizations" ON public.section_customization
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insertar algunos tipos de empresa por defecto
INSERT INTO public.company_types (name, description) VALUES
  ('insurance', 'Compañías de Seguros'),
  ('legal', 'Bufetes Legales'),
  ('consulting', 'Consultorías'),
  ('healthcare', 'Servicios de Salud'),
  ('finance', 'Servicios Financieros'),
  ('general', 'Uso General');

-- Insertar configuración por defecto
INSERT INTO public.app_customization (
  company_type_id,
  theme_name,
  app_title,
  app_subtitle,
  welcome_message
) 
SELECT 
  id,
  'default',
  'Sistema de Gestión Documental Digital',
  'Crea plantillas, genera documentos PDF interactivos y gestiona firmas digitales',
  'Bienvenido al sistema de gestión documental más completo'
FROM public.company_types 
WHERE name = 'general';

-- Crear buckets de storage para customization
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customization', 'customization', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para customization
CREATE POLICY "Admin can upload customization files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'customization' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Everyone can view customization files" ON storage.objects
  FOR SELECT USING (bucket_id = 'customization');

CREATE POLICY "Admin can update customization files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'customization' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin can delete customization files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'customization' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
