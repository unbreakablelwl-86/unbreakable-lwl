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

  // Initialise from localStorage cache for instant display
  const [streak, setStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(STREAK_CACHE_KEY) || '0', 10);
  });
  const [bestStreak, setBestStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(BEST_STREAK_CACHE_KEY) || '0', 10);
  });
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LAST_LOGIN_CACHE_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  const syncStreak = useCallback(async () => {
    if (!user) {
      setStreak(0);
      setBestStreak(0);
      setLastLoginDate(null);
      setIsLoading(false);
      return;
    }

    const today = getLocalDate();

    try {
      // 1. Fetch current streak from DB
      const { data: existing } = await supabase
        .from('login_streaks')
        .select('current_streak, best_streak, last_login_date')
        .eq('user_id', user.id)
        .maybeSingle();

      let currentStreak: number;
      let currentBest: number;

      if (!existing) {
        // First ever login — create row
        currentStreak = 1;
        currentBest = 1;
        await supabase.from('login_streaks').insert({
          user_id: user.id,
          current_streak: 1,
          best_streak: 1,
          last_login_date: today,
        });
      } else {
        const dbDate = typeof existing.last_login_date === 'string'
          ? existing.last_login_date.split('T')[0]
          : String(existing.last_login_date);
        currentStreak = existing.current_streak;
        currentBest = existing.best_streak;

        if (dbDate === today) {
          // Already logged in today — just use DB values, no update needed
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

          // Update DB
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

      // 2. Update localStorage cache
      localStorage.setItem(STREAK_CACHE_KEY, String(currentStreak));
      localStorage.setItem(BEST_STREAK_CACHE_KEY, String(currentBest));
      localStorage.setItem(LAST_LOGIN_CACHE_KEY, today);

      // 3. Update state
      setStreak(currentStreak);
      setBestStreak(currentBest);
      setLastLoginDate(today);
    } catch (err) {
      console.error('[useLoginStreak] sync error:', err);
      // Fallback: use localStorage values already in state
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    syncStreak();
  }, [syncStreak]);

  return { streak, bestStreak, lastLoginDate, isLoading };
}
