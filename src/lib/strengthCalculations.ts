/**
 * Strength calculation utilities
 *
 * Updated 28 May 2026 — John's spec-aligned standards:
 *   Big 6 (Squat/Bench/Deadlift/OHP/Row/Pull-Up) exact spec values
 *   IPF GL Score for bodyweight-normalised power rating
 *   IPF Age Coefficients (Sub-Junior → Masters 4)
 *   Wilks-2 coefficient function
 */

export type Gender = 'male' | 'female';
export type Exercise =
  | 'bench' | 'incline_bench'
  | 'squat' | 'sumo_squat'
  | 'deadlift' | 'sumo_deadlift'
  | 'ohp'
  | 'db_chest_press' | 'incline_db_chest_press'
  | 'leg_press' | 'bent_over_row'
  | 'db_shoulder_press' | 'barbell_curl' | 'db_curl'
  | 'tricep_dips' | 'pull_up' | 'chin_up' | 'press_up';

export type IPFAgeCategory = 'sub_junior' | 'junior' | 'open' | 'masters_1' | 'masters_2' | 'masters_3' | 'masters_4';

export type AgeGroup = '18-23' | '24-34' | '35-44' | '45-54' | '55-64' | '65+';

export interface StrengthResult {
  oneRepMax: number;
  level: StrengthLevel;
  percentile: number;
  ratio: number;
  ageGroup: AgeGroup;
  ageAdjustedPercentile: number;
  ipfAgeCategory?: IPFAgeCategory;
  wilksScore?: number;
  ipfGLScore?: number;
  overallRating?: number;  // 40-99 scale
}

export interface StrengthLevel {
  name: string;
  stars: number;
  color: string;
}

// ═══════════════════════════════════════════════════
//  CORE FORMULAS
// ═══════════════════════════════════════════════════

/** Epley formula for 1RM estimation */
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0 || weight <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Wilks-2 Score (2020 revision)
 * Normalises a total to bodyweight for fair comparison across weight classes
 */
export function calculateWilks2(totalKg: number, bodyweightKg: number, gender: Gender): number {
  if (bodyweightKg <= 0 || totalKg <= 0) return 0;
  const x = bodyweightKg;

  // Wilks-2 polynomial coefficients (2020)
  const coeffs = gender === 'female'
    ? { a: -125.4255398, b: 13.71219419, c: -0.03307250631, d: -0.001050400051, e: 9.38773881462799e-6, f: -2.3334613884954e-8 }
    : { a: 47.46178854, b: 8.472061379, c: 0.07369410346, d: -0.001395833811, e: 7.07665973070743e-6, f: -1.20804336482315e-8 };

  const denom = coeffs.a + coeffs.b * x + coeffs.c * x ** 2 + coeffs.d * x ** 3 + coeffs.e * x ** 4 + coeffs.f * x ** 5;
  if (denom <= 0) return 0;

  return Math.round((500 / denom) * totalKg * 100) / 100;
}

/**
 * IPF GL Score (Goodlift Points)
 * Used by the IPF for cross-bodyweight comparison
 */
export function calculateIPFGL(totalKg: number, bodyweightKg: number, gender: Gender): number {
  if (bodyweightKg <= 0 || totalKg <= 0) return 0;

  // IPF GL coefficients (SBD — full powerlifting total)
  const coeffs = gender === 'female'
    ? { A: 610.32796, B: 1045.59282, C: 0.03048 }
    : { A: 1199.72839, B: 1025.18162, C: 0.00921 };

  const denom = coeffs.A - coeffs.B * Math.exp(-coeffs.C * bodyweightKg);
  if (denom <= 0) return 0;

  return Math.round((totalKg * 100 / denom) * 100) / 100;
}

// ═══════════════════════════════════════════════════
//  IPF AGE COEFFICIENTS
// ═══════════════════════════════════════════════════

/** Get IPF age category from age */
export function getIPFAgeCategory(age: number): IPFAgeCategory {
  if (age < 19) return 'sub_junior';      // 14-18
  if (age < 24) return 'junior';          // 19-23
  if (age < 40) return 'open';            // 24-39
  if (age < 50) return 'masters_1';       // 40-49
  if (age < 60) return 'masters_2';       // 50-59
  if (age < 70) return 'masters_3';       // 60-69
  return 'masters_4';                     // 70+
}

/** IPF age coefficient — approximate Foster coefficients */
export function getIPFAgeCoefficient(age: number): number {
  if (age < 14) return 1.0;

  // Sub-Junior (14-18)
  if (age === 14) return 1.23;
  if (age === 15) return 1.18;
  if (age === 16) return 1.13;
  if (age === 17) return 1.08;
  if (age === 18) return 1.04;

  // Junior (19-23)
  if (age === 19) return 1.02;
  if (age === 20) return 1.01;
  if (age <= 23) return 1.0;

  // Open (24-39)
  if (age <= 39) return 1.0;

  // Masters 1 (40-49) — progressive increase
  if (age <= 49) return 1.0 + (age - 39) * 0.005;

  // Masters 2 (50-59)
  if (age <= 59) return 1.05 + (age - 49) * 0.008;

  // Masters 3 (60-69)
  if (age <= 69) return 1.13 + (age - 59) * 0.012;

  // Masters 4 (70+)
  return 1.25 + (age - 69) * 0.015;
}

export const ipfAgeCategoryLabels: Record<IPFAgeCategory, string> = {
  sub_junior: 'Sub-Junior (14-18)',
  junior: 'Junior (19-23)',
  open: 'Open (24-39)',
  masters_1: 'Masters I (40-49)',
  masters_2: 'Masters II (50-59)',
  masters_3: 'Masters III (60-69)',
  masters_4: 'Masters IV (70+)',
};

// ═══════════════════════════════════════════════════
//  AGE GROUPS (legacy + new)
// ═══════════════════════════════════════════════════

export function getAgeGroup(age: number): AgeGroup {
  if (age < 24) return '18-23';
  if (age < 35) return '24-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

const ageAdjustments: Record<AgeGroup, number> = {
  '18-23': 1.0,
  '24-34': 1.0,
  '35-44': 1.08,
  '45-54': 1.18,
  '55-64': 1.30,
  '65+': 1.45,
};

export const ageGroupLabels: Record<AgeGroup, string> = {
  '18-23': '18-23 years',
  '24-34': '24-34 years',
  '35-44': '35-44 years',
  '45-54': '45-54 years',
  '55-64': '55-64 years',
  '65+': '65+ years',
};

// ═══════════════════════════════════════════════════
//  STRENGTH STANDARDS — John's spec (28 May 2026)
//  [Bronze / Silver / Gold / Diamond / Platinum]
//  BW multipliers (except Pull-Up = rep count)
// ═══════════════════════════════════════════════════

const strengthStandards: Record<Exercise, Record<Gender, number[]>> = {
  // ── BIG 6: Exact spec values ──
  squat: {
    male:   [0.75, 1.25, 1.5, 2.0, 2.5],
    female: [0.5,  0.75, 1.0, 1.5, 2.0],
  },
  bench: {
    male:   [0.5, 0.75, 1.0, 1.5, 2.0],
    female: [0.35, 0.5, 0.65, 1.0, 1.35],
  },
  deadlift: {
    male:   [1.0, 1.5, 2.0, 2.5, 3.0],
    female: [0.75, 1.0, 1.5, 2.0, 2.5],
  },
  ohp: {
    male:   [0.35, 0.55, 0.75, 1.0, 1.35],
    female: [0.2,  0.35, 0.5,  0.75, 1.0],
  },
  bent_over_row: {
    male:   [0.5, 0.65, 0.85, 1.15, 1.5],
    female: [0.35, 0.5, 0.65, 0.9, 1.2],
  },
  pull_up: {
    // NOTE: Pull-up uses rep count, not BW multiplier
    // These are rep thresholds: Bronze(8)/Silver(12)/Gold(16)/Diamond(20)/Platinum(25)
    male:   [8, 12, 16, 20, 25],
    female: [3, 6, 10, 15, 20],
  },

  // ── SECONDARY: Derived from big 6 ratios ──
  sumo_squat: {
    male:   [0.7,  1.2,  1.45, 1.95, 2.45],
    female: [0.45, 0.7,  0.95, 1.45, 1.95],
  },
  incline_bench: {
    male:   [0.4,  0.6,  0.85, 1.25, 1.7],
    female: [0.28, 0.4,  0.55, 0.85, 1.15],
  },
  sumo_deadlift: {
    male:   [1.0, 1.5, 2.0, 2.5, 3.0],
    female: [0.75, 1.0, 1.5, 2.0, 2.5],
  },
  db_chest_press: {
    male:   [0.2,  0.35, 0.5,  0.7,  0.9],
    female: [0.12, 0.22, 0.32, 0.48, 0.65],
  },
  incline_db_chest_press: {
    male:   [0.18, 0.32, 0.45, 0.65, 0.85],
    female: [0.1,  0.2,  0.3,  0.44, 0.6],
  },
  leg_press: {
    male:   [1.5, 2.0, 2.75, 3.5, 4.5],
    female: [1.0, 1.5, 2.0, 2.75, 3.5],
  },
  db_shoulder_press: {
    male:   [0.15, 0.25, 0.35, 0.48, 0.65],
    female: [0.08, 0.15, 0.25, 0.35, 0.48],
  },
  barbell_curl: {
    male:   [0.25, 0.4, 0.55, 0.7, 0.85],
    female: [0.15, 0.25, 0.35, 0.45, 0.55],
  },
  db_curl: {
    male:   [0.1, 0.18, 0.25, 0.33, 0.4],
    female: [0.05, 0.1, 0.15, 0.22, 0.28],
  },
  tricep_dips: {
    male:   [0.5, 0.75, 1.0, 1.25, 1.5],
    female: [0.3, 0.5, 0.7, 0.9, 1.1],
  },
  chin_up: {
    male:   [0.55, 0.8, 1.05, 1.3, 1.55],
    female: [0.3, 0.5, 0.7, 0.9, 1.1],
  },
  press_up: {
    male:   [0.5, 0.65, 0.8, 0.95, 1.1],
    female: [0.3, 0.45, 0.6, 0.75, 0.9],
  },
};

// ═══════════════════════════════════════════════════
//  RARITY LEVELS (renamed to match card system)
// ═══════════════════════════════════════════════════

const levels: StrengthLevel[] = [
  { name: 'Beginner', stars: 1, color: 'hsl(var(--muted-foreground))' },  // Below Bronze
  { name: 'Bronze',   stars: 2, color: '#CD7F32' },
  { name: 'Silver',   stars: 3, color: '#C0C0C0' },
  { name: 'Gold',     stars: 4, color: '#FFD700' },
  { name: 'Elite',    stars: 5, color: '#8b5cf6' },  // Diamond+
];

function calculatePercentileFromRatio(ratio: number, standards: number[]): { levelIndex: number; percentile: number } {
  let levelIndex = 0;
  let percentile = 5;

  if (ratio >= standards[4]) {
    levelIndex = 4;
    percentile = 99;
  } else if (ratio >= standards[3]) {
    levelIndex = 4;
    const progress = (ratio - standards[3]) / (standards[4] - standards[3]);
    percentile = Math.round(95 + progress * 4);
  } else if (ratio >= standards[2]) {
    levelIndex = 3;
    const progress = (ratio - standards[2]) / (standards[3] - standards[2]);
    percentile = Math.round(80 + progress * 15);
  } else if (ratio >= standards[1]) {
    levelIndex = 2;
    const progress = (ratio - standards[1]) / (standards[2] - standards[1]);
    percentile = Math.round(50 + progress * 30);
  } else if (ratio >= standards[0]) {
    levelIndex = 1;
    const progress = (ratio - standards[0]) / (standards[1] - standards[0]);
    percentile = Math.round(20 + progress * 30);
  } else {
    levelIndex = 0;
    const progress = ratio / standards[0];
    percentile = Math.round(Math.max(1, progress * 20));
  }

  return { levelIndex, percentile };
}

/**
 * Overall rating (40-99 scale) from BW ratio + standards
 * Used by PB Card stat engine
 */
export function calculateOverallRating(
  ratio: number,
  standards: number[],
  ageCoefficient: number = 1.0,
): number {
  const adjustedRatio = ratio * ageCoefficient;

  // Map ratio to 40-99: Bronze(0)=40, Silver(1)=52, Gold(2)=64, Diamond(3)=78, Platinum(4)=92+
  let base: number;
  if (adjustedRatio >= standards[4]) {
    base = 92 + Math.min(7, Math.floor((adjustedRatio - standards[4]) / standards[4] * 20));
  } else if (adjustedRatio >= standards[3]) {
    base = 78 + Math.floor((adjustedRatio - standards[3]) / (standards[4] - standards[3]) * 14);
  } else if (adjustedRatio >= standards[2]) {
    base = 64 + Math.floor((adjustedRatio - standards[2]) / (standards[3] - standards[2]) * 14);
  } else if (adjustedRatio >= standards[1]) {
    base = 52 + Math.floor((adjustedRatio - standards[1]) / (standards[2] - standards[1]) * 12);
  } else if (adjustedRatio >= standards[0]) {
    base = 40 + Math.floor((adjustedRatio - standards[0]) / (standards[1] - standards[0]) * 12);
  } else {
    base = 40;
  }

  return Math.min(99, Math.max(40, base));
}

// ═══════════════════════════════════════════════════
//  MAIN CALCULATION
// ═══════════════════════════════════════════════════

export function calculateStrengthLevel(
  oneRepMax: number,
  bodyweight: number,
  exercise: Exercise,
  gender: Gender,
  age: number,
): StrengthResult {
  const standards = strengthStandards[exercise][gender];
  const ratio = oneRepMax / bodyweight;
  const ageGroup = getAgeGroup(age);
  const ageAdjustment = ageAdjustments[ageGroup];
  const ipfAgeCoeff = getIPFAgeCoefficient(age);

  // Calculate base percentile (absolute strength)
  const { levelIndex, percentile } = calculatePercentileFromRatio(ratio, standards);

  // Calculate age-adjusted percentile (compares to same age group)
  const adjustedRatio = ratio * ageAdjustment;
  const { percentile: ageAdjustedPercentile } = calculatePercentileFromRatio(adjustedRatio, standards);

  // Overall rating (40-99)
  const overallRating = calculateOverallRating(ratio, standards, ipfAgeCoeff);

  // Wilks and IPF GL (use 1RM as "total" for single lift comparison)
  const wilksScore = calculateWilks2(oneRepMax, bodyweight, gender);
  const ipfGLScore = calculateIPFGL(oneRepMax, bodyweight, gender);

  return {
    oneRepMax,
    level: levels[levelIndex],
    percentile,
    ratio: Math.round(ratio * 100) / 100,
    ageGroup,
    ageAdjustedPercentile: Math.min(99, ageAdjustedPercentile),
    ipfAgeCategory: getIPFAgeCategory(age),
    wilksScore,
    ipfGLScore,
    overallRating,
  };
}

// ═══════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════

export const exerciseNames: Record<Exercise, string> = {
  bench: 'Bench Press',
  incline_bench: 'Incline Bench Press',
  squat: 'Squat',
  sumo_squat: 'Sumo Squat',
  deadlift: 'Dead Lift',
  sumo_deadlift: 'Sumo Dead Lift',
  ohp: 'Over Head Press',
  db_chest_press: 'Dumbbell Chest Press',
  incline_db_chest_press: 'Incline Dumbbell Chest Press',
  leg_press: 'Leg Press',
  bent_over_row: 'Bent Over Row',
  db_shoulder_press: 'Dumbbell Shoulder Press',
  barbell_curl: 'Barbell Curl',
  db_curl: 'Dumbbell Curl',
  tricep_dips: 'Tricep Dips',
  pull_up: 'Pull Up',
  chin_up: 'Chin Up',
  press_up: 'Press Up',
};
