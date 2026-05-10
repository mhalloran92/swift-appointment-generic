-- Migration: add messages table for two-way patient/admin communication

CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'patient')),
  body        TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT false NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Patients can read their own thread
CREATE POLICY "Patients can view own messages"
  ON public.messages FOR SELECT USING (auth.uid() = patient_id);

-- Patients can only insert messages as themselves
CREATE POLICY "Patients can send messages"
  ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = patient_id AND sender_role = 'patient'
  );

-- Patients can mark received (admin-sent) messages as read
CREATE POLICY "Patients can mark messages read"
  ON public.messages FOR UPDATE USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Admins have full access
CREATE POLICY "Admins have full access to messages"
  ON public.messages FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS messages_patient_id_idx ON public.messages(patient_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx  ON public.messages(created_at DESC);
