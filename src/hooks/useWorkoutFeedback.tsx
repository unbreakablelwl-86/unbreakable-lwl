import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface WorkoutFeedback {
  id: string;
  user_id: string;
  session_id: string | null;
  feedback_type: 'session' | 'technique' | 'progression' | 'recovery';
  content: string;
  suggestions: any;
  fatigue_score: number | null;
  performance_rating: 'excellent' | 'good' | 'average' | 'below_average' | 'poor' | null;
  voice_url: string | null;
  created_at: string;
}

export function useWorkoutFeedback(sessionId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['workout-feedback', user?.id, sessionId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('workout_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as WorkoutFeedback[];
    },
    enabled: !!user,
  });

  const generateFeedback = useMutation({
    mutationFn: async ({ 
      sessionId, 
      exerciseLogs 
    }: { 
      sessionId: string; 
      exerciseLogs: any[];
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      // Refresh and get the real user session token (NOT the anon key)
      // refreshSession ensures token is valid even after long workouts
      const { data: refreshedData } = await supabase.auth.refreshSession();
      let accessToken = refreshedData?.session?.access_token;
      if (!accessToken) {
        // Fallback to getSession if refresh fails
        const { data: sessionData } = await supabase.auth.getSession();
        accessToken = sessionData?.session?.access_token ?? undefined;
        if (!accessToken) throw new Error('Session expired — please sign in again');
      }
      
      // Call edge function to generate AI feedback
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-workout-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            sessionId,
            exerciseLogs,
            userId: user.id,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate feedback');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-feedback'] });
      toast({ title: 'Feedback Generated', description: 'Check your session feedback!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const { data: latestFeedback } = useQuery({
    queryKey: ['latest-feedback', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('workout_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as WorkoutFeedback | null;
    },
    enabled: !!user,
  });

  return {
    feedback,
    latestFeedback,
    isLoading,
    generateFeedback,
  };
}