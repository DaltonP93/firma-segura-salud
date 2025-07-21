-- Final RLS policy update for production
-- Remove the temporary logging triggers and update policies to be more robust

-- Remove debugging functions and triggers
DROP TRIGGER IF EXISTS log_document_creation_trigger ON public.documents;
DROP FUNCTION IF EXISTS public.log_document_creation();

-- Update the documents INSERT policy to be more robust
DROP POLICY IF EXISTS "Users can create documents" ON public.documents;

CREATE POLICY "Users can create documents" ON public.documents
FOR INSERT 
WITH CHECK (
  -- Ensure user is authenticated and created_by matches current user
  auth.uid() IS NOT NULL AND auth.uid() = created_by
);

-- Verify that auth.uid() returns valid UUIDs for authenticated users
-- This policy will only allow document creation when:
-- 1. User is properly authenticated (auth.uid() IS NOT NULL)
-- 2. The created_by field matches the authenticated user's ID
-- 3. The user exists in the auth.users table (implicitly validated by Supabase auth)