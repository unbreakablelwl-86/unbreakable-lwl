import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCoachingProfile } from '@/hooks/useCoachingProfile';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { GeneratedProgram } from '@/lib/programTypes';

interface UserContext {
  userId: string;
  profile?: {
    displayName?: string;
    age?: number;
    gender?: string;
    heightCm?: number;
    weightKg?: number;
  };
  goals?: string;
  experience?: string;
  injuries?: string;
  equipment?: string[];
  daysPerWeek?: number;
  sessionLength?: number;
  sportPreference?: string;
  previousPerformance?: {
    benchMax?: number;
    squatMax?: number;
    deadliftMax?: number;
    fiveKTime?: string;
  };
  chatContext?: string;
}

interface ProgrammeResult {
  program: GeneratedProgram;
  savedToHub: boolean;
  programId?: string;
  activeCount?: number;
  message?: string;
}

// Keywords that indicate a programme request
const PROGRAMME_KEYWORDS = [
  'build me a programme',
  'build me a program',
  'create a programme',
  'create a program',
  'make me a programme',
  'make me a program',
  'design a programme',
  'design a program',
  'write me a programme',
  'write me a program',
  'i want a programme',
  'i want a program',
  'i need a programme',
  'i need a program',
  'generate a programme',
  'generate a program',
  'training plan',
  'workout plan',
  'workout programme',
  'workout program',
  'training programme',
  'training program',
  'week programme',
  'week program',
  'strength programme',
  'strength program',
  'hypertrophy programme',
  'hypertrophy program',
  'muscle building programme',
  'fat loss programme',
  'weight loss programme',
];

export function useAIProgramme() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { profile: coachingProfile } = useCoachingProfile();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const detectProgrammeRequest = useCallback((message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return PROGRAMME_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  }, []);

  const generateProgramme = useCallback(async (
    prompt: string,
    additionalContext?: Partial<UserContext>
  ): Promise<ProgrammeResult | null> => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to generate a programme.', variant: 'destructive' });
      return null;
    }

    setIsGenerating(true);

    try {
      // Build user context from profile, coaching profile, and any additional data
      const userContext: UserContext = {
        userId: user.id,
        profile: {
          displayName: profile?.display_name || undefined,
          heightCm: coachingProfile?.height_cm ? Number(coachingProfile.height_cm) : undefined,
          weightKg: coachingProfile?.weight_kg ? Number(coachingProfile.weight_kg) : undefined,
        },
        ...additionalContext,
      };

      // Sport preference from coaching profile
      if ((coachingProfile as any)?.sport_preference) {
        userContext.sportPreference = (coachingProfile as any).sport_preference;
      }

      // Calculate age from coaching profile or DOB
      if (coachingProfile?.age_years) {
        userContext.profile = { ...userContext.profile, age: coachingProfile.age_years };
      } else if (profile?.date_of_birth) {
        const dob = new Date(profile.date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        userContext.profile = { ...userContext.profile, age };
      }

      // Get the user's session token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-programme`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            userContext,
            prompt,
            requestType: 'chat_request',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate programme');
      }

      const result: ProgrammeResult = await response.json();

      // Invalidate queries to refresh My Programmes
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });

      if (result.savedToHub) {
        toast({
          title: 'Programme Created!',
          description: result.message || `"${result.program.programName}" is now in your My Programmes hub.`,
        });
      }

      return result;
    } catch (error) {
      console.error('Programme generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate programme',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, profile, coachingProfile, queryClient]);

  return {
    generateProgramme,
    detectProgrammeRequest,
    isGenerating,
  };
}
