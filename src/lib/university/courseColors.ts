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
    bg: 'bg-orange-500/10',
    bgGradient: 'from-orange-500/20 to-red-500/10',
    border: 'border-orange-500/20',
    borderActive: 'border-orange-500/40',
    text: 'text-orange-500',
    textMuted: 'text-orange-500/60',
    iconBg: 'bg-orange-500/15',
    progressBg: 'bg-orange-500/30',
    progressFill: 'bg-orange-500',
    glow: 'shadow-orange-500/5',
    hoverBg: 'hover:bg-orange-500/5',
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
    bg: 'bg-amber-500/10',
    bgGradient: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-500/20',
    borderActive: 'border-amber-500/40',
    text: 'text-amber-500',
    textMuted: 'text-amber-500/60',
    iconBg: 'bg-amber-500/15',
    progressBg: 'bg-amber-500/30',
    progressFill: 'bg-amber-500',
    glow: 'shadow-amber-500/5',
    hoverBg: 'hover:bg-amber-500/5',
  },
};

// Default = primary orange (same as gym)
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
