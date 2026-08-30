-- UNBREAKABLE 86 — track whether the completion certificate email has been sent.
-- The tracker keeps running past day 86 (bonus streak days), so completed_at only
-- stamps once on the first crossing; this column guards the certificate email the
-- same way, so it fires exactly once per completed run, not on every later day.
alter table unbreakable86_enrolments
  add column if not exists certificate_sent_at timestamptz null;
