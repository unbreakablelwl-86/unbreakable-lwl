import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ContentItemStatus =
  | 'idea' | 'researching' | 'briefed' | 'draft' | 'review'
  | 'changes_requested' | 'approved' | 'ready_to_publish' | 'published' | 'archived';

export interface ContentItem {
  id: string;
  title: string;
  content_pillar: string;
  topic: string | null;
  objective: string | null;
  target_audience: string | null;
  format: string;
  status: ContentItemStatus;
  brief: Record<string, unknown>;
  draft_content: string | null;
  cta: string | null;
  supporting_product_feature: string | null;
  supporting_educational_concept: string | null;
  source_material: unknown[];
  claims_to_verify: string[];
  experiment_hypothesis: string | null;
  experiment_tag: string | null;
  parent_content_id: string | null;
  ai_generated: boolean;
  generated_by_model: string | null;
  created_by: string | null;
  current_version: number;
  approved_version: number | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Founder-only Marketing & Content AI foundation hook.
 *
 * Every AI-generation call goes through the `marketing-content-ai` edge
 * function (dev-role re-verified server-side, every call audit-logged). It
 * never publishes anything — content_items only ever move between pre-publish
 * states here. Actually scheduling/publishing happens by promoting an
 * approved item into the existing social_posts table (Social Command Centre),
 * never automatically.
 */
export function useMarketingContentAI() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems((data ?? []) as unknown as ContentItem[]);
    } catch (err) {
      console.error('Failed to load content items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const invoke = useCallback(async (payload: Record<string, unknown>) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('marketing-content-ai', { body: payload });
      if (error) throw error;
      await fetchItems();
      return { data, error: null as string | null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Marketing & Content AI request failed';
      return { data: null, error: message };
    } finally {
      setGenerating(false);
    }
  }, [fetchItems]);

  const generateIdeas = useCallback((opts: { content_pillar?: string; topic?: string; objective?: string; count?: number }) =>
    invoke({ mode: 'generate_ideas', ...opts }), [invoke]);

  const createBrief = useCallback((content_item_id: string) =>
    invoke({ mode: 'create_brief', content_item_id }), [invoke]);

  const draftContent = useCallback((content_item_id: string, platform?: string) =>
    invoke({ mode: 'draft_content', content_item_id, platform }), [invoke]);

  const repurpose = useCallback((content_item_id: string, target_formats: string[]) =>
    invoke({ mode: 'repurpose', content_item_id, target_formats }), [invoke]);

  const analyzePerformance = useCallback(async (days = 90) => {
    const { data, error } = await supabase.functions.invoke('marketing-content-ai', {
      body: { mode: 'analyze_performance', days },
    });
    if (error) return { result: null, error: error.message };
    return { result: (data as { result: unknown })?.result ?? null, error: null as string | null };
  }, []);

  // --- Founder review actions: plain DB writes, no AI/LLM call involved. ---

  const sendToReview = useCallback(async (id: string) => {
    await supabase.from('content_items').update({ status: 'review' }).eq('id', id);
    await fetchItems();
  }, [fetchItems]);

  const approve = useCallback(async (item: ContentItem) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    await supabase.from('content_items').update({
      status: 'approved',
      approved_version: item.current_version,
      approved_by: uid ?? null,
      approved_at: new Date().toISOString(),
    }).eq('id', item.id);
    await supabase.from('content_approval_log').insert({
      content_item_id: item.id, action: 'approved', version_at_action: item.current_version, actor: uid ?? null,
    });
    await fetchItems();
  }, [fetchItems]);

  const requestChanges = useCallback(async (item: ContentItem, notes?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    await supabase.from('content_items').update({ status: 'changes_requested' }).eq('id', item.id);
    await supabase.from('content_approval_log').insert({
      content_item_id: item.id, action: 'changes_requested', version_at_action: item.current_version, actor: uid ?? null, notes: notes ?? null,
    });
    await fetchItems();
  }, [fetchItems]);

  const reject = useCallback(async (item: ContentItem, notes?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    await supabase.from('content_items').update({ status: 'archived' }).eq('id', item.id);
    await supabase.from('content_approval_log').insert({
      content_item_id: item.id, action: 'rejected', version_at_action: item.current_version, actor: uid ?? null, notes: notes ?? null,
    });
    await fetchItems();
  }, [fetchItems]);

  const markReadyToPublish = useCallback(async (id: string) => {
    await supabase.from('content_items').update({ status: 'ready_to_publish' }).eq('id', id);
    await fetchItems();
  }, [fetchItems]);

  const archive = useCallback(async (item: ContentItem) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    await supabase.from('content_items').update({ status: 'archived' }).eq('id', item.id);
    await supabase.from('content_approval_log').insert({
      content_item_id: item.id, action: 'archived', version_at_action: item.current_version, actor: uid ?? null,
    });
    await fetchItems();
  }, [fetchItems]);

  const duplicate = useCallback(async (item: ContentItem) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    await supabase.from('content_items').insert({
      title: `${item.title} (copy)`,
      content_pillar: item.content_pillar,
      topic: item.topic,
      objective: item.objective,
      target_audience: item.target_audience,
      format: item.format,
      status: 'idea',
      brief: item.brief,
      draft_content: item.draft_content,
      cta: item.cta,
      supporting_product_feature: item.supporting_product_feature,
      supporting_educational_concept: item.supporting_educational_concept,
      source_material: item.source_material,
      created_by: uid ?? null,
      ai_generated: false,
    });
    await supabase.from('content_approval_log').insert({
      content_item_id: item.id, action: 'duplicated', version_at_action: item.current_version, actor: uid ?? null,
    });
    await fetchItems();
  }, [fetchItems]);

  // Bridge into the EXISTING Social Command Centre / calendar — this is the
  // only path from a content_item to something that can actually be
  // scheduled or published. It creates a `social_posts` row in 'draft'
  // status; nothing here schedules or publishes it.
  const promoteToSocialDraft = useCallback(async (item: ContentItem, platform: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return { error: 'Not signed in' };
    const { error } = await supabase.from('social_posts').insert({
      user_id: uid,
      platform,
      content_type: item.content_pillar,
      tone: null,
      content: item.draft_content ?? '',
      status: 'draft',
      content_item_id: item.id,
    });
    return { error: error?.message ?? null };
  }, []);

  return {
    items, loading, generating,
    fetchItems, generateIdeas, createBrief, draftContent, repurpose, analyzePerformance,
    sendToReview, approve, requestChanges, reject, markReadyToPublish, archive, duplicate,
    promoteToSocialDraft,
  };
}
