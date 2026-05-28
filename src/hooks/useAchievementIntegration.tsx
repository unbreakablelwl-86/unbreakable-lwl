/**
 * useAchievementIntegration — Auto-awards achievement cards on:
 * 1. Programme completion → Programme Trophy card
 * 2. New lift PB (exercise log) → PB Personal card (gold/silver/bronze for top 3)
 * 3. New run PB (personal_records) → PB Personal card
 * 4. Global ranking milestone → PB Global card (diamond/platinum)
 * 
 * Hook into existing workout + run completion flows.
 */
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { ProgrammeType, ActivityCategory } from '@/hooks/useAchievementCards';

/* ═══ Types ═══ */
interface LiftResult {
  exerciseName: string;
  weightKg: number;
  reps: number;
  sessionId: string;
}

interface RunResult {
  runId: string;
  distanceKm: number;
  timeSeconds: number;
  distanceType: string;
  activityType: string;
}

interface AwardedCard {
  cardId: string;
  rarity: string;
  type: string;
}

/* ═══ Epley formula for estimated 1RM ═══ */
function estimatedOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function useAchievementIntegration() {
  const { user } = useAuth();

  /**
   * Call after a workout session completes — checks each exercise for PB
   */
  const checkLiftPBs = useCallback(async (lifts: LiftResult[]): Promise<AwardedCard[]> => {
    if (!user) return [];
    const awarded: AwardedCard[] = [];

    for (const lift of lifts) {
      const e1rm = estimatedOneRepMax(lift.weightKg, lift.reps);
      if (e1rm <= 0) continue;

      // Fetch user's top 3 lifts for this exercise (by estimated 1RM)
      const { data: topLifts } = await supabase
        .from('exercise_logs')
        .select('id, weight_kg, actual_reps')
        .eq('user_id', user.id)
        .eq('exercise_name', lift.exerciseName)
        .eq('completed', true)
        .gt('weight_kg', 0)
        .order('weight_kg', { ascending: false })
        .limit(20);

      if (!topLifts) continue;

      // Calculate e1rms and sort
      const sorted = topLifts
        .map(l => ({
          id: l.id,
          e1rm: estimatedOneRepMax(l.weight_kg, l.actual_reps || 1),
        }))
        .sort((a, b) => b.e1rm - a.e1rm);

      // Find this lift's rank in the sorted list
      const rank = sorted.findIndex(l => l.e1rm <= e1rm) + 1;
      
      // Only award for top 3
      if (rank > 0 && rank <= 3) {
        try {
          const { data: cardId } = await supabase.rpc('award_pb_card', {
            p_user_id: user.id,
            p_activity_category: 'lift' as ActivityCategory,
            p_exercise_name: lift.exerciseName,
            p_value: e1rm,
            p_unit: 'kg',
            p_rank: rank,
            p_distance_type: null,
            p_source_run_id: null,
            p_source_session_id: lift.sessionId,
          });

          if (cardId) {
            const rarity = rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze';
            awarded.push({ cardId, rarity, type: 'pb_personal' });
            toast.success(`🏋️ New ${rarity.toUpperCase()} PB Card: ${lift.exerciseName} — ${e1rm}kg e1RM`, {
              duration: 5000,
            });

            // Also check global ranking
            await supabase.rpc('check_global_pb_ranking', {
              p_user_id: user.id,
              p_activity_category: 'lift',
              p_exercise_name: lift.exerciseName,
              p_distance_type: null,
            });
          }
        } catch (err) {
          console.error('Error awarding lift PB card:', err);
        }
      }
    }
    return awarded;
  }, [user]);

  /**
   * Call after a run is logged — checks run PB and awards card
   */
  const checkRunPB = useCallback(async (run: RunResult): Promise<AwardedCard[]> => {
    if (!user) return [];
    const awarded: AwardedCard[] = [];

    // Fetch user's top 3 times for this distance type
    const { data: topRuns } = await supabase
      .from('personal_records')
      .select('id, time_seconds, distance_type')
      .eq('user_id', user.id)
      .eq('distance_type', run.distanceType)
      .eq('activity_type', run.activityType)
      .order('time_seconds', { ascending: true })
      .limit(3);

    if (!topRuns) return awarded;

    // Find this run's rank
    const rank = topRuns.findIndex(r => r.time_seconds !== null && run.timeSeconds <= r.time_seconds) + 1;
    const actualRank = rank === 0 ? topRuns.length + 1 : rank;

    if (actualRank <= 3) {
      try {
        const { data: cardId } = await supabase.rpc('award_pb_card', {
          p_user_id: user.id,
          p_activity_category: run.activityType as ActivityCategory,
          p_exercise_name: run.distanceType,
          p_value: run.timeSeconds,
          p_unit: 'seconds',
          p_rank: actualRank,
          p_distance_type: run.distanceType,
          p_source_run_id: run.runId,
          p_source_session_id: null,
        });

        if (cardId) {
          const rarity = actualRank === 1 ? 'gold' : actualRank === 2 ? 'silver' : 'bronze';
          awarded.push({ cardId, rarity, type: 'pb_personal' });

          const mins = Math.floor(run.timeSeconds / 60);
          const secs = Math.round(run.timeSeconds % 60);
          toast.success(`🏃 New ${rarity.toUpperCase()} PB Card: ${run.distanceType} — ${mins}:${secs.toString().padStart(2, '0')}`, {
            duration: 5000,
          });

          // Check global ranking
          await supabase.rpc('check_global_pb_ranking', {
            p_user_id: user.id,
            p_activity_category: run.activityType,
            p_exercise_name: null,
            p_distance_type: run.distanceType,
          });
        }
      } catch (err) {
        console.error('Error awarding run PB card:', err);
      }
    }
    return awarded;
  }, [user]);

  /**
   * Call when a user completes a programme
   */
  const awardProgrammeTrophy = useCallback(async (
    programmeType: ProgrammeType,
    programmeName: string,
    programmeId: string,
    stats?: Record<string, unknown>,
  ): Promise<AwardedCard | null> => {
    if (!user) return null;

    try {
      const { data: cardId, error } = await supabase.rpc('award_programme_trophy', {
        p_user_id: user.id,
        p_programme_type: programmeType,
        p_programme_name: programmeName,
        p_programme_id: programmeId,
        p_stats: stats || {},
      });

      if (error) {
        console.error('Error awarding programme trophy:', error);
        return null;
      }

      // Get the rarity that was awarded (based on total completions)
      const { data: card } = await supabase
        .from('achievement_cards')
        .select('rarity')
        .eq('id', cardId)
        .single();

      const rarity = card?.rarity || 'bronze';
      toast.success(`🏆 ${rarity.toUpperCase()} Trophy Card: ${programmeName}`, {
        duration: 5000,
      });

      return { cardId, rarity, type: 'programme_trophy' };
    } catch (err) {
      console.error('Error awarding programme trophy:', err);
      return null;
    }
  }, [user]);

  return {
    checkLiftPBs,
    checkRunPB,
    awardProgrammeTrophy,
  };
}
