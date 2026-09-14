-- See prior migration comment (harden_pb_leaderboard_views, which failed with
-- 42P16 "cannot drop columns from view" because CREATE OR REPLACE VIEW
-- cannot narrow a view's column list -- DROP + CREATE is required instead).
-- Confirmed no other view depends on pb_leaderboard or run_pb_leaderboard
-- before dropping (checked pg_depend/pg_rewrite).

DROP VIEW IF EXISTS public.pb_leaderboard;
DROP VIEW IF EXISTS public.run_pb_leaderboard;

CREATE VIEW public.pb_leaderboard AS
WITH user_max_lifts AS (
  SELECT
    el.user_id,
    el.exercise_name,
    max(el.weight_kg) AS estimated_1rm,
    max(el.created_at) AS achieved_at
  FROM exercise_logs el
  WHERE el.weight_kg > 0::numeric
    AND COALESCE(el.is_auto_tracked, false) = false
  GROUP BY el.user_id, el.exercise_name
), ranked AS (
  SELECT
    uml.user_id,
    uml.exercise_name,
    uml.estimated_1rm,
    uml.achieved_at,
    p.display_name,
    p.avatar_url,
    CASE
      WHEN p.date_of_birth IS NULL THEN 'unknown'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 18 AND 24 THEN '18-24'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 25 AND 34 THEN '25-34'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 35 AND 44 THEN '35-44'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 45 AND 54 THEN '45-54'::text
      ELSE '55+'::text
    END AS age_category,
    count(*) OVER (PARTITION BY uml.exercise_name) AS total_in_category,
    rank() OVER (PARTITION BY uml.exercise_name ORDER BY uml.estimated_1rm DESC) AS rank_in_category,
    percent_rank() OVER (PARTITION BY uml.exercise_name ORDER BY uml.estimated_1rm) * 100::double precision AS percentile
  FROM user_max_lifts uml
  JOIN profiles p ON p.user_id = uml.user_id
)
SELECT user_id, exercise_name, estimated_1rm, achieved_at, display_name, avatar_url,
       age_category, total_in_category, rank_in_category, percentile
FROM ranked;

COMMENT ON VIEW public.pb_leaderboard IS
  'Global cross-user PB leaderboard. Intentionally SECURITY DEFINER to bypass exercise_logs/profiles RLS so rankings span all users, not just rows the caller could already see -- reviewed 2026-09-05, do not flip to security_invoker without re-checking exercise_logs RLS policies. Raw date_of_birth/sex are deliberately NOT exposed; only the derived age_category band is.';

CREATE VIEW public.run_pb_leaderboard AS
WITH ranked AS (
  SELECT
    pr.user_id,
    pr.distance_type,
    pr.time_seconds,
    pr.distance_km,
    pr.pace_per_km_seconds,
    pr.achieved_at,
    p.display_name,
    p.avatar_url,
    CASE
      WHEN p.date_of_birth IS NULL THEN 'unknown'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 18 AND 24 THEN '18-24'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 25 AND 34 THEN '25-34'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 35 AND 44 THEN '35-44'::text
      WHEN EXTRACT(year FROM age(now(), p.date_of_birth::timestamp with time zone)) BETWEEN 45 AND 54 THEN '45-54'::text
      ELSE '55+'::text
    END AS age_category,
    count(*) OVER (PARTITION BY pr.distance_type) AS total_in_category,
    rank() OVER (PARTITION BY pr.distance_type ORDER BY pr.time_seconds) AS rank_in_category,
    percent_rank() OVER (PARTITION BY pr.distance_type ORDER BY pr.time_seconds DESC) * 100::double precision AS percentile
  FROM personal_records pr
  JOIN profiles p ON p.user_id = pr.user_id
)
SELECT user_id, distance_type, time_seconds, distance_km, pace_per_km_seconds, achieved_at,
       display_name, avatar_url, age_category, total_in_category, rank_in_category, percentile
FROM ranked;

-- run_pb_leaderboard is backed by personal_records, which already has a
-- "viewable by everyone" RLS policy, so it can safely run as the caller
-- (security_invoker) instead of the classic owner-privilege view default.
ALTER VIEW public.run_pb_leaderboard SET (security_invoker = on);

COMMENT ON VIEW public.run_pb_leaderboard IS
  'Global cross-user running-PB leaderboard. Runs as security_invoker=on because personal_records has a public "viewable by everyone" RLS policy, so no DEFINER bypass is needed. Raw date_of_birth/sex are deliberately NOT exposed; only the derived age_category band is.';
