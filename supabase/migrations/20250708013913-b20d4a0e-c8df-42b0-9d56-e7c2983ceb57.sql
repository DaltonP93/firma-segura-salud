-- Phase 1: Enhanced Database Structure for Electronic Signature System

-- Create signature_requests table for managing signature workflows
CREATE TABLE public.signature_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'in_progress', 'completed', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create signers table for managing individual signers in a signature request
CREATE TABLE public.signers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signature_request_id UUID REFERENCES signature_requests(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'signer' CHECK (role IN ('signer', 'beneficiary', 'witness', 'representative')),
  signing_order INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'signed', 'declined', 'expired')),
  access_token UUID DEFAULT gen_random_uuid() UNIQUE,
  signed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}'::jsonb,
  signature_data TEXT,
  signature_type TEXT DEFAULT 'electronic' CHECK (signature_type IN ('electronic', 'biometric', 'digital_certificate')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create signature_fields table for defining signature positions in documents
CREATE TABLE public.signature_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  signer_id UUID REFERENCES signers(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL DEFAULT 'signature' CHECK (field_type IN ('signature', 'initials', 'date', 'text', 'checkbox')),
  page_number INTEGER NOT NULL DEFAULT 1,
  x_position DECIMAL(10,6) NOT NULL,
  y_position DECIMAL(10,6) NOT NULL,
  width DECIMAL(10,6) NOT NULL DEFAULT 150.0,
  height DECIMAL(10,6) NOT NULL DEFAULT 50.0,
  is_required BOOLEAN DEFAULT true,
  placeholder_text TEXT,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document_events table for tracking all document activities
CREATE TABLE public.document_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  signer_id UUID REFERENCES signers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'sent', 'opened', 'signed', 'declined', 'expired', 'reminded', 'completed')),
  event_data JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_logs table for tracking sent notifications
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signature_request_id UUID REFERENCES signature_requests(id) ON DELETE CASCADE NOT NULL,
  signer_id UUID REFERENCES signers(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'whatsapp', 'push')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  message_content TEXT,
  external_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for signature_requests
CREATE POLICY "Users can create signature requests" 
  ON public.signature_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own signature requests" 
  ON public.signature_requests 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can update own signature requests" 
  ON public.signature_requests 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- RLS Policies for signers
CREATE POLICY "Users can manage signers for own signature requests" 
  ON public.signers 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM signature_requests 
    WHERE signature_requests.id = signers.signature_request_id 
    AND signature_requests.created_by = auth.uid()
  ));

CREATE POLICY "Signers can view own signer record via access token" 
  ON public.signers 
  FOR SELECT 
  USING (true); -- We'll handle access token validation in the application

-- RLS Policies for signature_fields
CREATE POLICY "Users can manage signature fields for own documents" 
  ON public.signature_fields 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = signature_fields.document_id 
    AND documents.created_by = auth.uid()
  ));

-- RLS Policies for document_events
CREATE POLICY "Users can create document events" 
  ON public.document_events 
  FOR INSERT 
  WITH CHECK (true); -- Events can be created by anyone with proper access

CREATE POLICY "Users can view events for own documents" 
  ON public.document_events 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = document_events.document_id 
    AND documents.created_by = auth.uid()
  ));

-- RLS Policies for notification_logs
CREATE POLICY "Users can manage notification logs for own signature requests" 
  ON public.notification_logs 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM signature_requests 
    WHERE signature_requests.id = notification_logs.signature_request_id 
    AND signature_requests.created_by = auth.uid()
  ));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_signature_requests_updated_at
  BEFORE UPDATE ON public.signature_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_signers_updated_at
  BEFORE UPDATE ON public.signers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_signature_fields_updated_at
  BEFORE UPDATE ON public.signature_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_signature_requests_document_id ON signature_requests(document_id);
CREATE INDEX idx_signature_requests_created_by ON signature_requests(created_by);
CREATE INDEX idx_signature_requests_status ON signature_requests(status);

CREATE INDEX idx_signers_signature_request_id ON signers(signature_request_id);
CREATE INDEX idx_signers_access_token ON signers(access_token);
CREATE INDEX idx_signers_email ON signers(email);
CREATE INDEX idx_signers_status ON signers(status);

CREATE INDEX idx_signature_fields_document_id ON signature_fields(document_id);
CREATE INDEX idx_signature_fields_signer_id ON signature_fields(signer_id);

CREATE INDEX idx_document_events_document_id ON document_events(document_id);
CREATE INDEX idx_document_events_signer_id ON document_events(signer_id);
CREATE INDEX idx_document_events_timestamp ON document_events(timestamp);

CREATE INDEX idx_notification_logs_signature_request_id ON notification_logs(signature_request_id);
CREATE INDEX idx_notification_logs_signer_id ON notification_logs(signer_id);

-- Add some sample signature field types and improve documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS signature_request_id UUID REFERENCES signature_requests(id);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS total_signers INTEGER DEFAULT 0;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS completed_signers INTEGER DEFAULT 0;