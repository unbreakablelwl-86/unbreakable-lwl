import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'dark' | 'light';
  profile_visibility: 'public' | 'friends' | 'private';
  show_stats_publicly: boolean;
  allow_comments_default: boolean;
  allow_friend_requests: boolean;
  notify_likes: boolean;
  notify_comments: boolean;
  notify_friend_requests: boolean;
  notify_achievements: boolean;
  notify_messages: boolean;
  show_community_posts: boolean;
  show_achievements_in_feed: boolean;
  ai_feedback_enabled: boolean;
  allow_messages: 'everyone' | 'friends' | 'none';
  show_online_status: boolean;
  motivational_popups_enabled: boolean;
  cardio_voice_enabled: boolean;
  created_at: string;
  updated_at: string;
}

const defaultSettings: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'dark',
  profile_visibility: 'public',
  show_stats_publicly: true,
  allow_comments_default: true,
  allow_friend_requests: true,
  notify_likes: true,
  notify_comments: true,
  notify_friend_requests: true,
  notify_achievements: true,
  notify_messages: true,
  show_community_posts: true,
  show_achievements_in_feed: true,
  ai_feedback_enabled: true,
  allow_messages: 'friends',
  show_online_status: true,
  motivational_popups_enabled: true,
  cardio_voice_enabled: true,
};

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setSettings(data as UserSettings);
    } else {
      // Create default settings if they don't exist
      const { data: newData, error: insertError } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id, ...defaultSettings })
        .select()
        .single();

      if (!insertError && newData) {
        setSettings(newData as UserSettings);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Sync DB theme to localStorage + DOM (ThemeToggle is the live controller)
  useEffect(() => {
    if (!settings?.theme) return;
    const stored = localStorage.getItem('unbreakable_theme');
    // Only apply DB theme if localStorage hasn't been set yet
    if (!stored) {
      localStorage.setItem('unbreakable_theme', settings.theme);
      const root = document.documentElement;
      if (settings.theme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
      }
    }
  }, [settings?.theme]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating settings:', error);
      return { error };
    }

    setSettings({ ...settings, ...updates });
    return { error: null };
  };

  const toggleTheme = async () => {
    const newTheme = settings?.theme === 'dark' ? 'light' : 'dark';
    return updateSettings({ theme: newTheme });
  };

  return {
    settings,
    loading,
    updateSettings,
    toggleTheme,
    refetch: fetchSettings,
  };
}
