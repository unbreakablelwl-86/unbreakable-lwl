import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import shieldLogo from '@/assets/unbreakable-shield.png';

/* ── Course-type → human-readable names ────────────────────── */
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

interface CertificateViewProps {
  userName: string;
  courseType: string;
  level: number;
  completedDate: string; // ISO date string
}

export function CertificateView({ userName, courseType, level, completedDate }: CertificateViewProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const courseLabel = COURSE_LABELS[courseType] || 'Applied Fitness & Exercise Science';
  const formattedDate = new Date(completedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const certTitle = `LEVEL ${level} CERTIFICATE`;
  const certSubTitle = courseLabel;

  /* ── Download as image via canvas ──────────────────────────── */
  const handleDownload = useCallback(async () => {
    if (!certRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certRef.current, {
        backgroundColor: '#0a0a0a',
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

  /* ── Native share ──────────────────────────────────────────── */
  const handleShare = useCallback(async () => {
    if (!certRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `UNBREAKABLE-Certificate.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: 'UNBREAKABLE Certificate',
            text: `I just earned my ${certTitle} in ${courseLabel}! 💪 #UNBREAKABLE #KeepShowingUp`,
            files: [file],
          });
        } else {
          // fallback — download
          const link = document.createElement('a');
          link.download = `UNBREAKABLE-Certificate.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      });
    } catch {
      toast.error('Could not share');
    }
  }, [courseType, level, certTitle, courseLabel]);

  return (
    <div className="space-y-6">
      {/* ── Certificate card ──────────────────────────────── */}
      <div
        ref={certRef}
        className="relative w-full max-w-2xl mx-auto aspect-[1.414/1] rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1207 50%, #0a0a0a 100%)',
        }}
      >
        {/* Outer border */}
        <div className="absolute inset-3 rounded border-2 border-orange-500/40" />
        {/* Inner border */}
        <div className="absolute inset-5 rounded border border-orange-500/20" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 py-6">
          {/* Shield logo */}
          <img
            src={shieldLogo}
            alt="UNBREAKABLE Shield"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-3"
            crossOrigin="anonymous"
          />

          {/* Brand name */}
          <h2
            className="font-display text-xl sm:text-2xl tracking-[0.3em] mb-0.5"
            style={{ color: '#e97520' }}
          >
            UNBREAKABLE
          </h2>
          <p className="text-[10px] sm:text-xs tracking-[0.5em] text-orange-400/60 uppercase mb-4">
            KEEP SHOWING UP
          </p>

          {/* Divider */}
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent mb-4" />

          {/* Certificate title */}
          <p className="text-xs sm:text-sm tracking-[0.2em] text-orange-400/80 uppercase mb-2">
            CERTIFICATE OF COMPLETION
          </p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wide text-foreground mb-1">
            {certTitle}
          </h1>
          <p className="text-sm sm:text-base text-orange-400/90 font-medium mb-5">
            {certSubTitle}
          </p>

          {/* Awarded to */}
          <p className="text-xs tracking-[0.15em] text-muted-foreground/80 uppercase mb-1">
            AWARDED TO
          </p>
          <h3 className="font-display text-xl sm:text-2xl md:text-3xl tracking-wide text-foreground mb-4">
            {userName}
          </h3>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent mb-4" />

          {/* Date + Film strip reference */}
          <p className="text-xs text-muted-foreground/70">{formattedDate}</p>

          {/* LWL film strip footer */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-1.5 h-2 bg-orange-500/30 rounded-[1px]" />
              ))}
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.4em] text-orange-400/50 uppercase">
              LIVE WITHOUT LIMITS
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-1.5 h-2 bg-orange-500/30 rounded-[1px]" />
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-3 text-[7px] sm:text-[8px] text-muted-foreground/40 max-w-sm leading-relaxed">
            This certificate recognises completion of UNBREAKABLE education content written to NVQ standard.
            It is not an official qualification or accredited certification.
          </p>
        </div>
      </div>

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
