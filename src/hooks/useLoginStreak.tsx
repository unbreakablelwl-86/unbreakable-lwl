import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

/**
 * Tracks daily login streak.
 * 
 * For dev/coach: streak auto-increments on each daily login regardless of actions.
 * For regular users: streak increments on daily login (any page load counts).
 * 
 * Streak logic:
 * - Same day login → no change
 * - Next day login → streak +1
 * - Skipped a day → streak resets to 1
 * 
 * Data stored in localStorage for instant display.
 */

const STREAK_KEY = 'unbreakable_login_streak';
const LAST_LOGIN_KEY = 'unbreakable_last_login_date';
const BEST_STREAK_KEY = 'unbreakable_best_streak';

function getLocalDate(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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
  const { isDev, isCoach } = useUserRole();
  const isPrivileged = isDev || isCoach;

  const [streak, setStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
  });
  const [bestStreak, setBestStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(BEST_STREAK_KEY) || '0', 10);
  });
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LAST_LOGIN_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  const updateStreak = useCallback(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const today = getLocalDate();
    const storedDate = localStorage.getItem(LAST_LOGIN_KEY);
    let currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
    let currentBest = parseInt(localStorage.getItem(BEST_STREAK_KEY) || '0', 10);

    if (storedDate === today) {
      // Already logged in today — no change
      setStreak(currentStreak);
      setBestStreak(currentBest);
      setLastLoginDate(today);
      setIsLoading(false);
      return;
    }

    if (storedDate) {
      const gap = daysBetween(storedDate, today);
      if (gap === 1) {
        // Consecutive day — extend streak
        currentStreak += 1;
      } else if (gap > 1) {
        // Missed a day — reset
        currentStreak = 1;
      }
      // gap === 0 shouldn't happen (caught above), gap < 0 means clock weirdness → keep current
    } else {
      // First ever login tracked
      currentStreak = 1;
    }

    // Update best
    if (currentStreak > currentBest) {
      currentBest = currentStreak;
    }

    // Persist
    localStorage.setItem(STREAK_KEY, String(currentStreak));
    localStorage.setItem(BEST_STREAK_KEY, String(currentBest));
    localStorage.setItem(LAST_LOGIN_KEY, today);

    setStreak(currentStreak);
    setBestStreak(currentBest);
    setLastLoginDate(today);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return { streak, bestStreak, lastLoginDate, isLoading };
}
