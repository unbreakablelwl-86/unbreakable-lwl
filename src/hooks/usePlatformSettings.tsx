import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: unknown;
  description: string | null;
  category: string;
  updated_at: string;
}

export interface PlatformSettingsMap {
  maintenance_mode: { enabled: boolean; message: string };
}

const defaultSettings: PlatformSettingsMap = {
  maintenance_mode: { enabled: false, message: '' },
};

export function usePlatformSettings() {
  const { user } = useAuth();
  const { isOwner } = useUserRole();
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [settingsMap, setSettingsMap] = useState<PlatformSettingsMap>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      setSettings(data || []);

      // Build settings map
      const map = { ...defaultSettings };
      (data || []).forEach((s: PlatformSetting) => {
        const value = (s.setting_value || {}) as Record<string, unknown>;
        switch (s.setting_key) {
          case 'maintenance_mode':
            map.maintenance_mode = {
              enabled: (value.enabled as boolean) ?? false,
              message: (value.message as string) ?? '',
            };
            break;
        }
      });

      setSettingsMap(map);
    } catch (error) {
      console.error('Error fetching platform settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(async (
    settingKey: string,
    value: Record<string, unknown>
  ) => {
    if (!user || !isOwner) {
      toast.error('Only owners can modify platform settings');
      return { error: new Error('Unauthorized') };
    }

    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          setting_value: value as Json,
          updated_by: user.id,
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      // Log the action
      await supabase.from('admin_activity_logs').insert([{
        admin_id: user.id,
        action_type: 'update_setting',
        target_type: 'platform_setting',
        details: { setting_key: settingKey, new_value: value } as Json,
      }]);

      toast.success('Setting updated');
      await fetchSettings();
      return { error: null };
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
      return { error };
    }
  }, [user, isOwner, fetchSettings]);

  const toggleFeature = useCallback(async (
    settingKey: string,
    enabled: boolean
  ) => {
    return updateSetting(settingKey, { enabled });
  }, [updateSetting]);

  return {
    settings,
    settingsMap,
    loading,
    fetchSettings,
    updateSetting,
    toggleFeature,
    isMaintenanceMode: settingsMap.maintenance_mode.enabled,
    maintenanceMessage: settingsMap.maintenance_mode.message,
  };
}
