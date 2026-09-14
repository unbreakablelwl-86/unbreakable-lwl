-- _tts_debug_log is a temporary internal diagnostic table (see supabase/functions/breathing-tts).
-- It is only ever written to via the edge function's service-role client, which bypasses RLS,
-- so enabling RLS with no policies has zero functional impact on that write path — it simply
-- closes off anon/authenticated read/write access via PostgREST, which is the intended fix for
-- the "RLS Disabled in Public" advisory.
ALTER TABLE public._tts_debug_log ENABLE ROW LEVEL SECURITY;
