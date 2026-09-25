-- GDPR consent audit trail + age-gate enforcement (OPEN_QUESTIONS.md #6).
--
-- Terms.tsx already states "You must be at least 16 years old to create an account," and
-- the signup form already collects date_of_birth -- but nothing anywhere enforced that
-- minimum, and consent to the Terms/Privacy Policy was only a client-side checkbox that
-- was never recorded server-side. This migration closes both gaps without touching any
-- existing data: it only affects new signups and future date_of_birth updates.
--
-- NOTE: written to keep the repo in sync with the live schema (OPEN_QUESTIONS.md #10). As
-- of writing, this has NOT yet been applied to the live database -- that requires a
-- separate, explicitly-approved production-deploy step.

-- ── Consent audit trail ──
-- terms_version / health_data_consent_version store the Privacy/Terms page's own
-- "Last updated" string at the moment of acceptance, so a later policy change doesn't
-- silently look like existing users already agreed to it.
alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists health_data_consent_at timestamptz,
  add column if not exists health_data_consent_version text;

comment on column public.profiles.terms_accepted_at is 'When the member accepted the Terms + Privacy Policy at signup. NULL for accounts created before this column existed.';
comment on column public.profiles.health_data_consent_at is 'Explicit, separate consent (UK GDPR Art. 9) to processing of health-related data (training/nutrition/wellbeing). NULL for accounts created before this column existed, or if consent was withdrawn.';

-- ── Age-gate enforcement (16+, matching the live Terms.tsx copy) ──
-- A CHECK constraint can't reference now() (not immutable), so this is a trigger instead.
-- Fires only on INSERT or when date_of_birth is actually being set/changed -- existing
-- rows with a NULL or already-stored date_of_birth are never re-validated retroactively.
create or replace function public.enforce_minimum_signup_age()
returns trigger
language plpgsql
as $$
begin
  if NEW.date_of_birth is not null then
    if extract(year from age(now(), NEW.date_of_birth::timestamp with time zone)) < 16 then
      raise exception 'Members must be at least 16 years old.' using errcode = '23514';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists enforce_minimum_signup_age_trigger on public.profiles;
create trigger enforce_minimum_signup_age_trigger
  before insert or update of date_of_birth on public.profiles
  for each row
  execute function public.enforce_minimum_signup_age();
