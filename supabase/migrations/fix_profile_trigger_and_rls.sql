-- Migration: ensure profile auto-creation trigger exists and fix RLS on profiles

-- 1. Re-create the trigger function (SECURITY DEFINER bypasses RLS so it can
--    always write to profiles regardless of the calling user's permissions).
--    ON CONFLICT DO NOTHING makes it safe to re-run on existing rows.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, date_of_birth)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    NULLIF(new.raw_user_meta_data->>'date_of_birth', '')::DATE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop and re-attach the trigger so it definitely exists.
--    DROP IF EXISTS means this is safe to run even if the trigger is missing.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill: create a profiles row for any auth user who slipped through
--    without one (anyone who signed up while the trigger was absent).
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 4. Add a missing INSERT policy so users can write their own row.
--    This is a safety net for the upsert path (e.g. Insurance, Profile pages)
--    in case a profile row doesn't exist for any reason.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
