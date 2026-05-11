-- Migration: fix handle_new_user() trigger failing with null email
--
-- Root cause: auth.users.email can be NULL at AFTER INSERT trigger time for
-- some Supabase auth flows (e.g. email-confirmation pending). The email column
-- on profiles is NOT NULL, so the insert fails.
--
-- Fix:
--   1. Drop the NOT NULL constraint on profiles.email (auth.users is the
--      source of truth for email; the column here is denormalized read-only data).
--   2. Update the trigger to use COALESCE so it picks up the email from either
--      NEW.email or raw_user_meta_data, whichever is populated first.

-- 1. Allow email to be null on profiles
ALTER TABLE public.profiles
  ALTER COLUMN email DROP NOT NULL;

-- 2. Re-create trigger function with COALESCE email fallback
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, date_of_birth)
  VALUES (
    new.id,
    COALESCE(new.email, new.raw_user_meta_data->>'email'),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    NULLIF(new.raw_user_meta_data->>'date_of_birth', '')::DATE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger itself is already attached from the previous migration;
-- re-create it here in case this migration is run in isolation.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
