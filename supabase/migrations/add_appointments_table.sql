-- Migration: add appointments table for Calendly webhook sync
-- Run this once in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.appointments (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID REFERENCES public.profiles(id),
  event_name           TEXT NOT NULL,
  start_time           TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time             TIMESTAMP WITH TIME ZONE,
  status               TEXT DEFAULT 'active' NOT NULL, -- 'active' | 'cancelled'
  invitee_email        TEXT NOT NULL,
  invitee_name         TEXT,
  location             TEXT,
  cancel_url           TEXT,
  reschedule_url       TEXT,
  calendly_event_uri   TEXT,
  calendly_invitee_uri TEXT UNIQUE,  -- unique so duplicate webhooks are safe
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON public.appointments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to appointments"
  ON public.appointments FOR ALL USING (public.is_admin());
