// ═══════════════════════════════════════════════════
// Exercise Image URLs — ExerciseDB animated GIFs
// Source: oss.exercisedb.dev (open-source exercise database)
// Each exercise has 1 animated GIF showing full movement
// ═══════════════════════════════════════════════════

import type { Exercise } from './exercise-types'

const EDB_BASE = 'https://static.exercisedb.dev/media'

/**
 * Get the animated GIF URL for an exercise.
 * Prefers the gifUrl field on the exercise object;
 * falls back to constructing from exerciseDbId.
 */
export function getExerciseGifUrl(exercise: { gifUrl?: string; exerciseDbId?: string }): string {
  if (exercise.gifUrl) return exercise.gifUrl
  if (exercise.exerciseDbId) return `${EDB_BASE}/${exercise.exerciseDbId}.gif`
  return ''
}

/**
 * Legacy helper — returns the same GIF for both start/end
 * to keep existing components working without refactor.
 */
export function getExerciseImages(exerciseId: string, exercise?: { gifUrl?: string; exerciseDbId?: string }): { start: string; end: string; gif: string } {
  const gif = exercise ? getExerciseGifUrl(exercise) : ''
  return {
    start: gif,
    end: gif,
    gif,
  }
}

/**
 * Get the full URL for an exercise image path (legacy compat)
 */
export function getExerciseImageUrl(imagePath: string): string {
  return imagePath
}
