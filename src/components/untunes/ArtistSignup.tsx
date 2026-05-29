import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic2, Music, DollarSign, Upload, Users, TrendingUp,
  ChevronRight, Crown, Sparkles, Star, Zap, CheckCircle,
  Dumbbell, Footprints, Headphones, Guitar, Flame, Waves, Podcast, Swords, Drum,
  Activity, Brain,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GENRES, GENRE_CATEGORIES } from '@/hooks/useUnTunes';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const GENRE_ICONS: Record<string, React.ComponentType<any>> = {
  Dumbbell, Footprints, Mic2, Headphones, Guitar, Flame, Waves, Podcast, Swords, Drum,
  Zap, Activity, Brain,
};

const FEATURES = [
  { icon: Upload, label: 'Upload unlimited tracks & podcasts' },
  { icon: DollarSign, label: 'Set your own pricing — keep 80% of sales' },
  { icon: Users, label: 'Build your fanbase within the Unbreakable community' },
  { icon: TrendingUp, label: 'Track plays, followers, and earnings' },
  { icon: Music, label: 'Create albums, EPs, and podcast series' },
  { icon: Star, label: 'Get featured on the Un-Tunes homepage' },
];

export function UnTunesArtistSignup() {
  const { user } = useAuth();
  const [step, setStep] = useState<'info' | 'form'>('info');
  const [artistName, setArtistName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleGenre = (key: string) => {
    setSelectedGenres(prev =>
      prev.includes(key) ? prev.filter(g => g !== key) : [...prev, key].slice(0, 3)
    );
  };

  const handleSubmit = async () => {
    if (!user || !artistName.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('un_tunes_artists').insert({
        user_id: user.id,
        artist_name: artistName.trim(),
        bio: bio.trim(),
        genre_tags: selectedGenres,
        subscription_status: 'pending',
        follower_count: 0,
        total_plays: 0,
        is_verified: false,
        social_links: {},
      });

      if (error) throw error;
      toast.success('Welcome to Un-Tunes! You\'re now an artist 🎵');
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create artist profile');
    }
    setSubmitting(false);
  };

  if (step === 'info') {
    return (
      <div className="space-y-6">
        {/* Hero */}
        <motion.div {...fadeIn} className="text-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(255,85,0,0.3)]">
            <Crown className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(255,85,0,0.6)]" />
          </div>
          <h2 className="font-display text-2xl tracking-wider text-foreground mb-2">BECOME AN ARTIST</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Share your music and podcasts with the Unbreakable community. Set your own prices, build your fanbase, earn from your craft.
          </p>
        </motion.div>

        {/* Pricing */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <Card className="p-5 border-primary/30 bg-primary/5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.5)]" />
                  <span className="font-display text-sm tracking-wider text-primary">ARTIST SIGN-UP</span>
                </div>
                <p className="text-2xl font-bold text-foreground">50 <span className="text-sm font-normal text-muted-foreground">tokens · one-time</span></p>
                <p className="text-xs text-muted-foreground mt-1">80/20 revenue split — you keep 80%</p>
              </div>
              <div className="text-right">
                <Badge className="bg-primary text-primary-foreground font-display text-[10px] tracking-wider shadow-[0_0_12px_rgba(255,85,0,0.3)]">
                  UNLIMITED UPLOADS
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="space-y-2">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-primary drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]" />
              </div>
              <p className="text-sm text-muted-foreground">{f.label}</p>
            </div>
          ))}
        </motion.div>

        <Button
          onClick={() => setStep('form')}
          className="w-full h-12 gap-2 font-display tracking-wider text-sm shadow-[0_0_20px_rgba(255,85,0,0.3)]"
        >
          <Zap className="w-4 h-4" />
          GET STARTED
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          By signing up you agree to our{' '}
          <Link to="/untunes/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <h2 className="font-display text-lg tracking-wider text-foreground mb-1">CREATE YOUR ARTIST PROFILE</h2>
        <p className="text-xs text-muted-foreground">This is how listeners will find you on Un-Tunes</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="space-y-4">
        <div>
          <label className="text-xs font-display tracking-wider text-muted-foreground mb-1.5 block">ARTIST NAME *</label>
          <Input
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="Your artist name"
            className="bg-card/50 border-border/50"
          />
        </div>

        <div>
          <label className="text-xs font-display tracking-wider text-muted-foreground mb-1.5 block">BIO</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell listeners about yourself..."
            className="w-full h-24 rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={500}
          />
          <p className="text-[10px] text-muted-foreground text-right mt-1">{bio.length}/500</p>
        </div>

        <div>
          <label className="text-xs font-display tracking-wider text-muted-foreground mb-2 block">PILLARS (select up to 3)</label>
          <div className="flex gap-2">
            {GENRE_CATEGORIES.map(cat => {
              const CatIcon = GENRE_ICONS[cat.icon] || Music;
              return (
                <button
                  key={cat.key}
                  onClick={() => toggleGenre(cat.key)}
                  className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all ${
                    selectedGenres.includes(cat.key)
                      ? 'bg-primary/15 border-primary/40 shadow-[0_0_12px_rgba(255,85,0,0.3)]'
                      : 'border-border/50 text-muted-foreground hover:border-primary/50 bg-card/30'
                  }`}
                >
                  <CatIcon className={`w-5 h-5 text-primary ${selectedGenres.includes(cat.key) ? 'drop-shadow-[0_0_6px_rgba(255,85,0,0.6)]' : ''}`} />
                  <span className="font-display text-[10px] tracking-wider">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!artistName.trim() || submitting}
          className="flex-1 gap-2 font-display tracking-wider shadow-[0_0_16px_rgba(255,85,0,0.3)]"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {submitting ? 'CREATING...' : 'CREATE PROFILE'}
        </Button>
      </div>
    </div>
  );
}
