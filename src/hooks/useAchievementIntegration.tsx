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

/* ═══ Generate AI bio line for a card (fire-and-forget) ═══ */
async function generateCardBio(cardId: string, exerciseName: string, pbValue: number, pbUnit: string) {
  try {
    await supabase.functions.invoke('generate-pb-bio', {
      body: { card_id: cardId, exercise_name: exerciseName, pb_value: pbValue, pb_unit: pbUnit },
    });
  } catch (err) {
    // Non-critical — card works without bio
    console.warn('Bio generation failed (non-critical):', err);
  }
}

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
   * Call after a workout session completes — awards/upgrades card for EVERY exercise logged.
   * First log of any exercise = bronze card. Better lifts upgrade rarity automatically.
   * DB function handles upsert (one card per exercise per user).
   */
  const checkLiftPBs = useCallback(async (lifts: LiftResult[]): Promise<AwardedCard[]> => {
    if (!user) return [];
    const awarded: AwardedCard[] = [];
    // Deduplicate by exercise — keep best e1RM per exercise in this session
    const bestByExercise = new Map<string, { e1rm: number; lift: LiftResult }>();
    for (const lift of lifts) {
      const e1rm = estimatedOneRepMax(lift.weightKg, lift.reps);
      if (e1rm <= 0) continue;
      const existing = bestByExercise.get(lift.exerciseName);
      if (!existing || e1rm > existing.e1rm) {
        bestByExercise.set(lift.exerciseName, { e1rm, lift });
      }
    }

    for (const [exerciseName, { e1rm, lift }] of bestByExercise) {
      try {
        const { data: cardId } = await supabase.rpc('award_pb_card', {
          p_user_id: user.id,
          p_activity_category: 'lift' as ActivityCategory,
          p_exercise_name: exerciseName,
          p_value: e1rm,
          p_unit: 'kg',
          p_rank: 1,
          p_distance_type: null,
          p_source_run_id: null,
          p_source_session_id: lift.sessionId,
        });

        if (cardId) {
          // Fetch the actual rarity assigned by the DB trigger
          const { data: cardData } = await supabase
            .from('achievement_cards')
            .select('rarity')
            .eq('id', cardId)
            .single();
          const rarity = cardData?.rarity || 'bronze';
          awarded.push({ cardId, rarity, type: 'pb_personal' });
          toast.success(`🏋️ ${rarity.toUpperCase()} PB Card: ${exerciseName} — ${e1rm}kg`, {
            duration: 5000,
          });

          // Generate AI bio line (fire-and-forget, non-blocking)
          generateCardBio(cardId, exerciseName, e1rm, 'kg');

          // Also check global ranking
          try {
            await supabase.rpc('check_global_pb_ranking', {
              p_user_id: user.id,
              p_activity_category: 'lift',
              p_exercise_name: exerciseName,
              p_distance_type: null,
            });
          } catch { /* non-critical */ }
        }
      } catch (err) {
        console.error('Error awarding lift PB card:', err);
      }
    }
    return awarded;
  }, [user]);

  /**
   * Call after a run is logged — awards/upgrades card for this distance.
   * First run = card. Faster times upgrade rarity automatically.
   * DB function handles upsert (one card per distance per user).
   */
  const checkRunPB = useCallback(async (run: RunResult): Promise<AwardedCard[]> => {
    if (!user) return [];
    const awarded: AwardedCard[] = [];

    try {
      const { data: cardId } = await supabase.rpc('award_pb_card', {
        p_user_id: user.id,
        p_activity_category: run.activityType as ActivityCategory,
        p_exercise_name: run.distanceType,
        p_value: run.timeSeconds,
        p_unit: 'seconds',
        p_rank: 1,
        p_distance_type: run.distanceType,
        p_source_run_id: run.runId,
        p_source_session_id: null,
      });

      if (cardId) {
        // Fetch actual rarity from DB trigger
        const { data: cardData } = await supabase
          .from('achievement_cards')
          .select('rarity')
          .eq('id', cardId)
          .single();
        const rarity = cardData?.rarity || 'bronze';
        awarded.push({ cardId, rarity, type: 'pb_personal' });

        const mins = Math.floor(run.timeSeconds / 60);
        const secs = Math.round(run.timeSeconds % 60);
        toast.success(`🏃 ${rarity.toUpperCase()} PB Card: ${run.distanceType} — ${mins}:${secs.toString().padStart(2, '0')}`, {
          duration: 5000,
        });

        // Check global ranking
        try {
          await supabase.rpc('check_global_pb_ranking', {
            p_user_id: user.id,
            p_activity_category: run.activityType,
            p_exercise_name: null,
            p_distance_type: run.distanceType,
          });
        } catch { /* non-critical */ }
      }
    } catch (err) {
      console.error('Error awarding run PB card:', err);
    }
    return awarded;
  }, [user]);

  /**
   * Programme trophy cards are disabled — we no longer award cards for completed programmes.
   * Kept as a no-op so existing callers don't break.
   */
  const awardProgrammeTrophy = useCallback(async (
    _programmeType: ProgrammeType,
    _programmeName: string,
    _programmeId: string,
    _stats?: Record<string, unknown>,
  ): Promise<AwardedCard | null> => {
    return null;
  }, []);

  return {
    checkLiftPBs,
    checkRunPB,
    awardProgrammeTrophy,
  };
}
