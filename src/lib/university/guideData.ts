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
  category: 'beginner' | 'strength' | 'calisthenics' | 'mindset' | 'big-lifts' | 'nutrition' | 'cardio' | 'recovery' | 'lifestyle' | 'powerlifting';
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
  {
    key: 'guide_11',
    num: '11',
    title: 'Nutrition 101',
    subtitle: 'Your Complete Guide to Fuelling Right',
    description: 'Calories, macros, micros, hydration, meal timing, and busting every nutrition myth. The fundamentals that actually work.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🥗',
    category: 'nutrition',
    fileName: 'UNBREAKABLE_Guide_11_Nutrition_101.pdf',
    pages: 21,
  },
  {
    key: 'guide_12',
    num: '12',
    title: 'Meal Prep Mastery',
    subtitle: 'Eat Smart, Save Time',
    description: 'Batch cooking methods, weekly shopping lists under £27, high-protein meal ideas, and meal prep for every goal.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🍱',
    category: 'nutrition',
    fileName: 'UNBREAKABLE_Guide_12_Meal_Prep_Mastery.pdf',
    pages: 17,
  },
  {
    key: 'guide_13',
    num: '13',
    title: 'High-Protein Recipes',
    subtitle: '20 Quick Recipes with Full Macros',
    description: '20 easy recipes — breakfast, lunch, dinner, snacks & post-workout. Every recipe under 30 minutes with full macro breakdowns.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🍳',
    category: 'nutrition',
    fileName: 'UNBREAKABLE_Guide_13_High_Protein_Recipes.pdf',
    pages: 17,
  },
  {
    key: 'guide_14',
    num: '14',
    title: 'Running for Beginners',
    subtitle: 'From Zero to Your First 5K',
    description: 'Walk-run method, running form, pacing, injury prevention, and a 12-week plan to your first 5K. No experience needed.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🏃',
    category: 'cardio',
    fileName: 'UNBREAKABLE_Guide_14_Running_For_Beginners.pdf',
    pages: 17,
  },
  {
    key: 'guide_15',
    num: '15',
    title: 'Conditioning & HIIT',
    subtitle: 'High-Intensity Training That Works',
    description: 'Tabata, EMOM, AMRAP, sprint protocols, 10 complete workouts, and how to programme conditioning alongside lifting.',
    coinCost: GUIDE_COIN_COST,
    emoji: '⚡',
    category: 'cardio',
    fileName: 'UNBREAKABLE_Guide_15_Conditioning_HIIT.pdf',
    pages: 15,
  },
  {
    key: 'guide_16',
    num: '16',
    title: 'Recovery & Mobility',
    subtitle: 'Move Better, Recover Faster',
    description: 'Sleep optimisation, foam rolling, stretching protocols, deload programming, and a 15-minute daily mobility routine.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🧘',
    category: 'recovery',
    fileName: 'UNBREAKABLE_Guide_16_Recovery_Mobility.pdf',
    pages: 17,
  },
  {
    key: 'guide_17',
    num: '17',
    title: 'Habit Building',
    subtitle: 'Small Changes, Unbreakable Results',
    description: 'The habit loop, habit stacking, the two-minute rule, environment design, 30-day challenges, and bouncing back from slip-ups.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🔁',
    category: 'lifestyle',
    fileName: 'UNBREAKABLE_Guide_17_Habit_Building.pdf',
    pages: 19,
  },
  {
    key: 'guide_18',
    num: '18',
    title: 'Home Workouts',
    subtitle: 'Train Anywhere, No Equipment',
    description: 'Full exercise library with progressions, 4-week beginner & intermediate programmes, and minimal equipment upgrades.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🏠',
    category: 'lifestyle',
    fileName: 'UNBREAKABLE_Guide_18_Home_Workouts.pdf',
    pages: 17,
  },
  {
    key: 'guide_19',
    num: '19',
    title: 'Powerlifting Basics',
    subtitle: 'Your Guide to Competition',
    description: 'Federations, competition commands, 12-week prep, attempt selection, meet day walkthrough, and equipment guide.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🏆',
    category: 'powerlifting',
    fileName: 'UNBREAKABLE_Guide_19_Powerlifting_Basics.pdf',
    pages: 17,
  },
  {
    key: 'guide_20',
    num: '20',
    title: 'Body Recomposition',
    subtitle: 'Lose Fat & Build Muscle',
    description: 'The science of recomp, nutrition & training protocols, supplements that work, progress tracking, and avoiding common mistakes.',
    coinCost: GUIDE_COIN_COST,
    emoji: '🔄',
    category: 'lifestyle',
    fileName: 'UNBREAKABLE_Guide_20_Body_Recomposition.pdf',
    pages: 17,
  },
];

/** Get download URL for a guide */
export function getGuideDownloadUrl(fileName: string): string {
  return `https://vlwcoqilwyfcrsxodtdx.supabase.co/storage/v1/object/public/university-downloads/guides/${fileName}`;
}

/** All guide keys for validation */
export const ALL_GUIDE_KEYS = GUIDES.map(g => g.key);

/** Guide bundle — all 20 for 50 tokens (save 50) */
export const GUIDE_BUNDLE = {
  key: 'guide_bundle_all',
  name: 'Complete Guide Collection',
  coinCost: 150,
  savings: 150,
  courses: ALL_GUIDE_KEYS,
};
