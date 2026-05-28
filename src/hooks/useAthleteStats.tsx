/**
 * useAthleteStats — PB Card stat system
 *
 * Strength cards (STR/PWR/CON/PGS/EXP/RNK):
 *   STR: Relative strength via Wilks/IPF standards
 *   PWR: IPF GL power score
 *   CON: Training consistency (sessions/week)
 *   PGS: Progression rate (weight improvement %)
 *   EXP: Experience (total sessions + training age)
 *   RNK: Global percentile rank (live leaderboard)
 *
 * Cardio cards (SPD/END/CON/DST/ELV/RNK):
 *   SPD: Best pace
 *   END: Endurance capacity
 *   CON: Training consistency
 *   DST: Total distance
 *   ELV: Elevation / longest effort
 *   RNK: Global percentile rank (live)
 *
 * Overall Rating: 40-99, Wilks/IPF GL + age coefficient + sex-specific standards
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AthleteStats {
  // Strength stats
  str: number;
  pwr: number;
  // Cardio stats
  spd: number;
  end: number;
  dst: number;
  elv: number;
  // Shared stats
  con: number;
  pgs: number;
  exp: number;
  rnk: number;
  // Overall
  overall: number;
  // Raw data
  total_volume_kg?: number;
  max_e1rm?: number;
  gl_score?: number;
  total_sessions?: number;
  total_run_km?: number;
  best_pace?: number;
  longest_run_km?: number;
  bodyweight?: number;
  exercise_variety?: number;
}

/* ═══ STRENGTH CARD STATS ═══ */
export const STRENGTH_STAT_LABELS: Record<string, { label: string; fullLabel: string; color: string }> = {
  str: { label: 'STR', fullLabel: 'Strength', color: '#FF5500' },
  pwr: { label: 'PWR', fullLabel: 'Power', color: '#FF3300' },
  con: { label: 'CON', fullLabel: 'Consistency', color: '#00FF88' },
  pgs: { label: 'PGS', fullLabel: 'Progression', color: '#FFD700' },
  exp: { label: 'EXP', fullLabel: 'Experience', color: '#00CCFF' },
  rnk: { label: 'RNK', fullLabel: 'Global Rank', color: '#AA66FF' },
};
export const STRENGTH_STAT_ORDER = ['str', 'pwr', 'con', 'pgs', 'exp', 'rnk'] as const;

/* ═══ CARDIO CARD STATS ═══ */
export const CARDIO_STAT_LABELS: Record<string, { label: string; fullLabel: string; color: string }> = {
  spd: { label: 'SPD', fullLabel: 'Speed', color: '#00CCFF' },
  end: { label: 'END', fullLabel: 'Endurance', color: '#00FF88' },
  con: { label: 'CON', fullLabel: 'Consistency', color: '#FFD700' },
  dst: { label: 'DST', fullLabel: 'Distance', color: '#FF5500' },
  elv: { label: 'ELV', fullLabel: 'Elevation', color: '#FF8800' },
  rnk: { label: 'RNK', fullLabel: 'Global Rank', color: '#AA66FF' },
};
export const CARDIO_STAT_ORDER = ['spd', 'end', 'con', 'dst', 'elv', 'rnk'] as const;

/* ═══ Legacy compat — used by existing code that imports STAT_LABELS/STAT_ORDER ═══ */
export const STAT_LABELS = STRENGTH_STAT_LABELS;
export const STAT_ORDER = STRENGTH_STAT_ORDER;

export function useAthleteStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AthleteStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (activityCategory?: string, exerciseName?: string) => {
    if (!user) return null;
    setLoading(true);

    try {
      // Try new per-type stats function first
      const { data, error } = await supabase.rpc('calculate_pb_card_stats', {
        p_user_id: user.id,
        p_activity_category: activityCategory || 'lift',
        p_exercise_name: exerciseName || null,
      });

      if (error) {
        // Fallback to legacy function if new one isn't deployed yet
        const { data: legacyData } = await supabase.rpc('get_athlete_stats', { p_user_id: user.id });
        if (legacyData) {
          const parsed: AthleteStats = {
            str: legacyData?.str ?? 0, pwr: legacyData?.pwr ?? 0,
            spd: legacyData?.spd ?? 0, end: legacyData?.end ?? 0,
            con: legacyData?.con ?? 0, pgs: legacyData?.pgs ?? 0,
            exp: legacyData?.exp ?? 0, rnk: legacyData?.rnk ?? 0,
            dst: legacyData?.dst ?? 0, elv: legacyData?.elv ?? 0,
            overall: legacyData?.overall ?? 40,
          };
          setStats(parsed);
          setLoading(false);
          return parsed;
        }
        setLoading(false);
        return null;
      }

      const parsed: AthleteStats = {
        str: data?.str ?? 0, pwr: data?.pwr ?? 0,
        spd: data?.spd ?? 0, end: data?.end ?? 0,
        con: data?.con ?? 0, pgs: data?.pgs ?? 0,
        exp: data?.exp ?? 0, rnk: data?.rnk ?? 0,
        dst: data?.dst ?? 0, elv: data?.elv ?? 0,
        overall: data?.overall ?? 40,
        total_volume_kg: data?.total_volume_kg,
        max_e1rm: data?.max_e1rm,
        gl_score: data?.gl_score,
        total_run_km: data?.total_run_km,
        best_pace: data?.best_pace,
        longest_run_km: data?.longest_run_km,
        bodyweight: data?.bodyweight,
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

  const generateBio = useCallback(async (cardId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pb-bio', {
        body: { card_id: cardId },
      });
      if (error) { console.error('Error generating bio:', error); return null; }
      return data?.bio_line || null;
    } catch (err) {
      console.error('Error in generateBio:', err);
      return null;
    }
  }, []);

  return { stats, loading, fetchStats, generateBio };
}
