import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'unbreakable_coach_name';
const DEFAULT_NAME = 'UNBREAKABLE COACH';

/**
 * Hook to manage the user's custom Unbreakable Coach name.
 * Stores per-user in localStorage for instant access.
 * Falls back to "UNBREAKABLE COACH" if not set.
 */
export function useCoachName() {
  const { user } = useAuth();

  const getStoredName = useCallback(() => {
    if (!user) return DEFAULT_NAME;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      return stored || DEFAULT_NAME;
    } catch {
      return DEFAULT_NAME;
    }
  }, [user]);

  const [coachName, setCoachNameState] = useState(getStoredName);

  const setCoachName = useCallback((name: string) => {
    const trimmed = name.trim();
    const finalName = trimmed.length > 0 ? trimmed.toUpperCase() : DEFAULT_NAME;
    if (user) {
      try {
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, finalName);
      } catch {
        // localStorage full or unavailable — just use in-memory
      }
    }
    setCoachNameState(finalName);
  }, [user]);

  const resetCoachName = useCallback(() => {
    if (user) {
      try {
        localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
      } catch {
        // ignore
      }
    }
    setCoachNameState(DEFAULT_NAME);
  }, [user]);

  return {
    coachName,
    setCoachName,
    resetCoachName,
    isDefault: coachName === DEFAULT_NAME,
    DEFAULT_NAME,
  };
}
