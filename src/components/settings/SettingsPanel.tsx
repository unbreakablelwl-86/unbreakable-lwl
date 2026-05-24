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
      <Card className="bg-card border-border">
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
              <p className="text-sm text-muted-foreground">
                Switch between dark and light mode
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Sun className={`w-4 h-4 ${settings.theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={handleThemeToggle}
              />
              <Moon className={`w-4 h-4 ${settings.theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <BlockedUsersSection />

      {/* Programme Tracking Preferences */}
      <Card className="bg-card border-border">
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
              <p className="text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">
                Voice updates every 1km during live cardio tracking
              </p>
            </div>
            <Switch
              checked={(settings as any).cardio_voice_enabled ?? true}
              onCheckedChange={(checked) => handleUpdate({ cardio_voice_enabled: checked } as any)}
            />
          </div>

          {/* Voice Gender */}
          {(settings as any).cardio_voice_enabled !== false && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" />
                  Voice Type
                </Label>
                <p className="text-sm text-muted-foreground">
                  Male or female cardio coach voice
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-display tracking-wide transition-all ${
                    (settings as any).cardio_voice_gender !== 'female' 
                      ? 'bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30' 
                      : 'bg-[#1A1A1A] text-muted-foreground border border-[#333]'
                  }`}
                  onClick={() => handleUpdate({ cardio_voice_gender: 'male' } as any)}
                >
                  Male
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-display tracking-wide transition-all ${
                    (settings as any).cardio_voice_gender === 'female' 
                      ? 'bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30' 
                      : 'bg-[#1A1A1A] text-muted-foreground border border-[#333]'
                  }`}
                  onClick={() => handleUpdate({ cardio_voice_gender: 'female' } as any)}
                >
                  Female
                </button>
              </div>
            </div>
          )}

          {/* Spotify Link */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                Spotify
              </Label>
              <p className="text-sm text-muted-foreground">
                {(settings as any).spotify_linked ? 'Connected — music during sessions' : 'Link for music during sessions'}
              </p>
            </div>
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-display tracking-wide transition-all ${
                (settings as any).spotify_linked 
                  ? 'bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30' 
                  : 'bg-[#1A1A1A] text-muted-foreground border border-[#333] hover:border-[#1DB954]/30 hover:text-[#1DB954]'
              }`}
              onClick={() => {
                if (!(settings as any).spotify_linked) {
                  window.open('https://accounts.spotify.com/authorize?client_id=placeholder&response_type=code&redirect_uri=' + encodeURIComponent(window.location.origin + '/settings/spotify-callback') + '&scope=user-read-playback-state,user-modify-playback-state,streaming', '_blank');
                  toast.info('Spotify integration coming soon — stay tuned! 🎵');
                } else {
                  handleUpdate({ spotify_linked: false } as any);
                  toast.success('Spotify disconnected');
                }
              }}
            >
              {(settings as any).spotify_linked ? 'Connected ✓' : 'Link'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Coaching Settings */}
      <Card className="bg-card border-border">
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
              <p className="text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">
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
      <Card className="bg-card border-border border-destructive/30">
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
