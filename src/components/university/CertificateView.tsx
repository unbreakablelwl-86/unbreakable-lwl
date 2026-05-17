import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import shieldLogo from '@/assets/unbreakable-shield.png';

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
        {/* Background image — brick wall + metal frame */}
        <img
          src="/cert-bg.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 sm:px-16 py-8">
          {/* Shield logo */}
          <img
            src={shieldLogo}
            alt="LWL Shield"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2 drop-shadow-lg"
            crossOrigin="anonymous"
          />

          {/* UNBREAKABLE / UNIVERSITY */}
          <h2
            className="font-display text-lg sm:text-2xl tracking-[0.25em] drop-shadow-md"
            style={{ color: '#d4d4d4', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            UNBREAKABLE
          </h2>
          <p
            className="text-[9px] sm:text-xs tracking-[0.5em] uppercase mb-3 sm:mb-4"
            style={{ color: '#a0a0a0', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
          >
            UNIVERSITY
          </p>

          {/* "This certificate is presented to" */}
          <p
            className="text-[10px] sm:text-xs tracking-[0.15em] uppercase mb-1"
            style={{
              color: '#b0b0b0',
              fontVariant: 'small-caps',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            This Certificate Is Presented To
          </p>

          {/* User name — gold cursive */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl mb-2 drop-shadow-lg"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', 'Palatino', cursive, serif",
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#d4a44a',
              textShadow: '0 2px 12px rgba(212,164,74,0.4), 0 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            {userName}
          </h1>

          {/* "For successfully completing" */}
          <p
            className="text-[9px] sm:text-[11px] tracking-[0.15em] uppercase mb-1.5"
            style={{
              color: '#a0a0a0',
              fontVariant: 'small-caps',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            For Successfully Completing
          </p>

          {/* Course title — orange bold */}
          <h3
            className="font-display text-base sm:text-xl md:text-2xl tracking-wide mb-3 sm:mb-4 drop-shadow-md"
            style={{
              color: '#e97520',
              textShadow: '0 2px 8px rgba(233,117,32,0.3), 0 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            {courseShort} LEVEL {level} : {courseLabel.toUpperCase()}
          </h3>

          {/* Bottom row: signature left, LWL cert right */}
          <div className="flex items-end justify-between w-full max-w-sm sm:max-w-md mt-auto">
            <div className="text-left">
              <p
                className="text-sm sm:text-lg mb-0"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', cursive, serif",
                  fontStyle: 'italic',
                  color: '#d4a44a',
                  textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                }}
              >
                J. Threlfall
              </p>
              <p
                className="text-[7px] sm:text-[9px] tracking-[0.2em] uppercase"
                style={{ color: '#888', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
              >
                LEAD INSTRUCTOR
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase"
                style={{ color: '#a0a0a0', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
              >
                LWL CERTIFICATE
              </p>
              <p
                className="text-[7px] sm:text-[9px] tracking-[0.12em] uppercase"
                style={{ color: '#888', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
              >
                OF ACHIEVEMENT
              </p>
            </div>
          </div>

          {/* Keep Showing Up */}
          <p
            className="mt-2 sm:mt-3 text-[10px] sm:text-xs tracking-[0.3em] uppercase"
            style={{
              color: '#b0b0b0',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            ★&nbsp; KEEP SHOWING UP &nbsp;★
          </p>
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
