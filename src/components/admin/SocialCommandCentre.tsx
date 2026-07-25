import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMetaCredentials } from '@/hooks/useMetaCredentials';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MetaCredentialsForm } from '@/components/settings/MetaCredentialsForm';
import { SocialMediaUpload } from './SocialMediaUpload';
import {
  Zap, Save, Calendar, BarChart3, Copy, Trash2, RefreshCw, Loader2,
  Image, Send, Facebook, Instagram, Key, TrendingUp, Trophy, Heart,
  MessageSquare, Share2, Eye, FileText, Music, Check,
} from 'lucide-react';

/* ── Music Library Track Type ── */
interface MusicTrack {
  id: string;
  title: string;
  genre: string;
  duration_seconds: number;
  cover_url: string | null;
  audio_url: string;
  artist_name?: string;
}

const PLATFORMS = [
  { id: 'instagram', label: '📸 INSTA' },
  { id: 'tiktok', label: '🎵 TIKTOK' },
  { id: 'facebook', label: '👥 FB' },
  { id: 'x', label: '𝕏 X' },
];

/* ── Content types aligned to the 6 Unbreakable pillars + key formats ── */
const CONTENT_TYPES = [
  { id: 'power', label: '🧱 Power' },
  { id: 'movement', label: '🔥 Movement' },
  { id: 'fuel', label: '⛽ Fuel' },
  { id: 'mindset', label: '🧠 Mindset' },
  { id: 'education', label: '📚 Education' },
  { id: 'un-tunes', label: '🎵 Un-Tunes' },
  { id: 'transformation', label: '💪 Transformation' },
  { id: 'real-talk', label: '🗣️ Real Talk' },
  { id: 'community', label: '🤝 Community' },
  { id: 'app-feature', label: '📱 App Feature' },
];

/* ── Tones — Scouse-first, authentic voices ── */
const TONES = [
  { id: 'scouse-fire', label: '🔥 SCOUSE FIRE' },
  { id: 'raw-honest', label: '💯 RAW & HONEST' },
  { id: 'coach-mode', label: '📋 COACH MODE' },
  { id: 'challenger', label: '😤 CHALLENGER' },
  { id: 'uplift', label: '✨ UPLIFT' },
  { id: 'banter', label: '😂 BANTER' },
];

interface SocialPost {
  id: string;
  platform: string;
  content_type: string;
  tone: string | null;
  content: string;
  image_prompt: string | null;
  image_url: string | null;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  meta_status?: string | null;
  meta_post_id?: string | null;
  published_at?: string | null;
  publish_error?: string | null;
  likes?: number;
  saves?: number;
  comments_count?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
  engagement_rate?: number;
  last_synced_at?: string | null;
  coach_name?: string | null;
  custom_image_url?: string | null;
  custom_video_url?: string | null;
  script?: string | null;
  user_id?: string;
}

export function SocialCommandCentre() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { hasCredentials, publishToMeta } = useMetaCredentials();
  const [activeTab, setActiveTab] = useState('create');
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [tone, setTone] = useState('');
  const [context, setContext] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [script, setScript] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [savedPosts, setSavedPosts] = useState<SocialPost[]>([]);
  const [allPosts, setAllPosts] = useState<SocialPost[]>([]);
  const [schedulePostId, setSchedulePostId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  /* ── Music Library State ── */
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [musicFilter, setMusicFilter] = useState('');

  useEffect(() => {
    fetchSavedPosts();
    fetchAllPosts();
    fetchMusicTracks();
  }, [user]);

  const fetchSavedPosts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setSavedPosts(data as SocialPost[]);
  };

  const fetchAllPosts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('social_posts')
      .select('*')
      .eq('meta_status', 'published')
      .order('engagement_rate', { ascending: false });
    if (data) setAllPosts(data as SocialPost[]);
  };

  const fetchMusicTracks = async () => {
    const { data } = await supabase
      .from('un_tunes_tracks')
      .select('id, title, genre, duration_seconds, cover_url, audio_url, artist_id, un_tunes_artists!inner(artist_name)')
      .order('play_count', { ascending: false })
      .limit(100);
    if (data) {
      setMusicTracks(data.map((t: any) => ({
        ...t,
        artist_name: t.un_tunes_artists?.artist_name || 'Unknown',
      })));
    }
  };

  const handleGenerate = async () => {
    if (!platform || !contentType) {
      toast({ title: 'Select platform and content type', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    setGeneratedPost('');
    setGeneratedImagePrompt('');
    setGeneratedImageUrl('');

    try {
      // Auto-select a random Un-Tunes track if none manually picked
      const trackToUse = selectedTrack || (musicTracks.length > 0
        ? musicTracks[Math.floor(Math.random() * musicTracks.length)]
        : null);
      const { data, error } = await supabase.functions.invoke('generate-social-content', {
        body: {
          platform, contentType, tone, context, inspiration,
          ...(trackToUse ? {
            featuredTrack: {
              title: trackToUse.title,
              genre: trackToUse.genre,
              artist: trackToUse.artist_name,
              duration: trackToUse.duration_seconds,
            },
          } : {}),
        },
      });
      if (error) throw error;
      setGeneratedPost(data.post || '');
      setGeneratedImagePrompt(data.imagePrompt || '');
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedImagePrompt) return;
    setGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-social-image', {
        body: { prompt: generatedImagePrompt },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        toast({ title: 'Image generated!' });
      }
    } catch (err: any) {
      toast({ title: 'Image generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleSave = async () => {
    if (!generatedPost || !user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('social_posts').insert({
        user_id: user.id,
        platform,
        content_type: contentType,
        tone: tone || null,
        content: generatedPost,
        image_prompt: generatedImagePrompt || null,
        image_url: generatedImageUrl || customImageUrl || null,
        status: 'draft',
        context: context || null,
        inspiration: inspiration || null,
        coach_name: profile?.display_name || null,
        custom_image_url: customImageUrl || null,
        custom_video_url: customVideoUrl || null,
        script: script || null,
        music_track_id: selectedTrack?.id || null,
        music_suggestion: selectedTrack ? `${selectedTrack.title} — ${selectedTrack.artist_name || 'Unbreakable'}` : null,
      });
      if (error) throw error;
      toast({ title: 'Post saved!' });
      setCustomImageUrl('');
      setCustomVideoUrl('');
      setScript('');
      fetchSavedPosts();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('social_posts').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Post deleted' });
      fetchSavedPosts();
    }
  };

  const handleSchedule = async () => {
    if (!schedulePostId || !scheduleDate) {
      toast({ title: 'Select a post and date', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('social_posts')
      .update({ status: 'scheduled', scheduled_at: scheduleDate })
      .eq('id', schedulePostId);
    if (!error) {
      toast({ title: 'Post scheduled!' });
      setSchedulePostId('');
      setScheduleDate('');
      fetchSavedPosts();
    }
  };

  const handlePublishToMeta = async (post: SocialPost, targetPlatform: 'facebook' | 'instagram' | 'both') => {
    if (!hasCredentials) {
      toast({ title: 'Meta credentials not set', description: 'Add your Meta API credentials in the API tab.', variant: 'destructive' });
      setActiveTab('api');
      return;
    }
    setPublishing(post.id);
    try {
      const { data, error } = await publishToMeta({
        post_id: post.id,
        platform: targetPlatform,
        content: post.content,
        image_url: post.custom_image_url || post.image_url || undefined,
      });
      if (error) throw error;
      if (data?.success) {
        toast({ title: '🚀 Published!', description: `Posted to ${targetPlatform === 'both' ? 'Facebook & Instagram' : targetPlatform}` });
      } else if (data?.errors) {
        toast({ title: 'Partial publish', description: data.errors.join('; '), variant: 'destructive' });
      }
      fetchSavedPosts();
    } catch (err: any) {
      toast({ title: 'Publish failed', description: err.message, variant: 'destructive' });
    } finally {
      setPublishing(null);
    }
  };

  const copyPostContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied!' });
  };

  const drafts = savedPosts.filter(p => p.status === 'draft');
  const scheduled = savedPosts.filter(p => p.status === 'scheduled');
  const published = savedPosts.filter(p => p.meta_status === 'published');

  // Engagement analytics
  const topPerformers = [...allPosts].sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0)).slice(0, 10);
  const totalLikes = allPosts.reduce((s, p) => s + (p.likes || 0), 0);
  const totalShares = allPosts.reduce((s, p) => s + (p.shares || 0), 0);
  const totalComments = allPosts.reduce((s, p) => s + (p.comments_count || 0), 0);
  const totalReach = allPosts.reduce((s, p) => s + (p.reach || 0), 0);
  const avgEngagement = allPosts.length > 0
    ? (allPosts.reduce((s, p) => s + (p.engagement_rate || 0), 0) / allPosts.length).toFixed(1)
    : '0';

  // Best performing content type/tone combos
  const comboMap: Record<string, { count: number; totalEngagement: number }> = {};
  allPosts.forEach(p => {
    const key = `${p.content_type} × ${p.tone || 'no-tone'}`;
    if (!comboMap[key]) comboMap[key] = { count: 0, totalEngagement: 0 };
    comboMap[key].count++;
    comboMap[key].totalEngagement += (p.engagement_rate || 0);
  });
  const bestCombos = Object.entries(comboMap)
    .map(([combo, stats]) => ({ combo, avg: stats.count > 0 ? stats.totalEngagement / stats.count : 0, count: stats.count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <div>
          <h2 className="font-display text-lg text-foreground tracking-wider">SOCIAL COMMAND CENTRE</h2>
          <p className="text-[10px] text-muted-foreground tracking-widest">CONTENT GENERATOR • PUBLISH • TRACK</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="create" className="font-display gap-1.5 text-xs"><Zap className="w-3.5 h-3.5" />CREATE</TabsTrigger>
          <TabsTrigger value="saved" className="font-display gap-1.5 text-xs"><Save className="w-3.5 h-3.5" />SAVED</TabsTrigger>
          <TabsTrigger value="schedule" className="font-display gap-1.5 text-xs"><Calendar className="w-3.5 h-3.5" />SCHEDULE</TabsTrigger>
          <TabsTrigger value="analytics" className="font-display gap-1.5 text-xs"><TrendingUp className="w-3.5 h-3.5" />ANALYTICS</TabsTrigger>
          <TabsTrigger value="api" className="font-display gap-1.5 text-xs"><Key className="w-3.5 h-3.5" />API</TabsTrigger>
        </TabsList>

        {/* CREATE TAB */}
        <TabsContent value="create" className="space-y-4 mt-4">
          <Card><CardContent className="pt-5 space-y-4">
            <p className="text-[10px] text-primary font-display tracking-widest">📱 PLATFORM</p>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map(p => (
                <Button key={p.id} variant={platform === p.id ? 'default' : 'outline'} size="sm"
                  className="text-xs font-display" onClick={() => setPlatform(p.id)}>{p.label}</Button>
              ))}
            </div>
          </CardContent></Card>

          <Card><CardContent className="pt-5 space-y-4">
            <p className="text-[10px] text-primary font-display tracking-widest">🔥 CONTENT TYPE</p>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPES.map(c => (
                <Button key={c.id} variant={contentType === c.id ? 'default' : 'outline'} size="sm"
                  className="text-xs font-display" onClick={() => setContentType(c.id)}>{c.label}</Button>
              ))}
            </div>
          </CardContent></Card>

          <Card><CardContent className="pt-5 space-y-4">
            <p className="text-[10px] text-primary font-display tracking-widest">🎯 TONE</p>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map(t => (
                <Button key={t.id} variant={tone === t.id ? 'default' : 'outline'} size="sm"
                  className="text-[10px] font-display" onClick={() => setTone(t.id)}>{t.label}</Button>
              ))}
            </div>
          </CardContent></Card>

          <Card><CardContent className="pt-5 space-y-3">
            <p className="text-[10px] text-primary font-display tracking-widest">✏️ CONTEXT / TOPIC (OPTIONAL)</p>
            <Textarea placeholder="e.g. Monday motivation, new programme launch, client success story..."
              value={context} onChange={e => setContext(e.target.value)} className="min-h-[60px]" />
          </CardContent></Card>

          <Card><CardContent className="pt-5 space-y-3">
            <p className="text-[10px] text-primary font-display tracking-widest">💡 INSPIRATION — PASTE POSTS YOU LOVE</p>
            <Textarea placeholder="Paste examples of posts you like the style of..."
              value={inspiration} onChange={e => setInspiration(e.target.value)} className="min-h-[60px]" />
          </CardContent></Card>

          <Card><CardContent className="pt-5 space-y-3">
            <p className="text-[10px] text-primary font-display tracking-widest">📝 SCRIPT / NOTES</p>
            <Textarea placeholder="Add your own script or notes for this post..."
              value={script} onChange={e => setScript(e.target.value)} className="min-h-[60px]" />
          </CardContent></Card>

          {/* Media Upload */}
          <Card><CardContent className="pt-5">
            <SocialMediaUpload
              onImageUploaded={setCustomImageUrl}
              onVideoUploaded={setCustomVideoUrl}
              currentImageUrl={customImageUrl}
              currentVideoUrl={customVideoUrl}
              onClearImage={() => setCustomImageUrl('')}
              onClearVideo={() => setCustomVideoUrl('')}
            />
          </CardContent></Card>

          {/* 🎵 Music Library Picker */}
          <Card><CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-primary font-display tracking-widest flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" /> UN-TUNES LIBRARY
              </p>
              <Button variant="ghost" size="sm" className="text-[9px] font-display h-6 px-2"
                onClick={() => setShowMusicPicker(!showMusicPicker)}>
                {showMusicPicker ? 'HIDE' : `BROWSE (${musicTracks.length} TRACKS)`}
              </Button>
            </div>

            {selectedTrack && (
              <div className="flex items-center gap-3 p-2 rounded-lg border border-primary/30 bg-primary/5">
                {selectedTrack.cover_url && (
                  <img loading="lazy" src={selectedTrack.cover_url} alt="" className="w-10 h-10 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-display text-foreground truncate">{selectedTrack.title}</p>
                  <p className="text-[9px] text-muted-foreground">{selectedTrack.artist_name} • {selectedTrack.genre}</p>
                </div>
                <Badge className="text-[8px] font-display bg-primary/20 text-primary border-0">
                  <Check className="w-2.5 h-2.5 mr-0.5" /> SELECTED
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedTrack(null)}>
                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            )}

            {showMusicPicker && (
              <div className="space-y-2">
                <Input
                  placeholder="Search tracks by title or genre..."
                  value={musicFilter}
                  onChange={e => setMusicFilter(e.target.value)}
                  className="text-xs h-8"
                />
                <div className="max-h-[200px] overflow-y-auto space-y-1 scrollbar-thin">
                  {musicTracks
                    .filter(t =>
                      !musicFilter ||
                      t.title.toLowerCase().includes(musicFilter.toLowerCase()) ||
                      t.genre.toLowerCase().includes(musicFilter.toLowerCase()) ||
                      (t.artist_name || '').toLowerCase().includes(musicFilter.toLowerCase())
                    )
                    .map(track => (
                      <button
                        key={track.id}
                        onClick={() => { setSelectedTrack(track); setShowMusicPicker(false); }}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                          selectedTrack?.id === track.id
                            ? 'border border-primary bg-primary/10'
                            : 'border border-border hover:border-primary/30 hover:bg-primary/5'
                        }`}
                      >
                        {track.cover_url ? (
                          <img loading="lazy" src={track.cover_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Music className="w-3.5 h-3.5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-display text-foreground truncate">{track.title}</p>
                          <p className="text-[9px] text-muted-foreground">{track.artist_name || 'Unbreakable'} • {track.genre}</p>
                        </div>
                        <span className="text-[9px] text-muted-foreground flex-shrink-0">
                          {Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, '0')}
                        </span>
                      </button>
                    ))}
                </div>
                <p className="text-[8px] text-muted-foreground text-center">
                  Select a track to feature in your social content. AI will reference it in the generated post.
                </p>
              </div>
            )}

            {!selectedTrack && !showMusicPicker && (
              <p className="text-[9px] text-muted-foreground">
                Feature a track from your Un-Tunes library in your post. Great for engagement.
              </p>
            )}
          </CardContent></Card>

          <Button className="w-full font-display tracking-widest text-xs py-6" onClick={handleGenerate}
            disabled={generating || !platform || !contentType}>
            {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />GENERATING...</> : '⚡ GENERATE CONTENT'}
          </Button>

          {/* OUTPUT */}
          {generatedPost && (
            <Card className="border-primary border-border bg-card">
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-primary font-display tracking-widest">✅ YOUR POST</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="text-[10px] font-display gap-1">
                      <Copy className="w-3 h-3" />COPY
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSave} disabled={loading} className="text-[10px] font-display gap-1">
                      <Save className="w-3 h-3" />SAVE
                    </Button>
                  </div>
                </div>
                <Badge className="font-display text-[9px] tracking-wider">{platform.toUpperCase()}</Badge>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{generatedPost}</p>

                {generatedImagePrompt && (
                  <div className="border border-dashed border-muted-foreground/30 rounded-lg p-4 space-y-3">
                    <p className="text-[10px] text-primary font-display tracking-widest">🖼️ IMAGE PROMPT</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{generatedImagePrompt}</p>
                    <Button variant="outline" size="sm" onClick={handleGenerateImage} disabled={generatingImage}
                      className="text-[10px] font-display gap-1.5 w-full">
                      {generatingImage ? <><Loader2 className="w-3 h-3 animate-spin" />GENERATING IMAGE...</>
                        : <><Image className="w-3 h-3" />GENERATE IMAGE</>}
                    </Button>
                    {generatedImageUrl && (
                      <img loading="lazy" src={generatedImageUrl} alt="Generated social content" className="w-full rounded-lg mt-2" />
                    )}
                  </div>
                )}

                <Button variant="ghost" className="w-full text-[10px] font-display gap-1.5 text-muted-foreground"
                  onClick={handleGenerate} disabled={generating}>
                  <RefreshCw className="w-3 h-3" />REGENERATE
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SAVED TAB */}
        <TabsContent value="saved" className="space-y-4 mt-4">
          <p className="text-[10px] text-primary font-display tracking-widest">SAVED POSTS</p>
          {savedPosts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-3xl mb-3">💾</p>
              <p className="text-sm">No saved posts yet. Generate and save content from the Create tab.</p>
            </div>
          ) : (
            savedPosts.map(post => (
              <Card key={post.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className="font-display text-[9px]">{post.platform.toUpperCase()}</Badge>
                      <Badge variant="outline" className="font-display text-[9px]">{post.content_type}</Badge>
                      <Badge variant={post.status === 'scheduled' ? 'default' : 'secondary'}
                        className="font-display text-[9px]">{post.status.toUpperCase()}</Badge>
                      {post.meta_status === 'published' && (
                        <Badge className="bg-primary/20 text-primary font-display text-[9px]">✅ PUBLISHED</Badge>
                      )}
                      {post.meta_status === 'partial' && (
                        <Badge className="bg-primary/20 text-primary font-display text-[9px]">⚠️ PARTIAL</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">{post.content}</p>

                  {/* Show uploaded media */}
                  {(post.custom_image_url || post.image_url) && (
                    <img loading="lazy" src={post.custom_image_url || post.image_url || ''} alt="Post image" className="w-full rounded-lg max-h-48 object-cover" />
                  )}
                  {post.custom_video_url && (
                    <video src={post.custom_video_url} controls className="w-full rounded-lg max-h-48" />
                  )}
                  {post.script && (
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-[9px] text-primary font-display tracking-wider mb-1">📝 SCRIPT</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{post.script}</p>
                    </div>
                  )}

                  {/* Engagement stats if published */}
                  {post.meta_status === 'published' && (post.likes || post.shares || post.comments_count) ? (
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-primary" />{post.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-primary" />{post.comments_count || 0}</span>
                      <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-primary" />{post.shares || 0}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-primary" />{post.reach || 0}</span>
                      {post.engagement_rate ? (
                        <Badge variant="outline" className="text-[8px] font-display">{post.engagement_rate}% ER</Badge>
                      ) : null}
                    </div>
                  ) : null}

                  {post.publish_error && (
                    <p className="text-[10px] text-destructive bg-destructive/10 rounded p-2">{post.publish_error}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyPostContent(post.content)}
                      className="text-[10px] font-display gap-1"><Copy className="w-3 h-3" />COPY</Button>
                    
                    {hasCredentials && post.meta_status !== 'published' && (
                      <>
                        <Button variant="outline" size="sm"
                          onClick={() => handlePublishToMeta(post, 'facebook')}
                          disabled={publishing === post.id}
                          className="text-[10px] font-display gap-1 border-primary/30 text-primary hover:bg-primary/10">
                          {publishing === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Facebook className="w-3 h-3" />}
                          FB
                        </Button>
                        <Button variant="outline" size="sm"
                          onClick={() => handlePublishToMeta(post, 'instagram')}
                          disabled={publishing === post.id || (!post.image_url && !post.custom_image_url)}
                          className="text-[10px] font-display gap-1 border-primary/30 text-primary hover:bg-primary/10">
                          {publishing === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Instagram className="w-3 h-3" />}
                          IG
                        </Button>
                        <Button variant="outline" size="sm"
                          onClick={() => handlePublishToMeta(post, 'both')}
                          disabled={publishing === post.id || (!post.image_url && !post.custom_image_url)}
                          className="text-[10px] font-display gap-1 border-primary/30 text-primary hover:bg-primary/10">
                          {publishing === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          BOTH
                        </Button>
                      </>
                    )}
                    
                    <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)}
                      className="text-[10px] font-display gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                      <Trash2 className="w-3 h-3" />DELETE
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* SCHEDULE TAB */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <Card><CardContent className="pt-5 space-y-4">
            <p className="text-[10px] text-primary font-display tracking-widest">📅 SCHEDULE A SAVED POST</p>
            <p className="text-xs text-muted-foreground">
              Schedule posts for publishing. Scheduled posts with Meta credentials will auto-publish at the set time.
            </p>

            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">SELECT POST</p>
              {drafts.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No saved drafts yet.</p>
              ) : (
                drafts.map(d => (
                  <button key={d.id}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                      schedulePostId === d.id
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                    }`}
                    onClick={() => setSchedulePostId(d.id)}>
                    <span className="font-display text-[9px] tracking-wider">{d.platform.toUpperCase()}</span>
                    <span className="mx-2">·</span>
                    {d.content.slice(0, 80)}...
                  </button>
                ))
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">DATE & TIME</p>
              <Input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
            </div>

            <Button className="w-full font-display tracking-widest text-xs" onClick={handleSchedule}
              disabled={!schedulePostId || !scheduleDate}>
              📅 MARK AS SCHEDULED
            </Button>
          </CardContent></Card>

          {scheduled.length > 0 && (
            <>
              <p className="text-[10px] text-primary font-display tracking-widest">SCHEDULED POSTS</p>
              {scheduled.map(post => (
                <Card key={post.id}>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex gap-2">
                      <Badge className="font-display text-[9px]">{post.platform.toUpperCase()}</Badge>
                      <Badge variant="outline" className="font-display text-[9px] text-primary border-primary/30">
                        {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString('en-GB') : 'SCHEDULED'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyPostContent(post.content)}
                        className="text-[10px] font-display gap-1"><Copy className="w-3 h-3" />COPY</Button>
                      {hasCredentials && post.meta_status !== 'published' && (
                        <Button variant="outline" size="sm"
                          onClick={() => handlePublishToMeta(post, 'both')}
                          disabled={publishing === post.id}
                          className="text-[10px] font-display gap-1 border-primary/30 text-primary hover:bg-primary/10">
                          {publishing === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          PUBLISH NOW
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <p className="text-[10px] text-primary font-display tracking-widest">📊 ENGAGEMENT ANALYTICS</p>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card><CardContent className="pt-4 text-center">
              <p className="text-2xl font-black text-primary">{savedPosts.length}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1">TOTAL POSTS</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 text-center">
              <p className="text-2xl font-black text-primary">{published.length}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1">PUBLISHED</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 text-center">
              <p className="text-2xl font-black text-primary">{totalLikes}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1">TOTAL LIKES</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 text-center">
              <p className="text-2xl font-black text-primary">{totalComments}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1">COMMENTS</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 text-center">
              <p className="text-2xl font-black text-primary">{totalShares}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1">SHARES</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 text-center">
              <p className="text-2xl font-black text-primary">{totalReach}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1">TOTAL REACH</p>
            </CardContent></Card>
          </div>

          <Card><CardContent className="pt-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-primary font-display tracking-widest">📈 AVG ENGAGEMENT RATE</p>
              <p className="text-xl font-black text-primary">{avgEngagement}%</p>
            </div>
          </CardContent></Card>

          {/* Best Performing Content Combos */}
          {bestCombos.length > 0 && (
            <Card><CardContent className="pt-5 space-y-3">
              <p className="text-[10px] text-primary font-display tracking-widest flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> BEST PERFORMING COMBOS
              </p>
              <p className="text-[10px] text-muted-foreground">Content type × tone combinations ranked by engagement</p>
              {bestCombos.map((combo, i) => (
                <div key={combo.combo} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary w-5">#{i + 1}</span>
                    <span className="text-xs text-foreground">{combo.combo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] font-display">{combo.avg.toFixed(1)}% ER</Badge>
                    <span className="text-[9px] text-muted-foreground">{combo.count} posts</span>
                  </div>
                </div>
              ))}
            </CardContent></Card>
          )}

          {/* Top Performing Posts Across All Coaches */}
          <Card><CardContent className="pt-5 space-y-3">
            <p className="text-[10px] text-primary font-display tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> TOP PERFORMING POSTS
            </p>
            <p className="text-[10px] text-muted-foreground">Highest engagement across all coaches</p>
            {topPerformers.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4 text-center">No published posts with engagement data yet. Engagement metrics sync after publishing to Meta.</p>
            ) : (
              topPerformers.map((post, i) => (
                <div key={post.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-primary">#{i + 1}</span>
                      <Badge className="font-display text-[9px]">{post.platform.toUpperCase()}</Badge>
                      <Badge variant="outline" className="font-display text-[9px]">{post.content_type}</Badge>
                    </div>
                    {post.engagement_rate ? (
                      <Badge className="bg-primary/20 text-primary font-display text-[9px]">{post.engagement_rate}% ER</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-primary" />{post.likes || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-primary" />{post.comments_count || 0}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-primary" />{post.shares || 0}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-primary" />{post.reach || 0}</span>
                  </div>
                  {post.coach_name && (
                    <p className="text-[9px] text-muted-foreground font-display tracking-wider">BY {post.coach_name.toUpperCase()}</p>
                  )}
                </div>
              ))
            )}
          </CardContent></Card>

          {/* Content Strategy Tips */}
          <Card><CardContent className="pt-5 space-y-3">
            <p className="text-[10px] text-primary font-display tracking-widest">💡 CONTENT STRATEGY</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>📸 <strong>Instagram</strong> — 4-7x per week. Reels get 3x more reach.</li>
              <li>🎵 <strong>TikTok</strong> — Post daily. Raw and real beats polished every time.</li>
              <li>👥 <strong>Facebook</strong> — Share into fitness groups. Community drives reach.</li>
              <li>⏰ <strong>Best times</strong> — 6-8am and 6-9pm weekdays.</li>
              <li>🔥 <strong>Top content</strong> — Real Talk and Transformation posts win in fitness.</li>
              <li>📊 <strong>Track everything</strong> — Engagement data syncs from Meta after publishing.</li>
            </ul>
          </CardContent></Card>
        </TabsContent>

        {/* API TAB — Meta Credentials */}
        <TabsContent value="api" className="space-y-4 mt-4">
          <MetaCredentialsForm />
          
          {!hasCredentials && (
            <Card className="border-primary/30 border-border bg-card">
              <CardContent className="pt-5 space-y-3">
                <p className="text-[10px] text-primary font-display tracking-widest">🔗 WHY CONNECT?</p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>✅ Publish directly to Facebook & Instagram from here</li>
                  <li>✅ Track engagement metrics (likes, shares, comments, reach)</li>
                  <li>✅ See best performing content across all coaches</li>
                  <li>✅ Learn what content types and tones work best</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
