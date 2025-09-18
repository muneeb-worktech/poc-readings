-- Create an admin user for testing
-- This script should be run after the initial setup to create a test admin account

-- First, we need to manually create an admin user profile
-- Note: This assumes you've already created a user through the signup process
-- Replace the email and user_id with actual values after creating the user

-- Example of updating a user to admin role (replace with actual user ID)
-- UPDATE public.user_profiles 
-- SET role = 'admin' 
-- WHERE email = 'admin@example.com';

-- For demo purposes, let's create a function to promote users to admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.user_profiles 
  SET role = 'admin', updated_at = NOW()
  WHERE email = user_email;
$$;

-- Usage: SELECT public.promote_user_to_admin('your-email@example.com');
