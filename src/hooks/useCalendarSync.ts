import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type CalendarProgramType = 'training' | 'cardio';

/**
 * Tracks which 4-week calendar-export "blocks" a user has already synced for
 * a given programme, so the Add-to-Calendar prompt shows once per new block
 * rather than re-offering the same weeks over and over.
 */
export function useCalendarSync(programType: CalendarProgramType, programId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['calendar-sync', programType, programId];

  const { data: syncedBlocks, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user || !programId) return [] as number[];
      const { data, error } = await supabase
        .from('programme_calendar_syncs')
        .select('block_number')
        .eq('user_id', user.id)
        .eq('program_type', programType)
        .eq('program_id', programId);
      if (error) throw error;
      return (data || []).map((row) => row.block_number as number);
    },
    enabled: !!user && !!programId,
  });

  const markBlockSynced = useMutation({
    mutationFn: async (blockNumber: number) => {
      if (!user || !programId) throw new Error('Must be logged in');
      const { error } = await supabase.from('programme_calendar_syncs').upsert(
        {
          user_id: user.id,
          program_type: programType,
          program_id: programId,
          block_number: blockNumber,
          synced_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,program_type,program_id,block_number' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    syncedBlocks: syncedBlocks || [],
    isBlockSynced: (block: number) => (syncedBlocks || []).includes(block),
    isLoading,
    markBlockSynced,
  };
}
