-- Migration: add is_existing_patient flag to profiles
-- Run this once in the Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_existing_patient BOOLEAN DEFAULT false;
