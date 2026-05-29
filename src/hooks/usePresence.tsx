/**
 * UNBREAKABLE — User Presence Hook
 *
 * Sends heartbeat every 60s to mark user as online.
 * Provides `isUserOnline(userId)` for checking others' status.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useLocation } from 'react-router-dom';

const HEARTBEAT_INTERVAL = 60_000; // 60 seconds

export function usePresenceHeartbeat() {
  const { user } = useAuth();
  const location = useLocation();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const sendHeartbeat = useCallback(async () => {
    if (!user) return;
    try {
      await (supabase as any).rpc('update_presence', { p_page: location.pathname });
    } catch {
      // Silently fail
    }
  }, [user, location.pathname]);

  useEffect(() => {
    if (!user) return;

    // Immediate heartbeat on mount/page change
    sendHeartbeat();

    // Set up interval
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Mark offline on page unload
    const handleUnload = () => {
      if (user) {
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/update_presence`,
          JSON.stringify({ p_page: null })
        );
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user, sendHeartbeat]);
}

/**
 * Check if specific users are online.
 * Returns a Map of userId → { isOnline, lastSeen }.
 */
export function useUserPresence(userIds: string[]) {
  const [presence, setPresence] = useState<Map<string, { isOnline: boolean; lastSeen: string | null }>>(new Map());

  useEffect(() => {
    if (userIds.length === 0) return;

    const fetchPresence = async () => {
      try {
        const { data } = await supabase
          .from('user_presence')
          .select('user_id, is_online, last_seen')
          .in('user_id', userIds);

        if (data) {
          const map = new Map<string, { isOnline: boolean; lastSeen: string | null }>();
          data.forEach((row: any) => {
            map.set(row.user_id, {
              isOnline: row.is_online,
              lastSeen: row.last_seen,
            });
          });
          setPresence(map);
        }
      } catch {
        // Silently fail
      }
    };

    fetchPresence();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPresence, 30_000);
    return () => clearInterval(interval);
  }, [userIds.join(',')]);

  return presence;
}

/**
 * Simple helper: is a single user online?
 */
export function useIsOnline(userId: string | undefined) {
  const presence = useUserPresence(userId ? [userId] : []);
  if (!userId) return false;
  return presence.get(userId)?.isOnline ?? false;
}

/**
 * Legacy-compatible hook used by UserProfileModal and Social.
 * Returns an object with isUserOnline function.
 */
export function usePresence() {
  const checkOnline = useCallback((userId: string) => {
    // Returns false synchronously — use useIsOnline for reactive checks
    return false;
  }, []);

  return { isUserOnline: checkOnline };
}
