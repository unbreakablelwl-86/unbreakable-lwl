// Builds a downloadable .ics calendar file for a block of programme sessions.
// No Google/Apple login or API integration required — this is the standard
// "Add to Calendar" pattern used across the web: a single file containing one
// VEVENT per session, which Google Calendar, Apple Calendar and Outlook can
// all import directly (Google: Calendar settings -> Import & Export; on most
// phones/desktops, just opening the downloaded file offers to add it).

export interface CalendarExportEvent {
  /** Stable, unique id for this event (used as the ICS UID). */
  id: string;
  /** YYYY-MM-DD — rendered as an all-day event. */
  date: string;
  /** Event title, e.g. "Lower Body — Squat Pattern". */
  title: string;
  /** Plain-text lines shown in the event description. */
  details: string[];
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatIcsDate(dateStr: string): string {
  // All-day VEVENT — DTSTART;VALUE=DATE wants YYYYMMDD, no separators.
  return dateStr.replace(/-/g, '');
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function foldLine(line: string): string {
  // RFC 5545 recommends folding lines longer than 75 octets — not strictly
  // required for compatibility with Google/Apple/Outlook, but cheap to do.
  if (line.length <= 75) return line;
  let result = '';
  let remaining = line;
  let first = true;
  while (remaining.length > 0) {
    const chunkLen = first ? 75 : 74;
    result += (first ? '' : '\r\n ') + remaining.slice(0, chunkLen);
    remaining = remaining.slice(chunkLen);
    first = false;
  }
  return result;
}

export function buildIcsCalendar(calendarName: string, events: CalendarExportEvent[]): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Unbreakable LWL//Programme Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ];

  for (const event of events) {
    const uid = `${event.id}@unbreakable-lwl.com`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${formatIcsDate(event.date)}`,
      `DTEND;VALUE=DATE:${formatIcsDate(addDays(event.date, 1))}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText(event.details.join('\n'))}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** Triggers a browser download of the given .ics content. */
export function downloadIcsFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
