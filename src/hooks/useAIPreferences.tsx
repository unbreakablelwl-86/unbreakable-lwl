import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface AIPreferences {
  id: string;
  user_id: string;
  voice_feedback_enabled: boolean;
  voice_gender: 'male' | 'female';
  movement_analysis_enabled: boolean;
  auto_progression_enabled: boolean;
  feedback_frequency: 'realtime' | 'after_set' | 'after_session' | 'daily';
  created_at: string;
  updated_at: string;
}

const defaultPreferences: Omit<AIPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  voice_feedback_enabled: false,
  voice_gender: 'male',
  movement_analysis_enabled: false,
  auto_progression_enabled: true,
  feedback_frequency: 'after_session',
};

export function useAIPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['ai-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_ai_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Return existing or create default
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('user_ai_preferences')
          .insert({
            user_id: user.id,
            ...defaultPreferences,
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData as AIPreferences;
      }
      
      return data as AIPreferences;
    },
    enabled: !!user,
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<AIPreferences>) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('user_ai_preferences')
        .update(updates)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-preferences'] });
      toast({ title: 'Preferences Updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleVoiceFeedback = () => {
    if (!preferences) return;
    updatePreferences.mutate({ voice_feedback_enabled: !preferences.voice_feedback_enabled });
  };

  const toggleMovementAnalysis = () => {
    if (!preferences) return;
    updatePreferences.mutate({ movement_analysis_enabled: !preferences.movement_analysis_enabled });
  };

  const toggleAutoProgression = () => {
    if (!preferences) return;
    updatePreferences.mutate({ auto_progression_enabled: !preferences.auto_progression_enabled });
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    toggleVoiceFeedback,
    toggleMovementAnalysis,
    toggleAutoProgression,
  };
}