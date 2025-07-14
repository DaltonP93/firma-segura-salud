
-- Create API configurations table
CREATE TABLE public.api_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name text NOT NULL UNIQUE,
  service_type text NOT NULL,
  api_key text,
  additional_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_service_type CHECK (service_type IN ('email', 'whatsapp', 'sms', 'other'))
);

-- Enable RLS
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for API configurations
CREATE POLICY "Admin can manage API configurations" 
  ON public.api_configurations 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  ));

-- Create function to get API configuration by service name
CREATE OR REPLACE FUNCTION public.get_api_config(service_name text)
RETURNS TABLE(api_key text, additional_config jsonb, is_active boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT api_configurations.api_key, api_configurations.additional_config, api_configurations.is_active
  FROM public.api_configurations
  WHERE api_configurations.service_name = $1 AND api_configurations.is_active = true
  LIMIT 1;
$$;

-- Insert default configurations
INSERT INTO public.api_configurations (service_name, service_type, additional_config) VALUES
('resend', 'email', '{"from_email": "noreply@example.com", "from_name": "Sistema de Firmas"}'),
('whatsapp_business', 'whatsapp', '{"phone_number_id": "", "template_namespace": ""}')
ON CONFLICT (service_name) DO NOTHING;

-- Add updated_at trigger
CREATE TRIGGER update_api_configurations_updated_at
  BEFORE UPDATE ON public.api_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
