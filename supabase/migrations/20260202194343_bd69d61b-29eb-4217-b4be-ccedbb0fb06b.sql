-- ===========================================
-- CREAR BUCKETS DE STORAGE
-- ===========================================

-- Bucket para plantillas PDF
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-templates',
  'pdf-templates',
  true,
  52428800, -- 50MB
  ARRAY['application/pdf']::text[]
);

-- Bucket para documentos generados
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg']::text[]
);

-- Bucket para documentos firmados
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signed-documents',
  'signed-documents',
  false, -- Privado por seguridad
  52428800,
  ARRAY['application/pdf', 'image/png', 'image/jpeg']::text[]
);

-- Bucket para firmas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures',
  'signatures',
  false, -- Privado
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml']::text[]
);

-- Bucket para avatares de usuario
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
);

-- ===========================================
-- POLÍTICAS RLS PARA STORAGE
-- ===========================================

-- PDF Templates - Lectura pública, escritura autenticada
CREATE POLICY "pdf_templates_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdf-templates');

CREATE POLICY "pdf_templates_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pdf-templates');

CREATE POLICY "pdf_templates_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'pdf-templates');

CREATE POLICY "pdf_templates_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'pdf-templates');

-- Documents - Lectura pública, escritura autenticada
CREATE POLICY "documents_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "documents_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "documents_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "documents_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents');

-- Signed Documents - Solo usuarios autenticados
CREATE POLICY "signed_documents_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'signed-documents');

CREATE POLICY "signed_documents_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'signed-documents');

CREATE POLICY "signed_documents_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'signed-documents');

CREATE POLICY "signed_documents_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'signed-documents');

-- Signatures - Solo usuarios autenticados
CREATE POLICY "signatures_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'signatures');

CREATE POLICY "signatures_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "signatures_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'signatures');

-- Avatars - Lectura pública, usuarios pueden gestionar sus propios avatares
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);