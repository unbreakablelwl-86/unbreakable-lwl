-- New Focus Games: Flow State, Mental Maths, Focus Timer
-- Score tables for global leaderboards

-- =====================
-- 1. flow_scores
-- =====================
CREATE TABLE IF NOT EXISTS public.flow_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  max_speed REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.flow_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flow scores"
  ON public.flow_scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own flow scores"
  ON public.flow_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own flow scores"
  ON public.flow_scores FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_flow_scores_score ON public.flow_scores (score DESC);
CREATE INDEX idx_flow_scores_user ON public.flow_scores (user_id);

-- =====================
-- 2. mental_maths_scores
-- =====================
CREATE TABLE IF NOT EXISTS public.mental_maths_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  solved INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.mental_maths_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mental maths scores"
  ON public.mental_maths_scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own mental maths scores"
  ON public.mental_maths_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mental maths scores"
  ON public.mental_maths_scores FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_mental_maths_scores_score ON public.mental_maths_scores (score DESC);
CREATE INDEX idx_mental_maths_scores_user ON public.mental_maths_scores (user_id);

-- =====================
-- 3. focus_timer_scores
-- =====================
CREATE TABLE IF NOT EXISTS public.focus_timer_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.focus_timer_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view focus timer scores"
  ON public.focus_timer_scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own focus timer scores"
  ON public.focus_timer_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own focus timer scores"
  ON public.focus_timer_scores FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_focus_timer_scores_score ON public.focus_timer_scores (score DESC);
CREATE INDEX idx_focus_timer_scores_user ON public.focus_timer_scores (user_id);
