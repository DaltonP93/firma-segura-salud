
-- Update the profiles table RLS policy to allow admins to view all profiles
-- First, create a security definer function to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create new policies that allow users to view their own profile AND admins to view all profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR 
  public.get_current_user_role() IN ('admin', 'super_admin')
);

-- Also allow admins to update any profile (for user management)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update profiles" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR 
  public.get_current_user_role() IN ('admin', 'super_admin')
);

-- Allow admins to delete profiles (for user management)
CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE USING (
  public.get_current_user_role() IN ('admin', 'super_admin')
);
