import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string | null;
  // Joined data
  admin_profile?: {
    display_name: string | null;
    username: string | null;
  };
}

export function useAdminActivityLogs() {
  const { user } = useAuth();
  const { isAdminOrOwner } = useUserRole();
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (limit: number = 50) => {
    if (!user || !isAdminOrOwner) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch admin profiles
      const adminIds = [...new Set((data || []).map(l => l.admin_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', adminIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const enrichedLogs: AdminActivityLog[] = (data || []).map(l => ({
        ...l,
        details: l.details as Record<string, unknown>,
        admin_profile: profileMap.get(l.admin_id),
      }));

      setLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdminOrOwner]);

  const getActionLabel = (actionType: string): string => {
    const labels: Record<string, string> = {
      suspend_user: 'Suspended User',
      lift_suspension: 'Lifted Suspension',
      assign_role: 'Changed Role',
      update_report: 'Updated Report',
      update_setting: 'Changed Setting',
      global_block: 'Global Block',
    };
    return labels[actionType] || actionType;
  };

  return {
    logs,
    loading,
    fetchLogs,
    getActionLabel,
  };
}
