-- =============================================================================
-- GymTracker Pro – Tabela de Anamnese (questionário pós-cadastro)
-- =============================================================================
-- Execute no SQL Editor do Supabase após 001_initial_schema.sql
-- =============================================================================

CREATE TABLE public.anamnesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anamnesis_select_own"
  ON public.anamnesis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "anamnesis_insert_own"
  ON public.anamnesis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "anamnesis_update_own"
  ON public.anamnesis FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "anamnesis_delete_own"
  ON public.anamnesis FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER anamnesis_updated_at
  BEFORE UPDATE ON public.anamnesis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
