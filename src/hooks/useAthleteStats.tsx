/**
 * useAthleteStats — FIFA-style 6-stat system for PB Cards
 * 
 * Stats (0-99 scale):
 * - STR (Strength): Total volume lifted
 * - PWR (Power): Max estimated 1RM
 * - SPD (Speed): Best running pace
 * - END (Endurance): Total run distance + sessions
 * - AGI (Agility): Exercise variety
 * - REC (Recovery): Training consistency
 * 
 * Overall Rating: Weighted average (strength-biased)
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AthleteStats {
  str: number;
  pwr: number;
  spd: number;
  end: number;
  agi: number;
  rec: number;
  overall: number;
  total_volume_kg?: number;
  max_e1rm?: number;
  total_sessions?: number;
  total_run_km?: number;
  exercise_variety?: number;
}

export const STAT_LABELS: Record<string, { label: string; fullLabel: string; color: string }> = {
  str: { label: 'STR', fullLabel: 'Strength', color: '#FF5500' },
  pwr: { label: 'PWR', fullLabel: 'Power', color: '#FF3300' },
  spd: { label: 'SPD', fullLabel: 'Speed', color: '#00CCFF' },
  end: { label: 'END', fullLabel: 'Endurance', color: '#00FF88' },
  agi: { label: 'AGI', fullLabel: 'Agility', color: '#FFD700' },
  rec: { label: 'REC', fullLabel: 'Recovery', color: '#AA66FF' },
};

export const STAT_ORDER = ['str', 'pwr', 'spd', 'end', 'agi', 'rec'] as const;

export function useAthleteStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AthleteStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('get_athlete_stats', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching athlete stats:', error);
        setLoading(false);
        return null;
      }

      const parsed: AthleteStats = {
        str: data?.str ?? 0,
        pwr: data?.pwr ?? 0,
        spd: data?.spd ?? 0,
        end: data?.end ?? 0,
        agi: data?.agi ?? 0,
        rec: data?.rec ?? 0,
        overall: data?.overall ?? 0,
        total_volume_kg: data?.total_volume_kg,
        max_e1rm: data?.max_e1rm,
        total_sessions: data?.total_sessions,
        total_run_km: data?.total_run_km,
        exercise_variety: data?.exercise_variety,
      };

      setStats(parsed);
      setLoading(false);
      return parsed;
    } catch (err) {
      console.error('Error in useAthleteStats:', err);
      setLoading(false);
      return null;
    }
  }, [user]);

  /**
   * Generate AI bio for a specific card
   */
  const generateBio = useCallback(async (cardId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pb-bio', {
        body: { card_id: cardId },
      });

      if (error) {
        console.error('Error generating bio:', error);
        return null;
      }

      return data?.bio_line || null;
    } catch (err) {
      console.error('Error in generateBio:', err);
      return null;
    }
  }, []);

  return {
    stats,
    loading,
    fetchStats,
    generateBio,
  };
}
