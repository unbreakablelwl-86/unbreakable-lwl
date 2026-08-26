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
  Lock,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useUserSettings, UserSettings } from '@/hooks/useUserSettings';
import { useAIPreferences } from '@/hooks/useAIPreferences';
import { VoiceSettingsSheet } from '@/components/coaching/VoiceSettingsSheet';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

import { BlockedUsersSection } from './BlockedUsersSection';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { SocialLinksCard } from './SocialLinksCard';
import { SportPreferenceCard } from './SportPreferenceCard';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function SettingsPanel() {
  const { settings, loading, updateSettings, toggleTheme } = useUserSettings();
  const { preferences: aiPreferences, isLoading: aiLoading, updatePreferences } = useAIPreferences();
  const { profile, updateProfile } = useProfile();
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const { isSupported: pushSupported, isSubscribed: pushSubscribed, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications();
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message || 'Failed to change password');
    } else {
      toast.success('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeletingAccount(true);
    // Call edge function to delete user data, then sign out
    const { error } = await supabase.functions.invoke('delete-account');
    if (error) {
      toast.error('Failed to delete account. Please contact support.');
      setDeletingAccount(false);
      return;
    }
    await signOut();
    toast.success('Account deleted successfully');
  };

  const handlePrivacyToggle = async (isPublic: boolean) => {
    if (!profile) return;
    const { error } = await updateProfile({ is_public: isPublic } as any);
    if (error) {
      toast.error('Failed to update privacy setting');
    } else {
      toast.success(isPublic ? 'Profile is now public' : 'Profile is now private');
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

          {/* Voice — opens coach voice settings sheet */}
          <VoiceSettingsSheet>
            <button className="flex items-center justify-between w-full text-left">
              <div className="space-y-0.5">
                <Label className="text-foreground font-medium flex items-center gap-2 cursor-pointer">
                  <Volume2 className="w-4 h-4 text-primary" />
                  Coach Voice Settings
                </Label>
                <p className="text-sm text-muted-foreground">
                  Configure voice for chat, mindset, cardio, notifications & more
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </VoiceSettingsSheet>

          {/* Spotify removed — Un-Tunes is standalone */}
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
          {/* Breathing voice now controlled via Coach Voice Settings above */}

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
        </CardContent>
      </Card>

      {/* Sport Preference */}
      <SportPreferenceCard />

      {/* Social Links */}
      <SocialLinksCard profile={profile} updateProfile={updateProfile} />

      {/* Privacy */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl tracking-wide flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            PRIVACY
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium flex items-center gap-2">
                {(profile as any)?.is_public ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-primary" />}
                Public Profile
              </Label>
              <p className="text-sm text-muted-foreground">
                {(profile as any)?.is_public ? 'Anyone can see your profile and posts' : 'Only followers can see your profile'}
              </p>
            </div>
            <Switch
              checked={(profile as any)?.is_public ?? false}
              onCheckedChange={handlePrivacyToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      {pushSupported && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl tracking-wide flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              NOTIFICATIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  {pushSubscribed ? 'You will receive alerts for PBs, coaching, and drops' : 'Enable to get notified about new PBs, coaching updates, and card drops'}
                </p>
              </div>
              <Switch
                checked={pushSubscribed}
                onCheckedChange={(checked) => checked ? pushSubscribe() : pushUnsubscribe()}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Change */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl tracking-wide flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            CHANGE PASSWORD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground font-medium">New Password</Label>
            <Input
              type="password"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Confirm Password</Label>
            <Input
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <Button
            onClick={handlePasswordChange}
            disabled={changingPassword || !newPassword || !confirmPassword}
            className="w-full font-heading tracking-wide"
          >
            {changingPassword ? 'CHANGING...' : 'CHANGE PASSWORD'}
          </Button>
        </CardContent>
      </Card>

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

      {/* Account Deletion */}
      <Card className="bg-card border-border border-destructive/50">
        <CardHeader>
          <CardTitle className="font-heading text-xl tracking-wide flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            DELETE ACCOUNT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all data. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full font-heading tracking-wide">
                <Trash2 className="w-4 h-4 mr-2" />
                DELETE MY ACCOUNT
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-foreground">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will permanently delete your account, all your data, achievements, and progress. 
                  This cannot be undone. Type <span className="text-destructive font-bold">DELETE</span> to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="bg-background border-border"
              />
              <AlertDialogFooter>
                <AlertDialogCancel className="font-display">CANCEL</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                  className="bg-destructive text-destructive-foreground font-display"
                >
                  {deletingAccount ? 'DELETING...' : 'DELETE FOREVER'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
