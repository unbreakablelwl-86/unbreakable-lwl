import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { canNotify } from '@/lib/notificationPrefs';

export interface CheckIn {
  id: string;
  assignment_id: string;
  coach_id: string;
  athlete_id: string;
  check_in_number: number;
  due_date: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  status: 'pending' | 'submitted' | 'reviewed' | 'skipped';
  weight_kg: number | null;
  body_fat_pct: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  energy_level: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  mood: number | null;
  soreness: number | null;
  training_compliance: number | null;
  nutrition_compliance: number | null;
  steps_avg: number | null;
  water_litres: number | null;
  wins: string | null;
  challenges: string | null;
  athlete_notes: string | null;
  coach_response: string | null;
  photo_front: string | null;
  photo_side: string | null;
  photo_back: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  athlete_profile?: { display_name: string | null; username: string | null; avatar_url: string | null };
}

export function useCheckIns(filterByAthleteId?: string) {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckIns = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from('coaching_check_ins')
      .select('*')
      .order('created_at', { ascending: false });

    if (filterByAthleteId) {
      query = query.eq('athlete_id', filterByAthleteId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching check-ins:', error);
      setLoading(false);
      return;
    }

    // Enrich with athlete profiles
    const athleteIds = [...new Set((data || []).map(c => c.athlete_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, username, avatar_url')
      .in('user_id', athleteIds.length > 0 ? athleteIds : ['none']);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    const enriched = (data || []).map(c => ({
      ...c,
      status: c.status as CheckIn['status'],
      athlete_profile: profileMap.get(c.athlete_id) || undefined,
    }));

    setCheckIns(enriched);
    setLoading(false);
  }, [user, filterByAthleteId]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  const createCheckIn = async (assignmentId: string, coachId: string, athleteId: string, dueDate?: string) => {
    // Get next check-in number
    const { data: existing } = await supabase
      .from('coaching_check_ins')
      .select('check_in_number')
      .eq('assignment_id', assignmentId)
      .order('check_in_number', { ascending: false })
      .limit(1);

    const nextNumber = ((existing?.[0] as any)?.check_in_number || 0) + 1;

    const { error } = await supabase
      .from('coaching_check_ins')
      .insert({
        assignment_id: assignmentId,
        coach_id: coachId,
        athlete_id: athleteId,
        check_in_number: nextNumber,
        due_date: dueDate || null,
        status: 'pending',
      });

    if (error) {
      toast.error('Failed to create check-in');
      console.error(error);
      return;
    }

    // Notify athlete (respect preferences)
    if (await canNotify(athleteId, 'coaching_feedback')) {
      await supabase.from('notifications').insert({
        user_id: athleteId,
        type: 'coaching_feedback',
        title: `Check-in #${nextNumber} Ready`,
        body: 'Your coach has sent you a new check-in to complete.',
        data: { assignment_id: assignmentId, link: '/my-coaching' },
      });
    }

    toast.success(`Check-in #${nextNumber} created`);
    fetchCheckIns();
  };

  const submitCheckIn = async (checkInId: string, data: Partial<CheckIn>) => {
    const { error } = await supabase
      .from('coaching_check_ins')
      .update({
        ...data,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', checkInId);

    if (error) {
      toast.error('Failed to submit check-in');
      console.error(error);
      return;
    }

    // Notify coach
    const checkIn = checkIns.find(c => c.id === checkInId);
    if (checkIn) {
      await supabase.from('notifications').insert({
        user_id: checkIn.coach_id,
        type: 'coaching_feedback',
        title: 'Check-in Submitted',
        body: `${checkIn.athlete_profile?.display_name || 'An athlete'} submitted check-in #${checkIn.check_in_number}.`,
        data: { check_in_id: checkInId, link: '/coach?tab=checkins' },
      });
    }

    toast.success('Check-in submitted!');
    fetchCheckIns();
  };

  const reviewCheckIn = async (checkInId: string, coachResponse: string) => {
    const { error } = await supabase
      .from('coaching_check_ins')
      .update({
        coach_response: coachResponse,
        status: 'reviewed',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', checkInId);

    if (error) {
      toast.error('Failed to review check-in');
      console.error(error);
      return;
    }

    // Notify athlete (respect preferences)
    const checkIn = checkIns.find(c => c.id === checkInId);
    if (checkIn && await canNotify(checkIn.athlete_id, 'feedback_response')) {
      await supabase.from('notifications').insert({
        user_id: checkIn.athlete_id,
        type: 'feedback_response',
        title: 'Coach Reviewed Your Check-in',
        body: 'Your coach has reviewed your latest check-in.',
        data: { check_in_id: checkInId, link: '/my-coaching' },
      });
    }

    toast.success('Check-in reviewed');
    fetchCheckIns();
  };

  const deleteCheckIn = async (checkInId: string) => {
    const { error } = await supabase
      .from('coaching_check_ins')
      .delete()
      .eq('id', checkInId);

    if (error) {
      toast.error('Failed to delete check-in');
      return;
    }
    toast.success('Check-in deleted');
    fetchCheckIns();
  };

  // Helpers
  const pendingCheckIns = checkIns.filter(c => c.status === 'pending');
  const submittedCheckIns = checkIns.filter(c => c.status === 'submitted');
  const reviewedCheckIns = checkIns.filter(c => c.status === 'reviewed');
  const myPendingCheckIns = checkIns.filter(c => c.athlete_id === user?.id && c.status === 'pending');

  return {
    checkIns,
    pendingCheckIns,
    submittedCheckIns,
    reviewedCheckIns,
    myPendingCheckIns,
    loading,
    createCheckIn,
    submitCheckIn,
    reviewCheckIn,
    deleteCheckIn,
    refetch: fetchCheckIns,
  };
}
