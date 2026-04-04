-- SUPABASE DATABASE SETUP SCRIPT
-- Copy and paste this into the Supabase SQL Editor to set up the foundation for Kozlowski Chiropractic Booking System

-- ==========================================
-- 1. Create Custom Types
-- ==========================================
CREATE TYPE user_role AS ENUM ('user', 'client', 'admin', 'banned');
CREATE TYPE session_status AS ENUM ('active', 'cancelled', 'completed');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'completed');

-- ==========================================
-- 2. Create Tables
-- ==========================================

-- Profiles (extends Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Session Types (Templates for services)
CREATE TABLE IF NOT EXISTS public.session_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  pricing NUMERIC NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sessions (Actual scheduled instances)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type_id UUID REFERENCES public.session_types(id) NOT NULL,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  max_slots INTEGER NOT NULL DEFAULT 1,
  booked_slots INTEGER NOT NULL DEFAULT 0,
  status session_status DEFAULT 'active'::session_status NOT NULL,
  cancel_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  session_id UUID REFERENCES public.sessions(id) NOT NULL,
  status booking_status DEFAULT 'confirmed'::booking_status NOT NULL,
  cancel_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Availability Rules (For recurring schedules)
CREATE TABLE IF NOT EXISTS public.availability_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- History / Audit Logs
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.booking_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id),
  action TEXT NOT NULL, -- e.g., 'created', 'cancelled'
  changed_by_user_id UUID REFERENCES public.profiles(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.session_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id),
  changes TEXT NOT NULL, -- JSON or text describing what changed
  changed_by_user_id UUID REFERENCES public.profiles(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- 3. Triggers
-- ==========================================

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to elevate user to 'client' upon their first confirmed booking
CREATE OR REPLACE FUNCTION public.elevate_to_client_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'client'::user_role
  WHERE id = NEW.user_id AND role = 'user'::user_role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER update_role_on_first_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION public.elevate_to_client_on_booking();


-- ==========================================
-- 4. Row Level Security (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;

-- Helper Function for Admin Check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" 
ON public.profiles FOR ALL USING (public.is_admin());

-- Session Types Policies
CREATE POLICY "Anyone can view session types" 
ON public.session_types FOR SELECT USING (true);

CREATE POLICY "Admins can manage session types" 
ON public.session_types FOR ALL USING (public.is_admin());

-- Sessions Policies
CREATE POLICY "Anyone can view active sessions" 
ON public.sessions FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage sessions" 
ON public.sessions FOR ALL USING (public.is_admin());

-- Bookings Policies
CREATE POLICY "Users can view own bookings" 
ON public.bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" 
ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings (e.g. cancel)" 
ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings" 
ON public.bookings FOR ALL USING (public.is_admin());

-- Availability Rules Policies
CREATE POLICY "Admins can manage availability rules" 
ON public.availability_rules FOR ALL USING (public.is_admin());

-- History Tables Policies
CREATE POLICY "Admins can view history" 
ON public.login_history FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view booking history" 
ON public.booking_history FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view session history" 
ON public.session_history FOR SELECT USING (public.is_admin());
