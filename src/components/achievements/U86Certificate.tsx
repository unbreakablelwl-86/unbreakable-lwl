/**
 * U86Certificate — Completion certificate for the Unbreakable86 programme
 *
 * Renders a shareable, branded certificate with:
 * - Unbreakable / Live Without Limits shield and branding
 * - User name and completion date
 * - Programme stats summary
 * - Share / download actions
 */
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Shield, Download, Share2, X, Award, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface U86CertificateProps {
  displayName: string;
  completionDate: string;
  stats?: {
    workoutsCompleted?: number;
    weeksCompleted?: number;
    totalVolume?: number;
  };
  onClose?: () => void;
  onShare?: () => void;
}

export function U86Certificate({
  displayName,
  completionDate,
  stats,
  onClose,
  onShare,
}: U86CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(completionDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white z-50"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <motion.div
        className="flex flex-col items-center gap-4 max-w-sm w-full"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* ═══ Certificate Card ═══ */}
        <div
          ref={certRef}
          className="w-full max-w-[340px] rounded-2xl overflow-hidden relative"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%, #1a0a14 0%, #0d0408 40%, #050204 100%)',
            border: '2px solid rgba(255, 107, 0, 0.3)',
            boxShadow: '0 0 40px rgba(255, 107, 0, 0.1), inset 0 0 40px rgba(255, 107, 0, 0.03)',
          }}
        >
          {/* Gold shimmer overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: 'linear-gradient(135deg, transparent 25%, rgba(255,193,7,0.08) 50%, transparent 75%)',
              animation: 'certShimmer 3s ease-in-out infinite',
            }}
          />

          {/* Content */}
          <div className="relative z-10 p-6 text-center">
            {/* Top branding */}
            <motion.div
              className="flex items-center justify-center gap-2 mb-1"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img
                src="/unbreakable-shield.png"
                alt="Unbreakable"
                className="w-8 h-8 object-contain"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,107,0,0.4))' }}
              />
            </motion.div>

            <motion.p
              className="text-[10px] font-display tracking-[0.3em] text-amber-500/60"
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              UNBREAKABLE
            </motion.p>
            <motion.p
              className="text-[7px] font-mono tracking-[0.2em] text-amber-400/35 mb-4"
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              LIVE WITHOUT LIMITS
            </motion.p>

            {/* Divider line */}
            <div className="w-16 h-px mx-auto mb-4" style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.3), transparent)',
            }} />

            {/* Certificate title */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, type: 'spring' }}
            >
              <p className="text-[8px] font-mono tracking-[0.25em] text-amber-400/40 mb-1">
                CERTIFICATE OF COMPLETION
              </p>
              <h2 className="text-2xl font-display tracking-wider text-amber-400"
                style={{ textShadow: '0 0 20px rgba(255,193,7,0.3)' }}>
                UNBREAKABLE86
              </h2>
            </motion.div>

            {/* Divider */}
            <div className="w-24 h-px mx-auto my-4" style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.25), transparent)',
            }} />

            {/* Awarded to */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-[8px] font-mono tracking-[0.15em] text-white/30 mb-1">
                AWARDED TO
              </p>
              <p className="text-xl font-display tracking-wider text-white"
                style={{ textShadow: '0 0 12px rgba(255,255,255,0.15)' }}>
                {displayName.toUpperCase()}
              </p>
            </motion.div>

            {/* Date */}
            <motion.p
              className="text-[9px] font-mono tracking-wider text-white/40 mt-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {formattedDate.toUpperCase()}
            </motion.p>

            {/* Stats summary */}
            {stats && (
              <motion.div
                className="flex justify-center gap-4 mt-4 pt-3"
                style={{ borderTop: '1px solid rgba(255,107,0,0.1)' }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {stats.weeksCompleted && (
                  <div className="text-center">
                    <p className="text-lg font-display text-amber-400">{stats.weeksCompleted}</p>
                    <p className="text-[7px] font-mono tracking-widest text-white/30">WEEKS</p>
                  </div>
                )}
                {stats.workoutsCompleted && (
                  <div className="text-center">
                    <p className="text-lg font-display text-amber-400">{stats.workoutsCompleted}</p>
                    <p className="text-[7px] font-mono tracking-widest text-white/30">SESSIONS</p>
                  </div>
                )}
                {stats.totalVolume && (
                  <div className="text-center">
                    <p className="text-lg font-display text-amber-400">
                      {stats.totalVolume >= 1000
                        ? `${(stats.totalVolume / 1000).toFixed(0)}K`
                        : stats.totalVolume}
                    </p>
                    <p className="text-[7px] font-mono tracking-widest text-white/30">KG LIFTED</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Seal */}
            <motion.div
              className="mt-4 flex justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: 'spring', damping: 15 }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,107,0,0.15), rgba(255,107,0,0.05))',
                  border: '2px solid rgba(255,107,0,0.25)',
                  boxShadow: '0 0 20px rgba(255,107,0,0.1)',
                }}
              >
                <Shield className="w-7 h-7 text-amber-500/70" />
              </div>
            </motion.div>

            <motion.p
              className="text-[7px] font-display tracking-[0.2em] text-amber-500/40 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              U86 CERTIFIED
            </motion.p>
          </div>
        </div>

        {/* Actions */}
        <motion.div
          className="flex gap-3"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              className="font-display tracking-wider text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              onClick={onShare}
            >
              <Share2 className="w-4 h-4 mr-2" /> SHARE
            </Button>
          )}
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              className="font-display tracking-wider text-xs border-border text-muted-foreground"
              onClick={onClose}
            >
              CLOSE
            </Button>
          )}
        </motion.div>
      </motion.div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes certShimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
}
