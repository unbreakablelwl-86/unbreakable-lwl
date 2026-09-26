-- Fix full account deletion: two tables had foreign keys to auth.users(id)
-- with no ON DELETE action (defaulting to NO ACTION/RESTRICT). That silently
-- broke full account deletion whenever the deleted user had a coaching
-- check-in (as coach or athlete) or was the leading bidder on a card
-- auction: auth.admin.deleteUser() would fail with a foreign key violation,
-- but by that point the calling edge function had already wiped the user's
-- other data — leaving a half-deleted auth.users row behind that still
-- owned the email address, so that person could never sign up again with
-- the same email.
--
-- Every other table with a foreign key to auth.users(id) already has
-- ON DELETE CASCADE or ON DELETE SET NULL, so fixing just these three
-- columns is sufficient to make full account deletion unconditionally
-- succeed for any user going forward.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'coaching_check_ins_coach_id_fkey'
               AND table_name = 'coaching_check_ins') THEN
    ALTER TABLE public.coaching_check_ins DROP CONSTRAINT coaching_check_ins_coach_id_fkey;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'coaching_check_ins_athlete_id_fkey'
               AND table_name = 'coaching_check_ins') THEN
    ALTER TABLE public.coaching_check_ins DROP CONSTRAINT coaching_check_ins_athlete_id_fkey;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'un_tunes_card_listings_current_bidder_id_fkey'
               AND table_name = 'un_tunes_card_listings') THEN
    ALTER TABLE public.un_tunes_card_listings DROP CONSTRAINT un_tunes_card_listings_current_bidder_id_fkey;
  END IF;
END $$;

-- coach_id must allow NULL to support ON DELETE SET NULL
ALTER TABLE public.coaching_check_ins ALTER COLUMN coach_id DROP NOT NULL;

-- coach_id: SET NULL rather than CASCADE, so an athlete's own submitted
-- check-in history (measurements, wellness scores, notes) survives their
-- coach's account later being deleted.
ALTER TABLE public.coaching_check_ins
  ADD CONSTRAINT coaching_check_ins_coach_id_fkey
  FOREIGN KEY (coach_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- athlete_id: the check-in is fundamentally the athlete's own record, so
-- when the athlete's account is deleted, delete it with them — matches
-- every other user-owned table in the schema.
ALTER TABLE public.coaching_check_ins
  ADD CONSTRAINT coaching_check_ins_athlete_id_fkey
  FOREIGN KEY (athlete_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- un_tunes_card_listings.current_bidder_id was already nullable; just needs
-- SET NULL so a deleted bidder's account doesn't block deletion or leave the
-- listing pointing at a nonexistent user.
ALTER TABLE public.un_tunes_card_listings
  ADD CONSTRAINT un_tunes_card_listings_current_bidder_id_fkey
  FOREIGN KEY (current_bidder_id) REFERENCES auth.users(id) ON DELETE SET NULL;
