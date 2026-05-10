-- Migration: add practice_settings table and doctor/office_manager sub-roles

-- 1. Extend user_role ENUM with admin sub-roles
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'doctor';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'office_manager';

-- 2. Update is_admin() so existing RLS policies cover all admin-tier roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin'::user_role, 'doctor'::user_role, 'office_manager'::user_role)
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Helper: only admin + doctor can write settings (not office_manager)
CREATE OR REPLACE FUNCTION public.can_edit_settings()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin'::user_role, 'doctor'::user_role)
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Singleton settings table (id = 1 enforced by CHECK)
CREATE TABLE IF NOT EXISTS public.practice_settings (
  id          INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  practice_name TEXT,
  address       TEXT,
  phone         TEXT,
  email         TEXT,
  calendly_url  TEXT,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.practice_settings ENABLE ROW LEVEL SECURITY;

-- All admin-tier roles can read
CREATE POLICY "Admin tier can read settings"
  ON public.practice_settings FOR SELECT
  USING (public.is_admin());

-- Only admin and doctor can insert/update
CREATE POLICY "Admins and doctors can insert settings"
  ON public.practice_settings FOR INSERT
  WITH CHECK (public.can_edit_settings());

CREATE POLICY "Admins and doctors can update settings"
  ON public.practice_settings FOR UPDATE
  USING (public.can_edit_settings());

-- 5. Seed default row (no-op if already exists)
INSERT INTO public.practice_settings (id, practice_name, address, phone, email, calendly_url)
VALUES (
  1,
  'Generic Appointment Services',
  '123 Business St, City, State 12345',
  '(555) 000-0000',
  'hello@example.com',
  'https://calendly.com/michael-halloranai/30min'
)
ON CONFLICT (id) DO NOTHING;
