import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Bot, Trophy, Heart, UserPlus, MessageCircle, Dumbbell, Package, Apple } from 'lucide-react';
import { toast } from 'sonner';

function getPrefSections(isDev: boolean) {
  return [
    {
      label: 'AI Coach',
      items: [
        // Dev-only: ties to the daily-autofill cron, which only ever runs for dev-role accounts.
        ...(isDev ? [{ key: 'ai_daily_fill', label: 'Daily auto-fill completed', icon: Bot }] : []),
        { key: 'ai_programme', label: 'Programme generated', icon: Bot },
        { key: 'ai_meal_plan', label: 'Meal plan generated', icon: Bot },
        // { key: 'weekly_pack', label: 'Weekly pack ready', icon: Package }, // Card system hidden
      ],
    },
  {
    label: 'Training',
    items: [
      { key: 'pb_unlocked', label: 'New PB unlocked', icon: Trophy },
    ],
  },
  {
    label: 'Social',
    items: [
      { key: 'post_likes', label: 'Post likes', icon: Heart },
      { key: 'new_followers', label: 'New followers', icon: UserPlus },
      { key: 'comments', label: 'Comments', icon: MessageCircle },
    ],
  },
  {
    label: 'Coaching',
    items: [
      { key: 'coach_plan', label: 'Plan updated by coach', icon: Dumbbell },
      { key: 'coach_message', label: 'Coach message', icon: Apple },
    ],
  },
  ];
}

const DEFAULT_PREFS: Record<string, boolean> = {
  ai_daily_fill: true,
  ai_programme: true,
  ai_meal_plan: true,
  weekly_pack: true,
  pb_unlocked: true,
  post_likes: true,
  new_followers: true,
  comments: true,
  coach_plan: true,
  coach_message: true,
};

export function NotificationPreferences() {
  const { user } = useAuth();
  const { isDev } = useUserRole();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const PREF_SECTIONS = getPrefSections(isDev);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('coaching_profiles')
        .select('notification_preferences')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.notification_preferences) {
        setPrefs({ ...DEFAULT_PREFS, ...data.notification_preferences });
      }
      setLoading(false);
    })();
  }, [user]);

  const toggle = async (key: string) => {
    if (!user) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);

    const { error } = await supabase
      .from('coaching_profiles')
      .update({ notification_preferences: updated } as any)
      .eq('user_id', user.id);

    if (error) {
      // Revert on failure
      setPrefs(prefs);
      toast.error('Failed to save preference');
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-heading font-bold text-sm tracking-wider text-foreground uppercase">
          Notification Preferences
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Choose which notifications you receive</p>
      </div>

      {PREF_SECTIONS.map((section) => (
        <div key={section.label}>
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.label}</p>
          </div>
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <Switch
                  checked={prefs[item.key] !== false}
                  onCheckedChange={() => toggle(item.key)}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
