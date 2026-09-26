-- Follow-up to fix_account_deletion_fk_blockers: a broader check turned up
-- SIX MORE tables with the exact same problem — foreign keys to
-- auth.users(id) with no ON DELETE action, silently blocking full account
-- deletion (and therefore blocking re-signup with the same email) for any
-- user with a row in them. These tables predate/duplicate newer ones
-- already fixed (e.g. pb_card_listings is an older sibling of
-- un_tunes_card_listings, still actively used by AuctionHouse.tsx;
-- coaching_session_bookings duplicates coach_hub_bookings; math_scores/
-- memory_scores/focus_sessions duplicate the newer game-score tables) but
-- still hold real rows, so they must be fixed rather than ignored.
--
-- Same pattern as before: CASCADE for a column that is the row's own
-- owner (deleting the account deletes their own record, like every other
-- user-owned table), SET NULL for a secondary reference (a coach on
-- someone else's booking, a bidder on someone else's listing) so deleting
-- one party doesn't wipe another user's data.
--
-- NOT YET APPLIED to the live database — pending JJ's go-ahead, same as
-- 20260926120000.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'coaching_session_bookings_athlete_id_fkey'
               AND table_name = 'coaching_session_bookings') THEN
    ALTER TABLE public.coaching_session_bookings DROP CONSTRAINT coaching_session_bookings_athlete_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'coaching_session_bookings_coach_id_fkey'
               AND table_name = 'coaching_session_bookings') THEN
    ALTER TABLE public.coaching_session_bookings DROP CONSTRAINT coaching_session_bookings_coach_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'focus_sessions_user_id_fkey'
               AND table_name = 'focus_sessions') THEN
    ALTER TABLE public.focus_sessions DROP CONSTRAINT focus_sessions_user_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'math_scores_user_id_fkey'
               AND table_name = 'math_scores') THEN
    ALTER TABLE public.math_scores DROP CONSTRAINT math_scores_user_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'memory_scores_user_id_fkey'
               AND table_name = 'memory_scores') THEN
    ALTER TABLE public.memory_scores DROP CONSTRAINT memory_scores_user_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'pb_card_listings_current_bidder_id_fkey'
               AND table_name = 'pb_card_listings') THEN
    ALTER TABLE public.pb_card_listings DROP CONSTRAINT pb_card_listings_current_bidder_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'pb_card_listings_seller_id_fkey'
               AND table_name = 'pb_card_listings') THEN
    ALTER TABLE public.pb_card_listings DROP CONSTRAINT pb_card_listings_seller_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'promo_redemptions_user_id_fkey'
               AND table_name = 'promo_redemptions') THEN
    ALTER TABLE public.promo_redemptions DROP CONSTRAINT promo_redemptions_user_id_fkey;
  END IF;
END $$;

-- coach_id must allow NULL to support ON DELETE SET NULL (mirrors
-- coaching_check_ins.coach_id from the previous migration)
ALTER TABLE public.coaching_session_bookings ALTER COLUMN coach_id DROP NOT NULL;

ALTER TABLE public.coaching_session_bookings
  ADD CONSTRAINT coaching_session_bookings_athlete_id_fkey
  FOREIGN KEY (athlete_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.coaching_session_bookings
  ADD CONSTRAINT coaching_session_bookings_coach_id_fkey
  FOREIGN KEY (coach_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.focus_sessions
  ADD CONSTRAINT focus_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.math_scores
  ADD CONSTRAINT math_scores_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.memory_scores
  ADD CONSTRAINT memory_scores_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.pb_card_listings
  ADD CONSTRAINT pb_card_listings_seller_id_fkey
  FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.pb_card_listings
  ADD CONSTRAINT pb_card_listings_current_bidder_id_fkey
  FOREIGN KEY (current_bidder_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.promo_redemptions
  ADD CONSTRAINT promo_redemptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
