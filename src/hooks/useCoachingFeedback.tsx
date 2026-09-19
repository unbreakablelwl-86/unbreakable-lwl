import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CoachingFeedback {
  id: string;
  coach_id: string;
  athlete_id: string;
  feedback_type: string;
  title: string;
  performance_rating: number | null;
  technique_notes: string | null;
  next_session_goals: string | null;
  general_comments: string | null;
  related_session_id: string | null;
  related_program_id: string | null;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FeedbackResponse {
  id: string;
  feedback_id: string;
  user_id: string;
  response_type: 'reply' | 'acknowledged';
  content: string | null;
  created_at: string;
}

interface CreateFeedbackData {
  athlete_id: string;
  feedback_type: string;
  title: string;
  performance_rating?: number | null;
  technique_notes?: string | null;
  next_session_goals?: string | null;
  general_comments?: string | null;
  related_session_id?: string | null;
  related_program_id?: string | null;
}

export function useCoachingFeedback() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createFeedback = useCallback(async (data: CreateFeedbackData) => {
    if (!user) return { error: new Error('Not authenticated') };
    setLoading(true);

    const { data: feedback, error } = await supabase
      .from('coaching_feedback' as any)
      .insert({
        coach_id: user.id,
        athlete_id: data.athlete_id,
        feedback_type: data.feedback_type,
        title: data.title,
        performance_rating: data.performance_rating || null,
        technique_notes: data.technique_notes || null,
        next_session_goals: data.next_session_goals || null,
        general_comments: data.general_comments || null,
        related_session_id: data.related_session_id || null,
        related_program_id: data.related_program_id || null,
      } as any)
      .select()
      .single();

    if (error) {
      setLoading(false);
      return { error };
    }

    // Send auto-message to inbox
    try {
      const { data: convId } = await supabase.rpc('start_or_get_conversation', {
        recipient_id: data.athlete_id,
      });

      if (convId) {
        await supabase.from('messages').insert({
          conversation_id: convId,
          sender_id: user.id,
          content: `📋 New coach update: "${data.title}". View your updates in 121 Coaching.`,
        });
      }
    } catch (e) {
      console.error('Auto-message failed:', e);
    }

    // Also relay this feedback into the athlete's AI Coach chat, and raise
    // a notification that deep-links straight to it — added alongside the
    // inbox message above, not replacing it. help_conversations/help_messages
    // RLS only allows auth.uid() = user_id, so a coach's own client can't
    // write into an athlete's chat directly; this runs server-side with the
    // service role after re-verifying the caller authored this feedback.
    try {
      await supabase.functions.invoke('deliver-coach-feedback', {
        body: { feedbackId: feedback.id },
      });
    } catch (e) {
      console.error('AI chat delivery failed:', e);
    }

    setLoading(false);
    return { data: feedback as unknown as CoachingFeedback, error: null };
  }, [user]);

  const getFeedbackForAthlete = useCallback(async (athleteId: string) => {
    const { data, error } = await supabase
      .from('coaching_feedback' as any)
      .select('*')
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error };
    return { data: (data || []) as unknown as CoachingFeedback[], error: null };
  }, []);

  const getMyCoachFeedback = useCallback(async () => {
    if (!user) return { data: [], error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('coaching_feedback' as any)
      .select('*')
      .eq('athlete_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error };
    return { data: (data || []) as unknown as CoachingFeedback[], error: null };
  }, [user]);

  const updateFeedback = useCallback(async (id: string, updates: Partial<CreateFeedbackData>) => {
    const { error } = await supabase
      .from('coaching_feedback' as any)
      .update(updates as any)
      .eq('id', id);

    return { error };
  }, []);

  const deleteFeedback = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('coaching_feedback' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete feedback');
      return { error };
    }
    toast.success('Feedback deleted');
    return { error: null };
  }, []);

  // ===== Feedback Responses =====

  const getResponsesForFeedback = useCallback(async (feedbackId: string) => {
    const { data, error } = await supabase
      .from('feedback_responses' as any)
      .select('*')
      .eq('feedback_id', feedbackId)
      .order('created_at', { ascending: true });

    if (error) return { data: [], error };
    return { data: (data || []) as unknown as FeedbackResponse[], error: null };
  }, []);

  const getResponsesForMultipleFeedback = useCallback(async (feedbackIds: string[]) => {
    if (feedbackIds.length === 0) return { data: [], error: null };
    const { data, error } = await supabase
      .from('feedback_responses' as any)
      .select('*')
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (error) return { data: [], error };
    return { data: (data || []) as unknown as FeedbackResponse[], error: null };
  }, []);

  const respondToFeedback = useCallback(async (feedbackId: string, content: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('feedback_responses' as any)
      .insert({
        feedback_id: feedbackId,
        user_id: user.id,
        response_type: 'reply',
        content,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Failed to send reply');
      return { error };
    }
    toast.success('Reply sent');
    return { data: data as unknown as FeedbackResponse, error: null };
  }, [user]);

  const acknowledgeFeedback = useCallback(async (feedbackId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('feedback_responses' as any)
      .insert({
        feedback_id: feedbackId,
        user_id: user.id,
        response_type: 'acknowledged',
        content: null,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Failed to acknowledge');
      return { error };
    }
    toast.success('Feedback acknowledged');
    return { data: data as unknown as FeedbackResponse, error: null };
  }, [user]);

  const deleteResponse = useCallback(async (responseId: string) => {
    const { error } = await supabase
      .from('feedback_responses' as any)
      .delete()
      .eq('id', responseId);

    if (error) {
      toast.error('Failed to delete response');
      return { error };
    }
    return { error: null };
  }, []);

  return {
    createFeedback,
    getFeedbackForAthlete,
    getMyCoachFeedback,
    updateFeedback,
    deleteFeedback,
    getResponsesForFeedback,
    getResponsesForMultipleFeedback,
    respondToFeedback,
    acknowledgeFeedback,
    deleteResponse,
    loading,
  };
}
