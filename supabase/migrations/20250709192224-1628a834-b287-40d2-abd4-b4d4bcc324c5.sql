-- Add expiration and security fields to signers table (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signers' AND column_name = 'expires_at') THEN
        ALTER TABLE signers ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signers' AND column_name = 'is_expired') THEN
        ALTER TABLE signers ADD COLUMN is_expired BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signers' AND column_name = 'access_attempts') THEN
        ALTER TABLE signers ADD COLUMN access_attempts INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signers' AND column_name = 'max_attempts') THEN
        ALTER TABLE signers ADD COLUMN max_attempts INTEGER DEFAULT 5;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signers' AND column_name = 'last_accessed_at') THEN
        ALTER TABLE signers ADD COLUMN last_accessed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END$$;

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_signers_expires_at ON signers(expires_at);
CREATE INDEX IF NOT EXISTS idx_signers_email ON signers(email);

-- Add security tracking to signature_requests
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signature_requests' AND column_name = 'security_level') THEN
        ALTER TABLE signature_requests ADD COLUMN security_level TEXT DEFAULT 'standard';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signature_requests' AND column_name = 'requires_otp') THEN
        ALTER TABLE signature_requests ADD COLUMN requires_otp BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signature_requests' AND column_name = 'allowed_domains') THEN
        ALTER TABLE signature_requests ADD COLUMN allowed_domains TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signature_requests' AND column_name = 'ip_restrictions') THEN
        ALTER TABLE signature_requests ADD COLUMN ip_restrictions TEXT[];
    END IF;
END$$;

-- Create function to check token validity
CREATE OR REPLACE FUNCTION public.is_token_valid(token_value UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    signer_record RECORD;
BEGIN
    SELECT * INTO signer_record 
    FROM signers 
    WHERE access_token = token_value;
    
    -- Check if token exists
    IF signer_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if token is expired
    IF signer_record.expires_at IS NOT NULL AND signer_record.expires_at < NOW() THEN
        UPDATE signers 
        SET is_expired = TRUE 
        WHERE access_token = token_value;
        RETURN FALSE;
    END IF;
    
    -- Check if max attempts exceeded
    IF signer_record.access_attempts >= signer_record.max_attempts THEN
        RETURN FALSE;
    END IF;
    
    -- Check if already signed
    IF signer_record.status = 'signed' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Create function to increment access attempts
CREATE OR REPLACE FUNCTION public.increment_access_attempts(token_value UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE signers 
    SET access_attempts = access_attempts + 1,
        last_accessed_at = NOW()
    WHERE access_token = token_value;
END;
$$;

-- Add WhatsApp integration fields to notification_logs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_logs' AND column_name = 'whatsapp_message_id') THEN
        ALTER TABLE notification_logs ADD COLUMN whatsapp_message_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_logs' AND column_name = 'whatsapp_status') THEN
        ALTER TABLE notification_logs ADD COLUMN whatsapp_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_logs' AND column_name = 'phone_number') THEN
        ALTER TABLE notification_logs ADD COLUMN phone_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_logs' AND column_name = 'template_name') THEN
        ALTER TABLE notification_logs ADD COLUMN template_name TEXT;
    END IF;
END$$;