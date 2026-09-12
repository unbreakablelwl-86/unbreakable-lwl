import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

export interface MindsetProgramme {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal?: string;
  duration_weeks: number;
  daily_minutes: number;
  focus_areas?: string[];
  status: string;
  programme_data: any;
  is_active: boolean;
  completed_activities?: string[];
  created_at: string;
  updated_at: string;
}

const MAX_ACTIVE_MINDSET = 2;

export function useMindsetProgrammes() {
  const { user } = useAuth();
  const { isDev, isCoach } = useUserRole();
  const queryClient = useQueryClient();

  const { data: programmes, isLoading } = useQuery({
    queryKey: ['mindset-programmes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mindset_programmes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MindsetProgramme[];
    },
    enabled: !!user,
  });

  const activeProgrammes = programmes?.filter(p => p.is_active) || [];

  const MAX_SAVED_MINDSET = 2;

  const saveProgramme = useMutation({
    mutationFn: async ({ programme, forUserId }: {
      programme: {
        name: string;
        description?: string;
        goal?: string;
        duration_weeks: number;
        daily_minutes: number;
        focus_areas?: string[];
        programme_data: any;
      };
      forUserId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Check total saved limit (dev/coach bypass)
      const bypassLimit = isDev || isCoach;
      if (!bypassLimit) {
        const currentCount = programmes?.length ?? 0;
        if (currentCount >= MAX_SAVED_MINDSET) {
          throw new Error(`Maximum ${MAX_SAVED_MINDSET} Mindset programmes allowed. Delete one to save a new one.`);
        }
      }
      const { data, error } = await supabase
        .from('mindset_programmes')
        .insert({
          ...programme,
          user_id: forUserId || user.id,
          status: 'not_started',
          is_active: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindset-programmes'] });
      toast.success('Mindset programme saved');
    },
    onError: () => toast.error('Failed to save programme'),
  });

  const toggleActive = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const prog = programmes?.find(p => p.id === id);
      if (!prog) throw new Error('Not found');

      const bypassLimit = isDev || isCoach;
      if (!bypassLimit && !prog.is_active && activeProgrammes.length >= MAX_ACTIVE_MINDSET) {
        throw new Error('Maximum 2 active mindset programmes. Deactivate one first.');
      }

      const { error } = await supabase
        .from('mindset_programmes')
        .update({
          is_active: !prog.is_active,
          status: !prog.is_active ? 'active' : 'paused',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mindset-programmes'] }),
    onError: (e) => toast.error(e.message),
  });

  const deleteProgramme = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('mindset_programmes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindset-programmes'] });
      toast.success('Programme deleted');
    },
    onError: () => toast.error('Failed to delete programme'),
  });

  const generateProgramme = async (prompt: string, userContext?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await supabase.functions.invoke('generate-mindset-programme', {
      body: { prompt, userContext },
    });

    if (response.error) throw new Error(response.error.message);
    return response.data;
  };

  return {
    programmes,
    activeProgrammes,
    isLoading,
    saveProgramme,
    toggleActive,
    deleteProgramme,
    generateProgramme,
  };
}
