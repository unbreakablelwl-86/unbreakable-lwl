/**
 * useAchievementCards — hook for Programme Trophies & PB Cards
 * Same pattern as UN-TUNES cards but for achievements
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AchievementCardType = 'programme_trophy' | 'pb_personal' | 'pb_global' | 'moment';
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';
export type ActivityCategory = 'lift' | 'run' | 'cycle' | 'row' | 'swim';
export type ProgrammeType = 'power' | 'cardio' | 'mindset' | 'fuel' | 'u86';

export interface AchievementCard {
  id: string;
  card_type: AchievementCardType;
  rarity: AchievementRarity;
  title: string;
  subtitle?: string;
  programme_type?: ProgrammeType;
  programme_name?: string;
  activity_category?: ActivityCategory;
  exercise_name?: string;
  record_value?: number;
  record_unit?: string;
  pb_value?: number;
  pb_unit?: string;
  pb_rank?: number;
  distance_type?: string;
  age_category?: string;
  global_rank_pct?: number;
  global_percentile?: number;
  global_rank?: number;
  total_in_category?: number;
  completion_count?: number;
  image_url?: string;
  programme_stats?: Record<string, unknown>;
  owner_display_name?: string;
  owner_gender?: string | null;
  earned_at: string;
  // FIFA-standard fields
  overall_rating?: number;
  athlete_stats?: { str: number; pwr: number; spd: number; end: number; agi: number; rec: number };
  bio_line?: string;
  card_number?: string;
  category_label?: string;
  edition_number?: number;
  edition_total?: number;
}

export interface AchievementCounts {
  total: number;
  bronze: number;
  silver: number;
  gold: number;
  diamond: number;
  platinum: number;
  trophies: number;
  pbPersonal: number;
  pbGlobal: number;
}

export function useAchievementCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<AchievementCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch cards + profile in parallel
    const [cardsResult, profileResult] = await Promise.all([
      supabase.rpc('get_achievement_collection', { p_user_id: user.id }),
      supabase.from('profiles').select('display_name, gender').eq('user_id', user.id).single(),
    ]);

    const ownerName = profileResult.data?.display_name || user.user_metadata?.full_name || null;
    const ownerGender = profileResult.data?.gender || null;

    let rawCards: AchievementCard[];
    if (cardsResult.error) {
      console.error('Error fetching achievement cards:', cardsResult.error);
      const { data: fallback } = await supabase
        .from('achievement_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      rawCards = (fallback || []) as AchievementCard[];
    } else {
      rawCards = (cardsResult.data || []) as AchievementCard[];
    }

    // Map DB column names → component field names, derive missing fields
    const CATEGORY_TO_ACTIVITY: Record<string, string> = {
      'Strength': 'lift', 'Power': 'lift', 'Cardio': 'run',
    };
    const mapped = rawCards.map(c => ({
      ...c,
      owner_display_name: ownerName,
      owner_gender: ownerGender,
      pb_value: c.pb_value ?? c.record_value,
      pb_unit: c.pb_unit ?? c.record_unit,
      activity_category: c.activity_category || (CATEGORY_TO_ACTIVITY[c.category_label || ''] as any) || 'lift',
    }));

    // Derive pb_rank within each exercise group (1 = best, by record_value desc)
    const exerciseGroups: Record<string, typeof mapped> = {};
    mapped.forEach(c => {
      if (c.card_type !== 'pb_personal') return;
      const key = c.exercise_name || 'Unknown';
      if (!exerciseGroups[key]) exerciseGroups[key] = [];
      exerciseGroups[key].push(c);
    });
    Object.values(exerciseGroups).forEach(group => {
      group.sort((a, b) => (Number(b.pb_value) || 0) - (Number(a.pb_value) || 0));
      group.forEach((c, i) => { c.pb_rank = i + 1; });
    });

    setCards(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchCards();
    else {
      setCards([]);
      setLoading(false);
    }
  }, [user, fetchCards]);

  const getCounts = useCallback((): AchievementCounts => {
    return {
      total: cards.length,
      bronze: cards.filter(c => c.rarity === 'bronze').length,
      silver: cards.filter(c => c.rarity === 'silver').length,
      gold: cards.filter(c => c.rarity === 'gold').length,
      diamond: cards.filter(c => c.rarity === 'diamond').length,
      platinum: cards.filter(c => c.rarity === 'platinum').length,
      trophies: cards.filter(c => c.card_type === 'programme_trophy').length,
      pbPersonal: cards.filter(c => c.card_type === 'pb_personal').length,
      pbGlobal: cards.filter(c => c.card_type === 'pb_global').length,
    };
  }, [cards]);

  const getByType = useCallback((type: AchievementCardType) => {
    return cards.filter(c => c.card_type === type);
  }, [cards]);

  const getByExercise = useCallback((exercise: string) => {
    return cards.filter(c => c.exercise_name === exercise);
  }, [cards]);

  // Award a programme trophy after programme completion
  const awardProgrammeTrophy = useCallback(async (
    programmeType: ProgrammeType,
    programmeName: string,
    programmeId: string,
    stats?: Record<string, unknown>,
  ): Promise<AchievementCard | null> => {
    if (!user) return null;

    const { data, error } = await supabase.rpc('award_programme_trophy', {
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

    await fetchCards();
    return cards.find(c => c.id === data) || null;
  }, [user, fetchCards, cards]);

  // Award PB cards after a new personal best (with duplicate detection + auto bio)
  const awardPBCards = useCallback(async (
    activityCategory: ActivityCategory,
    exerciseName: string,
    value: number,
    unit: string,
    rank: number,
    distanceType?: string,
    sourceRunId?: string,
    sourceSessionId?: string,
  ): Promise<string | null> => {
    if (!user) return null;

    // Duplicate detection — skip if identical card exists (same exercise + value + unit)
    const existing = cards.find(
      c => c.card_type === 'pb_personal'
        && c.exercise_name === exerciseName
        && c.record_value === value
        && c.record_unit === unit
    );
    if (existing) {
      console.log(`[PB Cards] Duplicate detected for ${exerciseName} ${value}${unit}, skipping`);
      return existing.id;
    }

    const { data, error } = await supabase.rpc('award_pb_card', {
      p_user_id: user.id,
      p_activity_category: activityCategory,
      p_exercise_name: exerciseName,
      p_value: value,
      p_unit: unit,
      p_rank: rank,
      p_distance_type: distanceType || null,
      p_source_run_id: sourceRunId || null,
      p_source_session_id: sourceSessionId || null,
    });

    if (error) {
      console.error('Error awarding PB card:', error);
      return null;
    }

    // Also check for global ranking
    await supabase.rpc('check_global_pb_ranking', {
      p_user_id: user.id,
      p_activity_category: activityCategory,
      p_exercise_name: exerciseName,
      p_distance_type: distanceType || null,
    });

    // Auto-trigger AI bio generation for the new card
    if (data) {
      supabase.functions.invoke('generate-pb-bio', {
        body: { cardId: data },
      }).catch(err => console.warn('Bio generation failed (non-blocking):', err));
    }

    await fetchCards();
    return data;
  }, [user, fetchCards, cards]);

  const deleteCard = useCallback(async (cardId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('achievement_cards' as any)
      .delete()
      .eq('id', cardId)
      .eq('user_id', user.id);
    if (error) {
      console.error('Error deleting achievement card:', error);
    }
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, [user]);

  return {
    cards,
    loading,
    refetch: fetchCards,
    getCounts,
    getByType,
    getByExercise,
    awardProgrammeTrophy,
    awardPBCards,
    deleteCard,
  };
}
