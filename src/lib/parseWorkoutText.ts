/**
 * Best-effort splitter for the free-text warmup/cooldown strings the AI
 * programme generator writes (see generate-program's prompt: "warmup":
 * "string", "cooldown": "string" — no structure at all, just prose like
 * "5 min general movement — leg swings, hip circles, bodyweight squats x 15.
 * Then 3 ramp-up sets on squat: 40%, 55%, 70% of working weight x 5 reps
 * each.").
 *
 * There's no reliable way to turn arbitrary coach-written prose into a
 * perfectly structured exercise list without another AI call per render
 * (too slow/costly for a live session view), so this takes the practical
 * middle ground: split on sentence and list punctuation, drop fragments
 * that are just leftover numbers/percentages, and treat everything else as
 * one line item. Good enough to give warmup/cooldown their own dropdown of
 * individual steps (JJ, Sept 2026) instead of one undifferentiated paragraph.
 */

const MIN_MEANINGFUL_CHARS = 3;
const MAX_ITEMS = 10;

/** True once digits/%/punctuation/whitespace are stripped out, so pure
 * leftovers like "55%" or "40%," don't get their own row. */
function hasEnoughText(fragment: string): boolean {
  const lettersOnly = fragment.replace(/[^a-zA-Z]/g, '');
  return lettersOnly.length >= MIN_MEANINGFUL_CHARS;
}

export function parseWorkoutTextItems(text: string | null | undefined): string[] {
  if (!text || !text.trim()) return [];

  const fragments = text
    .split(/[.,;]|—|–/)
    .map(f => f.trim())
    .filter(Boolean);

  const items: string[] = [];
  const seen = new Set<string>();

  for (const fragment of fragments) {
    if (!hasEnoughText(fragment)) continue;
    const key = fragment.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(fragment);
    if (items.length >= MAX_ITEMS) break;
  }

  return items;
}

/** Strips trailing rep/set/duration shorthand ("x 15", "each side", "30 sec")
 * so the remaining words match better against the named-exercise library —
 * e.g. "Bodyweight Squats x 15" -> "Bodyweight Squats". Falls back to the
 * original fragment if stripping would leave nothing usable. */
export function exerciseNameForLookup(fragment: string): string {
  const stripped = fragment
    .replace(/\bx\s*\d+.*$/i, '')
    .replace(/\d+\s*(sec|secs|seconds|min|mins|minutes|reps?).*$/i, '')
    .replace(/\beach\s+(side|leg|arm|direction)\b.*$/i, '')
    .trim();

  return hasEnoughText(stripped) ? stripped : fragment;
}
