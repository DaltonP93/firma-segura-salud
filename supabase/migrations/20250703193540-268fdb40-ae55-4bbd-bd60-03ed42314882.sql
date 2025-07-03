
-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true);

-- Create storage policies for profile images
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage bucket for background images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('background-images', 'background-images', true);

-- Create storage policies for background images
CREATE POLICY "Admins can upload background images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'background-images' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Everyone can view background images"
ON storage.objects FOR SELECT
USING (bucket_id = 'background-images');

CREATE POLICY "Admins can update background images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'background-images' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can delete background images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'background-images' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Create storage bucket for company icons
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-icons', 'company-icons', true);

-- Create storage policies for company icons
CREATE POLICY "Admins can upload company icons"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-icons' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Everyone can view company icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-icons');

CREATE POLICY "Admins can update company icons"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-icons' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can delete company icons"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-icons' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);
