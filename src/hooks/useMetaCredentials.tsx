import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MetaCredentials {
  id: string;
  page_access_token: string;
  facebook_page_id: string;
  instagram_account_id: string | null;
  page_name: string | null;
}

export function useMetaCredentials() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<MetaCredentials | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredentials = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('coach_meta_credentials')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setCredentials(data as MetaCredentials | null);
    setLoading(false);
  };

  useEffect(() => { fetchCredentials(); }, [user]);

  const saveCredentials = async (creds: {
    page_access_token: string;
    facebook_page_id: string;
    instagram_account_id?: string;
    page_name?: string;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    if (credentials) {
      const { error } = await supabase
        .from('coach_meta_credentials')
        .update({ ...creds, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (!error) await fetchCredentials();
      return { error };
    } else {
      const { error } = await supabase
        .from('coach_meta_credentials')
        .insert({ user_id: user.id, ...creds });
      if (!error) await fetchCredentials();
      return { error };
    }
  };

  const deleteCredentials = async () => {
    if (!user) return;
    await supabase.from('coach_meta_credentials').delete().eq('user_id', user.id);
    setCredentials(null);
  };

  const publishToMeta = async (options: {
    post_id?: string;
    platform: 'facebook' | 'instagram' | 'both';
    content: string;
    image_url?: string;
  }) => {
    const { data, error } = await supabase.functions.invoke('publish-to-meta', {
      body: options,
    });
    return { data, error };
  };

  return {
    credentials,
    loading,
    hasCredentials: !!credentials,
    saveCredentials,
    deleteCredentials,
    publishToMeta,
    refetch: fetchCredentials,
  };
}
