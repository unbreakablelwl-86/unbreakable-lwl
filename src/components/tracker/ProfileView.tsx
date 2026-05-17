import { useState, useRef } from 'react';
import { CoachingBioForm } from '@/components/settings/CoachingBioForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useUserRuns } from '@/hooks/useRuns';
import { useAuth } from '@/hooks/useAuth';
// import { useTrophies } from '@/hooks/useTrophies'; // Trophy system hidden for now
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { useCardioPrograms } from '@/hooks/useCardioPrograms';
import { useMindsetProgrammes } from '@/hooks/useMindsetProgrammes';
import { useMealPlans } from '@/hooks/useMealPlans';
import { MyProgramsSection } from '@/components/programming/MyProgramsSection';
import { SavedCardioPrograms } from '@/components/cardio/SavedCardioPrograms';
import { MindsetProgrammes } from '@/components/mindset/MindsetProgrammes';
import { Badge } from '@/components/ui/badge';
// import { TrophyCase, TrophyCountsBadge } from '@/components/tracker/TrophyCase'; // Trophy system hidden for now
import { CombinedStatsView } from '@/components/tracker/CombinedStatsView';
import { CombinedRecordsView } from '@/components/tracker/CombinedRecordsView';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { MembershipTab } from '@/components/profile/MembershipTab';
import { SocialLinksDisplay } from '@/components/profile/SocialLinksDisplay';
import { toast } from 'sonner';
import { 
  Edit2, 
  Save, 
  X, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Clock,
  Activity,
  Cake,
  Camera,
  Trash2,
  Globe,
  Lock,
  Dumbbell,
  CreditCard,
  BarChart2,
  Medal,
  User,
  Settings,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

export function ProfileView() {
  const { user } = useAuth();
  const { profile, updateProfile, refetch } = useProfile();
  const { uploadAvatar, removeAvatar, uploading } = useAvatarUpload();
  const { runs } = useUserRuns(user?.id);
  // const { getTrophyCounts } = useTrophies(); // Trophy system hidden for now
  const { activeProgram, programs } = useTrainingPrograms();
  const { sessions } = useWorkoutSessions();
  const { programs: cardioPrograms } = useCardioPrograms();
  const { programmes: mindsetProgrammes } = useMindsetProgrammes();
  const { mealPlans } = useMealPlans();
  const [isEditing, setIsEditing] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    username: '',
    bio: '',
    location: '',
    date_of_birth: '',
    is_public: true,
  });
  const [saving, setSaving] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'stats' | 'records' | 'membership' | 'settings'>('overview');
  // const trophyCounts = getTrophyCounts(); // Trophy system hidden for now
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalProgrammeCount = (programs?.length ?? 0) + (cardioPrograms?.length ?? 0) + (mindsetProgrammes?.length ?? 0) + (mealPlans?.length ?? 0);

  const normalizeUsernameInput = (raw: string) => {
    let v = raw.trim();
    if (v.startsWith('@')) v = v.slice(1);
    v = v.replace(/[.\s-]+/g, '_');
    return v;
  };

  const usernameValidationError = (() => {
    const v = normalizeUsernameInput(editData.username);
    if (!v) return null; // empty -> will be saved as null
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(v)) {
      return 'Nickname must be 3–30 chars and use only letters, numbers, and _';
    }
    return null;
  })();

  const startEditing = () => {
    setEditData({
      display_name: profile?.display_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      date_of_birth: profile?.date_of_birth || '',
      is_public: profile?.is_public ?? true,
    });
    setIsEditing(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { url, error } = await uploadAvatar(file);
    if (error) {
      toast.error(error.message);
    } else if (url) {
      toast.success('Avatar updated!');
      refetch();
    }
  };

  const handleRemoveAvatar = async () => {
    const { error } = await removeAvatar();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Avatar removed');
      refetch();
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveProfile = async () => {
    setSaving(true);

    const normalizedUsername = normalizeUsernameInput(editData.username);
    if (normalizedUsername && !/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
      setSaving(false);
      toast.error('Nickname can only use letters, numbers, and _ (3–30 chars)');
      return;
    }

    const payload = {
      ...editData,
      username: normalizedUsername,
    };

    const { error } = await updateProfile(payload);
    setSaving(false);

    if (error) {
      // Show the real reason (e.g. nickname taken / invalid) so users can fix it.
      const msg = (error as any)?.message || 'Failed to update profile';
      toast.error(msg);
    } else {
      toast.success('Profile updated!');
      setIsEditing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-card border-border overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
          
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-card">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {/* Avatar overlay with upload/remove buttons */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleAvatarClick}
                    disabled={uploading}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  {profile.avatar_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={handleRemoveAvatar}
                      disabled={uploading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editData.display_name}
                      onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                      placeholder="Display Name"
                      className="bg-input border-border"
                    />
                    <Input
                      value={editData.username}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          username: normalizeUsernameInput(e.target.value),
                        })
                      }
                      placeholder="@username"
                      className="bg-input border-border"
                    />
                    {usernameValidationError && (
                      <p className="text-xs text-destructive">{usernameValidationError}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <h2 className="font-display text-2xl text-foreground tracking-wide">
                      {profile.display_name || 'Runner'}
                    </h2>
                    {profile.username && (
                      <p className="text-muted-foreground">@{profile.username}</p>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveProfile}
                      disabled={saving}
                      className="font-display tracking-wide"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startEditing}
                    className="font-display tracking-wide"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    placeholder="City, Country"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                     <Cake className="w-4 h-4 text-primary" />
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    value={editData.date_of_birth}
                    onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for age-group leaderboards and trophies
                  </p>
                </div>
                {/* Public/Private Profile Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    {editData.is_public ? (
                     <Globe className="w-4 h-4 text-primary" />
                    ) : (
                      <Lock className="w-4 h-4 text-primary" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {editData.is_public ? 'Public Profile' : 'Private Profile'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {editData.is_public 
                          ? 'Anyone can see your profile and runs' 
                          : 'Only you can see your profile'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={editData.is_public}
                    onCheckedChange={(checked) => setEditData({ ...editData, is_public: checked })}
                  />
                </div>
              </div>
            ) : (
              <>
                {profile.bio && (
                  <p className="text-muted-foreground mt-4">{profile.bio}</p>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1 text-muted-foreground mt-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {/* Trophy counts badge - hidden for now */}

                {/* Social Links */}
                <SocialLinksDisplay
                  instagram={profile.social_instagram}
                  tiktok={profile.social_tiktok}
                  twitter={profile.social_twitter}
                  facebook={profile.social_facebook}
                  youtube={profile.social_youtube}
                  snapchat={profile.social_snapchat}
                  className="mt-3"
                />
              </>
            )}

            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Joined {format(parseISO(profile.created_at), 'MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                {profile.is_public ? (
                  <>
                    <Globe className="w-4 h-4 text-primary" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-primary" />
                    <span>Private</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Profile Tabs: Overview, Stats, Records */}
      <Tabs value={activeProfileTab} onValueChange={(v) => setActiveProfileTab(v as any)}>
        <TabsList className="w-full bg-card border border-border">
          <TabsTrigger value="overview" className="flex-1 font-display tracking-wide text-xs sm:text-sm">
            <User className="w-4 h-4 mr-1 sm:mr-2 text-primary" />
            <span className="hidden sm:inline">OVERVIEW</span>
            <span className="sm:hidden">ABOUT</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 font-display tracking-wide text-xs sm:text-sm">
            <BarChart2 className="w-4 h-4 mr-1 sm:mr-2 text-primary" />
            STATS
          </TabsTrigger>
          <TabsTrigger value="records" className="flex-1 font-display tracking-wide text-xs sm:text-sm">
            <Medal className="w-4 h-4 mr-1 sm:mr-2 text-primary" />
            <span className="hidden sm:inline">RECORDS</span>
            <span className="sm:hidden">PRs</span>
          </TabsTrigger>
          <TabsTrigger value="membership" className="flex-1 font-display tracking-wide text-xs sm:text-sm">
            <CreditCard className="w-4 h-4 mr-1 sm:mr-2 text-primary" />
            <span className="hidden sm:inline">MEMBERSHIP</span>
            <span className="sm:hidden">💳</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 font-display tracking-wide text-xs sm:text-sm">
            <Settings className="w-4 h-4 mr-1 sm:mr-2 text-primary" />
            <span className="hidden sm:inline">SETTINGS</span>
            <span className="sm:hidden">⚙️</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Coaching Profile (About Section) */}
          <CoachingBioForm />

          {/* Combined Programme Library */}
          <Card className="bg-card border-border p-6">
            <button
              onClick={() => setLibraryOpen(!libraryOpen)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <h3 className="font-display text-xl text-foreground tracking-wide">MY PROGRAMMES</h3>
                  <p className="text-sm text-muted-foreground">
                    {totalProgrammeCount} programme{totalProgrammeCount !== 1 ? 's' : ''} saved
                  </p>
                </div>
              </div>
              <motion.div animate={{ rotate: libraryOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <TrendingUp className="w-5 h-5 text-primary" />
              </motion.div>
            </button>

            {libraryOpen && (
              <div className="mt-6 space-y-6">
                {/* Power */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    <h4 className="font-display text-sm tracking-wide text-foreground">POWER</h4>
                    <Badge variant="outline" className="text-xs ml-auto">{programs?.length ?? 0}/2</Badge>
                  </div>
                  <MyProgramsSection />
                </div>

                {/* Movement */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-primary" />
                    <h4 className="font-display text-sm tracking-wide text-foreground">MOVEMENT</h4>
                    <Badge variant="outline" className="text-xs ml-auto">{cardioPrograms?.length ?? 0}/2</Badge>
                  </div>
                  {cardioPrograms && cardioPrograms.length > 0 ? (
                    <SavedCardioPrograms onViewProgram={() => {}} />
                  ) : (
                    <p className="text-sm text-muted-foreground">No movement programmes saved.</p>
                  )}
                </div>

                {/* Mindset */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-primary" />
                    <h4 className="font-display text-sm tracking-wide text-foreground">MINDSET</h4>
                    <Badge variant="outline" className="text-xs ml-auto">{mindsetProgrammes?.length ?? 0}/2</Badge>
                  </div>
                  <MindsetProgrammes />
                </div>

                {/* Fuel */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h4 className="font-display text-sm tracking-wide text-foreground">FUEL</h4>
                    <Badge variant="outline" className="text-xs ml-auto">{mealPlans?.length ?? 0}/2</Badge>
                  </div>
                  {mealPlans && mealPlans.length > 0 ? (
                    <div className="space-y-2">
                      {mealPlans.map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                          <div>
                            <p className="font-display text-sm text-foreground">{plan.name}</p>
                            {plan.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{plan.description}</p>
                            )}
                          </div>
                          {plan.is_active && (
                            <Badge variant="default" className="bg-primary/20 text-primary text-xs">Active</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No meal plans saved.</p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Trophy Case - hidden for now */}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <CombinedStatsView onViewRecords={(activityType) => {
            setActiveProfileTab('records');
          }} />
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <CombinedRecordsView />
        </TabsContent>

        <TabsContent value="membership" className="mt-6">
          <MembershipTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
