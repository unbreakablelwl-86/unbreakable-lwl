-- Schedules the jj-daily-habit-track edge function to run once a day via
-- pg_cron, so JJ's own dev account's UNBREAKABLE 86 Daily 7 gets logged
-- automatically every day going forward — mirroring the pattern already
-- used for the Chester QA account's chester-daily-update-daily job (same
-- edge-function + pg_cron mechanism, same 18:00 UTC time), but scoped down
-- per JJ's explicit request: no training/cardio logging, no University
-- progression, and no posting to the social timeline. It only ever banks
-- a genuine full 7/7 day.
--
-- This migration documents a cron job that was already applied directly
-- to the live database via mcp__Supabase__apply_migration on 2026-09-26
-- (result: {"success":true}); it is captured here as a tracked migration
-- file for recoverability/consistency, matching every other schema change
-- made this session. cron.schedule() is idempotent on jobname, so re-running
-- this (e.g. against a fresh environment) is safe.
--
-- Uses the project's publishable anon key (safe to commit — it is a public,
-- RLS-scoped key, not a service-role secret) as the Bearer token, matching
-- every other net.http_post-based cron job already in this project.

SELECT cron.schedule(
  'jj-u86-daily-track-daily',
  '0 18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://vlwcoqilwyfcrsxodtdx.supabase.co/functions/v1/jj-daily-habit-track',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd2NvcWlsd3lmY3JzeG9kdGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MTY3NTEsImV4cCI6MjA5NDQ5Mjc1MX0.pvRKMzT2kNmwKoIzqqd3mr4klgG5FSVnhG6xB1Ds6cE", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
