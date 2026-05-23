// ═══════════════════════════════════════════════════
// Exercise DB Types — ExerciseDB (oss.exercisedb.dev)
// ═══════════════════════════════════════════════════

export interface Exercise {
  id: string
  exerciseDbId?: string
  name: string
  force: string | null
  level: 'beginner' | 'intermediate' | 'expert'
  mechanic: string | null
  equipment: string | null
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  category: string
  images: string[]
  gifUrl?: string
}

export interface WorkoutSet {
  id: string
  weight: number
  reps: number
  rpe?: number
  isWarmup?: boolean
  completed: boolean
}

export interface WorkoutExercise {
  id: string
  exercise: Exercise
  sets: WorkoutSet[]
  notes?: string
  restSeconds: number
}

export interface Workout {
  id: string
  name: string
  date: string
  exercises: WorkoutExercise[]
  duration_seconds: number
  notes?: string
  completed: boolean
}

export interface PersonalRecord {
  exercise_id: string
  exercise_name: string
  weight: number
  reps: number
  estimated_1rm: number
  date: string
}

export const MUSCLE_GROUP_EMOJI: Record<string, string> = {
  'abdominals': '🔥',
  'abductors': '🦵',
  'adductors': '🦵',
  'biceps': '💪',
  'calves': '🦵',
  'chest': '🫁',
  'forearms': '🤝',
  'glutes': '🍑',
  'hamstrings': '🦵',
  'lats': '🔙',
  'lower back': '🔙',
  'middle back': '🔙',
  'neck': '🦒',
  'quadriceps': '🦵',
  'shoulders': '🏋️',
  'traps': '🏋️',
  'triceps': '💪',
}

export const EQUIPMENT_EMOJI: Record<string, string> = {
  'barbell': '🏋️',
  'dumbbell': '🔩',
  'body only': '🤸',
  'cable': '🔗',
  'machine': '⚙️',
  'kettlebells': '🔔',
  'bands': '🎗️',
  'exercise ball': '⚽',
  'foam roll': '🧻',
  'medicine ball': '🏐',
  'e-z curl bar': '🏋️',
  'other': '🔧',
  'none': '✋',
}

export const CATEGORY_LABELS: Record<string, string> = {
  'strength': 'Strength',
  'cardio': 'Cardio',
  'stretching': 'Stretching',
  'plyometrics': 'Plyometrics',
  'powerlifting': 'Powerlifting',
  'olympic weightlifting': 'Olympic',
  'strongman': 'Strongman',
}

/**
 * Epley formula: 1RM = weight × (1 + reps/30)
 */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}
