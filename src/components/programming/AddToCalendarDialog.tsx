import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Download } from 'lucide-react';
import { buildIcsCalendar, downloadIcsFile, CalendarExportEvent } from '@/lib/calendarExport';

interface AddToCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programName: string;
  weekRange: [number, number];
  events: CalendarExportEvent[];
  onSynced: () => void;
}

/**
 * Shared "Add to Calendar" popup for both Power and Movement programmes.
 * Exports one 4-week block of scheduled sessions as a single .ics file —
 * no Google account connection needed. Works with Google Calendar (Settings
 * -> Import & Export), Apple Calendar and Outlook alike.
 */
export function AddToCalendarDialog({
  open,
  onOpenChange,
  programName,
  weekRange,
  events,
  onSynced,
}: AddToCalendarDialogProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [startWeek, endWeek] = weekRange;

  const handleDownload = () => {
    const ics = buildIcsCalendar(`${programName} — Weeks ${startWeek}-${endWeek}`, events);
    downloadIcsFile(`${programName.replace(/[^a-z0-9]+/gi, '-')}-weeks-${startWeek}-${endWeek}.ics`, ics);
    setDownloaded(true);
    onSynced();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <CalendarPlus className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Add Weeks {startWeek}–{endWeek} to Your Calendar</DialogTitle>
          <DialogDescription>
            {downloaded ? (
              <>Your calendar file has downloaded. Open it — or import it into Google Calendar via Settings → Import &amp; Export — and all {events.length} sessions will be added.</>
            ) : (
              <>
                Download a calendar file with all {events.length} session{events.length === 1 ? '' : 's'} for weeks {startWeek}–{endWeek}. Works with Google Calendar, Apple Calendar and Outlook.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {downloaded ? (
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button className="w-full gap-2" onClick={handleDownload} disabled={events.length === 0}>
                <Download className="w-4 h-4" />
                Download Calendar File (.ics)
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
                Maybe Later
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
