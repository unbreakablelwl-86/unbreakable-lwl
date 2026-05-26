-- Focus Games Expansion: Reaction Trainer, Memory Matrix, Pattern Breaker
-- Score tables for leaderboards (mirrors snake_scores pattern)

-- =====================
-- 1. reaction_scores
-- =====================
CREATE TABLE IF NOT EXISTS public.reaction_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  best_reaction_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.reaction_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reaction scores"
  ON public.reaction_scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own reaction scores"
  ON public.reaction_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reaction scores"
  ON public.reaction_scores FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_reaction_scores_score ON public.reaction_scores (score DESC);
CREATE INDEX idx_reaction_scores_user ON public.reaction_scores (user_id);

-- =====================
-- 2. memory_matrix_scores
-- =====================
CREATE TABLE IF NOT EXISTS public.memory_matrix_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  max_level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.memory_matrix_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view memory matrix scores"
  ON public.memory_matrix_scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own memory matrix scores"
  ON public.memory_matrix_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memory matrix scores"
  ON public.memory_matrix_scores FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_memory_matrix_scores_score ON public.memory_matrix_scores (score DESC);
CREATE INDEX idx_memory_matrix_scores_user ON public.memory_matrix_scores (user_id);

-- =====================
-- 3. pattern_breaker_scores
-- =====================
CREATE TABLE IF NOT EXISTS public.pattern_breaker_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  max_sequence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.pattern_breaker_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pattern breaker scores"
  ON public.pattern_breaker_scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own pattern breaker scores"
  ON public.pattern_breaker_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pattern breaker scores"
  ON public.pattern_breaker_scores FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_pattern_breaker_scores_score ON public.pattern_breaker_scores (score DESC);
CREATE INDEX idx_pattern_breaker_scores_user ON public.pattern_breaker_scores (user_id);
