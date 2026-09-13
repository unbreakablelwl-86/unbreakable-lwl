import { useEffect, useState } from 'react';
import { useSessionPlanners } from '@/hooks/useSessionPlanners';
import { useCardioSessionPlanners } from '@/hooks/useCardioSessionPlanners';
import { useCalendarSync, CalendarProgramType } from '@/hooks/useCalendarSync';
import { weekRangeForBlock } from '@/lib/scheduleDates';
import { trainingEventsForRange, cardioEventsForRange } from '@/lib/calendarSessionEvents';
import { AddToCalendarDialog } from './AddToCalendarDialog';

interface AutoCalendarPromptProps {
  programType: CalendarProgramType;
  programId: string | null;
  programName: string;
  /** Bump this (e.g. to the just-started programme's id) to (re-)trigger the popup. */
  trigger: string | null;
  onDismiss: () => void;
}

/**
 * Popup shown right after a programme is started (real calendar dates now
 * exist), offering to add the first 4 weeks to the user's own calendar.
 * Mount this once near the top of a programme list — it renders nothing
 * until `trigger` matches `programId`.
 */
export function AutoCalendarPrompt({ programType, programId, programName, trigger, onDismiss }: AutoCalendarPromptProps) {
  const active = !!programId && trigger === programId;

  const trainingPlanners = useSessionPlanners(active && programType === 'training' ? programId : undefined);
  const cardioPlanners = useCardioSessionPlanners(active && programType === 'cardio' ? programId : undefined);
  const { markBlockSynced } = useCalendarSync(programType, active ? programId ?? undefined : undefined);

  const [open, setOpen] = useState(false);
  const [startWeek, endWeek] = weekRangeForBlock(1);

  const isLoading = programType === 'training' ? trainingPlanners.isLoading : cardioPlanners.isLoading;
  const events =
    programType === 'training'
      ? trainingEventsForRange(trainingPlanners.planners, startWeek, endWeek)
      : cardioEventsForRange(cardioPlanners.planners, startWeek, endWeek);

  useEffect(() => {
    if (active && !isLoading) {
      if (events.length > 0) setOpen(true);
      else onDismiss(); // nothing to sync (shouldn't normally happen right after a start)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isLoading, events.length]);

  if (!active) return null;

  return (
    <AddToCalendarDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onDismiss();
      }}
      programName={programName}
      weekRange={[startWeek, endWeek]}
      events={events}
      onSynced={() => markBlockSynced.mutate(1)}
    />
  );
}
