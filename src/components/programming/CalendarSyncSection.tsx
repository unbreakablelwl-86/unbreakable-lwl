import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, CalendarCheck } from 'lucide-react';
import { useSessionPlanners } from '@/hooks/useSessionPlanners';
import { useCardioSessionPlanners } from '@/hooks/useCardioSessionPlanners';
import { useCalendarSync, CalendarProgramType } from '@/hooks/useCalendarSync';
import { blockForWeek, weekRangeForBlock } from '@/lib/scheduleDates';
import { trainingEventsForRange, cardioEventsForRange } from '@/lib/calendarSessionEvents';
import { AddToCalendarDialog } from './AddToCalendarDialog';

interface CalendarSyncSectionProps {
  programType: CalendarProgramType;
  programId: string;
  programName: string;
  currentWeek: number;
}

/**
 * Inline "Add to Calendar" affordance shown in a programme's expanded view.
 * Always reflects whichever 4-week block the programme is currently in —
 * once that block is synced it shows a checkmark, and as soon as the
 * programme moves into a fresh, not-yet-synced block, the button reappears.
 */
export function CalendarSyncSection({ programType, programId, programName, currentWeek }: CalendarSyncSectionProps) {
  const trainingPlanners = useSessionPlanners(programType === 'training' ? programId : undefined);
  const cardioPlanners = useCardioSessionPlanners(programType === 'cardio' ? programId : undefined);
  const { isBlockSynced, markBlockSynced } = useCalendarSync(programType, programId);

  const [dialogOpen, setDialogOpen] = useState(false);

  const currentBlock = blockForWeek(currentWeek || 1);
  const [startWeek, endWeek] = weekRangeForBlock(currentBlock);

  const events =
    programType === 'training'
      ? trainingEventsForRange(trainingPlanners.planners, startWeek, endWeek)
      : cardioEventsForRange(cardioPlanners.planners, startWeek, endWeek);

  const isLoading = programType === 'training' ? trainingPlanners.isLoading : cardioPlanners.isLoading;
  const alreadySynced = isBlockSynced(currentBlock);

  if (isLoading || events.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 mb-4 rounded-lg border border-border/50 bg-surface">
      <div className="flex items-center gap-2 min-w-0">
        {alreadySynced ? (
          <CalendarCheck className="w-4 h-4 text-primary shrink-0" />
        ) : (
          <CalendarPlus className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-xs text-muted-foreground truncate">
          {alreadySynced ? `Weeks ${startWeek}–${endWeek} added to your calendar` : `Weeks ${startWeek}–${endWeek} ready to add to your calendar`}
        </span>
      </div>
      <Button variant={alreadySynced ? 'ghost' : 'outline'} size="sm" className="shrink-0 gap-1.5" onClick={() => setDialogOpen(true)}>
        {alreadySynced ? 'Re-download' : 'Add to Calendar'}
      </Button>

      <AddToCalendarDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        programName={programName}
        weekRange={[startWeek, endWeek]}
        events={events}
        onSynced={() => markBlockSynced.mutate(currentBlock)}
      />
    </div>
  );
}
