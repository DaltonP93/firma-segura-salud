
-- Make dalton9302@gmail.com a super admin
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'dalton9302@gmail.com';

-- Add username column to profiles table for login support
ALTER TABLE profiles 
ADD COLUMN username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- Add more font families to app_customization (updating default enum-like behavior)
-- We'll handle this in the application code by expanding the font options

-- Add profile_image_url column to profiles for user avatars
ALTER TABLE profiles 
ADD COLUMN profile_image_url TEXT;

-- Update app_customization table to support more customization options
ALTER TABLE app_customization 
ADD COLUMN header_background_color TEXT DEFAULT '#ffffff',
ADD COLUMN sidebar_background_color TEXT DEFAULT '#f8fafc',
ADD COLUMN button_style TEXT DEFAULT 'rounded',
ADD COLUMN card_shadow_style TEXT DEFAULT 'medium';

-- Create a function to get user by username or email (for login)
CREATE OR REPLACE FUNCTION public.get_user_by_username_or_email(identifier text)
RETURNS TABLE(user_id uuid, email text, username text, full_name text, role text)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id, email, username, full_name, role
  FROM profiles
  WHERE email = identifier OR username = identifier
  LIMIT 1;
$$;
