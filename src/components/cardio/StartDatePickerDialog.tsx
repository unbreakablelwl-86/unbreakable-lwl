import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface StartDatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
  isPending: boolean;
  programName: string;
}

export function StartDatePickerDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  programName,
}: StartDatePickerDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // The calendar popover renders on top of this dialog's own footer (Cancel /
  // START PROGRAMME) rather than pushing it down, since Popover content is
  // portaled and positioned over the page instead of reserving layout space.
  // Left uncontrolled, the popover stayed open after a date was picked and
  // permanently covered those buttons -- on narrower/mobile widths especially,
  // there was no visible way to actually confirm the new date. Controlling
  // `open` and closing it the moment a date is selected keeps the footer
  // reachable immediately after picking a date.
  const [calendarOpen, setCalendarOpen] = useState(false);

  // This dialog stays mounted between programmes (only `open` toggles), so
  // without this the date picker would carry over whatever was last picked
  // (or left mid-pick) from a previous programme instead of defaulting back
  // to today each time it's freshly opened.
  useEffect(() => {
    if (open) {
      setSelectedDate(new Date());
      setCalendarOpen(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide">START PROGRAMME</DialogTitle>
          <DialogDescription>
            Choose a start date for <span className="text-primary font-semibold">{programName}</span>.
            All sessions will be scheduled from this date.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[260px] justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  if (!d) return;
                  setSelectedDate(d);
                  setCalendarOpen(false);
                }}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(selectedDate)} disabled={isPending} className="gap-2 font-display tracking-wide">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            START PROGRAMME
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
