import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, Music, Mic2, TrendingUp, Users, Play, DollarSign,
  Settings, Plus, FileAudio, Image, Tag, Clock, Disc3,
  BarChart3, Eye, Heart, Share2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { Artist } from '@/hooks/useUnTunes';
import { GENRES } from '@/hooks/useUnTunes';
import { toast } from 'sonner';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

interface ArtistDashboardProps {
  artist: Artist;
}

type DashTab = 'overview' | 'upload' | 'tracks' | 'settings';

export function UnTunesArtistDashboard({ artist }: ArtistDashboardProps) {
  const [tab, setTab] = useState<DashTab>('overview');
  const [uploading, setUploading] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [trackTitle, setTrackTitle] = useState('');
  const [trackGenre, setTrackGenre] = useState('');
  const [trackType, setTrackType] = useState<'music' | 'podcast'>('music');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!audioFile || !trackTitle.trim()) {
      toast.error('Please add a title and audio file');
      return;
    }

    setUploading(true);
    try {
      // Upload audio
      const audioPath = `${artist.id}/${Date.now()}-${audioFile.name}`;
      const { error: audioErr } = await supabase.storage
        .from('un-tunes-audio')
        .upload(audioPath, audioFile);
      if (audioErr) throw audioErr;

      const { data: audioUrlData } = supabase.storage
        .from('un-tunes-audio')
        .getPublicUrl(audioPath);

      // Upload cover if provided
      let coverUrl = null;
      if (coverFile) {
        const coverPath = `${artist.id}/${Date.now()}-${coverFile.name}`;
        const { error: coverErr } = await supabase.storage
          .from('un-tunes-artwork')
          .upload(coverPath, coverFile);
        if (!coverErr) {
          const { data: coverUrlData } = supabase.storage
            .from('un-tunes-artwork')
            .getPublicUrl(coverPath);
          coverUrl = coverUrlData.publicUrl;
        }
      }

      // Get audio duration
      const duration = await getAudioDuration(audioFile);

      // Insert track
      const { error: insertErr } = await supabase.from('un_tunes_tracks').insert({
        artist_id: artist.id,
        title: trackTitle.trim(),
        audio_url: audioUrlData.publicUrl,
        cover_url: coverUrl,
        duration_seconds: Math.round(duration),
        genre: trackGenre || 'workout',
        tags: [],
        bpm: null,
        is_free: isFree,
        price_gbp: isFree ? null : parseFloat(price) || null,
        play_count: 0,
        track_type: trackType,
      });

      if (insertErr) throw insertErr;

      toast.success('Track uploaded! 🎵');
      // Reset form
      setTrackTitle('');
      setTrackGenre('');
      setAudioFile(null);
      setCoverFile(null);
      setIsFree(true);
      setPrice('');
      setTab('overview');
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    }
    setUploading(false);
  };

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { key: 'upload' as const, label: 'Upload', icon: Upload },
    { key: 'tracks' as const, label: 'My Tracks', icon: Music },
    { key: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Artist Header */}
      <motion.div {...fadeIn} className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden">
          {artist.avatar_url ? (
            <img src={artist.avatar_url} alt={artist.artist_name} className="w-full h-full object-cover" />
          ) : (
            <Mic2 className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg tracking-wider text-foreground">{artist.artist_name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="outline" className="text-[10px] font-display tracking-wider border-primary/30 text-primary">
              ARTIST
            </Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> {artist.follower_count} followers
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Play className="w-3 h-3" /> {artist.total_plays} plays
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card/50 p-1 rounded-xl border border-border/50">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-display tracking-wider transition-all ${
              tab === t.key
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <motion.div {...fadeIn} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Plays', value: artist.total_plays.toLocaleString(), icon: Play, color: 'text-primary' },
              { label: 'Followers', value: artist.follower_count.toLocaleString(), icon: Users, color: 'text-blue-400' },
              { label: 'Revenue Split', value: '80%', icon: DollarSign, color: 'text-green-400' },
              { label: 'Subscription', value: '£5/mo', icon: TrendingUp, color: 'text-amber-400' },
            ].map((stat, i) => (
              <Card key={i} className="p-4 border-border/50 bg-card/30">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-display tracking-wider">{stat.label}</p>
              </Card>
            ))}
          </div>

          <Button onClick={() => setTab('upload')} className="w-full gap-2 h-12 font-display tracking-wider">
            <Upload className="w-4 h-4" />
            UPLOAD NEW TRACK
          </Button>
        </motion.div>
      )}

      {/* Upload */}
      {tab === 'upload' && (
        <motion.div {...fadeIn} className="space-y-4">
          {/* Track Type */}
          <div className="flex gap-2">
            {(['music', 'podcast'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTrackType(t)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-display tracking-wider border transition-all ${
                  trackType === t
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-border/50 text-muted-foreground'
                }`}
              >
                {t === 'music' ? '🎵' : '🎙️'} {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-display tracking-wider text-muted-foreground mb-1.5 block">TITLE *</label>
            <Input
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              placeholder="Track title"
              className="bg-card/50 border-border/50"
            />
          </div>

          <div>
            <label className="text-xs font-display tracking-wider text-muted-foreground mb-1.5 block">GENRE</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map(g => (
                <button
                  key={g.key}
                  onClick={() => setTrackGenre(g.key)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-display tracking-wider border transition-all ${
                    trackGenre === g.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border/50 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio File */}
          <div>
            <label className="text-xs font-display tracking-wider text-muted-foreground mb-1.5 block">AUDIO FILE *</label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />
            <Card
              className="p-4 border-dashed border-2 border-border/50 bg-card/30 text-center cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => audioInputRef.current?.click()}
            >
              {audioFile ? (
                <div className="flex items-center gap-3">
                  <FileAudio className="w-5 h-5 text-primary" />
                  <div className="text-left flex-1">
                    <p className="text-sm text-foreground truncate">{audioFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Click to upload audio (MP3, WAV, M4A, FLAC)</p>
                </>
              )}
            </Card>
          </div>

          {/* Cover Art */}
          <div>
            <label className="text-xs font-display tracking-wider text-muted-foreground mb-1.5 block">COVER ART</label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
            <Card
              className="p-4 border-dashed border-2 border-border/50 bg-card/30 text-center cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverFile ? (
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5 text-primary" />
                  <p className="text-sm text-foreground truncate">{coverFile.name}</p>
                </div>
              ) : (
                <>
                  <Image className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Optional — add cover artwork</p>
                </>
              )}
            </Card>
          </div>

          {/* Pricing */}
          <div>
            <label className="text-xs font-display tracking-wider text-muted-foreground mb-1.5 block">PRICING</label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setIsFree(true)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-display tracking-wider border transition-all ${
                  isFree ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border/50 text-muted-foreground'
                }`}
              >
                FREE
              </button>
              <button
                onClick={() => setIsFree(false)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-display tracking-wider border transition-all ${
                  !isFree ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border/50 text-muted-foreground'
                }`}
              >
                PREMIUM
              </button>
            </div>
            {!isFree && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">£</span>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.99"
                  step="0.01"
                  min="0.50"
                  className="bg-card/50 border-border/50 w-32"
                />
                <span className="text-[10px] text-muted-foreground">You keep 80%</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!trackTitle.trim() || !audioFile || uploading}
            className="w-full h-12 gap-2 font-display tracking-wider"
          >
            {uploading ? (
              <Disc3 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? 'UPLOADING...' : 'PUBLISH TRACK'}
          </Button>
        </motion.div>
      )}

      {/* My Tracks */}
      {tab === 'tracks' && (
        <motion.div {...fadeIn}>
          <Card className="p-8 text-center border-border bg-card/50">
            <Music className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Your uploaded tracks will appear here</p>
            <p className="text-xs text-muted-foreground/60 mb-4">Upload your first track to get started</p>
            <Button size="sm" onClick={() => setTab('upload')} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Track
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <motion.div {...fadeIn} className="space-y-4">
          <Card className="p-4 border-border/50 bg-card/30">
            <h3 className="font-display text-xs tracking-wider text-muted-foreground mb-3">ARTIST PROFILE</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Artist Name</label>
                <Input defaultValue={artist.artist_name} className="bg-card/50 border-border/50 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Bio</label>
                <textarea
                  defaultValue={artist.bio}
                  className="w-full h-20 rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm resize-none"
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border/50 bg-card/30">
            <h3 className="font-display text-xs tracking-wider text-muted-foreground mb-2">SUBSCRIPTION</h3>
            <p className="text-sm text-foreground">£5/month — Artist Account</p>
            <p className="text-[10px] text-muted-foreground mt-1">Status: <span className="text-green-400">Active</span></p>
          </Card>

          <Card className="p-4 border-border/50 bg-card/30">
            <h3 className="font-display text-xs tracking-wider text-muted-foreground mb-2">REVENUE</h3>
            <p className="text-sm text-muted-foreground">80% artist / 20% Unbreakable on all sales</p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

/** Helper: get duration of audio file */
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    });
    audio.addEventListener('error', () => resolve(0));
    audio.src = URL.createObjectURL(file);
  });
}
