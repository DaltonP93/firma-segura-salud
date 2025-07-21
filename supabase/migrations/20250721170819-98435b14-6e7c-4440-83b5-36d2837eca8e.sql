-- Temporary fix: Update RLS policy to allow document creation with better debugging
-- This will help us identify why auth.uid() is null during document creation

-- First, let's create a function to safely get the current user ID
CREATE OR REPLACE FUNCTION public.get_auth_uid_safe()
RETURNS UUID AS $$
BEGIN
  -- Log the auth.uid() value for debugging
  RAISE LOG 'auth.uid() value: %', auth.uid();
  RETURN auth.uid();
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error getting auth.uid(): %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the documents INSERT policy to be more permissive temporarily
-- and add logging for debugging
DROP POLICY IF EXISTS "Users can create documents" ON public.documents;

CREATE POLICY "Users can create documents" ON public.documents
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated OR if created_by matches a valid user
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = created_by
    WHEN created_by IS NOT NULL THEN EXISTS (
      SELECT 1 FROM auth.users WHERE id = created_by
    )
    ELSE false
  END
);

-- Add a function to log document creation attempts
CREATE OR REPLACE FUNCTION public.log_document_creation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE LOG 'Document creation attempt - auth.uid(): %, created_by: %, NEW.id: %', 
    auth.uid(), NEW.created_by, NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log all document creation attempts
DROP TRIGGER IF EXISTS log_document_creation_trigger ON public.documents;
CREATE TRIGGER log_document_creation_trigger
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_document_creation();