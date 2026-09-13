import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface UserReport {
  id: string;
  reporter_id: string | null;
  reported_user_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  reported_content_type: string | null;
  reported_content_id: string | null;
  created_at: string | null;
  // Joined data
  reporter_profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  reported_user_profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export function useAdminReports() {
  const { user } = useAuth();
  const { isAdminOrOwner } = useUserRole();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async (status?: string) => {
    if (!user || !isAdminOrOwner) return;

    setLoading(true);
    try {
      let query = supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profile data for reporters and reported users
      const reporterIds = [...new Set((data || []).map(r => r.reporter_id).filter((id): id is string => Boolean(id)))];
      const reportedIds = [...new Set((data || []).map(r => r.reported_user_id))];
      const allUserIds = [...new Set([...reporterIds, ...reportedIds])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', allUserIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const enrichedReports: UserReport[] = (data || []).map(r => ({
        ...r,
        status: r.status as UserReport['status'],
        reporter_profile: r.reporter_id ? profileMap.get(r.reporter_id) : undefined,
        reported_user_profile: profileMap.get(r.reported_user_id),
      }));

      setReports(enrichedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [user, isAdminOrOwner]);

  const updateReportStatus = useCallback(async (
    reportId: string,
    status: 'reviewed' | 'resolved' | 'dismissed',
    resolutionNotes?: string
  ) => {
    if (!user || !isAdminOrOwner) {
      toast.error('Unauthorized');
      return { error: new Error('Unauthorized') };
    }

    try {
      const { error } = await supabase
        .from('user_reports')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || null,
        })
        .eq('id', reportId);

      if (error) throw error;

      // Log the action
      await supabase.from('admin_activity_logs').insert([{
        admin_id: user.id,
        action_type: 'update_report',
        target_type: 'report',
        target_id: reportId,
        details: { new_status: status, resolution_notes: resolutionNotes } as Json,
      }]);

      toast.success('Report updated');
      return { error: null };
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
      return { error };
    }
  }, [user, isAdminOrOwner]);

  const createReport = useCallback(async (
    reportedUserId: string,
    reason: string,
    description?: string,
    contentType?: string,
    contentId?: string
  ) => {
    if (!user) {
      toast.error('You must be logged in to report');
      return { error: new Error('Not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          reason,
          description,
          reported_content_type: contentType,
          reported_content_id: contentId,
        });

      if (error) throw error;

      toast.success('Report submitted');
      return { error: null };
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to submit report');
      return { error };
    }
  }, [user]);

  const getPendingCount = useCallback(async () => {
    if (!user || !isAdminOrOwner) return 0;

    try {
      const { count, error } = await supabase
        .from('user_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching pending count:', error);
      return 0;
    }
  }, [user, isAdminOrOwner]);

  return {
    reports,
    loading,
    fetchReports,
    updateReportStatus,
    createReport,
    getPendingCount,
  };
}
