-- Add expiration and security fields to signers table
ALTER TABLE signers 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_expired BOOLEAN DEFAULT FALSE,
ADD COLUMN access_attempts INTEGER DEFAULT 0,
ADD COLUMN max_attempts INTEGER DEFAULT 5,
ADD COLUMN last_accessed_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX idx_signers_access_token ON signers(access_token);
CREATE INDEX idx_signers_expires_at ON signers(expires_at);
CREATE INDEX idx_signers_email ON signers(email);

-- Add security tracking to signature_requests
ALTER TABLE signature_requests
ADD COLUMN security_level TEXT DEFAULT 'standard',
ADD COLUMN requires_otp BOOLEAN DEFAULT FALSE,
ADD COLUMN allowed_domains TEXT[],
ADD COLUMN ip_restrictions TEXT[];

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

-- Create function to generate secure signing URL
CREATE OR REPLACE FUNCTION public.generate_secure_signing_url(
    signer_id UUID,
    base_url TEXT DEFAULT 'https://your-app.com',
    expiration_hours INTEGER DEFAULT 72
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    token_value UUID;
    signer_record RECORD;
BEGIN
    -- Get signer record
    SELECT * INTO signer_record FROM signers WHERE id = signer_id;
    
    IF signer_record IS NULL THEN
        RAISE EXCEPTION 'Signer not found';
    END IF;
    
    -- Generate new token if needed
    IF signer_record.access_token IS NULL THEN
        token_value := gen_random_uuid();
        UPDATE signers 
        SET access_token = token_value,
            expires_at = NOW() + INTERVAL '1 hour' * expiration_hours
        WHERE id = signer_id;
    ELSE
        token_value := signer_record.access_token;
    END IF;
    
    RETURN base_url || '/sign/' || token_value::TEXT;
END;
$$;

-- Add WhatsApp integration fields to notification_logs
ALTER TABLE notification_logs
ADD COLUMN whatsapp_message_id TEXT,
ADD COLUMN whatsapp_status TEXT,
ADD COLUMN phone_number TEXT,
ADD COLUMN template_name TEXT;

-- Create function to clean expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE signers 
    SET is_expired = TRUE 
    WHERE expires_at < NOW() AND is_expired = FALSE;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$;