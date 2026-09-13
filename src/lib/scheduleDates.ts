// Shared helper for turning a programme's weekday-named session (e.g. "Thursday")
// into a real calendar date, anchored to whatever date the user actually picked
// as their programme start date — regardless of what day of the week that is.
//
// Both training_programs and cardio_programs previously scheduled sessions by
// naive array index (session 0 = start date + 0 days, session 1 = +1 day, ...),
// which only produced the right weekdays when the split's days happened to be
// consecutive AND the start date was the first of them. A real split like
// Mon/Tue/Thu/Fri, or a start date that isn't a Monday, landed sessions on the
// wrong actual day of the week — a real problem on its own, and one that would
// silently carry wrong dates into any calendar export.

const DOW_NAMES: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/** Parse a weekday name ("Monday", "mon", etc.) into a 0-6 (Sun-Sat) index. */
export function dowFromName(dayName: string | undefined | null): number | null {
  if (!dayName) return null;
  const key = dayName.trim().toLowerCase();
  return key in DOW_NAMES ? DOW_NAMES[key] : null;
}

/**
 * Compute the real calendar date for a session in week `week` (1-indexed)
 * whose target weekday is `targetDow` (0=Sun..6=Sat), given the programme's
 * actual start date. Week 1 is the 7-day window beginning on startDate; the
 * target weekday is placed at its first occurrence on/after startDate within
 * that window (so a Monday session started on a Wednesday correctly lands on
 * *next* Monday, still counted as week 1, rather than being pulled backwards
 * into the past).
 */
export function dateForWeekday(startDate: Date, week: number, targetDow: number): Date {
  const startDow = startDate.getDay();
  const offsetWithinWeek = (targetDow - startDow + 7) % 7;
  const d = new Date(startDate);
  d.setDate(d.getDate() + (week - 1) * 7 + offsetWithinWeek);
  return d;
}

/**
 * Convenience wrapper: resolve a session's target weekday from its own
 * `day` field (falling back to a sequential offset only if the name is
 * missing/unrecognised, so older/malformed programme data doesn't crash).
 */
export function dateForSession(
  startDate: Date,
  week: number,
  dayName: string | undefined | null,
  fallbackIndexInWeek: number
): Date {
  const dow = dowFromName(dayName);
  if (dow !== null) return dateForWeekday(startDate, week, dow);
  // Fallback: old behaviour, only used if we genuinely can't tell the day.
  const d = new Date(startDate);
  d.setDate(d.getDate() + (week - 1) * 7 + fallbackIndexInWeek);
  return d;
}

/** Which 4-week block a programme week falls into (weeks 1-4 = block 1, etc). */
export function blockForWeek(week: number): number {
  return Math.max(1, Math.ceil(week / 4));
}

/** [firstWeek, lastWeek] spanned by a given 4-week block number. */
export function weekRangeForBlock(block: number): [number, number] {
  return [block * 4 - 3, block * 4];
}
