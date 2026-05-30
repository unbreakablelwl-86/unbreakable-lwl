import { supabase } from '@/integrations/supabase/client';

/**
 * Map notification types to preference keys.
 * Types not listed here are always sent (e.g. system notifications).
 */
const TYPE_TO_PREF: Record<string, string> = {
  // AI
  ai_tracker_autofilled: 'ai_daily_fill',
  ai_programme: 'ai_programme',
  ai_meal_plan: 'ai_meal_plan',
  weekly_pack: 'weekly_pack',
  // Training
  pb_unlocked: 'pb_unlocked',
  // Social
  post_like: 'post_likes',
  follow: 'new_followers',
  post_comment: 'comments',
  // Coaching
  plan_update: 'coach_plan',
  programme_updated: 'coach_plan',
  coach_plan: 'coach_plan',
  coaching_feedback: 'coach_message',
  feedback_response: 'coach_message',
  coach_message: 'coach_message',
};

/**
 * Check if a user has opted in to a notification type.
 * Returns true (send) if no preference set or preference is true.
 * Returns false (block) only if explicitly set to false.
 */
export async function canNotify(userId: string, notificationType: string): Promise<boolean> {
  const prefKey = TYPE_TO_PREF[notificationType];
  if (!prefKey) return true; // Not a gated type — always send

  try {
    const { data } = await supabase
      .from('coaching_profiles')
      .select('notification_preferences')
      .eq('user_id', userId)
      .maybeSingle();

    const prefs = (data as any)?.notification_preferences || {};
    return prefs[prefKey] !== false; // default true if not set
  } catch {
    return true; // On error, send the notification
  }
}
