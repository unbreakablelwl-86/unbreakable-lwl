import { useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'unbreakable_coach_name';
const DEFAULT_NAME = 'UNBREAKABLE COACH';

/**
 * The AI coach's name.
 *
 * Renaming was removed for launch (Aug 2026): the coach is always
 * "UNBREAKABLE COACH". Any custom name left in localStorage from the old
 * behaviour is cleared on first load so returning users revert to the default.
 */
export function useCoachName() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
    } catch {
      // ignore
    }
  }, [user]);

  const noop = useCallback(() => {}, []);

  return {
    coachName: DEFAULT_NAME,
    setCoachName: noop,
    resetCoachName: noop,
    isDefault: true,
    DEFAULT_NAME,
  };
}
