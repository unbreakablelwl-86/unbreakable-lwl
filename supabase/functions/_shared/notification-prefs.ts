/**
 * Map notification types to user preference keys.
 * Types not listed here are always sent.
 */
const TYPE_TO_PREF: Record<string, string> = {
  ai_tracker_autofilled: "ai_daily_fill",
  ai_programme: "ai_programme",
  ai_meal_plan: "ai_meal_plan",
  weekly_pack: "weekly_pack",
  pb_unlocked: "pb_unlocked",
  post_like: "post_likes",
  follow: "new_followers",
  post_comment: "comments",
  plan_update: "coach_plan",
  programme_updated: "coach_plan",
  coach_plan: "coach_plan",
  coaching_feedback: "coach_message",
  feedback_response: "coach_message",
  coach_message: "coach_message",
};

/**
 * Check if a user wants to receive this notification type.
 * @param supabase - Supabase client (service role)
 * @param userId - Target user
 * @param notificationType - The notification type string
 * @returns true if allowed, false if user has opted out
 */
export async function canNotify(
  supabase: any,
  userId: string,
  notificationType: string
): Promise<boolean> {
  const prefKey = TYPE_TO_PREF[notificationType];
  if (!prefKey) return true;

  try {
    const { data } = await supabase
      .from("coaching_profiles")
      .select("notification_preferences")
      .eq("user_id", userId)
      .maybeSingle();

    const prefs = data?.notification_preferences || {};
    return prefs[prefKey] !== false;
  } catch {
    return true;
  }
}
