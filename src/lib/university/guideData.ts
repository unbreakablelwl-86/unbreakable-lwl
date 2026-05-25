/**
 * UNBREAKABLE Training Guides — downloadable PDF guides
 *
 * Each guide costs 15 tokens (~£4.99). Users purchase with coins,
 * then get instant download access. The purchase is recorded in
 * course_purchases with a guide_XX key.
 */

export interface GuideInfo {
  key: string;            // e.g. 'guide_01'
  num: string;            // e.g. '01'
  title: string;
  subtitle: string;
  description: string;
  coinCost: number;
  emoji: string;
  category: 'beginner' | 'strength' | 'calisthenics' | 'mindset' | 'big-lifts';
  fileName: string;       // file in Supabase storage
  pages: number;          // approx page count
}

export const GUIDE_COIN_COST = 15;

export const GUIDES: GuideInfo[] = [
  {
    key: 'guide_01',
    num: '01',
    title: "Beginner's Guide",
    subtitle: 'Your First Steps in the Gym',
    description: 'Everything you need to walk into any gym with confidence. Equipment basics, gym etiquette, beginner routines, and technique foundations.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🏋️',
    category: 'beginner',
    fileName: 'UNBREAKABLE_Guide_01_Beginners.pdf',
    pages: 28,
  },
  {
    key: 'guide_02',
    num: '02',
    title: 'Strong Foundations',
    subtitle: 'Build Your Base',
    description: 'Progressive overload principles, compound movement patterns, programme design basics, and training splits explained simply.',
    coinCost: GUIDE_COIN_COST,
    emoji: '💪',
    category: 'strength',
    fileName: 'UNBREAKABLE_Guide_02_Strong_Foundations.pdf',
    pages: 32,
  },
  {
    key: 'guide_03',
    num: '03',
    title: 'The Next Level',
    subtitle: 'Intermediate Training',
    description: 'Periodisation, advanced programming, plateau-busting strategies, and training intensity techniques for experienced lifters.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🚀',
    category: 'strength',
    fileName: 'UNBREAKABLE_Guide_03_Next_Level.pdf',
    pages: 30,
  },
  {
    key: 'guide_04',
    num: '04',
    title: 'Mind Over Matter',
    subtitle: 'Mental Strength & Resilience',
    description: 'Build mental toughness, manage stress, develop discipline, and create unbreakable habits that stick.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🧠',
    category: 'mindset',
    fileName: 'UNBREAKABLE_Guide_04_Mind_Over_Matter.pdf',
    pages: 26,
  },
  {
    key: 'guide_05',
    num: '05',
    title: 'Pull-Up Foundations',
    subtitle: 'From Zero to Your First Rep',
    description: 'Step-by-step progressions from dead hang to your first pull-up. Band-assisted drills, grip work, and lat activation.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🔝',
    category: 'calisthenics',
    fileName: 'UNBREAKABLE_Guide_05_Pullup_Foundations.pdf',
    pages: 22,
  },
  {
    key: 'guide_06',
    num: '06',
    title: 'Pull-Up Mastery',
    subtitle: 'Advanced Pull-Up Training',
    description: 'Weighted pull-ups, muscle-ups, archer pull-ups, and advanced grip variations. Programming for pull-up strength.',
    coinCost: GUIDE_COIN_COST,
    emoji: '⬆️',
    category: 'calisthenics',
    fileName: 'UNBREAKABLE_Guide_06_Pullup_Mastery.pdf',
    pages: 22,
  },
  {
    key: 'guide_07',
    num: '07',
    title: 'Big Lifts: Squat',
    subtitle: 'Master the King of Lifts',
    description: 'Complete squat bible — technique breakdown, mobility drills, common faults, squat variations, and progressive programmes.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🦵',
    category: 'big-lifts',
    fileName: 'UNBREAKABLE_Guide_07_Big_Lifts_Squat.pdf',
    pages: 34,
  },
  {
    key: 'guide_08',
    num: '08',
    title: 'Big Lifts: Bench Press',
    subtitle: 'Build a Bigger Bench',
    description: 'Bench press technique, arch setup, grip width, accessory work, shoulder health, and bench-specific programming.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🏋️‍♂️',
    category: 'big-lifts',
    fileName: 'UNBREAKABLE_Guide_08_Big_Lifts_Bench.pdf',
    pages: 30,
  },
  {
    key: 'guide_09',
    num: '09',
    title: 'Big Lifts: Deadlift',
    subtitle: 'Pull with Power',
    description: 'Conventional and sumo deadlift technique, hip hinge mastery, grip training, accessory movements, and deadlift programming.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🔥',
    category: 'big-lifts',
    fileName: 'UNBREAKABLE_Guide_09_Big_Lifts_Deadlift.pdf',
    pages: 36,
  },
  {
    key: 'guide_10',
    num: '10',
    title: 'Big Lifts: OHP',
    subtitle: 'Overhead Press Mastery',
    description: 'Strict press technique, push press, shoulder stability, overhead mobility, and pressing programme templates.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🙌',
    category: 'big-lifts',
    fileName: 'UNBREAKABLE_Guide_10_Big_Lifts_OHP.pdf',
    pages: 32,
  },
];

/** Get download URL for a guide */
export function getGuideDownloadUrl(fileName: string): string {
  return `https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/university-downloads/guides/${fileName}`;
}

/** All guide keys for validation */
export const ALL_GUIDE_KEYS = GUIDES.map(g => g.key);

/** Guide bundle — all 10 for 100 tokens (save 50) */
export const GUIDE_BUNDLE = {
  key: 'guide_bundle_all',
  name: 'Complete Guide Collection',
  coinCost: 100,
  savings: 50,
  courses: ALL_GUIDE_KEYS,
};
