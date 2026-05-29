/**
 * CardShareSheet — Unified sharing for PB Cards & Un-Tunes Cards
 *
 * Share destinations:
 * - Unbreakable Timeline/Feed
 * - Unbreakable Stories (full-screen card story asset)
 * - Native share sheet (iOS/Android) — 2x resolution PNG
 * - Copy card link (deep link)
 *
 * Features:
 * - 2x resolution canvas export (2160×2700)
 * - Full rarity finish in export (glow, shimmer, watermark)
 * - Unbreakable shield + "Live Without Limits™" watermark
 * - Auto-caption generator (editable)
 * - Per-tier story frames (Bronze copper → Platinum embossed)
 * - Card number + date stamp on all exports
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import {
  Share2, Send, Download, Link2, BookOpen, Sparkles,
  Loader2, X, Camera, Edit3, Copy, Check,
} from 'lucide-react';
import { RARITY_GLOW, type RarityTier, generatePBShareCaption, generateUnTunesShareCaption } from '@/lib/rarityGlow';
import type { AchievementCard } from '@/hooks/useAchievementCards';

/* ═══════════════════════════════════════════════════ */
/*  2x RESOLUTION CARD IMAGE GENERATOR                */
/* ═══════════════════════════════════════════════════ */

const EXPORT_W = 2160;
const EXPORT_H = 2700;

function drawRarityBackground(ctx: CanvasRenderingContext2D, tier: RarityTier) {
  const cfg = RARITY_GLOW[tier];

  // Base fill
  ctx.fillStyle = cfg.cardBg;
  ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);

  // Radial glow centre
  const grad = ctx.createRadialGradient(EXPORT_W / 2, EXPORT_H * 0.35, 0, EXPORT_W / 2, EXPORT_H * 0.35, EXPORT_W * 0.6);
  grad.addColorStop(0, `${cfg.primary}20`);
  grad.addColorStop(0.6, `${cfg.primary}08`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);

  // Border with gradient
  ctx.strokeStyle = cfg.primary;
  ctx.lineWidth = 8;
  ctx.strokeRect(60, 60, EXPORT_W - 120, EXPORT_H - 120);
  // Inner border
  ctx.strokeStyle = `${cfg.primary}40`;
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 80, EXPORT_W - 160, EXPORT_H - 160);

  // Tier-specific textures
  if (tier === 'bronze') {
    // Fine grain overlay
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * EXPORT_W;
      const y = Math.random() * EXPORT_H;
      ctx.fillStyle = `rgba(205,127,50,${Math.random() * 0.03})`;
      ctx.fillRect(x, y, 2, 2);
    }
  } else if (tier === 'silver') {
    // Brushed metal horizontal lines
    for (let y = 100; y < EXPORT_H - 100; y += 4) {
      ctx.strokeStyle = `rgba(192,192,192,${0.02 + Math.random() * 0.02})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, y);
      ctx.lineTo(EXPORT_W - 100, y);
      ctx.stroke();
    }
  } else if (tier === 'gold') {
    // Gold dust particles
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * EXPORT_W;
      const y = Math.random() * EXPORT_H;
      const r = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,215,0,${Math.random() * 0.06})`;
      ctx.fill();
    }
  } else if (tier === 'diamond') {
    // Geometric facets
    for (let i = 0; i < 20; i++) {
      const cx = Math.random() * EXPORT_W;
      const cy = Math.random() * EXPORT_H;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 40);
      ctx.lineTo(cx + 30, cy);
      ctx.lineTo(cx, cy + 40);
      ctx.lineTo(cx - 30, cy);
      ctx.closePath();
      ctx.strokeStyle = `rgba(125,249,255,${Math.random() * 0.05})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else if (tier === 'platinum') {
    // Directional grain
    for (let y = 100; y < EXPORT_H - 100; y += 3) {
      const offset = Math.sin(y * 0.01) * 20;
      ctx.strokeStyle = `rgba(229,228,226,${0.015 + Math.random() * 0.015})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100 + offset, y);
      ctx.lineTo(EXPORT_W - 100 + offset, y);
      ctx.stroke();
    }
  }
}

function drawWatermark(ctx: CanvasRenderingContext2D) {
  // Shield watermark (centre, low opacity)
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.font = '900 300px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('🛡️', EXPORT_W / 2, EXPORT_H * 0.4);
  ctx.restore();

  // "Live Without Limits™" bottom watermark
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.font = '400 28px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('UNBREAKABLE · LIVE WITHOUT LIMITS™', EXPORT_W / 2, EXPORT_H - 100);
  ctx.restore();
}

/**
 * Generate animated shimmer frames for Gold+ rarity cards.
 * Returns a short looping WebM video blob via MediaRecorder,
 * or falls back to static PNG if animation is not supported.
 */
async function generateAnimatedShareAsset(
  card: AchievementCard,
  type: 'pb' | 'untunes' = 'pb',
): Promise<{ blob: Blob; ext: string; mime: string } | null> {
  const tier = (card.rarity || 'bronze') as RarityTier;
  const rank = { platinum: 5, diamond: 4, gold: 3, silver: 2, bronze: 1, standard: 0 }[tier] || 0;

  // Only animate Gold+ cards
  if (rank < 3) {
    const img = await generateShareImage(card, type);
    return img ? { blob: img, ext: 'png', mime: 'image/png' } : null;
  }

  const cfg = RARITY_GLOW[tier];
  const canvas = document.createElement('canvas');
  canvas.width = 1080; // Smaller for animation performance
  canvas.height = 1350;
  const ctx = canvas.getContext('2d')!;
  const W = 1080, H = 1350;

  // Check if MediaRecorder + canvas capture is supported
  const stream = canvas.captureStream?.(30);
  if (!stream || !MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
    // Fallback to static PNG at full res
    const img = await generateShareImage(card, type);
    return img ? { blob: img, ext: 'png', mime: 'image/png' } : null;
  }

  return new Promise((resolve) => {
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9',
      videoBitsPerSecond: 2_000_000,
    });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      resolve({ blob: new Blob(chunks, { type: 'video/webm' }), ext: 'webm', mime: 'video/webm' });
    };

    const totalFrames = 60; // ~2 seconds at 30fps
    let frame = 0;

    function drawAnimatedFrame(t: number) {
      // Base
      ctx.fillStyle = cfg.cardBg;
      ctx.fillRect(0, 0, W, H);

      // Animated shimmer sweep
      const sweepX = ((t * 1.5) % 2 - 0.5) * W * 1.5;
      const shimmerGrad = ctx.createLinearGradient(sweepX - 200, 0, sweepX + 200, H);
      shimmerGrad.addColorStop(0, 'transparent');
      shimmerGrad.addColorStop(0.4, `${cfg.primary}15`);
      shimmerGrad.addColorStop(0.5, `${cfg.primary}35`);
      shimmerGrad.addColorStop(0.6, `${cfg.primary}15`);
      shimmerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = shimmerGrad;
      ctx.fillRect(0, 0, W, H);

      // Border glow pulse
      const pulse = 0.6 + 0.4 * Math.sin(t * Math.PI * 2);
      ctx.strokeStyle = cfg.primary;
      ctx.lineWidth = 4;
      ctx.globalAlpha = pulse;
      ctx.strokeRect(30, 30, W - 60, H - 60);
      ctx.globalAlpha = 1;

      // Radial centre glow
      const grad = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, W * 0.5);
      grad.addColorStop(0, `${cfg.primary}${Math.round(pulse * 20).toString(16).padStart(2, '0')}`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Diamond prismatic colour shift
      if (tier === 'diamond') {
        const hue = (t * 360) % 360;
        const prismGrad = ctx.createLinearGradient(0, 0, W, H);
        prismGrad.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.08)`);
        prismGrad.addColorStop(0.5, `hsla(${(hue + 120) % 360}, 80%, 60%, 0.1)`);
        prismGrad.addColorStop(1, `hsla(${(hue + 240) % 360}, 80%, 60%, 0.08)`);
        ctx.fillStyle = prismGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // Platinum rose-gold thread shimmer
      if (tier === 'platinum') {
        for (let y = 30; y < H - 30; y += 6) {
          const offset = Math.sin(y * 0.02 + t * 4) * 10;
          ctx.strokeStyle = `rgba(183,110,121,${0.03 + 0.04 * Math.sin(y * 0.01 + t * 3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(40 + offset, y);
          ctx.lineTo(W - 40 + offset, y);
          ctx.stroke();
        }
      }

      // Gold floating particles
      if (tier === 'gold') {
        for (let i = 0; i < 30; i++) {
          const px = (Math.sin(i * 1.7 + t * 2) * 0.5 + 0.5) * W;
          const py = (Math.cos(i * 2.3 + t * 1.5) * 0.5 + 0.5) * H;
          const r = 2 + Math.sin(i + t * 3) * 1.5;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,215,0,${0.15 + 0.1 * Math.sin(i + t * 4)})`;
          ctx.fill();
        }
      }

      // Icon
      ctx.textAlign = 'center';
      ctx.font = '100px system-ui';
      ctx.fillStyle = cfg.primary;
      const icon = card.card_type === 'programme_trophy' ? '🏆'
        : (card.exercise_name?.toLowerCase().includes('run') || card.activity_category === 'run') ? '🏃'
        : type === 'untunes' ? '🎵' : '💪';
      ctx.fillText(icon, W / 2, 380);

      // Rarity badge
      ctx.font = '900 28px system-ui';
      ctx.fillStyle = cfg.primary;
      ctx.save();
      ctx.shadowColor = `${cfg.primary}80`;
      ctx.shadowBlur = 15 * pulse;
      ctx.fillText(cfg.label, W / 2, 170);
      ctx.restore();

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 44px system-ui';
      const title = (card.title || card.exercise_name || 'Achievement').toUpperCase();
      let displayTitle = title;
      const maxW = W - 120;
      while (ctx.measureText(displayTitle).width > maxW && displayTitle.length > 10) {
        displayTitle = displayTitle.slice(0, -3) + '…';
      }
      ctx.fillText(displayTitle, W / 2, 550);

      // Subtitle
      if (card.subtitle || (card.record_value && card.record_unit)) {
        ctx.font = '600 28px system-ui';
        ctx.fillStyle = `${cfg.primary}DD`;
        ctx.fillText(card.subtitle || `${card.record_value}${card.record_unit}`, W / 2, 600);
      }

      // Overall rating
      if (card.overall_rating) {
        ctx.font = '900 80px system-ui';
        ctx.fillStyle = '#FFFFFF';
        ctx.save();
        ctx.shadowColor = `${cfg.primary}80`;
        ctx.shadowBlur = 20 * pulse;
        ctx.fillText(String(card.overall_rating), W / 2, 730);
        ctx.restore();
      }

      // Watermark
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.font = '400 14px system-ui';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('UNBREAKABLE · LIVE WITHOUT LIMITS™', W / 2, H - 50);
      ctx.restore();

      // Card number
      if (card.card_number) {
        ctx.font = '400 12px monospace';
        ctx.fillStyle = '#FFFFFF30';
        ctx.textAlign = 'right';
        ctx.fillText(card.card_number, W - 60, H - 70);
        ctx.textAlign = 'center';
      }
    }

    recorder.start();
    function renderFrame() {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }
      drawAnimatedFrame(frame / totalFrames);
      frame++;
      requestAnimationFrame(renderFrame);
    }
    renderFrame();
  });
}

async function generateShareImage(
  card: AchievementCard,
  type: 'pb' | 'untunes' = 'pb',
): Promise<Blob | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = EXPORT_W;
    canvas.height = EXPORT_H;
    const ctx = canvas.getContext('2d')!;
    const tier = (card.rarity || 'bronze') as RarityTier;
    const cfg = RARITY_GLOW[tier];

    // Draw rarity background
    drawRarityBackground(ctx, tier);

    // Card type label
    ctx.textAlign = 'center';
    ctx.fillStyle = `${cfg.primary}CC`;
    ctx.font = '600 40px system-ui';
    const typeLabel = card.card_type === 'programme_trophy'
      ? 'PROGRAMME TROPHY'
      : card.card_type === 'pb_global'
        ? 'GLOBAL PB CARD'
        : type === 'untunes'
          ? 'UN-TUNES CARD'
          : 'PERSONAL BEST CARD';
    ctx.fillText(typeLabel, EXPORT_W / 2, 220);

    // Rarity badge
    ctx.font = '900 56px system-ui';
    ctx.fillStyle = cfg.primary;
    ctx.save();
    ctx.shadowColor = `${cfg.primary}80`;
    ctx.shadowBlur = cfg.intensity * 10 + 10;
    ctx.fillText(cfg.label, EXPORT_W / 2, 310);
    ctx.restore();

    // Icon circle
    ctx.beginPath();
    ctx.arc(EXPORT_W / 2, 700, 250, 0, Math.PI * 2);
    ctx.fillStyle = `${cfg.primary}10`;
    ctx.fill();
    ctx.strokeStyle = `${cfg.primary}40`;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Exercise icon
    ctx.font = '200px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = cfg.primary;
    const icon = card.card_type === 'programme_trophy' ? '🏆'
      : (card.exercise_name?.toLowerCase().includes('run') || card.activity_category === 'run') ? '🏃'
      : type === 'untunes' ? '🎵'
      : '💪';
    ctx.fillText(icon, EXPORT_W / 2, 770);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 80px system-ui';
    const title = (card.title || card.exercise_name || 'Achievement').toUpperCase();
    // Truncate long titles
    const maxWidth = EXPORT_W - 240;
    let displayTitle = title;
    while (ctx.measureText(displayTitle).width > maxWidth && displayTitle.length > 10) {
      displayTitle = displayTitle.slice(0, -3) + '…';
    }
    ctx.fillText(displayTitle, EXPORT_W / 2, 1100);

    // Subtitle (lift stat)
    if (card.subtitle || (card.record_value && card.record_unit)) {
      ctx.font = '600 52px system-ui';
      ctx.fillStyle = `${cfg.primary}DD`;
      ctx.save();
      ctx.shadowColor = `${cfg.primary}60`;
      ctx.shadowBlur = 15;
      const sub = card.subtitle || `${card.record_value}${card.record_unit}`;
      ctx.fillText(sub, EXPORT_W / 2, 1190);
      ctx.restore();
    }

    // Overall rating (large number)
    if (card.overall_rating) {
      ctx.font = '900 160px system-ui';
      ctx.fillStyle = '#FFFFFF';
      ctx.save();
      ctx.shadowColor = `${cfg.primary}80`;
      ctx.shadowBlur = 30;
      ctx.fillText(String(card.overall_rating), EXPORT_W / 2, 1440);
      ctx.restore();
      ctx.font = '600 32px system-ui';
      ctx.fillStyle = '#FFFFFF80';
      ctx.fillText('OVERALL RATING', EXPORT_W / 2, 1490);
    }

    // 6-stat bar
    if (card.athlete_stats) {
      const stats = card.athlete_stats as Record<string, number>;
      const statKeys = ['str', 'pwr', 'spd', 'end', 'agi', 'rec'];
      const statLabels = ['STR', 'PWR', 'SPD', 'END', 'AGI', 'REC'];
      const barY = card.overall_rating ? 1560 : 1400;
      const barW = (EXPORT_W - 320) / 6;

      statKeys.forEach((key, i) => {
        const val = stats[key] || 0;
        const x = 160 + i * barW + barW / 2;

        // Stat value
        ctx.font = '900 44px system-ui';
        ctx.fillStyle = cfg.primary;
        ctx.textAlign = 'center';
        ctx.save();
        ctx.shadowColor = `${cfg.primary}50`;
        ctx.shadowBlur = 8;
        ctx.fillText(String(val), x, barY);
        ctx.restore();

        // Stat label
        ctx.font = '400 24px system-ui';
        ctx.fillStyle = '#FFFFFF60';
        ctx.fillText(statLabels[i], x, barY + 36);

        // Bar background
        ctx.fillStyle = '#FFFFFF10';
        ctx.fillRect(x - 16, barY + 48, 32, 100);
        // Bar fill
        ctx.fillStyle = `${cfg.primary}CC`;
        const fillH = (val / 99) * 100;
        ctx.fillRect(x - 16, barY + 48 + (100 - fillH), 32, fillH);
      });
    }

    // Bio line
    if (card.bio_line) {
      ctx.font = 'italic 36px system-ui';
      ctx.fillStyle = '#FFFFFF90';
      ctx.textAlign = 'center';
      const bioY = card.athlete_stats ? 1850 : card.overall_rating ? 1560 : 1400;
      // Word wrap
      const words = card.bio_line.split(' ');
      let line = '';
      let y = bioY;
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > EXPORT_W - 300) {
          ctx.fillText(`"${line.trim()}"`, EXPORT_W / 2, y);
          line = word + ' ';
          y += 44;
        } else {
          line = test;
        }
      }
      if (line.trim()) ctx.fillText(`"${line.trim()}"`, EXPORT_W / 2, y);
    }

    // Category badge
    const catLabel = card.category_label ||
      (['run', 'cycle', 'row', 'swim'].includes(card.activity_category || '') ? 'CARDIO' : 'STRENGTH');
    ctx.font = '700 28px system-ui';
    ctx.fillStyle = `${cfg.primary}AA`;
    ctx.fillText(catLabel, EXPORT_W / 2, EXPORT_H - 300);

    // Date stamp
    const dateStr = card.earned_at
      ? new Date(card.earned_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    ctx.font = '400 26px system-ui';
    ctx.fillStyle = '#FFFFFF50';
    ctx.fillText(dateStr, EXPORT_W / 2, EXPORT_H - 260);

    // Card number
    if (card.card_number) {
      ctx.font = '400 24px monospace';
      ctx.fillStyle = tier === 'platinum' ? '#B76E7990' : '#FFFFFF30';
      ctx.textAlign = 'right';
      ctx.fillText(card.card_number, EXPORT_W - 120, EXPORT_H - 140);
    }

    // Watermark
    drawWatermark(ctx);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  } catch (err) {
    console.error('Share image generation failed:', err);
    return null;
  }
}

/* ═══════════════════════════════════════════════════ */
/*  SHARE SHEET COMPONENT                             */
/* ═══════════════════════════════════════════════════ */

interface CardShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: AchievementCard;
  /** 'pb' or 'untunes' */
  cardSystem?: 'pb' | 'untunes';
  /** User display name for captions */
  displayName?: string;
}

export function CardShareSheet({
  open,
  onOpenChange,
  card,
  cardSystem = 'pb',
  displayName,
}: CardShareSheetProps) {
  const { user } = useAuth();
  const { createPost } = usePosts();
  const { toast } = useToast();
  const tier = (card.rarity || 'bronze') as RarityTier;
  const cfg = RARITY_GLOW[tier];

  const [caption, setCaption] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-generate caption
  useEffect(() => {
    if (!open) return;
    if (cardSystem === 'pb') {
      setCaption(generatePBShareCaption({
        displayName,
        exerciseName: card.exercise_name || card.title || 'Personal Best',
        recordValue: card.record_value || 0,
        recordUnit: card.record_unit || 'kg',
        tier,
        overallRating: card.overall_rating,
        date: card.earned_at,
      }));
    } else {
      setCaption(generateUnTunesShareCaption({
        trackName: card.title || 'Track',
        artistName: card.subtitle || 'Unknown Artist',
        tier,
      }));
    }
  }, [open, card, tier, cardSystem, displayName]);

  // Share to timeline/feed
  const handleShareFeed = useCallback(async () => {
    if (!user) return;
    setIsPosting(true);
    try {
      const blob = await generateShareImage(card, cardSystem);
      let imageUrl: string | undefined;

      // Upload image to storage if possible
      if (blob) {
        const { supabase } = await import('@/integrations/supabase/client');
        const path = `shared-cards/${user.id}/${card.id}-${Date.now()}.png`;
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, blob, { contentType: 'image/png', upsert: true });
        if (!uploadErr) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(path);
          imageUrl = data?.publicUrl;
        }
      }

      const { error } = await createPost({
        content: caption + '\n\n#Unbreakable #LiveWithoutLimits #KeepShowingUp',
        image_url: imageUrl,
        visibility: 'public',
      });

      if (error) {
        toast({ title: 'Failed to share', description: 'Could not post to timeline.' });
      } else {
        toast({ title: 'Shared!', description: 'Card posted to your timeline.' });
        onOpenChange(false);
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong.' });
    } finally {
      setIsPosting(false);
    }
  }, [user, card, caption, cardSystem, createPost, toast, onOpenChange]);

  // Determine if this card gets animated export
  const RARITY_RANK: Record<string, number> = { platinum: 5, diamond: 4, gold: 3, silver: 2, bronze: 1, standard: 0 };
  const isAnimated = (RARITY_RANK[tier] || 0) >= 3;

  // Share via native share sheet (animated for Gold+, static for others)
  const handleNativeShare = useCallback(async () => {
    setIsExporting(true);
    try {
      const asset = await generateAnimatedShareAsset(card, cardSystem);
      if (!asset) {
        toast({ title: 'Error', description: 'Could not generate card image.' });
        return;
      }

      const fileName = `unbreakable-${tier}-${(card.title || 'card').replace(/\s+/g, '-').toLowerCase()}.${asset.ext}`;
      const file = new File([asset.blob], fileName, { type: asset.mime });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
        });
        toast({ title: 'Shared!', description: `${isAnimated ? 'Animated card' : 'Card'} shared.` });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(asset.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Downloaded!', description: `${isAnimated ? 'Animated card' : 'Card image'} saved.` });
      }
      onOpenChange(false);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast({ title: 'Error', description: 'Share cancelled or failed.' });
      }
    } finally {
      setIsExporting(false);
    }
  }, [card, cardSystem, tier, cfg.label, caption, toast, onOpenChange, isAnimated]);

  // Download (animated for Gold+, static for others)
  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    try {
      const asset = await generateAnimatedShareAsset(card, cardSystem);
      if (asset) {
        const url = URL.createObjectURL(asset.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `unbreakable-${tier}-${(card.title || 'card').replace(/\s+/g, '-').toLowerCase()}.${asset.ext}`;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Downloaded!', description: `${isAnimated ? 'Animated card video' : 'Card image'} saved to your device.` });
      }
    } finally {
      setIsExporting(false);
    }
  }, [card, cardSystem, tier, toast, isAnimated]);

  // Copy deep link
  const handleCopyLink = useCallback(async () => {
    const deepLink = `${window.location.origin}/cards/${card.id}`;
    try {
      await navigator.clipboard.writeText(deepLink);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Card link copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Link', description: deepLink });
    }
  }, [card.id, toast]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl border-border bg-card max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="font-display tracking-wider text-sm flex items-center gap-2">
            <Share2 className="w-4 h-4" style={{ color: cfg.primary }} />
            SHARE CARD
          </SheetTitle>
        </SheetHeader>

        {/* Card preview */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl border mb-4"
          style={{
            background: `${cfg.cardBg}CC`,
            borderColor: `${cfg.primary}30`,
            boxShadow: cfg.boxShadow,
          }}
        >
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${cfg.primary}15` }}
          >
            <span className="text-2xl">
              {card.card_type === 'programme_trophy' ? '🏆' : cardSystem === 'untunes' ? '🎵' : '💪'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-foreground truncate">{card.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {card.subtitle || (card.record_value ? `${card.record_value}${card.record_unit}` : '')}
            </p>
            <p
              className="text-[10px] font-display tracking-[0.2em] mt-0.5"
              style={{ color: cfg.primary, textShadow: cfg.textShadow }}
            >
              {cfg.label}
            </p>
          </div>
        </div>

        {/* Caption */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-display tracking-wider text-muted-foreground">CAPTION</label>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-[10px] font-display tracking-wider text-primary flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" /> {isEditing ? 'DONE' : 'EDIT'}
            </button>
          </div>
          {isEditing ? (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-background/50 rounded-lg px-3 py-2 text-sm text-foreground border border-border/50 outline-none resize-none"
              rows={3}
              maxLength={280}
            />
          ) : (
            <p className="text-xs text-muted-foreground bg-background/30 rounded-lg px-3 py-2">
              {caption}
            </p>
          )}
        </div>

        {/* Share actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-display tracking-wider border-primary/30 text-primary hover:bg-primary/10"
            onClick={handleShareFeed}
            disabled={isPosting}
          >
            {isPosting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
            POST TO MY TIMELINE
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-display tracking-wider border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            onClick={handleNativeShare}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Share2 className="w-3 h-3 mr-2" />}
            {isAnimated ? 'SHARE ANIMATED CARD' : 'SHARE TO SOCIALS'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-display tracking-wider border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            onClick={handleDownload}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Download className="w-3 h-3 mr-2" />}
            {isAnimated ? 'SAVE ANIMATED CARD' : 'SAVE IMAGE (2x)'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-display tracking-wider border-zinc-700 text-zinc-400 hover:bg-zinc-900"
            onClick={handleCopyLink}
          >
            {copied ? <Check className="w-3 h-3 mr-2 text-green-400" /> : <Link2 className="w-3 h-3 mr-2" />}
            {copied ? 'COPIED!' : 'COPY CARD LINK'}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-[8px] text-muted-foreground/50 text-center mt-3 font-display tracking-wider">
          UNBREAKABLE · LIVE WITHOUT LIMITS™
        </p>
      </SheetContent>
    </Sheet>
  );
}
