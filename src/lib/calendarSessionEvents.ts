import { CalendarExportEvent } from './calendarExport';

/** Builds calendar events from Power (session_planners) rows for a week range. */
export function trainingEventsForRange(planners: any[] | undefined, startWeek: number, endWeek: number): CalendarExportEvent[] {
  if (!planners) return [];
  return planners
    .filter((p) => p.status === 'pending' && p.scheduled_date && p.week_number >= startWeek && p.week_number <= endWeek)
    .map((p) => ({
      id: p.id,
      date: p.scheduled_date as string,
      title: p.session_type,
      details: [
        `Week ${p.week_number} · Day ${p.day_number}`,
        ...(p.planned_exercises || []).map(
          (ex: any) => `${ex.name} — ${ex.sets} x ${ex.reps}${ex.equipment && ex.equipment !== 'bodyweight' ? ` (${ex.equipment})` : ''}`
        ),
        p.warmup ? `Warmup: ${p.warmup}` : '',
        p.cooldown ? `Cooldown: ${p.cooldown}` : '',
      ].filter(Boolean),
    }));
}

/** Builds calendar events from Movement (cardio_session_planners) rows for a week range. */
export function cardioEventsForRange(planners: any[] | undefined, startWeek: number, endWeek: number): CalendarExportEvent[] {
  if (!planners) return [];
  return planners
    .filter((p) => p.status === 'pending' && p.scheduled_date && p.week_number >= startWeek && p.week_number <= endWeek)
    .map((p) => {
      const session = p.planned_session || {};
      const mainLines: string[] = Array.isArray(session.mainSession)
        ? session.mainSession.map((seg: any) => `${seg.segment || ''} ${seg.duration || ''}${seg.notes ? ` — ${seg.notes}` : ''}`.trim())
        : [];
      return {
        id: p.id,
        date: p.scheduled_date as string,
        title: p.session_type,
        details: [
          `Week ${p.week_number} · Day ${p.day_number}`,
          session.duration ? `Duration: ${session.duration}` : p.duration_minutes ? `Duration: ${p.duration_minutes} min` : '',
          session.distance ? `Distance: ${session.distance}` : p.distance_km ? `Distance: ${p.distance_km} km` : '',
          session.intensity ? `Intensity: ${session.intensity}` : '',
          ...mainLines,
          p.warmup ? `Warmup: ${p.warmup}` : '',
          p.cooldown ? `Cooldown: ${p.cooldown}` : '',
        ].filter(Boolean),
      };
    });
}
