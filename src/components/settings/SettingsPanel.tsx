import { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Moon,
  Sun,
  Globe,
  Users,
  Lock,
  Bell,
  MessageSquare,
  Heart,
  Trophy,
  Eye,
  UserPlus,
  Settings,
  Dumbbell,
  
  LogOut,
  Sparkles,
  Video,
  Volume2,
  Brain,
  Flame,
  Mic,
} from 'lucide-react';
import { useUserSettings, UserSettings } from '@/hooks/useUserSettings';
import { useAIPreferences } from '@/hooks/useAIPreferences';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

import { BlockedUsersSection } from './BlockedUsersSection';
export function SettingsPanel() {
  const { settings, loading, updateSettings, toggleTheme } = useUserSettings();
  const { preferences: aiPreferences, isLoading: aiLoading, updatePreferences } = useAIPreferences();
  const { profile, updateProfile } = useProfile();
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const { isAdmin, isCoach } = useUserRole();

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
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            APPEARANCE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Theme</Label>
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

      {/* Privacy Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            PRIVACY
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Who can see your profile
              </p>
            </div>
            <Select
              value={settings.profile_visibility}
              onValueChange={(value: 'public' | 'friends' | 'private') => 
                handleUpdate({ profile_visibility: value })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Public
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Friends Only
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Private
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Show Stats Publicly
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your stats and records
              </p>
            </div>
            <Switch
              checked={settings.show_stats_publicly}
              onCheckedChange={(checked) => handleUpdate({ show_stats_publicly: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Allow Comments by Default
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable comments on new posts by default
              </p>
            </div>
            <Switch
              checked={settings.allow_comments_default}
              onCheckedChange={(checked) => handleUpdate({ allow_comments_default: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Allow Friend Requests
              </Label>
              <p className="text-sm text-muted-foreground">
                Let others send you friend requests
              </p>
            </div>
            <Switch
              checked={settings.allow_friend_requests}
              onCheckedChange={(checked) => handleUpdate({ allow_friend_requests: checked })}
            />
          </div>

          <Separator />

          {/* Messaging Settings */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Who Can Message Me
              </Label>
              <p className="text-sm text-muted-foreground">
                Control who can send you direct messages
              </p>
            </div>
            <Select
              value={(settings as any).allow_messages || 'friends'}
              onValueChange={(value: 'everyone' | 'friends' | 'none') => 
                handleUpdate({ allow_messages: value } as any)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Everyone
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Friends Only
                  </div>
                </SelectItem>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    No One
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Show Online Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Let friends see when you're online
              </p>
            </div>
            <Switch
              checked={(settings as any).show_online_status ?? true}
              onCheckedChange={(checked) => handleUpdate({ show_online_status: checked } as any)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <BlockedUsersSection />


      {/* Programme Tracking Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            PROGRAMME TRACKING
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-2">
            Configure your strength training preferences
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Rest Timer Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Sound and vibration when rest ends
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Auto-start Rest Timer</Label>
              <p className="text-sm text-muted-foreground">
                Start timer after logging a set
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Coaching Feedback
              </Label>
              <p className="text-sm text-muted-foreground">
                Get personalised feedback on form, progression, and recovery
              </p>
            </div>
            <Switch
              checked={settings.ai_feedback_enabled}
              onCheckedChange={(checked) => handleUpdate({ ai_feedback_enabled: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
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
              <Label className="text-foreground font-medium flex items-center gap-2">
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
        </CardContent>
      </Card>

      {/* Coaching Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            UNBREAKABLE COACH
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground mb-2">
            Configure your coaching preferences — built on 10+ years of coaching experience
          </p>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
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

          {aiPreferences?.voice_feedback_enabled && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-medium text-foreground">Female Voice</p>
              <p className="text-xs text-muted-foreground">Clear and encouraging tone</p>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Auto Progression
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically suggest weight/rep increases
              </p>
            </div>
            <Switch
              checked={aiPreferences?.auto_progression_enabled ?? true}
              onCheckedChange={(checked) => updatePreferences.mutate({ auto_progression_enabled: checked })}
              disabled={aiLoading}
            />
          </div>
        </CardContent>
      </Card>


      {/* Notification Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            NOTIFICATIONS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Likes
              </Label>
              <p className="text-sm text-muted-foreground">
                When someone likes your post
              </p>
            </div>
            <Switch
              checked={settings.notify_likes}
              onCheckedChange={(checked) => handleUpdate({ notify_likes: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Comments
              </Label>
              <p className="text-sm text-muted-foreground">
                When someone comments on your post
              </p>
            </div>
            <Switch
              checked={settings.notify_comments}
              onCheckedChange={(checked) => handleUpdate({ notify_comments: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Friend Requests
              </Label>
              <p className="text-sm text-muted-foreground">
                When you receive a friend request
              </p>
            </div>
            <Switch
              checked={settings.notify_friend_requests}
              onCheckedChange={(checked) => handleUpdate({ notify_friend_requests: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Achievements
              </Label>
              <p className="text-sm text-muted-foreground">
                When you earn a new achievement
              </p>
            </div>
            <Switch
              checked={settings.notify_achievements}
              onCheckedChange={(checked) => handleUpdate({ notify_achievements: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Messages
              </Label>
              <p className="text-sm text-muted-foreground">
                When you receive a new message
              </p>
            </div>
            <Switch
              checked={(settings as any).notify_messages ?? true}
              onCheckedChange={(checked) => handleUpdate({ notify_messages: checked } as any)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Feed Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            FEED PREFERENCES
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Show Community Posts</Label>
              <p className="text-sm text-muted-foreground">
                See posts from people you follow
              </p>
            </div>
            <Switch
              checked={settings.show_community_posts}
              onCheckedChange={(checked) => handleUpdate({ show_community_posts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Show Achievements in Feed</Label>
              <p className="text-sm text-muted-foreground">
                Display achievement cards in your feed
              </p>
            </div>
            <Switch
              checked={settings.show_achievements_in_feed}
              onCheckedChange={(checked) => handleUpdate({ show_achievements_in_feed: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Meta Credentials moved to Social Command Centre */}

      {/* Nutrition Goals removed - managed via Fuel section */}

      {/* Sign Out */}
      <Card className="bg-card border-border border-destructive/30">
        <CardContent className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full font-display tracking-wide"
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