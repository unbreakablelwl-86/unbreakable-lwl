/**
 * useExerciseArtwork — returns the bespoke card artwork URL for a given exercise name.
 * Priority: 1) exercise_artwork_cache (bespoke library) → 2) ExerciseDB animated GIF → 3) null
 * Loads both sources once and caches globally (singleton).
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/* ═══ Bespoke artwork cache (exercise_artwork_cache table) ═══ */
let _artworkCache: Map<string, string> | null = null;
let _artworkLoading = false;
const _artworkWaiters: Array<(map: Map<string, string>) => void> = [];

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeForArtwork(name: string): string {
  return name.toLowerCase().trim()
    .replace(/^(barbell|dumbbell|db|cable|machine|bodyweight|bw|ez.?bar|smith)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function loadArtworkCache(): Promise<Map<string, string>> {
  if (_artworkCache) return _artworkCache;
  if (_artworkLoading) {
    return new Promise<Map<string, string>>((resolve) => { _artworkWaiters.push(resolve); });
  }
  _artworkLoading = true;
  try {
    const { data, error } = await supabase
      .from('exercise_artwork_cache' as any)
      .select('exercise_name, image_url, sex')
      .order('exercise_name');

    const map = new Map<string, string>();
    if (!error && data) {
      for (const row of data as any[]) {
        if (row.image_url) {
          map.set(normalize(row.exercise_name), row.image_url);
        }
      }
    }
    _artworkCache = map;
    _artworkWaiters.forEach(w => w(map));
    _artworkWaiters.length = 0;
    return map;
  } catch {
    _artworkLoading = false;
    return new Map();
  }
}

/* ═══ ExerciseDB GIF cache (exercises.json) ═══ */
let _gifCache: Map<string, string> | null = null;
let _gifLoading = false;
const _gifWaiters: Array<(map: Map<string, string>) => void> = [];

async function loadGifCache(): Promise<Map<string, string>> {
  if (_gifCache) return _gifCache;
  if (_gifLoading) {
    return new Promise<Map<string, string>>((resolve) => { _gifWaiters.push(resolve); });
  }
  _gifLoading = true;
  try {
    const res = await fetch('/data/exercises.json');
    const data: Array<{ name: string; gifUrl?: string; exerciseDbId?: string }> = await res.json();
    const map = new Map<string, string>();
    for (const ex of data) {
      const url = ex.gifUrl || (ex.exerciseDbId ? `https://static.exercisedb.dev/media/${ex.exerciseDbId}.gif` : '');
      if (url) {
        map.set(normalize(ex.name), url);
      }
    }
    _gifCache = map;
    _gifWaiters.forEach(w => w(map));
    _gifWaiters.length = 0;
    return map;
  } catch {
    _gifLoading = false;
    return new Map();
  }
}

function findInMap(map: Map<string, string>, exerciseName: string): string | null {
  const key = normalize(exerciseName);
  // Exact match
  let url = map.get(key);
  if (url) return url;
  // Try without prefix (barbell/dumbbell etc)
  const stripped = normalizeForArtwork(exerciseName);
  url = map.get(normalize(stripped));
  if (url) return url;
  // Fuzzy: partial match
  for (const [k, v] of map) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  // Try stripped version fuzzy
  if (stripped !== key) {
    for (const [k, v] of map) {
      if (k.includes(stripped) || stripped.includes(k)) return v;
    }
  }
  return null;
}

/**
 * Hook: returns artwork URL for exercise.
 * Priority: bespoke artwork cache → ExerciseDB GIF → null
 */
export function useExerciseGif(exerciseName: string | undefined): string | null {
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseName) { setArtworkUrl(null); return; }
    let cancelled = false;

    (async () => {
      // 1. Try bespoke artwork cache first
      const artworkMap = await loadArtworkCache();
      if (cancelled) return;
      const bespoke = findInMap(artworkMap, exerciseName);
      if (bespoke) { setArtworkUrl(bespoke); return; }

      // 2. Fall back to ExerciseDB GIF
      const gifMap = await loadGifCache();
      if (cancelled) return;
      const gif = findInMap(gifMap, exerciseName);
      setArtworkUrl(gif);
    })();

    return () => { cancelled = true; };
  }, [exerciseName]);

  return artworkUrl;
}
