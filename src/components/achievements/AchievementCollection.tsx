/**
 * AchievementCollection — Full gallery for Programme Trophies & PB Cards
 * Same standard as UN-TUNES CollectionGallery: share to socials, download image,
 * full-screen viewer, confirm discard, Pokédex-style library.
 *
 * Updated: Neon glow system + unified CardShareSheet + RarityBadge
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Trophy, Dumbbell, Activity, Crown, Diamond, Sparkles,
  Shield, Medal, Award, Globe, TrendingUp, X, Share2,
  Download, Trash2, Loader2, ChevronLeft, ChevronRight,
  ChevronDown, AlertCircle, Camera,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CardShareSheet } from '@/components/achievements/CardShareSheet';
import { RarityBadge } from '@/components/achievements/RarityBadge';
import { RARITY_GLOW, type RarityTier } from '@/lib/rarityGlow';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAchievementCards, AchievementCard, AchievementRarity, AchievementCardType } from '@/hooks/useAchievementCards';
import { AchievementCardStatic, AchievementCardReveal, formatPBValue } from '@/components/achievements/AchievementCardReveal';
import UserProfileCard from '@/components/achievements/UserProfileCard';
import { supabase } from '@/integrations/supabase/client';

/* ═══ Reflective container backgrounds per rarity — behind cards ═══ */
const CONTAINER_REFLECTIVE_BG: Record<string, string> = {
  bronze: `
    radial-gradient(ellipse at 50% 40%, rgba(205,127,50,0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 30% 90%, rgba(139,69,19,0.06) 0%, transparent 40%),
    linear-gradient(180deg, #0D0B09 0%, #0A0908 50%, #0D0B09 100%)
  `,
  silver: `
    radial-gradient(ellipse at 50% 40%, rgba(192,192,192,0.07) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 90%, rgba(232,232,232,0.05) 0%, transparent 40%),
    linear-gradient(180deg, #0C0C0D 0%, #0A0A0B 50%, #0C0C0D 100%)
  `,
  gold: `
    radial-gradient(ellipse at 50% 35%, rgba(255,215,0,0.10) 0%, transparent 55%),
    radial-gradient(ellipse at 30% 85%, rgba(184,134,11,0.07) 0%, transparent 40%),
    linear-gradient(180deg, #0B0A06 0%, #090804 50%, #0B0A06 100%)
  `,
  diamond: `
    radial-gradient(ellipse at 40% 35%, rgba(125,249,255,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(191,95,255,0.06) 0%, transparent 45%),
    linear-gradient(180deg, #060609 0%, #04040A 50%, #060609 100%)
  `,
  platinum: `
    radial-gradient(ellipse at 50% 35%, rgba(229,228,226,0.09) 0%, transparent 55%),
    radial-gradient(ellipse at 40% 85%, rgba(183,110,121,0.06) 0%, transparent 40%),
    linear-gradient(180deg, #0C0B0B 0%, #0A0909 50%, #0C0B0B 100%)
  `,
};

/* ═══ Rarity config — mirrors UN-TUNES ═══ */
const RARITY_ORDER: Record<AchievementRarity, number> = {
  platinum: 5, diamond: 4, gold: 3, silver: 2, bronze: 1,
};

const RARITY_CONFIG: Record<AchievementRarity, {
  label: string; textColor: string; bgClass: string; borderClass: string;
  color: string; icon: typeof Trophy;
}> = {
  bronze:   { label: 'Bronze',   textColor: 'text-amber-600',  bgClass: 'bg-amber-500/10',   borderClass: 'border-amber-500/30',  color: '#d97706', icon: Award },
  silver:   { label: 'Silver',   textColor: 'text-gray-300',   bgClass: 'bg-gray-400/10',    borderClass: 'border-gray-400/30',   color: '#9ca3af', icon: Medal },
  gold:     { label: 'Gold',     textColor: 'text-yellow-400', bgClass: 'bg-yellow-500/10',   borderClass: 'border-yellow-500/30', color: '#fbbf24', icon: Crown },
  diamond:  { label: 'Diamond',  textColor: 'text-violet-400', bgClass: 'bg-violet-500/10',   borderClass: 'border-violet-500/30', color: '#8b5cf6', icon: Diamond },
  platinum: { label: 'Platinum', textColor: 'text-slate-200',  bgClass: 'bg-slate-200/10',    borderClass: 'border-slate-300/30',  color: '#e2e8f0', icon: Sparkles },
};

type TabType = 'all' | 'programmes' | 'strength' | 'cardio' | 'global';
type SortType = 'newest' | 'rarity' | 'exercise';

/* ═══ Generate shareable card image (same as UN-TUNES) ═══ */
async function generateAchievementCardImage(card: AchievementCard): Promise<Blob | null> {
  try {
    const config = RARITY_CONFIG[card.rarity];
    const color = config.color;

    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 1080, 1350);

    // Radial glow
    const grad = ctx.createRadialGradient(540, 500, 0, 540, 500, 600);
    grad.addColorStop(0, `${color}25`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1350);

    // Outer border
    ctx.strokeStyle = color; ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1000, 1270);
    ctx.strokeStyle = `${color}40`; ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, 976, 1246);

    // Card type icon area (large circle)
    ctx.beginPath();
    ctx.arc(540, 420, 180, 0, Math.PI * 2);
    ctx.fillStyle = `${color}15`;
    ctx.fill();
    ctx.strokeStyle = `${color}60`;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Icon text (emoji-style)
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.font = '120px system-ui';
    if (card.card_type === 'programme_trophy') {
      ctx.fillText('🏆', 540, 460);
    } else if (card.exercise_name?.toLowerCase().includes('run') || card.exercise_name?.toLowerCase().includes('km')) {
      ctx.fillText('🏃', 540, 460);
    } else if (card.exercise_name?.toLowerCase().includes('walk')) {
      ctx.fillText('🚶', 540, 460);
    } else {
      ctx.fillText('💪', 540, 460);
    }

    // Card type label
    ctx.fillStyle = color; ctx.font = '600 24px system-ui';
    const typeLabel = card.card_type === 'programme_trophy' ? 'PROGRAMME TROPHY'
      : card.card_type === 'pb_global' ? 'GLOBAL PB CARD'
      : 'PERSONAL BEST CARD';
    ctx.fillText(typeLabel, 540, 680);

    // Title
    ctx.fillStyle = '#ffffff'; ctx.font = '700 48px system-ui';
    ctx.fillText(card.title.substring(0, 25), 540, 780);

    // Subtitle (value)
    if (card.subtitle) {
      ctx.fillStyle = color; ctx.font = '600 64px system-ui';
      ctx.fillText(card.subtitle, 540, 870);
    }

    // Rarity badge
    ctx.fillStyle = color; ctx.font = '600 28px system-ui';
    ctx.fillText(`${config.label.toUpperCase()} EDITION`, 540, 980);

    // Divider line
    ctx.strokeStyle = `${color}40`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(200, 1020); ctx.lineTo(880, 1020); ctx.stroke();

    // Exercise / Programme name
    if (card.exercise_name || card.programme_name) {
      ctx.fillStyle = '#a1a1aa'; ctx.font = '400 24px system-ui';
      ctx.fillText(card.exercise_name || card.programme_name || '', 540, 1070);
    }

    // Date earned
    const date = new Date(card.earned_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    ctx.fillStyle = '#71717a'; ctx.font = '300 20px system-ui';
    ctx.fillText(`Earned ${date}`, 540, 1120);

    // Branding
    ctx.fillStyle = '#52525b'; ctx.font = '300 18px system-ui';
    ctx.fillText('UNBREAKABLE • ACHIEVEMENT CARD', 540, 1260);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  } catch { return null; }
}

/* ═══ Share Menu Modal ═══ */
function AchievementShareMenu({
  card,
  onShareFeed,
  onClose,
}: {
  card: AchievementCard;
  onShareFeed: () => void;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const config = RARITY_CONFIG[card.rarity];

  const handleShareSocials = async () => {
    const blob = await generateAchievementCardImage(card);
    const shareText = card.card_type === 'programme_trophy'
      ? `🏆 Earned a ${config.label} trophy — ${card.title}! #Unbreakable`
      : `💪 New PB: ${card.title} — ${card.subtitle}! ${config.label} card unlocked! #Unbreakable`;

    if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], 'card.png', { type: 'image/png' })] })) {
      try {
        const file = new File([blob], `achievement-${card.rarity}-${card.title.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
        await navigator.share({
          title: `Unbreakable ${config.label} Achievement`,
          text: shareText,
          files: [file],
        });
        toast({ title: 'Shared!', description: 'Achievement shared to socials.' });
        onClose(); return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') { onClose(); return; }
      }
    }

    // Fallback: copy
    try {
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast({ title: 'Copied!', description: 'Card image copied to clipboard.' });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({ title: 'Copied!', description: 'Share text copied.' });
      }
    } catch {
      toast({ title: 'Share text', description: shareText });
    }
    onClose();
  };

  const handleDownload = async () => {
    const blob = await generateAchievementCardImage(card);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `achievement-${card.rarity}-${card.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Downloaded!', description: 'Card saved to your device.' });
    }
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="max-w-xs w-full bg-zinc-900 rounded-2xl border border-primary/30 p-5 space-y-3"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-1">
          <Share2 className="w-6 h-6 text-primary mx-auto mb-2" />
          <h3 className="font-display text-white tracking-wider text-sm">SHARE ACHIEVEMENT</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            {config.label} — {card.title}
          </p>
        </div>

        <Button
          variant="outline" size="sm"
          className="w-full text-xs font-display tracking-wider border-primary/30 text-primary hover:bg-primary/10"
          onClick={(e) => { e.stopPropagation(); onShareFeed(); }}
        >
          <Sparkles className="w-3 h-3 mr-2" /> POST TO MY FEED
        </Button>

        <Button
          variant="outline" size="sm"
          className="w-full text-xs font-display tracking-wider border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          onClick={(e) => { e.stopPropagation(); handleShareSocials(); }}
        >
          <Share2 className="w-3 h-3 mr-2" /> SHARE TO SOCIALS
        </Button>

        <Button
          variant="outline" size="sm"
          className="w-full text-xs font-display tracking-wider border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
        >
          <Download className="w-3 h-3 mr-2" /> SAVE IMAGE
        </Button>

        <Button variant="ghost" size="sm"
          className="w-full text-xs font-display tracking-wider text-muted-foreground"
          onClick={onClose}
        >
          CANCEL
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Confirm Discard Modal ═══ */
function AchievementDiscardModal({
  card, onConfirm, onCancel,
}: {
  card: AchievementCard; onConfirm: () => void; onCancel: () => void;
}) {
  const config = RARITY_CONFIG[card.rarity];
  return (
    <motion.div
      className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="max-w-xs w-full bg-zinc-900 rounded-2xl border border-red-500/30 p-5 space-y-4"
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-3">
            <Trash2 className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="font-display text-white tracking-wider text-sm">DISCARD THIS CARD?</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You're about to permanently destroy your{' '}
            <span className={config.textColor}>{config.label}</span> "{card.title}" card.
          </p>
          <p className="text-[10px] text-red-400/70 mt-1">This cannot be undone.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"
            className="flex-1 text-xs font-display tracking-wider" onClick={onCancel}>
            KEEP IT
          </Button>
          <Button size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-display tracking-wider"
            onClick={onConfirm}>
            <Trash2 className="w-3 h-3 mr-1" /> DESTROY
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Full-Screen Card Viewer (with nav + share/discard) ═══ */
function AchievementFullViewer({
  card,
  cards,
  currentIndex,
  onClose,
  onNavigate,
  onShare,
  onDiscard,
}: {
  card: AchievementCard;
  cards: AchievementCard[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onShare: (card: AchievementCard) => void;
  onDiscard: (card: AchievementCard) => void;
}) {
  const config = RARITY_CONFIG[card.rarity];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < cards.length - 1;
  const date = new Date(card.earned_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      toast({ title: 'Invalid file', description: 'Upload an image or video of your lift.' });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 50MB for card media.' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
      const path = `card-media/${card.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error('No URL');
      const updateField = isVideo
        ? { video_url: publicUrl, media_type: 'video', image_url: card.image_url }
        : { image_url: publicUrl, media_type: 'image', video_url: card.video_url };
      const { error: dbErr } = await supabase.from('achievement_cards').update(updateField).eq('id', card.id);
      if (dbErr) throw dbErr;
      toast({ title: isVideo ? '🎬 Video uploaded!' : '📸 Image uploaded!', description: 'Your card has been updated. Refresh to see it.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast({ title: 'Upload failed', description: msg });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Close */}
      <Button variant="ghost" size="sm"
        className="absolute top-4 right-4 text-white/50 hover:text-white z-10"
        onClick={onClose}>
        <X className="w-6 h-6" />
      </Button>

      {/* Card counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs text-zinc-500 font-display tracking-widest">
        {currentIndex + 1} / {cards.length}
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <Button variant="ghost" size="sm"
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white z-10"
          onClick={() => onNavigate(currentIndex - 1)}>
          <ChevronLeft className="w-8 h-8" />
        </Button>
      )}
      {hasNext && (
        <Button variant="ghost" size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white z-10"
          onClick={() => onNavigate(currentIndex + 1)}>
          <ChevronRight className="w-8 h-8" />
        </Button>
      )}

      {/* Hidden file input for media upload */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />

      {/* Card — shows static (already revealed) in library view */}
      {/* If card has video, show auto-playing video instead of static card */}
      <div className="flex-1 flex items-center justify-center px-8 w-full max-w-sm">
        {card.video_url && card.media_type === 'video' ? (
          <div className="relative w-72 h-[28rem] rounded-2xl overflow-hidden"
            style={{ boxShadow: RARITY_GLOW[card.rarity as RarityTier]?.boxShadow }}>
            <video
              src={card.video_url}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
            />
            {/* Overlay card info at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10" style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
            }}>
              <p className="text-white font-display text-sm tracking-wider uppercase font-black" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                {card.owner_display_name || 'ATHLETE'}
              </p>
              <p className="text-[10px] font-display tracking-wider" style={{ color: '#FF5500' }}>
                {card.exercise_name} · {formatPBValue(card.pb_value || 0, card.pb_unit || 'kg')}
              </p>
            </div>
          </div>
        ) : (
          <AchievementCardStatic card={card} size="lg" />
        )}
      </div>

      {/* Card details + actions */}
      <div className="w-full max-w-sm px-6 pb-6 space-y-3">
        <div className="text-center">
          <p className={cn('text-xs font-display tracking-wider', config.textColor)}>
            {config.label.toUpperCase()} • {card.card_type === 'programme_trophy' ? 'TROPHY' : 'PERSONAL BEST'}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Earned {date}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm"
            className="flex-1 text-xs font-display tracking-wider border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}>
            <Camera className="w-3 h-3 mr-1" /> {uploading ? 'UPLOADING…' : card.image_url || card.video_url ? 'CHANGE MEDIA' : 'ADD PHOTO/VIDEO'}
          </Button>
          <Button variant="outline" size="sm"
            className="flex-1 text-xs font-display tracking-wider border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => onShare(card)}>
            <Share2 className="w-3 h-3 mr-1" /> SHARE
          </Button>
        </div>
        <Button variant="outline" size="sm"
          className="w-full text-xs font-display tracking-wider border-red-500/30 text-red-400 hover:bg-red-500/10"
          onClick={() => onDiscard(card)}>
          <Trash2 className="w-3 h-3 mr-2" /> DISCARD
        </Button>
      </div>
    </motion.div>
  );
}

/* ═══ Main Collection Component ═══ */
export function AchievementCollection() {
  const { cards, loading, getCounts, deleteCard } = useAchievementCards();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [filterRarity, setFilterRarity] = useState<AchievementRarity | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [shareCard, setShareCard] = useState<AchievementCard | null>(null);
  const [discardCard, setDiscardCard] = useState<AchievementCard | null>(null);
  const counts = getCounts();
  const CARDIO_CATS = useMemo(() => ['run', 'cycle', 'row', 'swim'], []);
  const strengthCount = useMemo(() => cards.filter(c => c.card_type === 'pb_personal' && !CARDIO_CATS.includes(c.activity_category || '')).length, [cards, CARDIO_CATS]);
  const cardioCount = useMemo(() => cards.filter(c => c.card_type === 'pb_personal' && CARDIO_CATS.includes(c.activity_category || '')).length, [cards, CARDIO_CATS]);

  const filteredCards = useMemo(() => {
    let result = [...cards];
    if (activeTab === 'programmes') result = result.filter(c => c.card_type === 'programme_trophy');
    const CARDIO_CATEGORIES = ['run', 'cycle', 'row', 'swim'];
    if (activeTab === 'strength') result = result.filter(c => c.card_type === 'pb_personal' && !CARDIO_CATEGORIES.includes(c.activity_category || ''));
    if (activeTab === 'cardio') result = result.filter(c => c.card_type === 'pb_personal' && CARDIO_CATEGORIES.includes(c.activity_category || ''));
    if (activeTab === 'global') result = result.filter(c => c.card_type === 'pb_global');
    if (filterRarity !== 'all') result = result.filter(c => c.rarity === filterRarity);

    if (sort === 'newest') result.sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime());
    else if (sort === 'rarity') result.sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]);
    else if (sort === 'exercise') result.sort((a, b) => (a.exercise_name || a.programme_name || '').localeCompare(b.exercise_name || b.programme_name || ''));
    return result;
  }, [cards, activeTab, sort, filterRarity]);

  // Share is now handled by CardShareSheet — kept for backwards compat
  const handleShareFeed = async (_card: AchievementCard) => {
    // Now handled by CardShareSheet component
    setShareCard(null);
  };

  const handleDiscard = async (card: AchievementCard) => {
    if (deleteCard) {
      await deleteCard(card.id);
      toast({ title: 'Discarded', description: `${card.title} has been destroyed.` });
    }
    setDiscardCard(null);
    setSelectedIndex(null);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {/* Header skeleton */}
        <Card className="border-border p-4 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-muted rounded w-48" />
              <div className="h-3 bg-muted/50 rounded w-28" />
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 py-2">
                <div className="w-4 h-4 rounded bg-muted" />
                <div className="h-5 w-6 rounded bg-muted" />
                <div className="h-2 w-10 rounded bg-muted/50" />
              </div>
            ))}
          </div>
        </Card>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-muted border border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with counts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border p-4 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground tracking-wide">ACHIEVEMENT CARDS</h3>
              <p className="text-sm text-muted-foreground">{counts.total} cards collected</p>
            </div>
          </div>

          {/* Rarity breakdown — neon glow per tier */}
          <div className="flex justify-between gap-2">
            {(['platinum', 'diamond', 'gold', 'silver', 'bronze'] as AchievementRarity[]).map(r => {
              const glowCfg = RARITY_GLOW[r];
              const count = counts[r];
              const isActive = filterRarity === r;
              return (
                <button
                  key={r}
                  onClick={() => setFilterRarity(filterRarity === r ? 'all' : r)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-all',
                    isActive ? glowCfg.borderClass + ' ' + glowCfg.bgClass : 'border-transparent hover:bg-muted/30',
                  )}
                  style={isActive ? { boxShadow: glowCfg.boxShadow } : undefined}
                >
                  <RarityBadge tier={r} variant="icon" size="sm" />
                  <span
                    className="font-display text-lg"
                    style={isActive ? { color: glowCfg.primary, textShadow: glowCfg.textShadow } : { color: glowCfg.primary }}
                  >
                    {count}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{r}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* ═══ HERO EXPLAINER — Diamond & Platinum tiers ═══ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border bg-card overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #8b5cf6 0%, #e2e8f0 50%, #8b5cf6 100%)' }} />
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" />
              <h4 className="font-display text-sm tracking-wider text-foreground">HOW RARE IS YOUR CARD?</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every PB you set earns a card. Your card's rarity is determined by how your lift compares to athletes
              of the <span className="text-foreground font-semibold">same age and sex</span> worldwide.
            </p>
            <div className="space-y-2">
              {/* Bronze/Silver/Gold */}
              <div className="flex items-start gap-2.5">
                <div className="flex gap-1 mt-0.5 flex-shrink-0">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <Medal className="w-3.5 h-3.5 text-gray-300" />
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <span className="text-amber-600 font-display">BRONZE</span> · <span className="text-gray-300 font-display">SILVER</span> · <span className="text-yellow-400 font-display">GOLD</span> —
                  Earned on every PB. Rank up as you beat your own records.
                </p>
              </div>
              {/* Diamond */}
              <div className="flex items-start gap-2.5 rounded-lg p-2 -mx-1"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02))' }}>
                <Diamond className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] leading-relaxed">
                    <span className="text-violet-400 font-display tracking-wider">DIAMOND</span>
                    <span className="text-muted-foreground"> — Top 5% in your age &amp; sex bracket globally. Prismatic holographic finish. Only the elite unlock these.</span>
                  </p>
                </div>
              </div>
              {/* Platinum */}
              <div className="flex items-start gap-2.5 rounded-lg p-2 -mx-1"
                style={{ background: 'linear-gradient(135deg, rgba(226,232,240,0.08), rgba(226,232,240,0.02))', border: '1px solid rgba(226,232,240,0.08)' }}>
                <Sparkles className="w-4 h-4 text-slate-200 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] leading-relaxed">
                    <span className="text-slate-200 font-display tracking-wider">PLATINUM</span>
                    <span className="text-muted-foreground"> — Top 1%. Numbered edition. Brushed chrome finish. The rarest card in the game. One lift. One moment. Generational.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs — 5 categories: All / Programmes / Strength / Cardio / Global */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="grid w-full grid-cols-5 bg-background border border-border">
          <TabsTrigger value="all" className="font-display tracking-wide text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            ALL ({counts.total})
          </TabsTrigger>
          <TabsTrigger value="programmes" className="font-display tracking-wide text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Award className="w-3 h-3 mr-0.5" /> PROG ({counts.trophies})
          </TabsTrigger>
          <TabsTrigger value="strength" className="font-display tracking-wide text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Dumbbell className="w-3 h-3 mr-0.5" /> STR ({strengthCount})
          </TabsTrigger>
          <TabsTrigger value="cardio" className="font-display tracking-wide text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="w-3 h-3 mr-0.5" /> CARDIO ({cardioCount})
          </TabsTrigger>
          <TabsTrigger value="global" className="font-display tracking-wide text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Globe className="w-3 h-3 mr-0.5" /> GLOBAL ({counts.pbGlobal})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* User Profile Card — shown at top of ALL tab */}
      {activeTab === 'all' && (
        <div className="max-w-[280px] mx-auto">
          <UserProfileCard />
        </div>
      )}

      {/* Sort + filter controls */}
      <div className="flex gap-2">
        {(['newest', 'rarity', 'exercise'] as SortType[]).map(s => (
          <Button key={s} variant={sort === s ? 'default' : 'outline'} size="sm"
            className={cn(
              "font-display tracking-wider text-[10px] transition-all",
              sort === s && "bg-[#FF5500] text-white border-[#FF5500] hover:bg-[#FF5500]/90"
            )}
            style={sort === s ? { boxShadow: '0 0 12px rgba(255,85,0,0.5), 0 0 24px rgba(255,85,0,0.2)' } : undefined}
            onClick={() => setSort(s)}>
            {s === 'newest' ? 'NEWEST' : s === 'rarity' ? 'RARITY' : 'NAME'}
          </Button>
        ))}
        {filterRarity !== 'all' && (
          <Button variant="ghost" size="sm"
            className="font-display tracking-wider text-[10px] text-muted-foreground"
            onClick={() => setFilterRarity('all')}>
            <X className="w-3 h-3 mr-1" /> CLEAR
          </Button>
        )}
      </div>

      {/* Card library — expanding rarity sections */}
      {filteredCards.length === 0 ? (
        <Card className="border-border p-8 bg-card text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground font-display tracking-wider text-sm">
            {activeTab === 'programmes' ? 'Complete a programme to earn your gold trophy card'
              : activeTab === 'strength' ? 'Hit a strength PB to earn your first lifting card'
              : activeTab === 'cardio' ? 'Set a cardio PB (run, cycle, row, swim) to earn your first card'
              : activeTab === 'global' ? 'Reach top 5% in your age group for a global card'
              : 'No achievement cards yet — keep grinding!'}
          </p>
        </Card>
      ) : filterRarity !== 'all' ? (
        /* When filtered to single rarity, show flat grid */
        <motion.div className="grid grid-cols-2 gap-4 sm:grid-cols-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {filteredCards.map((card, i) => {
            const glow = RARITY_GLOW[card.rarity as RarityTier] || RARITY_GLOW.bronze;
            const containerBg = CONTAINER_REFLECTIVE_BG[card.rarity] || CONTAINER_REFLECTIVE_BG.bronze;
            return (
              <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="relative group aspect-[3/4] rarity-gpu-hint rounded-2xl p-1.5"
                style={{ background: containerBg, boxShadow: glow.boxShadow }}
              >
                <AchievementCardStatic card={card} size="sm" onClick={() => setSelectedIndex(i)} />
                {/* Edit media icon */}
                <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(filteredCards.indexOf(card)); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/15 z-20">
                  <Camera className="w-2.5 h-2.5 text-white/60" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      ) : sort !== 'rarity' ? (
        /* Flat sorted grid — when user picks NEWEST or NAME, show cards in order */
        <motion.div className="grid grid-cols-2 gap-4 sm:grid-cols-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {filteredCards.map((card, i) => {
            const glow = RARITY_GLOW[card.rarity as RarityTier] || RARITY_GLOW.bronze;
            const containerBg = CONTAINER_REFLECTIVE_BG[card.rarity] || CONTAINER_REFLECTIVE_BG.bronze;
            return (
              <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="relative group aspect-[3/4] rarity-gpu-hint rounded-2xl p-1.5"
                style={{ background: containerBg, boxShadow: glow.boxShadow }}
              >
                <AchievementCardStatic card={card} size="sm" onClick={() => setSelectedIndex(i)} />
                {/* Edit media icon */}
                <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(filteredCards.indexOf(card)); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/15 z-20">
                  <Camera className="w-2.5 h-2.5 text-white/60" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (activeTab === 'strength' || activeTab === 'cardio') ? (
        /* Exercise-grouped view — each lift shows its own ranked results */
        <ExerciseGroupedView
          cards={filteredCards}
          onSelectCard={(card) => setSelectedIndex(filteredCards.findIndex(c => c.id === card.id))}
          onShareCard={(card) => setShareCard(card)}
        />
      ) : (
        /* Expanding rarity dropdowns */
        <RarityDropdownGrid
          cards={filteredCards}
          onSelectCard={(card) => setSelectedIndex(filteredCards.findIndex(c => c.id === card.id))}
          onShareCard={(card) => setShareCard(card)}
        />
      )}

      {/* Full-screen viewer */}
      <AnimatePresence>
        {selectedIndex !== null && filteredCards[selectedIndex] && (
          <AchievementFullViewer
            card={filteredCards[selectedIndex]}
            cards={filteredCards}
            currentIndex={selectedIndex}
            onClose={() => setSelectedIndex(null)}
            onNavigate={setSelectedIndex}
            onShare={(c) => { setSelectedIndex(null); setShareCard(c); }}
            onDiscard={(c) => { setSelectedIndex(null); setDiscardCard(c); }}
          />
        )}
      </AnimatePresence>

      {/* Share — unified CardShareSheet */}
      {shareCard && (
        <CardShareSheet
          open={!!shareCard}
          onOpenChange={(open) => !open && setShareCard(null)}
          card={shareCard}
          cardSystem="pb"
        />
      )}

      {/* Confirm discard modal */}
      <AnimatePresence>
        {discardCard && (
          <AchievementDiscardModal
            card={discardCard}
            onConfirm={() => handleDiscard(discardCard)}
            onCancel={() => setDiscardCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ Exercise-grouped view — each lift shows its own ranked results ═══ */
function ExerciseGroupedView({
  cards,
  onSelectCard,
  onShareCard,
}: {
  cards: AchievementCard[];
  onSelectCard: (card: AchievementCard) => void;
  onShareCard: (card: AchievementCard) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Group by exercise_name, sorted by total number of cards desc
  const exerciseGroups = useMemo(() => {
    const groups: Record<string, AchievementCard[]> = {};
    cards.forEach(card => {
      const key = card.exercise_name || 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(card);
    });
    // Sort cards within each group by rank (1=gold first)
    Object.values(groups).forEach(arr => arr.sort((a, b) => (a.pb_rank || 99) - (b.pb_rank || 99)));
    // Sort groups by best rarity, then by number of cards
    const RARITY_WEIGHT: Record<string, number> = { platinum: 5, diamond: 4, gold: 3, silver: 2, bronze: 1 };
    return Object.entries(groups).sort(([, a], [, b]) => {
      const aBest = Math.max(...a.map(c => RARITY_WEIGHT[c.rarity] || 0));
      const bBest = Math.max(...b.map(c => RARITY_WEIGHT[c.rarity] || 0));
      if (bBest !== aBest) return bBest - aBest;
      return b.length - a.length;
    });
  }, [cards]);

  // Default: top 3 exercises expanded
  useEffect(() => {
    if (exerciseGroups.length > 0 && Object.keys(expanded).length === 0) {
      const initial: Record<string, boolean> = {};
      exerciseGroups.slice(0, 3).forEach(([name]) => { initial[name] = true; });
      setExpanded(initial);
    }
  }, [exerciseGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  const RANK_LABELS = ['🥇 1st', '🥈 2nd', '🥉 3rd', '4th'];

  return (
    <div className="space-y-2">
      {exerciseGroups.map(([exerciseName, exCards]) => {
        const isExpanded = expanded[exerciseName] ?? false;
        const bestCard = exCards[0];
        const bestRarity = bestCard?.rarity || 'bronze';
        const cfg = RARITY_CONFIG[bestRarity];

        return (
          <motion.div key={exerciseName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={cn('border overflow-hidden transition-all', cfg.borderClass, 'bg-card')}>
              {/* Exercise header — tap to expand */}
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [exerciseName]: !prev[exerciseName] }))}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <cfg.icon className={cn('w-4 h-4 flex-shrink-0', cfg.textColor)} />
                  <span className="font-display tracking-wider text-[13px] text-foreground uppercase truncate">
                    {exerciseName}
                  </span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-[9px] font-display tracking-wider flex-shrink-0',
                    cfg.textColor, 'bg-white/5 border', cfg.borderClass,
                  )}>
                    {exCards.length} {exCards.length === 1 ? 'PB' : 'PBs'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Quick peek: best value */}
                  {bestCard?.pb_value && (
                    <span className={cn('text-xs font-display tracking-wide', cfg.textColor)}>
                      {formatPBValue(bestCard.pb_value, bestCard.pb_unit || 'kg')}
                    </span>
                  )}
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground opacity-60" />
                  </motion.div>
                </div>
              </button>

              {/* Expanding ranked results */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2">
                      {exCards.map((card, i) => {
                        const rankCfg = RARITY_CONFIG[card.rarity];
                        return (
                          <motion.div
                            key={card.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-3 group"
                          >
                            {/* Rank label */}
                            <div className="w-12 text-center flex-shrink-0">
                              <span className={cn('text-xs font-display tracking-wider', rankCfg.textColor)}>
                                {RANK_LABELS[i] || `${i + 1}th`}
                              </span>
                            </div>

                            {/* Mini card preview */}
                            <div className="w-16 h-22 flex-shrink-0 cursor-pointer" onClick={() => onSelectCard(card)}>
                              <AchievementCardStatic card={card} size="sm" onClick={() => onSelectCard(card)} />
                            </div>

                            {/* Stats */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1.5">
                                <span className={cn('text-lg font-display tracking-wide', rankCfg.textColor)}>
                                  {formatPBValue(card.pb_value || 0, card.pb_unit || 'kg')}
                                </span>
                                <span className={cn('text-[9px] font-display uppercase tracking-wider opacity-60', rankCfg.textColor)}>
                                  {rankCfg.label}
                                </span>
                              </div>
                              {/* Power bar */}
                              <div className="w-full h-1 rounded-full mt-1" style={{ background: `${rankCfg.color}15` }}>
                                <div className="h-full rounded-full transition-all" style={{
                                  width: `${Math.min(100, Math.max(20, (card.pb_value || 0) / (card.pb_unit === 'km' ? 42 : 300) * 100))}%`,
                                  background: `linear-gradient(90deg, ${rankCfg.color}99, ${rankCfg.color})`,
                                }} />
                              </div>
                              <p className="text-[9px] text-muted-foreground font-mono mt-0.5">
                                {new Date(card.earned_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>

                            {/* Share button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); onShareCard(card); }}
                              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <Share2 className="w-3 h-3 text-white/60" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══ Expanding rarity dropdown sections ═══ */
function RarityDropdownGrid({
  cards,
  onSelectCard,
  onShareCard,
}: {
  cards: AchievementCard[];
  onSelectCard: (card: AchievementCard) => void;
  onShareCard: (card: AchievementCard) => void;
}) {
  const [expanded, setExpanded] = useState<Record<AchievementRarity, boolean>>({
    platinum: true, diamond: true, gold: true, silver: false, bronze: false,
  });

  const grouped = useMemo(() => {
    const groups: Record<AchievementRarity, AchievementCard[]> = {
      platinum: [], diamond: [], gold: [], silver: [], bronze: [],
    };
    cards.forEach(card => {
      if (groups[card.rarity]) groups[card.rarity].push(card);
    });
    return groups;
  }, [cards]);

  const rarityOrder: AchievementRarity[] = ['platinum', 'diamond', 'gold', 'silver', 'bronze'];

  return (
    <div className="space-y-2">
      {rarityOrder.map(rarity => {
        const rarityCards = grouped[rarity];
        if (rarityCards.length === 0) return null;
        const cfg = RARITY_CONFIG[rarity];
        const isExpanded = expanded[rarity];

        return (
          <motion.div key={rarity} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={cn('border overflow-hidden transition-all', cfg.borderClass, cfg.bgClass)}>
              {/* Dropdown header */}
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [rarity]: !prev[rarity] }))}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <cfg.icon className={cn('w-5 h-5', cfg.textColor)} />
                  <span className={cn('font-display tracking-wider text-sm', cfg.textColor)}>
                    {cfg.label.toUpperCase()}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-display tracking-wider',
                    cfg.textColor, 'bg-white/5 border', cfg.borderClass,
                  )}>
                    {rarityCards.length}
                  </span>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className={cn('w-4 h-4', cfg.textColor, 'opacity-60')} />
                </motion.div>
              </button>

              {/* Expanding card grid */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 p-3 pt-0">
                      {rarityCards.map((card, i) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="relative group"
                        >
                          <AchievementCardStatic card={card} size="sm" onClick={() => onSelectCard(card)} />
                          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); onShareCard(card); }}
                              className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
                            >
                              <Share2 className="w-3 h-3 text-white/70" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══ Compact summary for profile/dashboard ═══ */
export function AchievementSummaryBadge() {
  const { getCounts, loading } = useAchievementCards();
  const counts = getCounts();

  if (loading || counts.total === 0) return null;

  return (
    <div className="flex items-center gap-3 text-sm">
      {counts.platinum > 0 && (
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-slate-200" />
          <span className="font-display text-slate-200">{counts.platinum}</span>
        </span>
      )}
      {counts.diamond > 0 && (
        <span className="flex items-center gap-1">
          <Diamond className="w-3.5 h-3.5 text-violet-400" />
          <span className="font-display text-violet-400">{counts.diamond}</span>
        </span>
      )}
      {counts.gold > 0 && (
        <span className="flex items-center gap-1">
          <Crown className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-display text-yellow-400">{counts.gold}</span>
        </span>
      )}
      {counts.silver > 0 && (
        <span className="flex items-center gap-1">
          <Medal className="w-3.5 h-3.5 text-gray-300" />
          <span className="font-display text-gray-300">{counts.silver}</span>
        </span>
      )}
      {counts.bronze > 0 && (
        <span className="flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-display text-amber-500">{counts.bronze}</span>
        </span>
      )}
    </div>
  );
}
