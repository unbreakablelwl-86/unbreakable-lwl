import type { CourseType } from './types';

export interface CourseColorScheme {
  accent: string;        // e.g. 'orange' | 'green' | 'purple' | 'yellow'
  bg: string;            // bg-{color}-500/10
  bgGradient: string;    // from-{color}/20 to-...
  border: string;        // border-{color}-500/20
  borderActive: string;  // border-{color}-500/40
  text: string;          // text-{color}-500
  textMuted: string;     // text-{color}-500/60
  iconBg: string;        // bg-{color}-500/15
  progressBg: string;    // bg-{color}-500/30
  progressFill: string;  // bg-{color}-500
  glow: string;          // shadow-{color}-500/5
  hoverBg: string;       // hover:bg-{color}-500/5
}

const schemes: Record<string, CourseColorScheme> = {
  gym: {
    accent: 'orange',
    bg: 'bg-[#FF5500]/20',
    bgGradient: 'from-[#FF5500]/30 to-[#FF3300]/20',
    border: 'border-[#FF5500]/60',
    borderActive: 'border-[#FF5500]/90',
    text: 'text-[#FF5500] drop-shadow-[0_0_10px_rgba(255,85,0,0.9)] drop-shadow-[0_0_20px_rgba(255,85,0,0.5)]',
    textMuted: 'text-[#FF5500]/80',
    iconBg: 'bg-[#FF5500]/30',
    progressBg: 'bg-[#FF5500]/35',
    progressFill: 'bg-[#FF5500] shadow-[0_0_12px_rgba(255,85,0,0.7),0_0_24px_rgba(255,85,0,0.3)]',
    glow: 'shadow-[0_0_25px_rgba(255,85,0,0.45),0_0_50px_rgba(255,85,0,0.2),0_0_80px_rgba(255,85,0,0.08)]',
    hoverBg: 'hover:bg-[#FF5500]/15',
  },
  nutrition: {
    accent: 'green',
    bg: 'bg-emerald-500/10',
    bgGradient: 'from-emerald-500/20 to-green-500/10',
    border: 'border-emerald-500/20',
    borderActive: 'border-emerald-500/40',
    text: 'text-emerald-500',
    textMuted: 'text-emerald-500/60',
    iconBg: 'bg-emerald-500/15',
    progressBg: 'bg-emerald-500/30',
    progressFill: 'bg-emerald-500',
    glow: 'shadow-emerald-500/5',
    hoverBg: 'hover:bg-emerald-500/5',
  },
  mindset: {
    accent: 'purple',
    bg: 'bg-violet-500/10',
    bgGradient: 'from-violet-500/20 to-blue-500/10',
    border: 'border-violet-500/20',
    borderActive: 'border-violet-500/40',
    text: 'text-violet-500',
    textMuted: 'text-violet-500/60',
    iconBg: 'bg-violet-500/15',
    progressBg: 'bg-violet-500/30',
    progressFill: 'bg-violet-500',
    glow: 'shadow-violet-500/5',
    hoverBg: 'hover:bg-violet-500/5',
  },
  sport: {
    accent: 'yellow',
    bg: 'bg-[#CCFF00]/20',
    bgGradient: 'from-[#CCFF00]/30 to-[#AADD00]/20',
    border: 'border-[#CCFF00]/60',
    borderActive: 'border-[#CCFF00]/90',
    text: 'text-[#CCFF00] drop-shadow-[0_0_10px_rgba(204,255,0,0.9)] drop-shadow-[0_0_20px_rgba(204,255,0,0.5)]',
    textMuted: 'text-[#CCFF00]/80',
    iconBg: 'bg-[#CCFF00]/30',
    progressBg: 'bg-[#CCFF00]/35',
    progressFill: 'bg-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.7),0_0_24px_rgba(204,255,0,0.3)]',
    glow: 'shadow-[0_0_25px_rgba(204,255,0,0.45),0_0_50px_rgba(204,255,0,0.2),0_0_80px_rgba(204,255,0,0.08)]',
    hoverBg: 'hover:bg-[#CCFF00]/15',
  },
};

// Default = primary neon orange (same as gym/power)
const defaultScheme = schemes.gym;

export function getCourseColors(courseType: string): CourseColorScheme {
  // Strip 'sport-' prefix for sport sub-courses
  const base = courseType.startsWith('sport-') ? 'sport' : courseType;
  return schemes[base] || defaultScheme;
}

/** Get estimated reading time for a chapter (based on word count) */
export function getReadingTime(chapter: { content: { paragraphs?: string[]; bullets?: string[] }[] | string }): number {
  let words = 0;
  if (typeof chapter.content === 'string') {
    words = chapter.content.split(/\s+/).length;
  } else {
    for (const section of chapter.content) {
      if (section.paragraphs) words += section.paragraphs.join(' ').split(/\s+/).length;
      if (section.bullets) words += section.bullets.join(' ').split(/\s+/).length;
    }
  }
  return Math.max(2, Math.ceil(words / 200)); // ~200 wpm, minimum 2 min
}
