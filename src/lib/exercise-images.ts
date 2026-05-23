// ═══════════════════════════════════════════════════
// Exercise Image URLs — served from GitHub CDN
// Source: yuhonas/free-exercise-db (Unlicense / Public Domain)
// Each exercise has 2 images: 0.jpg (start) + 1.jpg (end)
// ═══════════════════════════════════════════════════

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

/**
 * Get the full URL for an exercise image
 * @param imagePath - e.g. "3_4_Sit-Up/0.jpg"
 */
export function getExerciseImageUrl(imagePath: string): string {
  return `${BASE_URL}/${imagePath}`
}

/**
 * Get both start/end position images for an exercise
 * @param exerciseId - e.g. "3_4_Sit-Up"
 */
export function getExerciseImages(exerciseId: string): { start: string; end: string } {
  return {
    start: `${BASE_URL}/${exerciseId}/0.jpg`,
    end: `${BASE_URL}/${exerciseId}/1.jpg`,
  }
}
