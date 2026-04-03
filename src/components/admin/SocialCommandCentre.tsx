import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMetaCredentials } from '@/hooks/useMetaCredentials';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Save, Calendar, BarChart3, Copy, Trash2, RefreshCw, Loader2, Image, Send, Facebook, Instagram } from 'lucide-react';

const PLATFORMS = [
  { id: 'instagram', label: '📸 INSTA' },
  { id: 'tiktok', label: '🎵 TIKTOK' },
  { id: 'facebook', label: '👥 FB' },
  { id: 'x', label: '𝕏 X' },
];

const CONTENT_TYPES = [
  { id: 'motivational', label: '💪 Motivational' },
  { id: 'workout-tip', label: '🏋️ Workout Tip' },
  { id: 'nutrition', label: '🍎 Nutrition' },
  { id: 'mindset', label: '🧠 Mindset' },
  { id: 'course-promo', label: '🎓 Course Promo' },
  { id: 'community', label: '👥 Community' },
  { id: 'check-in', label: '📸 Check In' },
  { id: 'real-talk', label: '🎤 Real Talk' },
  { id: 'transformation', label: '⚡ Transformation' },
  { id: 'app-feature', label: '📱 App Feature' },
];

const TONES = [
  { id: 'fired-up', label: '🔥 FIRED UP' },
  { id: 'real-raw', label: '💯 REAL & RAW' },
  { id: 'educational', label: '📚 EDUCATIONAL' },
  { id: 'humorous', label: '😄 HUMOROUS' },
  { id: 'challenging', label: '⚔️ CHALLENGING' },
  { id: 'inspiring', label: '✨ INSPIRING' },
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
}

export function SocialCommandCentre() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [tone, setTone] = useState('');
  const [context, setContext] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [savedPosts, setSavedPosts] = useState<SocialPost[]>([]);
  const [schedulePostId, setSchedulePostId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSavedPosts();
  }, [user]);

  const fetchSavedPosts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSavedPosts(data as SocialPost[]);
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
      const { data, error } = await supabase.functions.invoke('generate-social-content', {
        body: { platform, contentType, tone, context, inspiration },
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
        image_url: generatedImageUrl || null,
        status: 'draft',
        context: context || null,
        inspiration: inspiration || null,
      });
      if (error) throw error;
      toast({ title: 'Post saved!' });
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

  const copyPostContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied!' });
  };

  const drafts = savedPosts.filter(p => p.status === 'draft');
  const scheduled = savedPosts.filter(p => p.status === 'scheduled');
  const platformCounts = savedPosts.reduce((acc, p) => {
    acc[p.platform] = (acc[p.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <div>
          <h2 className="font-display text-lg text-foreground tracking-wider">SOCIAL COMMAND CENTRE</h2>
          <p className="text-[10px] text-muted-foreground tracking-widest">CONTENT GENERATOR • ADMIN ONLY</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="create" className="font-display gap-1.5 text-xs"><Zap className="w-3.5 h-3.5" />CREATE</TabsTrigger>
          <TabsTrigger value="saved" className="font-display gap-1.5 text-xs"><Save className="w-3.5 h-3.5" />SAVED</TabsTrigger>
          <TabsTrigger value="schedule" className="font-display gap-1.5 text-xs"><Calendar className="w-3.5 h-3.5" />SCHEDULE</TabsTrigger>
          <TabsTrigger value="stats" className="font-display gap-1.5 text-xs"><BarChart3 className="w-3.5 h-3.5" />STATS</TabsTrigger>
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

          <Button className="w-full font-display tracking-widest text-xs py-6" onClick={handleGenerate}
            disabled={generating || !platform || !contentType}>
            {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />GENERATING...</> : '⚡ GENERATE CONTENT'}
          </Button>

          {/* OUTPUT */}
          {generatedPost && (
            <Card className="border-primary">
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
                      <img src={generatedImageUrl} alt="Generated social content" className="w-full rounded-lg mt-2" />
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
                    <div className="flex gap-2">
                      <Badge className="font-display text-[9px]">{post.platform.toUpperCase()}</Badge>
                      <Badge variant="outline" className="font-display text-[9px]">{post.content_type}</Badge>
                      <Badge variant={post.status === 'scheduled' ? 'default' : 'secondary'}
                        className="font-display text-[9px]">{post.status.toUpperCase()}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">{post.content}</p>
                  {post.image_url && (
                    <img src={post.image_url} alt="Post image" className="w-full rounded-lg max-h-48 object-cover" />
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyPostContent(post.content)}
                      className="text-[10px] font-display gap-1"><Copy className="w-3 h-3" />COPY</Button>
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
              Save a post first, then schedule it here. Copy into Buffer, Meta Business Suite or Hootsuite for auto-posting.
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
                    <Button variant="outline" size="sm" onClick={() => copyPostContent(post.content)}
                      className="text-[10px] font-display gap-1"><Copy className="w-3 h-3" />COPY</Button>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        {/* STATS TAB */}
        <TabsContent value="stats" className="space-y-4 mt-4">
          <p className="text-[10px] text-primary font-display tracking-widest">CONTENT OVERVIEW</p>
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="pt-4 text-center">
              <p className="text-2xl font-black text-primary">{savedPosts.length}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1">GENERATED</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 text-center">
              <p className="text-2xl font-black text-primary">{drafts.length}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1">DRAFTS</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 text-center">
              <p className="text-2xl font-black text-primary">{scheduled.length}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1">SCHEDULED</p>
            </CardContent></Card>
          </div>

          {Object.keys(platformCounts).length > 0 && (
            <Card><CardContent className="pt-5 space-y-3">
              <p className="text-[10px] text-primary font-display tracking-widest">📊 CONTENT BREAKDOWN</p>
              {Object.entries(platformCounts).map(([plat, count]) => (
                <div key={plat} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-display tracking-wider">{plat.toUpperCase()}</span>
                  <span className="text-xs font-bold text-primary">{count}</span>
                </div>
              ))}
            </CardContent></Card>
          )}

          <Card><CardContent className="pt-5 space-y-3">
            <p className="text-[10px] text-primary font-display tracking-widest">💡 POSTING TIPS FOR UNBREAKABLE</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>📸 <strong>Instagram</strong> — 4-7x per week. Reels get 3x more reach.</li>
              <li>🎵 <strong>TikTok</strong> — Post daily. Raw and real beats polished every time.</li>
              <li>👥 <strong>Facebook</strong> — Share into fitness groups. Community drives reach.</li>
              <li>⏰ <strong>Best times</strong> — 6-8am and 6-9pm weekdays.</li>
              <li>🔥 <strong>Top content</strong> — Real Talk and Transformation posts win in fitness.</li>
            </ul>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
