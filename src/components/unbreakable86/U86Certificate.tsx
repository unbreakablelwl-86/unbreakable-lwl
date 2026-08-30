/**
 * UNBREAKABLE 86 — Platinum Certificate
 * Premium certificate displayed when a user completes all 86 days.
 * Viewable by the completing user, coaches, and devs.
 */
import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Calendar, Flame, Share2, Download, RotateCcw, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { U86Enrolment } from '@/lib/unbreakable86Types';

interface U86CertificateProps {
  enrolment: U86Enrolment;
  userName: string;
  /** True when a coach/dev is viewing someone else's certificate */
  isViewerMode?: boolean;
  /** Return to the live tracker — the challenge keeps running past day 86, this isn't a dead end. */
  onBack?: () => void;
}

export function U86Certificate({ enrolment, userName, isViewerMode, onBack }: U86CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const completedDate = enrolment.completed_at ? format(new Date(enrolment.completed_at), 'dd MMMM yyyy') : '';
  const startDate = format(new Date(enrolment.start_date), 'dd MMMM yyyy');

  /* ── Download as image ─────────────────────────────────── */
  const handleDownload = useCallback(async () => {
    if (!certRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `UNBREAKABLE-86-Platinum-Certificate-${userName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Certificate downloaded');
    } catch {
      toast.error('Could not generate image — try a screenshot instead');
    }
  }, [userName]);

  /* ── Native share ──────────────────────────────────────── */
  const handleShare = useCallback(async () => {
    if (!certRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'UNBREAKABLE-86-Platinum-Certificate.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: 'UNBREAKABLE 86 — Platinum Certificate',
            text: `I completed the UNBREAKABLE 86 challenge! 86 days of Power, Movement, Fuel, Mindset & Education 💪🔥 #Unbreakable #LiveWithoutLimits #KeepShowingUp`,
            files: [file],
          });
        } else {
          const link = document.createElement('a');
          link.download = 'UNBREAKABLE-86-Platinum-Certificate.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      });
    } catch {
      toast.error('Could not share');
    }
  }, []);

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* ─── Back to tracker ─── */}
      {onBack && (
        <div className="px-4 pt-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-display tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" /> BACK TO TRACKER
          </button>
        </div>
      )}
      {/* ─── Viewer badge for coaches/devs ─── */}
      {isViewerMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-center"
        >
          <p className="text-xs text-primary font-display tracking-wider">
            👁️ VIEWING {userName.toUpperCase()}'S CERTIFICATE
          </p>
        </motion.div>
      )}

      {/* ─── Hero ─── */}
      <div className="relative px-4 pt-8 pb-4 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,210,240,0.12), transparent 70%)' }}
        />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <Trophy
              className="w-14 h-14 mx-auto"
              style={{ color: '#c8d0e8', filter: 'drop-shadow(0 0 20px rgba(200,210,240,0.6))' }}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs font-display tracking-[0.4em] mt-3"
            style={{ color: '#c0c8e0' }}
          >
            ✦ PLATINUM TIER ✦
          </motion.p>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* ─── Certificate Card — matches university tier style ─── */}
        <motion.div
          ref={certRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-lg"
          style={{ aspectRatio: '3 / 2' }}
        >
          {/* Platinum background image */}
          <img
            src="/cert-platinum-u86.webp"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous"
          />

          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 sm:px-16 py-6 sm:py-8">
            {/* UNBREAKABLE */}
            <h2
              className="font-display text-lg sm:text-2xl tracking-[0.25em] drop-shadow-md"
              style={{ color: '#e0e4f0', textShadow: '0 2px 10px rgba(200,210,240,0.5), 0 2px 6px rgba(0,0,0,0.8)' }}
            >
              UNBREAKABLE
            </h2>

            {/* 86 */}
            <p
              className="font-display text-3xl sm:text-5xl tracking-[0.15em] leading-none mb-1"
              style={{
                color: '#d0d8f0',
                textShadow: '0 2px 20px rgba(200,210,240,0.6), 0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              86
            </p>

            {/* Tier badge */}
            <div
              className="text-[8px] sm:text-[10px] tracking-[0.4em] uppercase mb-2 sm:mb-3 px-3 py-0.5 rounded-full"
              style={{
                color: '#c8d0e8',
                border: '1px solid rgba(200,210,240,0.4)',
                background: 'rgba(0,0,0,0.35)',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}
            >
              ✦ PLATINUM TIER ✦
            </div>

            {/* "This certificate is presented to" */}
            <p
              className="text-[9px] sm:text-[11px] tracking-[0.15em] uppercase mb-1"
              style={{
                color: '#a0a8c0',
                fontVariant: 'small-caps',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}
            >
              This Certificate Is Presented To
            </p>

            {/* User name — platinum colored */}
            <h1
              className="text-2xl sm:text-4xl md:text-5xl mb-1.5 sm:mb-2 drop-shadow-lg"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', 'Palatino', cursive, serif",
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#d0d8f0',
                textShadow: '0 2px 16px rgba(200,210,240,0.5), 0 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              {userName}
            </h1>

            {/* "For successfully completing" */}
            <p
              className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase mb-1"
              style={{
                color: '#9098b0',
                fontVariant: 'small-caps',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}
            >
              For Successfully Completing The
            </p>

            {/* Challenge title */}
            <h3
              className="font-display text-sm sm:text-lg md:text-xl tracking-wide mb-0.5 drop-shadow-md"
              style={{
                color: '#c0c8e0',
                textShadow: '0 2px 12px rgba(200,210,240,0.4), 0 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              86-DAY TRANSFORMATION CHALLENGE
            </h3>

            {/* Pillars */}
            <p
              className="text-[7px] sm:text-[9px] tracking-[0.12em] mb-1.5"
              style={{ color: '#8890a8', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
            >
              POWER · MOVEMENT · FUEL · MINDSET · EDUCATION
            </p>

            {/* Dates */}
            <p
              className="text-[8px] sm:text-[10px] tracking-[0.12em] mb-1"
              style={{ color: '#808898', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
            >
              {startDate} — {completedDate}
            </p>

            {/* Reset count */}
            {enrolment.reset_count > 0 && (
              <p
                className="text-[7px] sm:text-[8px] tracking-[0.2em] flex items-center justify-center gap-1"
                style={{ color: '#8890a8' }}
              >
                <span>RESET {enrolment.reset_count} TIME{enrolment.reset_count > 1 ? 'S' : ''} — STILL FINISHED</span>
              </p>
            )}

            {/* Bottom stamp line */}
            <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-center gap-1.5">
              <Flame
                className="w-3 h-3"
                style={{ color: '#c0c8e0', filter: 'drop-shadow(0 0 4px rgba(200,210,240,0.5))' }}
              />
              <p
                className="font-display text-[8px] sm:text-[9px] tracking-[0.3em]"
                style={{ color: '#a0a8c0', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
              >
                LIVE WITHOUT LIMITS
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Disclaimer ──────────────────────────────────── */}
        <p className="text-[9px] text-muted-foreground/50 text-center max-w-md mx-auto leading-relaxed">
          This certificate recognises completion of the UNBREAKABLE 86 transformation challenge.
        </p>

        {/* ── Action buttons ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-3 justify-center max-w-2xl mx-auto"
        >
          <Button
            onClick={handleDownload}
            className="gap-2 flex-1 max-w-[200px] h-12 rounded-xl font-display tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #8890a8, #c0c8e0)',
              color: '#1a1a2e',
              boxShadow: '0 0 20px rgba(200,210,240,0.2)',
            }}
          >
            <Download className="w-4 h-4" /> DOWNLOAD
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="gap-2 flex-1 max-w-[200px] h-12 rounded-xl font-display tracking-wider text-xs border-[#c0c8e0]/30 hover:border-[#c0c8e0]/60"
            style={{ color: '#c0c8e0' }}
          >
            <Share2 className="w-4 h-4" /> SHARE
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
