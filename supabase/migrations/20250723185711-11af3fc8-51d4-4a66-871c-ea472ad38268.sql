
-- Fix documents status constraint to allow all valid statuses
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_check;

-- Add proper status constraint with all valid values
ALTER TABLE public.documents ADD CONSTRAINT documents_status_check 
CHECK (status IN ('draft', 'pending_signature', 'sent', 'opened', 'signed', 'completed', 'expired', 'cancelled'));

-- Also fix sales_requests status constraint to ensure consistency
ALTER TABLE public.sales_requests DROP CONSTRAINT IF EXISTS sales_requests_status_check;

-- Add proper status constraint for sales requests
ALTER TABLE public.sales_requests ADD CONSTRAINT sales_requests_status_check 
CHECK (status IN ('draft', 'pending_health_declaration', 'pending_signature', 'completed', 'rejected', 'cancelled'));

-- Add missing sequence if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'document_number_seq') THEN
        CREATE SEQUENCE document_number_seq START 1;
    END IF;
END $$;

-- Add template_id to sales_requests for template association
ALTER TABLE public.sales_requests 
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.document_templates(id);

-- Add signed_pdf_url to documents for proper download functionality
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS signed_pdf_url text;

-- Create index for better performance on template lookups
CREATE INDEX IF NOT EXISTS idx_sales_requests_template_id ON public.sales_requests(template_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_signature_requests_status ON public.signature_requests(status);
