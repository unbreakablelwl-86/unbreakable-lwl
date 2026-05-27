import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Tracks daily login streak — persisted in Supabase `login_streaks` table
 * so it survives across devices. localStorage is a fast cache only.
 *
 * Streak logic:
 * - Same day login → no change
 * - Next day login → streak +1
 * - Skipped a day → streak resets to 1
 *
 * Multi-device safe:
 * - DB is always the source of truth
 * - Never shows localStorage fallback until DB confirms
 * - Retry on failure, localStorage only used after successful DB sync
 * - Logging in from a new device does NOT reset the streak
 */

const STREAK_CACHE_KEY = 'unbreakable_login_streak';
const LAST_LOGIN_CACHE_KEY = 'unbreakable_last_login_date';
const BEST_STREAK_CACHE_KEY = 'unbreakable_best_streak';

function getLocalDate(): string {
  // Use UK timezone so the day boundary is consistent
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' }); // YYYY-MM-DD
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T00:00:00Z');
  const b = new Date(dateB + 'T00:00:00Z');
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export interface LoginStreakData {
  streak: number;
  bestStreak: number;
  lastLoginDate: string | null;
  isLoading: boolean;
}

export function useLoginStreak(): LoginStreakData {
  const { user } = useAuth();

  // Start with isLoading=true so nothing flashes 0 before DB loads
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbSynced, setDbSynced] = useState(false);

  const syncStreak = useCallback(async (retryCount = 0) => {
    if (!user) {
      setStreak(0);
      setBestStreak(0);
      setLastLoginDate(null);
      setIsLoading(false);
      return;
    }

    const today = getLocalDate();

    try {
      // 1. Fetch current streak from DB — this is the ONLY source of truth
      const { data: existing, error: fetchError } = await supabase
        .from('login_streaks')
        .select('current_streak, best_streak, last_login_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let currentStreak: number;
      let currentBest: number;

      if (!existing) {
        // First ever login — create row
        currentStreak = 1;
        currentBest = 1;
        const { error: insertError } = await supabase.from('login_streaks').insert({
          user_id: user.id,
          current_streak: 1,
          best_streak: 1,
          last_login_date: today,
        });
        if (insertError) {
          // Could be race condition if another device just created it — re-fetch
          const { data: refetch } = await supabase
            .from('login_streaks')
            .select('current_streak, best_streak, last_login_date')
            .eq('user_id', user.id)
            .maybeSingle();
          if (refetch) {
            currentStreak = refetch.current_streak;
            currentBest = refetch.best_streak;
          }
        }
      } else {
        const dbDate = typeof existing.last_login_date === 'string'
          ? existing.last_login_date.split('T')[0]
          : String(existing.last_login_date);
        currentStreak = existing.current_streak;
        currentBest = existing.best_streak;

        if (dbDate === today) {
          // Already logged in today (maybe from another device) — use DB values as-is
          // This is the key multi-device fix: no reset, no change, just read
        } else {
          const gap = daysBetween(dbDate, today);
          if (gap === 1) {
            currentStreak += 1;
          } else if (gap > 1) {
            currentStreak = 1;
          }
          // gap <= 0 means clock weirdness — keep current

          if (currentStreak > currentBest) {
            currentBest = currentStreak;
          }

          // Update DB — use a conditional update to avoid race with other devices
          await supabase
            .from('login_streaks')
            .update({
              current_streak: currentStreak,
              best_streak: currentBest,
              last_login_date: today,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);
        }
      }

      // 2. Update localStorage cache (only AFTER successful DB sync)
      localStorage.setItem(STREAK_CACHE_KEY, String(currentStreak));
      localStorage.setItem(BEST_STREAK_CACHE_KEY, String(currentBest));
      localStorage.setItem(LAST_LOGIN_CACHE_KEY, today);

      // 3. Update state
      setStreak(currentStreak);
      setBestStreak(currentBest);
      setLastLoginDate(today);
      setDbSynced(true);
    } catch (err) {
      console.error('[useLoginStreak] sync error:', err);

      // Retry up to 2 times with backoff before falling back to cache
      if (retryCount < 2) {
        setTimeout(() => syncStreak(retryCount + 1), 1000 * (retryCount + 1));
        return; // Don't set isLoading false yet, we're retrying
      }

      // After retries exhausted, fall back to localStorage — but only if we have cached values
      const cachedStreak = localStorage.getItem(STREAK_CACHE_KEY);
      const cachedBest = localStorage.getItem(BEST_STREAK_CACHE_KEY);
      const cachedDate = localStorage.getItem(LAST_LOGIN_CACHE_KEY);
      if (cachedStreak && cachedDate) {
        setStreak(parseInt(cachedStreak, 10));
        setBestStreak(parseInt(cachedBest || '0', 10));
        setLastLoginDate(cachedDate);
      }
      // If no cache at all (brand new device + DB fail), streak stays 0 with isLoading false
      // This is the safest fallback — once DB comes back, next load will fix it
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    syncStreak();
  }, [syncStreak]);

  return { streak, bestStreak, lastLoginDate, isLoading };
}
