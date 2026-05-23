/**
 * UNBREAKABLE 86 — Completion Certificate
 * Displayed when user completes all 86 days. Shareable.
 */
import { motion } from 'framer-motion';
import { Trophy, Award, Calendar, Flame, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { U86Enrolment } from '@/lib/unbreakable86Types';

interface U86CertificateProps {
  enrolment: U86Enrolment;
  userName: string;
}

export function U86Certificate({ enrolment, userName }: U86CertificateProps) {
  const completedDate = enrolment.completed_at ? format(new Date(enrolment.completed_at), 'dd MMMM yyyy') : '';
  const startDate = format(new Date(enrolment.start_date), 'dd MMMM yyyy');

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* ─── Hero ─── */}
      <div className="relative px-4 pt-8 pb-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.15), transparent 70%)' }} />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <Trophy className="w-16 h-16 text-primary mx-auto" style={{ filter: 'drop-shadow(0 0 20px rgba(255,85,0,0.6))' }} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-display text-3xl tracking-wider mt-4"
          >
            <span className="text-primary" style={{ textShadow: '0 0 30px rgba(255,85,0,0.5)' }}>UNBREAKABLE</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-muted-foreground text-sm font-display tracking-widest mt-1"
          >
            CERTIFICATE OF COMPLETION
          </motion.p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* ─── Certificate Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl border-2 border-primary/30 bg-card p-6 text-center relative overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(255,85,0,0.1)' }}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary/30 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary/30 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />

          <Award className="w-10 h-10 text-primary mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 10px rgba(255,85,0,0.4))' }} />

          <p className="text-muted-foreground text-xs font-display tracking-widest mb-1">THIS CERTIFIES THAT</p>
          <h2 className="font-display text-2xl tracking-wider text-foreground mb-1">{userName.toUpperCase()}</h2>
          <p className="text-muted-foreground text-xs font-display tracking-wide mb-4">
            HAS COMPLETED THE
          </p>

          <div className="py-3 border-y border-primary/15">
            <h3 className="font-display text-xl tracking-wider text-primary" style={{ textShadow: '0 0 15px rgba(255,85,0,0.3)' }}>
              UNBREAKABLE 86
            </h3>
            <p className="text-muted-foreground text-[10px] font-display tracking-widest mt-1">
              86-DAY TRANSFORMATION CHALLENGE
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-muted-foreground text-xs">
              Across all 5 pillars: Power · Movement · Fuel · Mindset · Education
            </p>
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{startDate} — {completedDate}</span>
              </div>
            </div>
            {enrolment.reset_count > 0 && (
              <p className="text-primary/60 text-[10px] font-display tracking-wider">
                RESET {enrolment.reset_count} TIME{enrolment.reset_count > 1 ? 'S' : ''} — STILL FINISHED
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Flame className="w-5 h-5 text-primary mx-auto mb-1" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
            <p className="font-display text-[10px] tracking-widest text-muted-foreground">
              LIVE WITHOUT LIMITS
            </p>
          </div>
        </motion.div>

        {/* ─── Actions ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="space-y-2"
        >
          <Button
            className="w-full h-12 rounded-xl font-display tracking-wider bg-primary hover:bg-primary/90 text-white"
            style={{ boxShadow: '0 0 20px rgba(255,85,0,0.25)' }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            SHARE YOUR ACHIEVEMENT
          </Button>
          <Button
            variant="outline"
            className="w-full h-10 rounded-xl font-display tracking-wider text-xs border-border text-muted-foreground hover:text-foreground"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            DOWNLOAD CERTIFICATE
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
