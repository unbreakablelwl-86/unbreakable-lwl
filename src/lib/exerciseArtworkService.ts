/**
 * Exercise Artwork Service
 * 
 * Manages the auto-generation pipeline for PB card artwork:
 * 1. Check exercise_artwork_cache for existing artwork
 * 2. If none exists, queue generation (handled server-side)
 * 3. Return cached image_url for card display
 * 
 * Architecture:
 * - 5 rarity card templates (Bronze/Silver/Gold/Diamond/Platinum) = visual borders/effects
 * - Exercise artwork = the actual image of the exercise (generated once, cached globally)
 * - User stats = overlaid dynamically (name, PB value, date, rank)
 */
import { supabase } from '@/integrations/supabase/client';

export interface ExerciseArtwork {
  id: string;
  exercise_name: string;
  sex: 'male' | 'female';
  image_url: string;
  created_at: string;
}

/**
 * Get cached artwork for an exercise + sex combination.
 * Returns null if no artwork has been generated yet.
 */
export async function getExerciseArtwork(
  exerciseName: string,
  sex: 'male' | 'female' = 'male'
): Promise<string | null> {
  const { data, error } = await supabase
    .from('exercise_artwork_cache' as any)
    .select('image_url')
    .eq('exercise_name', exerciseName.toLowerCase().trim())
    .eq('sex', sex)
    .single();

  if (error || !data) return null;
  return (data as any).image_url;
}

/**
 * Get all cached artworks (for prefetching/preloading).
 */
export async function getAllExerciseArtworks(): Promise<ExerciseArtwork[]> {
  const { data, error } = await supabase
    .from('exercise_artwork_cache' as any)
    .select('*')
    .order('exercise_name');

  if (error || !data) return [];
  return data as any as ExerciseArtwork[];
}

/**
 * Map an exercise name to the best matching artwork key.
 * This handles variations like "Barbell Bench Press" → "bench press".
 */
export function normalizeExerciseName(name: string): string {
  return name.toLowerCase().trim()
    // Remove common prefixes
    .replace(/^(barbell|dumbbell|db|cable|machine|bodyweight|bw|ez.?bar|smith)\s+/i, '')
    // Normalize common variations
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get the user's sex from their profile for artwork selection.
 */
export async function getUserSex(userId: string): Promise<'male' | 'female'> {
  const { data } = await supabase
    .from('profiles')
    .select('sex')
    .eq('user_id', userId)
    .single();

  return (data?.sex === 'female') ? 'female' : 'male';
}
