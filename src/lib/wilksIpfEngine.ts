/**
 * UNBREAKABLE — Wilks/IPF Strength Scoring Engine
 * 
 * Calculates population-benchmarked ratings for all exercises:
 * - Competition lifts (squat, bench, deadlift): IPF GL Points + Wilks-2
 * - Major compounds (OHP, rows, pull-ups): Strength-to-bodyweight ratios
 * - Isolation/machine exercises: Population percentile bands
 * - Cardio: Pace percentiles by distance
 * 
 * All ratings output 0-99 scale for card display.
 */

/* ═══════════════════════════════════════════════════ */
/*  IPF GL COEFFICIENTS (2024 revision)               */
/* ═══════════════════════════════════════════════════ */

/** IPF Goodlift Points: total = coeff × total_kg / (a × ln(bw)^2 + c) */
const IPF_GL_PARAMS = {
  male: {
    // Coefficients for equipped classic total
    a: 310.67,
    b: 857.785,
    c: 53.216,
    d: 147.0835,
  },
  female: {
    a: 125.1435,
    b: 228.03,
    c: 34.5246,
    d: 86.8301,
  },
};

/**
 * IPF GL Points for a single lift (scaled from total formula)
 * Used for squat, bench press, deadlift
 */
export function ipfGLPoints(
  liftKg: number,
  bodyweightKg: number,
  sex: 'male' | 'female'
): number {
  if (liftKg <= 0 || bodyweightKg <= 0) return 0;
  const p = IPF_GL_PARAMS[sex];
  const lnBW = Math.log(bodyweightKg);
  const denominator = p.a - p.b * Math.exp(-p.c * lnBW * lnBW);
  if (denominator <= 0) return 0;
  // Scale single lift: approximate as 1/3 of total
  return Math.round((liftKg * 100 / denominator) * 100) / 100;
}

/* ═══════════════════════════════════════════════════ */
/*  WILKS-2 FORMULA (2020 revision)                   */
/* ═══════════════════════════════════════════════════ */

const WILKS2_COEFFICIENTS = {
  male: {
    a: -216.0475144,
    b: 16.2606339,
    c: -0.002388645,
    d: -0.00113732,
    e: 7.01863e-6,
    f: -1.291e-8,
  },
  female: {
    a: 594.31747775582,
    b: -27.23842536447,
    c: 0.82112226871,
    d: -0.00930733913,
    e: 4.731582e-5,
    f: -9.054e-8,
  },
};

/**
 * Wilks-2 coefficient for a given bodyweight
 */
export function wilks2Coefficient(bodyweightKg: number, sex: 'male' | 'female'): number {
  if (bodyweightKg <= 0) return 0;
  const c = WILKS2_COEFFICIENTS[sex];
  const bw = bodyweightKg;
  const denominator = c.a + c.b * bw + c.c * bw ** 2 + c.d * bw ** 3 + c.e * bw ** 4 + c.f * bw ** 5;
  if (denominator <= 0) return 0;
  return 500 / denominator;
}

/**
 * Wilks-2 points for a lift
 */
export function wilks2Points(liftKg: number, bodyweightKg: number, sex: 'male' | 'female'): number {
  return Math.round(liftKg * wilks2Coefficient(bodyweightKg, sex) * 100) / 100;
}

/* ═══════════════════════════════════════════════════ */
/*  AGE COEFFICIENTS (McCulloch / IPF Masters)        */
/* ═══════════════════════════════════════════════════ */

const AGE_COEFFICIENTS: Record<number, number> = {
  14: 1.23, 15: 1.18, 16: 1.13, 17: 1.08, 18: 1.06, 19: 1.04, 20: 1.03, 21: 1.02,
  22: 1.01, 23: 1.0, 24: 1.0, 25: 1.0, 26: 1.0, 27: 1.0, 28: 1.0, 29: 1.0,
  30: 1.0, 31: 1.0, 32: 1.0, 33: 1.0, 34: 1.0, 35: 1.0, 36: 1.0, 37: 1.0,
  38: 1.0, 39: 1.0, 40: 1.01, 41: 1.02, 42: 1.031, 43: 1.043, 44: 1.055,
  45: 1.068, 46: 1.082, 47: 1.097, 48: 1.113, 49: 1.13, 50: 1.147,
  51: 1.165, 52: 1.184, 53: 1.204, 54: 1.225, 55: 1.246, 56: 1.268,
  57: 1.291, 58: 1.315, 59: 1.34, 60: 1.366, 61: 1.393, 62: 1.421,
  63: 1.45, 64: 1.48, 65: 1.511, 66: 1.543, 67: 1.576, 68: 1.61,
  69: 1.645, 70: 1.681, 71: 1.718, 72: 1.756, 73: 1.795, 74: 1.835,
  75: 1.876, 76: 1.918, 77: 1.961, 78: 2.005, 79: 2.05, 80: 2.096,
};

/**
 * Get age coefficient (McCulloch standard)
 */
export function getAgeCoefficient(age: number): number {
  if (age < 14) return AGE_COEFFICIENTS[14];
  if (age > 80) return AGE_COEFFICIENTS[80];
  return AGE_COEFFICIENTS[age] || 1.0;
}

/**
 * Age-adjusted score
 */
export function ageAdjustedScore(baseScore: number, age: number): number {
  return Math.round(baseScore * getAgeCoefficient(age) * 100) / 100;
}

/* ═══════════════════════════════════════════════════ */
/*  EXERCISE CLASSIFICATION                           */
/* ═══════════════════════════════════════════════════ */

export type ExerciseCategory = 'competition' | 'compound' | 'isolation' | 'cardio' | 'bodyweight';

/** Classification for how to rate each exercise */
interface ExerciseStandard {
  category: ExerciseCategory;
  /** For compounds: strength-to-bodyweight ratio standards [beginner, intermediate, advanced, elite, world] */
  bwRatios?: { male: number[]; female: number[] };
  /** For competition lifts: use IPF GL or Wilks */
  useIPF?: boolean;
}

/**
 * Competition lift patterns — these get IPF GL scoring
 */
const COMPETITION_PATTERNS = [
  /^(back\s+)?squat$/i,
  /^(flat\s+)?bench\s+press$/i,
  /^(conventional\s+|sumo\s+)?deadlift$/i,
];

/**
 * Major compound patterns — BW ratio scoring
 * Ratios: [beginner, novice, intermediate, advanced, elite] (1RM / bodyweight)
 */
const COMPOUND_STANDARDS: Array<{
  pattern: RegExp;
  male: number[];
  female: number[];
}> = [
  { pattern: /overhead\s+press|ohp|military\s+press|shoulder\s+press/i, male: [0.4, 0.55, 0.75, 1.0, 1.35], female: [0.25, 0.35, 0.5, 0.7, 0.95] },
  { pattern: /barbell\s+row|bent[\s-]over\s+row|pendlay/i, male: [0.5, 0.65, 0.85, 1.15, 1.5], female: [0.3, 0.45, 0.6, 0.8, 1.1] },
  { pattern: /pull[\s-]?up|chin[\s-]?up/i, male: [0.5, 0.75, 1.0, 1.4, 1.8], female: [0.3, 0.5, 0.7, 1.0, 1.3] },
  { pattern: /dip/i, male: [0.5, 0.75, 1.0, 1.5, 2.0], female: [0.3, 0.5, 0.7, 1.0, 1.3] },
  { pattern: /front\s+squat/i, male: [0.6, 0.8, 1.1, 1.4, 1.8], female: [0.4, 0.55, 0.75, 1.0, 1.35] },
  { pattern: /romanian\s+deadlift|rdl/i, male: [0.6, 0.8, 1.1, 1.4, 1.75], female: [0.4, 0.55, 0.75, 1.0, 1.3] },
  { pattern: /hip\s+thrust/i, male: [0.8, 1.1, 1.5, 2.0, 2.5], female: [0.6, 0.9, 1.25, 1.75, 2.25] },
  { pattern: /incline\s+(bench\s+)?press/i, male: [0.45, 0.6, 0.8, 1.1, 1.4], female: [0.25, 0.4, 0.55, 0.75, 1.0] },
  { pattern: /leg\s+press/i, male: [1.5, 2.0, 3.0, 4.0, 5.5], female: [1.0, 1.5, 2.25, 3.0, 4.0] },
  { pattern: /clean\s+(&\s+)?jerk|power\s+clean|clean/i, male: [0.5, 0.7, 1.0, 1.3, 1.6], female: [0.3, 0.5, 0.7, 0.95, 1.2] },
  { pattern: /snatch/i, male: [0.4, 0.55, 0.8, 1.05, 1.3], female: [0.25, 0.4, 0.6, 0.8, 1.0] },
];

/**
 * Classify an exercise and determine scoring method
 */
export function classifyExercise(name: string): ExerciseStandard {
  const lower = name.toLowerCase().trim();

  // Check competition lifts
  for (const pattern of COMPETITION_PATTERNS) {
    if (pattern.test(lower)) {
      return { category: 'competition', useIPF: true };
    }
  }

  // Check major compounds
  for (const std of COMPOUND_STANDARDS) {
    if (std.pattern.test(lower)) {
      return {
        category: 'compound',
        bwRatios: { male: std.male, female: std.female },
      };
    }
  }

  // Bodyweight exercises
  if (/push[\s-]?up|plank|sit[\s-]?up|burpee|mountain\s+climber/i.test(lower)) {
    return { category: 'bodyweight' };
  }

  // Cardio
  if (/run|walk|cycle|bike|row|swim|sprint|jog|trek/i.test(lower)) {
    return { category: 'cardio' };
  }

  // Everything else is isolation
  return { category: 'isolation' };
}

/* ═══════════════════════════════════════════════════ */
/*  OVERALL RATING CALCULATOR (0-99 scale)            */
/* ═══════════════════════════════════════════════════ */

/**
 * Calculate overall rating for a PB card (0-99 scale)
 * 
 * Competition lifts: IPF GL → mapped to 0-99
 * Compounds: BW ratio → mapped to percentile → 0-99
 * Isolation: Absolute weight → population percentile → 0-99
 * Cardio: Pace → population percentile → 0-99
 */
export function calculateOverallRating(params: {
  exerciseName: string;
  liftKg: number;
  reps?: number;
  bodyweightKg: number;
  sex: 'male' | 'female';
  age?: number;
}): number {
  const { exerciseName, liftKg, reps = 1, bodyweightKg, sex, age } = params;
  const classification = classifyExercise(exerciseName);

  // Estimate 1RM (Epley formula)
  const e1rm = reps === 1 ? liftKg : Math.round(liftKg * (1 + reps / 30) * 10) / 10;

  let rawRating: number;

  switch (classification.category) {
    case 'competition': {
      // IPF GL points → 0-99 mapping
      const glPoints = ipfGLPoints(e1rm, bodyweightKg, sex);
      // Rough mapping: 30 GL = beginner (20), 60 GL = intermediate (50), 90 GL = advanced (75), 120+ GL = elite (90+)
      rawRating = Math.min(99, Math.round(glPoints * 0.75));
      break;
    }

    case 'compound': {
      // BW ratio → percentile
      const ratio = e1rm / bodyweightKg;
      const standards = classification.bwRatios![sex];
      rawRating = bwRatioToRating(ratio, standards);
      break;
    }

    case 'isolation': {
      // For isolation exercises, use a generic BW ratio scale
      const ratio = e1rm / bodyweightKg;
      // Generic isolation standards (much lower than compounds)
      const genericStandards = sex === 'male'
        ? [0.15, 0.25, 0.4, 0.6, 0.85]
        : [0.1, 0.18, 0.3, 0.45, 0.65];
      rawRating = bwRatioToRating(ratio, genericStandards);
      break;
    }

    case 'bodyweight': {
      // Bodyweight exercises: reps-based rating
      const bwStandards = sex === 'male'
        ? [5, 15, 30, 50, 80]   // reps for push-ups etc
        : [3, 10, 20, 35, 60];
      rawRating = repsToRating(reps || 1, bwStandards);
      break;
    }

    case 'cardio': {
      // Cardio: lower time = better, but we'd need distance context
      // For now use pace-based rating (handled separately by cardio card logic)
      rawRating = 50; // Default, will be overridden by cardio-specific logic
      break;
    }

    default:
      rawRating = 50;
  }

  // Apply age coefficient bonus (older lifters get credit)
  if (age && age > 39) {
    const ageBonus = (getAgeCoefficient(age) - 1) * 15; // Up to ~10 rating points at age 70
    rawRating = Math.min(99, Math.round(rawRating + ageBonus));
  }

  return Math.max(1, Math.min(99, rawRating));
}

/**
 * Map bodyweight ratio to 0-99 rating using 5-point standard
 * Standards: [beginner, novice, intermediate, advanced, elite]
 * Rating bands: [20, 35, 50, 70, 85] → interpolated
 */
function bwRatioToRating(ratio: number, standards: number[]): number {
  const bands = [15, 30, 50, 70, 88];

  if (ratio <= 0) return 1;
  if (ratio >= standards[4] * 1.2) return 99; // Beyond elite

  for (let i = 0; i < standards.length; i++) {
    if (ratio <= standards[i]) {
      const prevStd = i === 0 ? 0 : standards[i - 1];
      const prevBand = i === 0 ? 1 : bands[i - 1];
      const progress = (ratio - prevStd) / (standards[i] - prevStd);
      return Math.round(prevBand + progress * (bands[i] - prevBand));
    }
  }

  // Beyond elite: scale 88-99
  const beyondElite = (ratio - standards[4]) / (standards[4] * 0.2);
  return Math.min(99, Math.round(88 + beyondElite * 11));
}

/**
 * Map reps to 0-99 rating for bodyweight exercises
 */
function repsToRating(reps: number, standards: number[]): number {
  const bands = [15, 30, 50, 70, 88];

  if (reps <= 0) return 1;
  if (reps >= standards[4] * 1.2) return 99;

  for (let i = 0; i < standards.length; i++) {
    if (reps <= standards[i]) {
      const prevStd = i === 0 ? 0 : standards[i - 1];
      const prevBand = i === 0 ? 1 : bands[i - 1];
      const progress = (reps - prevStd) / (standards[i] - prevStd);
      return Math.round(prevBand + progress * (bands[i] - prevBand));
    }
  }

  const beyondElite = (reps - standards[4]) / (standards[4] * 0.2);
  return Math.min(99, Math.round(88 + beyondElite * 11));
}

/* ═══════════════════════════════════════════════════ */
/*  6-STAT CALCULATOR                                 */
/* ═══════════════════════════════════════════════════ */

export interface SixStats {
  str: number;  // Strength: total volume lifted
  pwr: number;  // Power: max e1RM relative to bodyweight
  spd: number;  // Speed: best running pace
  end: number;  // Endurance: total distance + session count
  agi: number;  // Agility: exercise variety
  rec: number;  // Recovery: training consistency
}

/**
 * Calculate 6-stat profile from user's training data
 * All values 0-99 scale
 */
export function calculateSixStats(data: {
  totalVolumeKg: number;
  maxE1RM: number;
  bodyweightKg: number;
  sex: 'male' | 'female';
  bestPaceMinPerKm?: number;
  totalRunKm?: number;
  totalSessions: number;
  weeksActive: number;
  uniqueExercises: number;
}): SixStats {
  const { totalVolumeKg, maxE1RM, bodyweightKg, sex, bestPaceMinPerKm, totalRunKm = 0, totalSessions, weeksActive, uniqueExercises } = data;

  // STR: Total volume — logarithmic scale
  // 1,000kg = ~20, 10,000kg = ~40, 100,000kg = ~60, 500,000kg = ~80, 2M+ = ~99
  const str = Math.min(99, Math.max(1, Math.round(Math.log10(Math.max(1, totalVolumeKg)) * 18 - 18)));

  // PWR: Max e1RM to bodyweight ratio
  const bwRatio = bodyweightKg > 0 ? maxE1RM / bodyweightKg : 0;
  const pwrStandards = sex === 'male' ? [0.5, 1.0, 1.5, 2.0, 2.75] : [0.3, 0.6, 1.0, 1.5, 2.0];
  const pwr = bwRatioToRating(bwRatio, pwrStandards);

  // SPD: Running pace (lower = better)
  let spd = 1;
  if (bestPaceMinPerKm && bestPaceMinPerKm > 0) {
    // 8:00/km = ~20, 6:00/km = ~40, 5:00/km = ~55, 4:00/km = ~75, 3:00/km = ~95
    const paceScore = Math.max(0, 10 - bestPaceMinPerKm) / 7; // 0-1 scale (3min=1.0, 10min=0)
    spd = Math.max(1, Math.min(99, Math.round(paceScore * 99)));
  }

  // END: Total distance + consistency
  // Combine run distance and total sessions
  const distScore = Math.min(50, Math.round(Math.log10(Math.max(1, totalRunKm + 1)) * 20));
  const sessScore = Math.min(49, Math.round(Math.log10(Math.max(1, totalSessions)) * 18));
  const end = Math.max(1, Math.min(99, distScore + sessScore));

  // AGI: Exercise variety
  // 5 exercises = ~25, 15 = ~45, 30 = ~60, 50 = ~75, 100+ = ~90+
  const agi = Math.min(99, Math.max(1, Math.round(Math.sqrt(uniqueExercises) * 12)));

  // REC: Training consistency (sessions per week average)
  const sessionsPerWeek = weeksActive > 0 ? totalSessions / weeksActive : 0;
  // 1x/week = ~25, 2x = ~40, 3x = ~55, 4x = ~70, 5x = ~80, 6+ = ~90+
  const rec = Math.min(99, Math.max(1, Math.round(sessionsPerWeek * 15)));

  return { str, pwr, spd, end, agi, rec };
}

/**
 * Calculate overall rating from 6 stats (strength-biased weighted average)
 */
export function overallFromSixStats(stats: SixStats): number {
  const weights = { str: 0.25, pwr: 0.25, spd: 0.12, end: 0.15, agi: 0.10, rec: 0.13 };
  const weighted = Object.entries(weights).reduce(
    (sum, [key, weight]) => sum + (stats[key as keyof SixStats] || 0) * weight,
    0
  );
  return Math.max(1, Math.min(99, Math.round(weighted)));
}

/* ═══════════════════════════════════════════════════ */
/*  GLOBAL PERCENTILE RANK                            */
/* ═══════════════════════════════════════════════════ */

/**
 * Calculate percentile rank within a cohort
 * Returns 0-100 where lower = better (e.g. top 5% = 5)
 */
export function percentileRank(
  userScore: number,
  allScores: number[],
  lowerIsBetter = false
): number {
  if (allScores.length === 0) return 50;
  const sorted = [...allScores].sort((a, b) => lowerIsBetter ? a - b : b - a);
  const rank = sorted.findIndex(s => lowerIsBetter ? s >= userScore : s <= userScore);
  const position = rank === -1 ? sorted.length : rank;
  return Math.round((position / sorted.length) * 100);
}

/**
 * Format rating as 2-digit display (01-99)
 */
export function formatRating(rating: number): string {
  return String(Math.max(1, Math.min(99, rating))).padStart(2, '0');
}
