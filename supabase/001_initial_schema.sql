-- =============================================================================
-- GymTracker Pro – Schema inicial para Supabase
-- =============================================================================
-- Como usar: no dashboard do Supabase, abra SQL Editor → New query → cole
-- todo o conteúdo deste arquivo → Run.
--
-- Execute uma vez. Para rodar de novo (ex.: reset), apague antes as tabelas
-- na ordem inversa das FKs ou use "Drop all" no Table Editor.
-- =============================================================================

-- Extensão para UUID (já existe em projetos novos do Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Perfil do usuário (complementa auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT NOT NULL,
  birth_date DATE,
  height_cm NUMERIC(5,2),
  goal TEXT CHECK (goal IN ('emagrecer', 'ganhar_massa', 'condicionamento', 'forca', 'outros')),
  gender TEXT CHECK (gender IN ('M', 'F', 'outro')),
  avatar_url TEXT,
  plan_status TEXT DEFAULT 'active' CHECK (plan_status IN ('active', 'late', 'inactive')),
  weight_goal_kg NUMERIC(5,2),
  weekly_frequency INT CHECK (weekly_frequency >= 0 AND weekly_frequency <= 7),
  notes TEXT,
  injuries TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. Exercícios (por usuário)
-- -----------------------------------------------------------------------------
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('peito', 'costas', 'ombros', 'braços', 'pernas', 'abdômen', 'cardio', 'outros')),
  muscle_groups TEXT[] DEFAULT '{}',
  equipment TEXT NOT NULL CHECK (equipment IN ('barra', 'halteres', 'máquina', 'peso_livre', 'corpo', 'cabo', 'outros')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('iniciante', 'intermediário', 'avançado')),
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercises_all_own"
  ON public.exercises FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. Medidas corporais
-- -----------------------------------------------------------------------------
CREATE TABLE public.body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  chest_cm NUMERIC(5,2),
  waist_cm NUMERIC(5,2),
  hips_cm NUMERIC(5,2),
  left_arm_cm NUMERIC(5,2),
  right_arm_cm NUMERIC(5,2),
  left_thigh_cm NUMERIC(5,2),
  right_thigh_cm NUMERIC(5,2),
  neck_cm NUMERIC(5,2),
  shoulder_cm NUMERIC(5,2),
  body_fat_percent NUMERIC(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "body_measurements_all_own"
  ON public.body_measurements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. Treinos
-- -----------------------------------------------------------------------------
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  duration_min INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workouts_all_own"
  ON public.workouts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. Exercícios do treino (cada item = um exercício no treino, com várias séries)
-- -----------------------------------------------------------------------------
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  exercise_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_exercises_all_via_workout"
  ON public.workout_exercises FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 6. Séries (de cada exercício dentro do treino)
-- -----------------------------------------------------------------------------
CREATE TABLE public.workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  weight_kg NUMERIC(6,2) NOT NULL,
  reps INT NOT NULL,
  rest_seconds INT,
  notes TEXT
);

ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_sets_all_via_workout"
  ON public.workout_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workouts w ON w.id = we.workout_id
      WHERE we.id = workout_sets.workout_exercise_id AND w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workouts w ON w.id = we.workout_id
      WHERE we.id = workout_sets.workout_exercise_id AND w.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 7. Metas
-- -----------------------------------------------------------------------------
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('peso', 'medida', 'exercicio', 'volume', 'frequencia', 'outros')),
  target_value NUMERIC(12,2) NOT NULL,
  current_value NUMERIC(12,2),
  unit TEXT DEFAULT '',
  target_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'pausada', 'cancelada')),
  exercise_id UUID,
  exercise_name TEXT,
  measurement_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals_all_own"
  ON public.goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. Fotos de progresso (metadados; arquivo no Storage)
-- -----------------------------------------------------------------------------
CREATE TABLE public.progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('frontal', 'lateral_esquerda', 'lateral_direita', 'posterior', 'outros')),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_photos_all_own"
  ON public.progress_photos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. Trigger: criar perfil ao registrar usuário (Supabase Auth)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário')
  );
  RETURN NEW;
END;
$$;

-- Só cria o trigger se não existir (evita erro ao re-executar)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 10. Função para atualizar updated_at (opcional)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar updated_at em tabelas que têm a coluna
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER body_measurements_updated_at
  BEFORE UPDATE ON public.body_measurements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER progress_photos_updated_at
  BEFORE UPDATE ON public.progress_photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
