import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

/* ── Course-type → human-readable labels ──────────────────── */
const COURSE_LABELS: Record<string, string> = {
  gym: 'Applied Fitness & Exercise Science',
  nutrition: 'Healthy Eating & Nutritional Science',
  mindset: 'Mental Performance & Wellbeing',
  sport: 'Sport-Specific Training',
  'sport-football': 'Sport Science — Football',
  'sport-boxing': 'Sport Science — Boxing',
  'sport-rugby': 'Sport Science — Rugby',
  'sport-running': 'Sport Science — Running',
  'sport-swimming': 'Sport Science — Swimming',
  'sport-mma': 'Sport Science — MMA',
  'sport-cycling': 'Sport Science — Cycling',
  'sport-tennis': 'Sport Science — Tennis',
  'sport-basketball': 'Sport Science — Basketball',
  'sport-cricket': 'Sport Science — Cricket',
};

/* ── Short course-type names for the title line ───────────── */
const COURSE_SHORT: Record<string, string> = {
  gym: 'POWER',
  nutrition: 'FUEL',
  mindset: 'MINDSET',
  sport: 'SPORT',
  'sport-football': 'SPORT — FOOTBALL',
  'sport-boxing': 'SPORT — BOXING',
  'sport-rugby': 'SPORT — RUGBY',
  'sport-running': 'SPORT — RUNNING',
  'sport-swimming': 'SPORT — SWIMMING',
  'sport-mma': 'SPORT — MMA',
  'sport-cycling': 'SPORT — CYCLING',
  'sport-tennis': 'SPORT — TENNIS',
  'sport-basketball': 'SPORT — BASKETBALL',
  'sport-cricket': 'SPORT — CRICKET',
};

/* ── Tier configuration ───────────────────────────────────── */
interface TierConfig {
  bg: string;
  nameColor: string;
  nameGlow: string;
  accentColor: string;
  accentGlow: string;
  tierLabel: string;
  tierIcon: string;
  stampBorder: string;
  stampText: string;
}

function getTierConfig(level: number, courseType: string): TierConfig {
  const isSport = courseType.startsWith('sport');

  // Sports + Level 4 → Diamond
  if (isSport || level >= 4) {
    return {
      bg: '/cert-diamond-l4.webp',
      nameColor: '#e8e8ff',
      nameGlow: '0 2px 16px rgba(200,200,255,0.5), 0 2px 6px rgba(0,0,0,0.6)',
      accentColor: '#c0c8ff',
      accentGlow: '0 2px 12px rgba(180,190,255,0.4), 0 2px 6px rgba(0,0,0,0.6)',
      tierLabel: 'DIAMOND',
      tierIcon: '💎',
      stampBorder: 'rgba(200,210,255,0.5)',
      stampText: 'rgba(200,210,255,0.7)',
    };
  }

  // Level 3 → Gold
  if (level === 3) {
    return {
      bg: '/cert-gold-l3.webp',
      nameColor: '#d4a44a',
      nameGlow: '0 2px 16px rgba(212,164,74,0.5), 0 2px 6px rgba(0,0,0,0.6)',
      accentColor: '#e9a030',
      accentGlow: '0 2px 12px rgba(233,160,48,0.4), 0 2px 6px rgba(0,0,0,0.6)',
      tierLabel: 'GOLD',
      tierIcon: '🥇',
      stampBorder: 'rgba(212,164,74,0.5)',
      stampText: 'rgba(212,164,74,0.7)',
    };
  }

  // Level 2 → Silver
  return {
    bg: '/cert-silver-l2.webp',
    nameColor: '#c0c0c8',
    nameGlow: '0 2px 16px rgba(192,192,200,0.4), 0 2px 6px rgba(0,0,0,0.6)',
    accentColor: '#a8a8b4',
    accentGlow: '0 2px 12px rgba(168,168,180,0.3), 0 2px 6px rgba(0,0,0,0.6)',
    tierLabel: 'SILVER',
    tierIcon: '🥈',
    stampBorder: 'rgba(192,192,200,0.4)',
    stampText: 'rgba(192,192,200,0.6)',
  };
}

interface CertificateViewProps {
  userName: string;
  courseType: string;
  level: number;
  completedDate: string;
}

export function CertificateView({ userName, courseType, level, completedDate }: CertificateViewProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const courseLabel = COURSE_LABELS[courseType] || 'Applied Fitness & Exercise Science';
  const courseShort = COURSE_SHORT[courseType] || 'POWER';
  const tier = getTierConfig(level, courseType);

  const formattedDate = new Date(completedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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
      link.download = `UNBREAKABLE-${courseType}-L${level}-Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Certificate downloaded');
    } catch {
      toast.error('Could not generate image — try a screenshot instead');
    }
  }, [courseType, level]);

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
        const file = new File([blob], 'UNBREAKABLE-Certificate.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: 'UNBREAKABLE Certificate',
            text: `I just completed ${courseShort} Level ${level} at UNBREAKABLE University! 💪 #UNBREAKABLE #KeepShowingUp`,
            files: [file],
          });
        } else {
          const link = document.createElement('a');
          link.download = 'UNBREAKABLE-Certificate.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      });
    } catch {
      toast.error('Could not share');
    }
  }, [courseType, level, courseShort]);

  return (
    <div className="space-y-6">
      {/* ── Certificate ──────────────────────────────────── */}
      <div
        ref={certRef}
        className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-lg"
        style={{ aspectRatio: '3 / 2' }}
      >
        {/* Background image — tier-specific */}
        <img
          src={tier.bg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 sm:px-16 py-6 sm:py-8">
          {/* UNBREAKABLE / UNIVERSITY */}
          <h2
            className="font-display text-lg sm:text-2xl tracking-[0.25em] drop-shadow-md"
            style={{ color: '#d4d4d4', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            UNBREAKABLE
          </h2>
          <p
            className="text-[9px] sm:text-xs tracking-[0.5em] uppercase mb-2 sm:mb-3"
            style={{ color: '#a0a0a0', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
          >
            UNIVERSITY
          </p>

          {/* Tier badge */}
          <div
            className="text-[8px] sm:text-[10px] tracking-[0.4em] uppercase mb-2 sm:mb-3 px-3 py-0.5 rounded-full"
            style={{
              color: tier.accentColor,
              border: `1px solid ${tier.stampBorder}`,
              background: 'rgba(0,0,0,0.3)',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            {tier.tierIcon} {tier.tierLabel} TIER
          </div>

          {/* "This certificate is presented to" */}
          <p
            className="text-[9px] sm:text-[11px] tracking-[0.15em] uppercase mb-1"
            style={{
              color: '#b0b0b0',
              fontVariant: 'small-caps',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            This Certificate Is Presented To
          </p>

          {/* User name — tier-colored */}
          <h1
            className="text-2xl sm:text-4xl md:text-5xl mb-1.5 sm:mb-2 drop-shadow-lg"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', 'Palatino', cursive, serif",
              fontStyle: 'italic',
              fontWeight: 400,
              color: tier.nameColor,
              textShadow: tier.nameGlow,
            }}
          >
            {userName}
          </h1>

          {/* "For successfully completing" */}
          <p
            className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase mb-1"
            style={{
              color: '#a0a0a0',
              fontVariant: 'small-caps',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            For Successfully Completing
          </p>

          {/* Course title — tier accent */}
          <h3
            className="font-display text-sm sm:text-lg md:text-xl tracking-wide mb-1.5 sm:mb-2 drop-shadow-md"
            style={{
              color: tier.accentColor,
              textShadow: tier.accentGlow,
            }}
          >
            {courseShort} LEVEL {level} : {courseLabel.toUpperCase()}
          </h3>

          {/* Date */}
          <p
            className="text-[8px] sm:text-[10px] tracking-[0.15em] mb-2 sm:mb-3"
            style={{
              color: '#909090',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            {formattedDate}
          </p>

          {/* Unbreakable Stamp — circular seal */}
          <div
            className="relative flex items-center justify-center"
            style={{
              width: '72px',
              height: '72px',
            }}
          >
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${tier.stampBorder}`,
                background: 'rgba(0,0,0,0.25)',
              }}
            />
            {/* Inner ring */}
            <div
              className="absolute rounded-full"
              style={{
                inset: '3px',
                border: `1px solid ${tier.stampBorder}`,
                opacity: 0.5,
              }}
            />
            {/* Inner content */}
            <div className="relative flex flex-col items-center justify-center text-center px-1">
              <span
                className="text-[7px] sm:text-[8px] tracking-[0.15em] uppercase font-bold leading-none"
                style={{ color: tier.stampText }}
              >
                UNBREAKABLE
              </span>
              <span
                className="text-[10px] sm:text-[12px] leading-none mt-0.5"
                style={{ color: tier.stampText }}
              >
                ✦
              </span>
              <span
                className="text-[6px] sm:text-[7px] tracking-[0.12em] uppercase font-bold leading-none"
                style={{ color: tier.stampText }}
              >
                CERTIFIED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Disclaimer below cert ────────────────────────── */}
      <p className="text-[9px] text-muted-foreground/50 text-center max-w-md mx-auto leading-relaxed">
        This certificate recognises completion of UNBREAKABLE education content written to NVQ standard.
        It is not an official qualification or accredited certification.
      </p>

      {/* ── Action buttons ────────────────────────────────── */}
      <div className="flex gap-3 justify-center max-w-2xl mx-auto">
        <Button onClick={handleDownload} className="gap-2 flex-1 max-w-[200px]">
          <Download className="w-4 h-4" /> Download
        </Button>
        <Button onClick={handleShare} variant="outline" className="gap-2 flex-1 max-w-[200px]">
          <Share2 className="w-4 h-4" /> Share
        </Button>
      </div>
    </div>
  );
}
