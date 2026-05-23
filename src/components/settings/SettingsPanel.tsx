import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Moon,
  Sun,
  Dumbbell,
  LogOut,
  Flame,
  Mic,
  Volume2,
  Video,
  Brain,
} from 'lucide-react';
import { useUserSettings, UserSettings } from '@/hooks/useUserSettings';
import { useAIPreferences } from '@/hooks/useAIPreferences';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

import { BlockedUsersSection } from './BlockedUsersSection';
import { SocialLinksCard } from './SocialLinksCard';
import { SportPreferenceCard } from './SportPreferenceCard';

export function SettingsPanel() {
  const { settings, loading, updateSettings, toggleTheme } = useUserSettings();
  const { preferences: aiPreferences, isLoading: aiLoading, updatePreferences } = useAIPreferences();
  const { profile, updateProfile } = useProfile();
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleUpdate = async (updates: Partial<UserSettings>) => {
    setSaving(true);
    const { error } = await updateSettings(updates);
    setSaving(false);
    if (error) {
      toast.error('Failed to update settings');
    } else {
      toast.success('Settings updated');
    }
  };

  const handleThemeToggle = async () => {
    const { error } = await toggleTheme();
    if (error) {
      toast.error('Failed to update theme');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className="bg-[#111] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="font-heading text-xl tracking-wide flex items-center gap-2">
            {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            APPEARANCE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white font-medium">Theme</Label>
              <p className="text-sm text-[#888]">
                Switch between dark and light mode
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Sun className={`w-4 h-4 ${settings.theme === 'light' ? 'text-primary' : 'text-[#888]'}`} />
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={handleThemeToggle}
              />
              <Moon className={`w-4 h-4 ${settings.theme === 'dark' ? 'text-primary' : 'text-[#888]'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <BlockedUsersSection />

      {/* Programme Tracking Preferences */}
      <Card className="bg-[#111] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="font-heading text-xl tracking-wide flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            PROGRAMME TRACKING
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                Motivational Popups
              </Label>
              <p className="text-sm text-[#888]">
                Motivational quotes on sign-in and milestones
              </p>
            </div>
            <Switch
              checked={(settings as any).motivational_popups_enabled ?? true}
              onCheckedChange={(checked) => handleUpdate({ motivational_popups_enabled: checked } as any)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white font-medium flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                Cardio Voice Prompts
              </Label>
              <p className="text-sm text-[#888]">
                Voice updates every 1km during live cardio tracking
              </p>
            </div>
            <Switch
              checked={(settings as any).cardio_voice_enabled ?? true}
              onCheckedChange={(checked) => handleUpdate({ cardio_voice_enabled: checked } as any)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Coaching Settings */}
      <Card className="bg-[#111] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="font-heading text-xl tracking-wide flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            UNBREAKABLE COACH
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                Breathing Voice
              </Label>
              <p className="text-sm text-[#888]">
                Voice guidance for breathing meditation exercises
              </p>
            </div>
            <Switch
              checked={aiPreferences?.voice_feedback_enabled ?? false}
              onCheckedChange={(checked) => updatePreferences.mutate({ voice_feedback_enabled: checked })}
              disabled={aiLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white font-medium flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Movement Analysis
              </Label>
              <p className="text-sm text-[#888]">
                Analyse technique from uploaded videos
              </p>
            </div>
            <Switch
              checked={aiPreferences?.movement_analysis_enabled ?? false}
              onCheckedChange={(checked) => updatePreferences.mutate({ movement_analysis_enabled: checked })}
              disabled={aiLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sport Preference */}
      <SportPreferenceCard />

      {/* Social Links */}
      <SocialLinksCard profile={profile} updateProfile={updateProfile} />

      {/* Sign Out */}
      <Card className="bg-[#111] border-white/[0.06] border-destructive/30">
        <CardContent className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full font-heading tracking-wide"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            SIGN OUT
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
