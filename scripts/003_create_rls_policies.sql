-- Row Level Security policies implementing deny-by-default with role-based access
-- Viewers: read-only access, Admins: full CRUD

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

-- User Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Assets RLS Policies
CREATE POLICY "Authenticated users can view assets"
  ON public.assets FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert assets"
  ON public.assets FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Only admins can update assets"
  ON public.assets FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Only admins can delete assets"
  ON public.assets FOR DELETE
  USING (public.get_user_role() = 'admin');

-- Sessions RLS Policies
CREATE POLICY "Authenticated users can view sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Only admins can update sessions"
  ON public.sessions FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Only admins can delete sessions"
  ON public.sessions FOR DELETE
  USING (public.get_user_role() = 'admin');

-- Readings RLS Policies
CREATE POLICY "Users can view readings"
  ON public.readings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert readings"
  ON public.readings FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Service role can insert readings"
  ON public.readings FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Only admins can update readings"
  ON public.readings FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Only admins can delete readings"
  ON public.readings FOR DELETE
  USING (public.get_user_role() = 'admin');
