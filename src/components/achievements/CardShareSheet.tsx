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
import { useStories } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import {
  Share2, Send, Download, Link2, BookOpen, Sparkles,
  Loader2, X, Camera, Edit3, Copy, Check,
} from 'lucide-react';
import { RARITY_GLOW, type RarityTier, generatePBShareCaption, generateUnTunesShareCaption } from '@/lib/rarityGlow';
import type { AchievementCard } from '@/hooks/useAchievementCards';
import { AchievementCardStatic } from '@/components/achievements/AchievementCardReveal';

/* ═══════════════════════════════════════════════════ */
/*  2x RESOLUTION CARD IMAGE GENERATOR                */
/* ═══════════════════════════════════════════════════ */

const EXPORT_W = 2160;
const EXPORT_H = 2700;

function drawRarityBackground(ctx: CanvasRenderingContext2D, tier: RarityTier) {
  const cfg = RARITY_GLOW[tier];
  const W = EXPORT_W, H = EXPORT_H;

  // ── Base fill ──
  ctx.fillStyle = cfg.cardBg;
  ctx.fillRect(0, 0, W, H);

  // ── Tier-specific metallic/stone material finishes ──
  if (tier === 'bronze') {
    // BRONZE — hammered stone with warm copper patina
    // Deep copper radial hotspot
    const g1 = ctx.createRadialGradient(W * 0.3, H * 0.2, 0, W * 0.3, H * 0.2, W * 0.7);
    g1.addColorStop(0, 'rgba(205,127,50,0.18)');
    g1.addColorStop(0.5, 'rgba(139,69,19,0.08)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    // Stone grain texture — heavy
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const size = Math.random() * 4 + 1;
      ctx.fillStyle = `rgba(205,127,50,${Math.random() * 0.06 + 0.01})`;
      ctx.fillRect(x, y, size, size * 0.5);
    }
    // Vertical patina streaks
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * W;
      const streakH = Math.random() * H * 0.4 + H * 0.1;
      const startY = Math.random() * (H - streakH);
      const sg = ctx.createLinearGradient(x, startY, x, startY + streakH);
      sg.addColorStop(0, 'transparent');
      sg.addColorStop(0.3, `rgba(139,69,19,${Math.random() * 0.04})`);
      sg.addColorStop(0.7, `rgba(205,127,50,${Math.random() * 0.03})`);
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.fillRect(x - 3, startY, 6, streakH);
    }
  } else if (tier === 'silver') {
    // SILVER — brushed chrome with directional polish
    // Chrome highlight sweep across upper third
    const g1 = ctx.createLinearGradient(0, 0, W, H * 0.4);
    g1.addColorStop(0, 'rgba(192,192,192,0.02)');
    g1.addColorStop(0.3, 'rgba(232,232,232,0.12)');
    g1.addColorStop(0.5, 'rgba(255,255,255,0.08)');
    g1.addColorStop(0.7, 'rgba(192,192,192,0.04)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    // Brushed horizontal lines — dense, fine
    for (let y = 60; y < H - 60; y += 2) {
      const alpha = 0.02 + Math.random() * 0.04;
      const offset = Math.sin(y * 0.005) * 30;
      ctx.strokeStyle = `rgba(200,200,200,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60 + offset, y);
      ctx.lineTo(W - 60 + offset, y);
      ctx.stroke();
    }
    // Chrome specular dots
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,232,232,${Math.random() * 0.05})`;
      ctx.fill();
    }
  } else if (tier === 'gold') {
    // GOLD — liquid gold foil with embossed lustre
    // Multiple gold radial hotspots for depth
    const spots = [[0.25, 0.15], [0.75, 0.3], [0.4, 0.7], [0.6, 0.9]];
    for (const [sx, sy] of spots) {
      const g = ctx.createRadialGradient(W * sx, H * sy, 0, W * sx, H * sy, W * 0.5);
      g.addColorStop(0, 'rgba(255,215,0,0.14)');
      g.addColorStop(0.4, 'rgba(184,134,11,0.06)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    // Foil shimmer — diagonal light bands
    for (let i = 0; i < 8; i++) {
      const startX = Math.random() * W * 1.5 - W * 0.25;
      const bandW = 60 + Math.random() * 120;
      const bg = ctx.createLinearGradient(startX, 0, startX + bandW, H);
      bg.addColorStop(0, 'transparent');
      bg.addColorStop(0.3, `rgba(255,215,0,${0.03 + Math.random() * 0.05})`);
      bg.addColorStop(0.5, `rgba(255,245,200,${0.02 + Math.random() * 0.04})`);
      bg.addColorStop(0.7, `rgba(184,134,11,${0.02 + Math.random() * 0.03})`);
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.fillRect(startX, 0, bandW, H);
    }
    // Gold dust particles — larger, more visible
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = Math.random() * 3 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,215,0,${Math.random() * 0.08 + 0.02})`;
      ctx.fill();
    }
    // Diamond-cut border texture
    ctx.strokeStyle = '#FFD70040';
    ctx.lineWidth = 1;
    for (let i = 0; i < 200; i++) {
      const bx = 55 + Math.random() * (W - 110);
      const by = 55 + Math.random() * (H - 110);
      if (bx < 70 || bx > W - 70 || by < 70 || by > H - 70) {
        ctx.beginPath();
        ctx.moveTo(bx - 4, by);
        ctx.lineTo(bx, by - 4);
        ctx.lineTo(bx + 4, by);
        ctx.lineTo(bx, by + 4);
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (tier === 'diamond') {
    // DIAMOND — prismatic holographic with crystalline facets
    // Multi-colour prismatic gradient background
    const g1 = ctx.createLinearGradient(0, 0, W, H);
    g1.addColorStop(0, 'rgba(0,191,255,0.06)');
    g1.addColorStop(0.2, 'rgba(191,95,255,0.08)');
    g1.addColorStop(0.4, 'rgba(0,206,209,0.06)');
    g1.addColorStop(0.6, 'rgba(125,249,255,0.10)');
    g1.addColorStop(0.8, 'rgba(191,95,255,0.06)');
    g1.addColorStop(1, 'rgba(0,191,255,0.04)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    // Holographic light bars — diagonal rainbow streaks
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * W * 1.2 - W * 0.1;
      const bw = 40 + Math.random() * 100;
      const colors = ['rgba(125,249,255,', 'rgba(191,95,255,', 'rgba(0,206,209,', 'rgba(240,248,255,'];
      const c = colors[Math.floor(Math.random() * colors.length)];
      const bg = ctx.createLinearGradient(x, 0, x + bw, H);
      bg.addColorStop(0, 'transparent');
      bg.addColorStop(0.4, `${c}${(0.03 + Math.random() * 0.05).toFixed(2)})`);
      bg.addColorStop(0.6, `${c}${(0.02 + Math.random() * 0.04).toFixed(2)})`);
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.fillRect(x, 0, bw, H);
    }
    // Crystalline facet overlay — geometric diamonds
    for (let i = 0; i < 50; i++) {
      const cx = Math.random() * W;
      const cy = Math.random() * H;
      const s = 20 + Math.random() * 60;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s * 0.6, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - s * 0.6, cy);
      ctx.closePath();
      const fc = Math.random() > 0.5 ? '125,249,255' : '191,95,255';
      ctx.strokeStyle = `rgba(${fc},${(Math.random() * 0.06 + 0.02).toFixed(2)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Spectral scatter dots
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = Math.random() * 2 + 0.5;
      const sc = ['125,249,255', '191,95,255', '0,206,209', '240,248,255'][Math.floor(Math.random() * 4)];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${sc},${(Math.random() * 0.08 + 0.02).toFixed(2)})`;
      ctx.fill();
    }
  } else if (tier === 'platinum') {
    // PLATINUM — brushed platinum with rose-gold inlay threads
    // Platinum base gradient — subtle warmth
    const g1 = ctx.createLinearGradient(0, 0, W, H);
    g1.addColorStop(0, 'rgba(229,228,226,0.06)');
    g1.addColorStop(0.3, 'rgba(183,110,121,0.04)');
    g1.addColorStop(0.6, 'rgba(229,228,226,0.08)');
    g1.addColorStop(1, 'rgba(183,110,121,0.03)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    // Directional grain — sinuous platinum lines
    for (let y = 50; y < H - 50; y += 2) {
      const offset = Math.sin(y * 0.008) * 25 + Math.sin(y * 0.003) * 15;
      const alpha = 0.02 + Math.random() * 0.03;
      ctx.strokeStyle = `rgba(229,228,226,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50 + offset, y);
      ctx.lineTo(W - 50 + offset, y);
      ctx.stroke();
    }
    // Rose-gold thread inlays — thin vertical accent lines
    for (let i = 0; i < 15; i++) {
      const x = 100 + Math.random() * (W - 200);
      const sg = ctx.createLinearGradient(x, 0, x, H);
      sg.addColorStop(0, 'transparent');
      sg.addColorStop(0.2, `rgba(183,110,121,${0.03 + Math.random() * 0.04})`);
      sg.addColorStop(0.5, `rgba(229,228,226,${0.02 + Math.random() * 0.03})`);
      sg.addColorStop(0.8, `rgba(183,110,121,${0.02 + Math.random() * 0.03})`);
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.fillRect(x - 1, 0, 2, H);
    }
    // Crown/shield emblem watermark — top centre
    ctx.save();
    ctx.globalAlpha = 0.035;
    ctx.font = '900 200px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#E5E4E2';
    ctx.fillText('♛', W / 2, 280);
    ctx.restore();
    // Linen micro-texture
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      ctx.fillStyle = `rgba(229,228,226,${Math.random() * 0.015})`;
      ctx.fillRect(x, y, 3, 1);
    }
  }

  // ── Border system (all tiers) ──
  // Outer border — tier primary colour
  ctx.strokeStyle = cfg.primary;
  ctx.lineWidth = tier === 'platinum' ? 10 : tier === 'diamond' ? 8 : 6;
  ctx.beginPath();
  ctx.roundRect(50, 50, W - 100, H - 100, 24);
  ctx.stroke();

  // Inner accent border
  ctx.strokeStyle = `${cfg.accent || cfg.primary}30`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(70, 70, W - 140, H - 140, 20);
  ctx.stroke();

  // Corner accents for Gold+ tiers
  if (['gold', 'diamond', 'platinum'].includes(tier)) {
    const cornerSize = 40;
    const corners = [[50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50]];
    ctx.strokeStyle = `${cfg.primary}60`;
    ctx.lineWidth = 3;
    for (const [cx, cy] of corners) {
      const dx = cx < W / 2 ? 1 : -1;
      const dy = cy < H / 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cx + dx * cornerSize, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * cornerSize);
      ctx.stroke();
    }
  }
}

function drawWatermark(ctx: CanvasRenderingContext2D, tier: RarityTier) {
  const cfg = RARITY_GLOW[tier];

  // Shield watermark (centre, low opacity — tinted to tier colour)
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.font = '900 280px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = cfg.primary;
  ctx.fillText('🛡️', EXPORT_W / 2, EXPORT_H * 0.42);
  ctx.restore();

  // "UNBREAKABLE · LIVE WITHOUT LIMITS™" bottom watermark
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.font = '500 30px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = cfg.primary;
  ctx.letterSpacing = '4px';
  ctx.fillText('UNBREAKABLE', EXPORT_W / 2, EXPORT_H - 120);
  ctx.globalAlpha = 0.25;
  ctx.font = '300 22px system-ui';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('LIVE WITHOUT LIMITS™', EXPORT_W / 2, EXPORT_H - 85);
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

export async function generateShareImage(
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

    // Try to load hero image first
    let heroImg: HTMLImageElement | null = null;
    const heroUrl = card.image_url;
    if (heroUrl) {
      try {
        heroImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = heroUrl;
          setTimeout(() => reject(new Error('Image load timeout')), 4000);
        });
      } catch {
        heroImg = null;
      }
    }

    // Draw hero image as background if available
    if (heroImg) {
      const imgRatio = heroImg.width / heroImg.height;
      const canvasRatio = EXPORT_W / EXPORT_H;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (imgRatio > canvasRatio) {
        drawH = EXPORT_H;
        drawW = drawH * imgRatio;
        drawX = (EXPORT_W - drawW) / 2;
        drawY = 0;
      } else {
        drawW = EXPORT_W;
        drawH = drawW / imgRatio;
        drawX = 0;
        drawY = 0; // top-aligned for athlete photos
      }
      ctx.globalAlpha = 0.6;
      ctx.drawImage(heroImg, drawX, drawY, drawW, drawH);
      ctx.globalAlpha = 1;
      // Dark gradient overlay so text is readable
      const overlay = ctx.createLinearGradient(0, 0, 0, EXPORT_H);
      overlay.addColorStop(0, 'rgba(0,0,0,0.3)');
      overlay.addColorStop(0.4, 'rgba(0,0,0,0.5)');
      overlay.addColorStop(0.7, 'rgba(0,0,0,0.85)');
      overlay.addColorStop(1, 'rgba(0,0,0,0.95)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);
    }

    // Rarity badge — top right
    ctx.textAlign = 'right';
    ctx.font = '900 56px system-ui';
    ctx.fillStyle = cfg.primary;
    ctx.save();
    ctx.shadowColor = `${cfg.primary}80`;
    ctx.shadowBlur = cfg.intensity * 10 + 10;
    ctx.fillText(cfg.label, EXPORT_W - 100, 120);
    ctx.restore();

    // Overall rating — top left, large
    if (card.overall_rating) {
      ctx.textAlign = 'left';
      ctx.font = '900 120px system-ui';
      ctx.fillStyle = cfg.primary;
      ctx.save();
      ctx.shadowColor = `${cfg.primary}80`;
      ctx.shadowBlur = 25;
      ctx.fillText(String(card.overall_rating), 80, 180);
      ctx.restore();
      ctx.font = '600 28px system-ui';
      ctx.fillStyle = `${cfg.primary}90`;
      ctx.fillText('OVR', 80, 215);
    }

    // Category badge — below OVR
    const catLabel = card.category_label ||
      (['run', 'cycle', 'row', 'swim'].includes(card.activity_category || '') ? 'CARDIO' : 'STRENGTH');
    ctx.textAlign = 'left';
    ctx.font = '700 32px system-ui';
    ctx.fillStyle = `${cfg.primary}CC`;
    ctx.fillText(catLabel, 80, 260);

    // Card type label — small
    ctx.textAlign = 'center';
    ctx.fillStyle = `${cfg.primary}80`;
    ctx.font = '600 28px system-ui';
    const typeLabel = card.card_type === 'programme_trophy'
      ? 'PROGRAMME TROPHY'
      : card.card_type === 'pb_global'
        ? 'GLOBAL PB CARD'
        : type === 'untunes'
          ? 'UN-TUNES CARD'
          : 'PERSONAL BEST CARD';
    ctx.fillText(typeLabel, EXPORT_W / 2, EXPORT_H * 0.42);

    // Athlete name — large
    if (card.owner_display_name) {
      ctx.textAlign = 'left';
      ctx.font = '900 64px system-ui';
      ctx.fillStyle = '#FFFFFF';
      ctx.save();
      ctx.shadowColor = `${cfg.primary}50`;
      ctx.shadowBlur = 15;
      ctx.fillText(card.owner_display_name.toUpperCase(), 80, EXPORT_H * 0.55);
      ctx.restore();
    }

    // Title (exercise name)
    ctx.textAlign = 'left';
    ctx.fillStyle = cfg.primary;
    ctx.font = '900 52px system-ui';
    const title = (card.title || card.exercise_name || 'Achievement').toUpperCase();
    // Truncate long titles
    const maxWidth = EXPORT_W - 200;
    let displayTitle = title;
    while (ctx.measureText(displayTitle).width > maxWidth && displayTitle.length > 10) {
      displayTitle = displayTitle.slice(0, -3) + '…';
    }
    // Exercise name + weight + date line
    const pbLine = card.pb_value
      ? `${displayTitle} · ${card.pb_value}${card.pb_unit || 'KG'}`
      : displayTitle;
    ctx.fillText(pbLine, 80, EXPORT_H * 0.62);

    // Date line
    if (card.earned_at) {
      ctx.font = '500 32px system-ui';
      ctx.fillStyle = `${cfg.primary}AA`;
      const dateStr = new Date(card.earned_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
      ctx.fillText(dateStr, 80, EXPORT_H * 0.66);
    }

    // 6-stat grid — horizontal bars like the in-app card
    if (card.athlete_stats) {
      const stats = card.athlete_stats as Record<string, number>;
      const isCardio = ['run', 'cycle', 'row', 'swim'].includes(card.activity_category || '');
      const statKeys = isCardio
        ? ['spd', 'end', 'con', 'dst', 'elv', 'rnk']
        : ['str', 'pwr', 'con', 'pgs', 'exp', 'rnk'];
      const statLabels = isCardio
        ? ['SPEED', 'ENDURANCE', 'CONSISTENCY', 'DISTANCE', 'ELEVATION', 'GLOBAL RANK']
        : ['STRENGTH', 'POWER', 'CONSISTENCY', 'PROGRESSION', 'EXPERIENCE', 'GLOBAL RANK'];
      const statColors = ['#FF5500', '#FF2200', '#22C55E', '#FACC15', '#3B82F6', '#A855F7'];

      // Rounded panel background
      const panelX = 60, panelY = EXPORT_H * 0.69;
      const panelW = EXPORT_W - 120, panelH = 340;
      ctx.fillStyle = `${cfg.primary}08`;
      ctx.strokeStyle = `${cfg.primary}18`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, panelH, 16);
      ctx.fill();
      ctx.stroke();

      // 3x2 grid of stats
      const colW = (panelW - 60) / 3;
      const rowH = panelH / 2;
      statKeys.forEach((key, i) => {
        const val = stats[key] || 0;
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = panelX + 30 + col * colW;
        const y = panelY + 30 + row * rowH;

        // Label + value on same line
        ctx.textAlign = 'left';
        ctx.font = '900 22px system-ui';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(statLabels[i], x, y + 24);

        ctx.textAlign = 'right';
        ctx.font = '900 32px system-ui';
        ctx.fillStyle = statColors[i];
        ctx.save();
        ctx.shadowColor = `${statColors[i]}40`;
        ctx.shadowBlur = 6;
        ctx.fillText(String(val), x + colW - 20, y + 26);
        ctx.restore();

        // Horizontal bar
        const barX = x, barY2 = y + 36, barW = colW - 20, barH = 8;
        ctx.fillStyle = 'rgba(255,85,0,0.10)';
        ctx.beginPath();
        ctx.roundRect(barX, barY2, barW, barH, 4);
        ctx.fill();

        const fillW = Math.max(4, (val / 99) * barW);
        const barGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        barGrad.addColorStop(0, `${statColors[i]}60`);
        barGrad.addColorStop(1, statColors[i]);
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(barX, barY2, fillW, barH, 4);
        ctx.fill();
      });
    }

    // Bio line
    if (card.bio_line) {
      ctx.font = 'italic 32px system-ui';
      ctx.fillStyle = '#FFFFFFCC';
      ctx.textAlign = 'left';
      const bioY = EXPORT_H * 0.91;
      ctx.fillText(`"${card.bio_line}"`, 80, bioY);
    }

    // Bottom row: AWARDED date + card number + rank badge
    ctx.textAlign = 'left';
    ctx.font = '400 22px monospace';
    ctx.fillStyle = '#FFFFFF40';
    const awardedDate = card.earned_at
      ? new Date(card.earned_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
      : '';
    ctx.fillText(`AWARDED  ${awardedDate}`, 80, EXPORT_H - 100);

    // Card number — bottom right
    if (card.card_number) {
      ctx.textAlign = 'right';
      ctx.font = '400 22px monospace';
      ctx.fillStyle = tier === 'platinum' ? '#B76E7990' : '#FFFFFF30';
      ctx.fillText(card.card_number, EXPORT_W - 80, EXPORT_H - 100);
    }

    // Watermark
    drawWatermark(ctx, tier);

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
  const { createStory } = useStories();
  const { toast } = useToast();
  const tier = (card.rarity || 'bronze') as RarityTier;
  const cfg = RARITY_GLOW[tier];

  const [caption, setCaption] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardCaptureRef = useRef<HTMLDivElement>(null);

  /** Capture the actual rendered card component — exact replica of in-app card */
  const captureCardImage = useCallback(async (): Promise<Blob | null> => {
    const el = cardCaptureRef.current;
    if (!el) {
      // Fallback: canvas-drawn card
      return generateShareImage(card, cardSystem);
    }

    try {
      // Temporarily make the off-screen card visible for capture
      el.style.position = 'fixed';
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.opacity = '1';
      el.style.zIndex = '9999';
      el.style.pointerEvents = 'none';

      // Wait for React paint + fonts + shimmer CSS to settle
      await document.fonts.ready;
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      await new Promise<void>(r => setTimeout(r, 200));

      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: el.offsetWidth,
        height: el.offsetHeight,
        foreignObjectRendering: false,
        ignoreElements: (elem) => elem.tagName === 'VIDEO',
      });

      // Restore off-screen
      el.style.left = '-9999px';
      el.style.top = '0px';
      el.style.opacity = '0';
      el.style.zIndex = '-1';

      return new Promise<Blob | null>(resolve =>
        canvas.toBlob(blob => resolve(blob), 'image/png', 1.0)
      );
    } catch (err) {
      console.warn('html2canvas capture failed, falling back to canvas draw:', err);
      // Restore off-screen on error
      if (el) {
        el.style.left = '-9999px';
        el.style.top = '0px';
        el.style.opacity = '0';
        el.style.zIndex = '-1';
      }
      // Fallback: canvas-drawn card
      return generateShareImage(card, cardSystem);
    }
  }, [card, cardSystem]);

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
      // Capture the actual rendered card via html2canvas
      const blob = await captureCardImage() || await generateShareImage(card, cardSystem);
      let imageUrl: string | undefined;

      // Upload image to storage if possible
      if (blob) {
        const { supabase } = await import('@/integrations/supabase/client');
        const path = `${user.id}/${card.id}-${Date.now()}.png`;
        const { error: uploadErr } = await supabase.storage
          .from('card-shares')
          .upload(path, blob, { contentType: 'image/png', upsert: true });
        if (!uploadErr) {
          const { data } = supabase.storage.from('card-shares').getPublicUrl(path);
          imageUrl = data?.publicUrl;
        } else {
          // Fallback: try avatars bucket if card-shares doesn't exist yet
          const { error: fbErr } = await supabase.storage
            .from('avatars')
            .upload(`shared-cards/${path}`, blob, { contentType: 'image/png', upsert: true });
          if (!fbErr) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(`shared-cards/${path}`);
            imageUrl = data?.publicUrl;
          }
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
  }, [user, card, caption, cardSystem, createPost, toast, onOpenChange, captureCardImage]);

  // Share to story — full-screen card with rarity frame
  const [isPostingStory, setIsPostingStory] = useState(false);
  const handleShareStory = useCallback(async () => {
    if (!user) return;
    setIsPostingStory(true);
    try {
      const blob = await captureCardImage() || await generateShareImage(card, cardSystem);
      let imageUrl: string | undefined;

      if (blob) {
        const { supabase } = await import('@/integrations/supabase/client');
        const path = `${user.id}/story-${card.id}-${Date.now()}.png`;
        const { error: uploadErr } = await supabase.storage
          .from('card-shares')
          .upload(path, blob, { contentType: 'image/png', upsert: true });
        if (!uploadErr) {
          const { data } = supabase.storage.from('card-shares').getPublicUrl(path);
          imageUrl = data?.publicUrl;
        } else {
          // Fallback to avatars bucket
          const { error: fbErr } = await supabase.storage
            .from('avatars')
            .upload(`shared-cards/story-${path}`, blob, { contentType: 'image/png', upsert: true });
          if (!fbErr) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(`shared-cards/story-${path}`);
            imageUrl = data?.publicUrl;
          }
        }
      }

      const { error } = await createStory({
        content: caption,
        image_url: imageUrl || null,
        visibility: 'public',
        background_color: '#080808',
        text_overlays: caption ? [{
          text: caption,
          x: 50, y: 85,
          fontSize: 16,
          color: '#FFFFFF',
          fontFamily: 'display',
        }] : [],
      });

      if (error) {
        toast({ title: 'Failed', description: 'Could not add to your story.' });
      } else {
        toast({ title: 'Story posted! 🔥', description: 'Card added to your story.' });
        onOpenChange(false);
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong.' });
    } finally {
      setIsPostingStory(false);
    }
  }, [user, card, caption, cardSystem, createStory, toast, onOpenChange, captureCardImage]);

  // Determine if this card gets animated export
  const RARITY_RANK: Record<string, number> = { platinum: 5, diamond: 4, gold: 3, silver: 2, bronze: 1, standard: 0 };
  const isAnimated = (RARITY_RANK[tier] || 0) >= 3;

  // Share via native share sheet — always static PNG with premium metallic/stone finish
  const handleNativeShare = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await captureCardImage();

      if (!blob) {
        toast({ title: 'Error', description: 'Could not generate card image.' });
        return;
      }

      const ext = 'png';
      const mime = 'image/png';

      const fileName = `unbreakable-${tier}-${(card.title || 'card').replace(/\s+/g, '-').toLowerCase()}.${ext}`;
      const file = new File([blob], fileName, { type: mime });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        toast({ title: 'Shared!', description: 'Card shared.' });
      } else {
        // Fallback: download — use `blob` not `asset.blob` (asset may be undefined)
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Downloaded!', description: 'Card image saved.' });
      }
      onOpenChange(false);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast({ title: 'Error', description: 'Share cancelled or failed.' });
      }
    } finally {
      setIsExporting(false);
    }
  }, [card, cardSystem, tier, caption, toast, onOpenChange, captureCardImage]);

  // Download — always static PNG with premium metallic/stone finish
  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await captureCardImage();

      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `unbreakable-${tier}-${(card.title || 'card').replace(/\s+/g, '-').toLowerCase()}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Downloaded!', description: 'Card image saved to your device.' });
      }
    } finally {
      setIsExporting(false);
    }
  }, [card, tier, toast, captureCardImage]);
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
        {/* Hidden rendered card for html2canvas capture — forExport reduces shimmer overlay */}
        <div
          ref={cardCaptureRef}
          className="fixed pointer-events-none"
          style={{ left: '-9999px', top: 0, width: 360, height: 500, zIndex: -1, opacity: 0, overflow: 'visible' }}
          aria-hidden="true"
        >
          <AchievementCardStatic card={card} size="lg" forExport noShimmer={false} />
        </div>

        <SheetHeader className="text-left pb-2">
          <SheetTitle className="font-display tracking-wider text-sm flex items-center gap-2">
            <Share2 className="w-4 h-4" style={{ color: cfg.primary }} />
            SHARE CARD
          </SheetTitle>
        </SheetHeader>

        {/* Card preview — mini version of actual rendered card */}
        <div className="flex justify-center mb-4">
          <div className="w-48 aspect-[3/4]">
            <AchievementCardStatic card={card} size="sm" />
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

        {/* Share actions — internal only (no external socials) */}
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
            className="w-full text-xs font-display tracking-wider border-primary/30 text-primary hover:bg-primary/10"
            onClick={handleShareStory}
            disabled={isPostingStory}
          >
            {isPostingStory ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <BookOpen className="w-3 h-3 mr-2" />}
            ADD TO MY STORY
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-display tracking-wider border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            onClick={handleDownload}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Download className="w-3 h-3 mr-2" />}
            SAVE IMAGE
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
