/**
 * useExerciseGif — returns the ExerciseDB animated GIF URL for a given exercise name.
 * Loads exercises.json once and caches it globally (singleton).
 */
import { useState, useEffect } from 'react';

interface ExerciseEntry {
  name: string;
  gifUrl?: string;
  exerciseDbId?: string;
}

let _cache: Map<string, string> | null = null;
let _loading = false;
const _waiters: Array<(map: Map<string, string>) => void> = [];

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function loadExerciseMap(): Promise<Map<string, string>> {
  if (_cache) return _cache;
  if (_loading) {
    return new Promise<Map<string, string>>((resolve) => { _waiters.push(resolve); });
  }
  _loading = true;
  try {
    const res = await fetch('/data/exercises.json');
    const data: ExerciseEntry[] = await res.json();
    const map = new Map<string, string>();
    for (const ex of data) {
      const url = ex.gifUrl || (ex.exerciseDbId ? `https://static.exercisedb.dev/media/${ex.exerciseDbId}.gif` : '');
      if (url) {
        map.set(normalize(ex.name), url);
      }
    }
    _cache = map;
    _waiters.forEach(w => w(map));
    _waiters.length = 0;
    return map;
  } catch {
    _loading = false;
    return new Map();
  }
}

export function useExerciseGif(exerciseName: string | undefined): string | null {
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseName) { setGifUrl(null); return; }
    let cancelled = false;

    loadExerciseMap().then(map => {
      if (cancelled) return;
      const key = normalize(exerciseName);
      // Try exact match first
      let url = map.get(key) || null;
      // Fuzzy: try partial match (e.g. "bench press" matches "barbell bench press")
      if (!url) {
        for (const [k, v] of map) {
          if (k.includes(key) || key.includes(k)) { url = v; break; }
        }
      }
      setGifUrl(url);
    });

    return () => { cancelled = true; };
  }, [exerciseName]);

  return gifUrl;
}
