import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Footprints,
  Zap,
  Bike,
  Waves,
  Droplets,
  Calendar as CalendarIcon,
  Trash2,
  Eye,
  Play,
  Pause,
  Target,
  Clock,
  ChevronDown,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useCardioPrograms, CardioProgram, CardioProgramStatus } from '@/hooks/useCardioPrograms';
import { useUserRole } from '@/hooks/useUserRole';
import { Switch } from '@/components/ui/switch';
import { Bot } from 'lucide-react';
import { GeneratedCardioProgram, activityLabels, ActivityType } from '@/lib/cardioTypes';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CardioProgramDisplay } from './CardioProgramDisplay';
import { CardioNextSessionPreview } from './CardioNextSessionPreview';
import { MovementExecutionView } from './MovementExecutionView';
import { StartDatePickerDialog } from './StartDatePickerDialog';
import { CalendarSyncSection } from '@/components/programming/CalendarSyncSection';
import { AutoCalendarPrompt } from '@/components/programming/AutoCalendarPrompt';

interface SavedCardioProgramsProps {
  onViewProgram: (program: GeneratedCardioProgram) => void;
}

const statusConfig: Record<CardioProgramStatus, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-muted text-muted-foreground border-muted' },
  active: { label: 'Active', className: 'bg-primary text-primary-foreground border-primary' },
  completed: { label: 'Completed', className: 'bg-primary/20 text-primary border-primary/30' },
  paused: { label: 'Paused', className: 'bg-primary/20 text-primary border-primary/30' },
};

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'walk': return <Footprints className="w-5 h-5 text-primary" />;
    case 'run': return <Zap className="w-5 h-5 text-primary" />;
    case 'cycle': return <Bike className="w-5 h-5 text-primary" />;
    case 'row': return <Waves className="w-5 h-5 text-primary" />;
    case 'swim': return <Droplets className="w-5 h-5 text-primary" />;
    default: return <Zap className="w-5 h-5 text-primary" />;
  }
};

export function SavedCardioPrograms({ onViewProgram }: SavedCardioProgramsProps) {
  const {
    programs,
    isLoading,
    activeProgramCount,
    canActivateMore,
    maxActivePrograms,
    startProgrammeExecution,
    deactivateProgram,
    deleteProgram,
    setAutoTrack,
  } = useCardioPrograms();
  const { isDev } = useUserRole();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [executingProgramId, setExecutingProgramId] = useState<string | null>(null);
  const [startDateProgram, setStartDateProgram] = useState<CardioProgram | null>(null);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);
  const [justStartedProgramId, setJustStartedProgramId] = useState<string | null>(null);

  const executingProgram = programs?.find(p => p.id === executingProgramId);

  if (isLoading) {
    return (
      <Card className=" border-border border-border bg-card">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!programs || programs.length === 0) {
    // Every other pillar's library (Power, Mindset, Fuel) shows an empty
    // state with an icon, message and a way to create something -- this one
    // just rendered nothing, so a signed-in user with no saved cardio
    // programmes saw a blank page below the header. Matches the pattern in
    // MyProgramsSection (Power) and MindsetProgrammes.
    return (
      <Card className="p-6 border border-border text-center bg-card">
        <Footprints className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">No saved programmes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ask your Unbreakable Coach to build a bespoke movement programme, or build one manually.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/help?mode=cardio">
            <Button variant="default" className="gap-2 w-full sm:w-auto">
              <Sparkles className="w-4 h-4" />
              Build with Coach
            </Button>
          </Link>
          <Link to="/tracker/create">
            <Button variant="outline" className="w-full sm:w-auto">
              Build Manually
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Show execution view if tracking
  if (executingProgram) {
    return (
      <>
        <MovementExecutionView
          program={executingProgram}
          onClose={() => setExecutingProgramId(null)}
        />
        <AutoCalendarPrompt
          programType="cardio"
          programId={executingProgram.id}
          programName={executingProgram.name}
          trigger={justStartedProgramId}
          onDismiss={() => setJustStartedProgramId(null)}
        />
      </>
    );
  }

  const handleStartClick = (program: CardioProgram, e: React.MouseEvent) => {
    e.stopPropagation();
    setStartDateProgram(program);
  };

  const handleConfirmStart = async (date: Date) => {
    if (!startDateProgram) return;
    try {
      await startProgrammeExecution.mutateAsync({
        programId: startDateProgram.id,
        startDate: date,
      });
      setJustStartedProgramId(startDateProgram.id);
      setExecutingProgramId(startDateProgram.id);
      setStartDateProgram(null);
      setExpandedId(null);
    } catch {
      // handled by mutation
    }
  };

  const handleResumeClick = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExecutingProgramId(programId);
    setExpandedId(null);
  };

  // A paused programme (was started, then deactivated) used to fall through
  // to the same "Start" button as a never-started one, which reopened the
  // date picker every time — silently rescheduling the whole calendar just
  // to resume where you left off. Power's equivalent resumes onto today's
  // date without asking, so do the same here.
  const handleResumePaused = async (program: CardioProgram, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await startProgrammeExecution.mutateAsync({ programId: program.id, startDate: new Date() });
      setExecutingProgramId(program.id);
      setExpandedId(null);
    } catch {
      // handled by mutation
    }
  };

  const handleDeactivate = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deactivateProgram.mutate(programId);
  };

  const handleDelete = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingProgramId(programId);
  };

  const confirmDelete = () => {
    if (deletingProgramId) {
      deleteProgram.mutate(deletingProgramId);
      if (expandedId === deletingProgramId) setExpandedId(null);
      if (executingProgramId === deletingProgramId) setExecutingProgramId(null);
      setDeletingProgramId(null);
    }
  };

  const handleExpand = (programId: string) => {
    if (executingProgramId) return;
    setExpandedId(expandedId === programId ? null : programId);
  };

  return (
    <div className="space-y-4">
      {/* Header — same layout as Power: active count + always-visible Build with Coach CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm md:text-base text-muted-foreground">
            Active: <span className="text-foreground font-medium">{activeProgramCount}</span> / {maxActivePrograms}
          </span>
          {!canActivateMore && (
            <Badge variant="outline" className="border-primary/50 text-primary shrink-0">
              Max Reached
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/help?mode=cardio">
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Sparkles className="w-4 h-4" />
              Build with Coach
            </Button>
          </Link>
        </div>
      </div>

      {programs.map((program) => (
        <div key={program.id}>
          <Card
            className={`p-5 border bg-card transition-all ${
              program.is_active ? 'border-primary shadow-[0_0_15px_hsl(var(--primary)/0.15)]' : 'border-border'
            }`}
          >
            {/* Top row: icon + name + status/activity badges + live dot */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {getActivityIcon(program.program_data.activityType)}
                </div>
                <h3 className="font-display text-xl text-foreground leading-tight">
                  {program.name}
                </h3>
                <Badge variant="outline" className={statusConfig[program.status].className}>
                  {statusConfig[program.status].label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {activityLabels[program.program_data.activityType]}
                </Badge>
              </div>
              {program.is_active && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0 mt-2" />
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {program.overview || 'Custom movement programme'}
            </p>

            {/* Meta row: date + progress */}
            <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-primary/60" />
                {format(new Date(program.created_at), 'MMM d, yyyy')}
              </span>
              {(program.is_active || program.status === 'paused') && program.current_week && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary/60" />
                  Week {program.current_week}, Day {program.current_day}
                  {program.status === 'paused' && (
                    <span className="text-primary/60">(paused)</span>
                  )}
                </span>
              )}
            </div>

            {isDev && program.is_active && (
              <div className="flex items-center gap-2 mb-3 text-xs">
                <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Auto-track (dev only)</span>
                <Switch
                  checked={program.auto_track_enabled}
                  onCheckedChange={(checked) => setAutoTrack.mutate({ programId: program.id, enabled: checked })}
                  disabled={setAutoTrack.isPending}
                />
              </div>
            )}

            {/* Actions — two rows, matching Power's mobile-friendly layout */}
            <div className="space-y-2 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                {program.is_active ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => handleResumeClick(program.id, e)}
                      className="gap-1.5 flex-1"
                    >
                      <Target className="w-4 h-4" />
                      Track Session
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDeactivate(program.id, e)}
                      disabled={deactivateProgram.isPending}
                      className="gap-1.5"
                    >
                      {deactivateProgram.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                      Pause
                    </Button>
                  </>
                ) : program.status === 'paused' ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => handleResumePaused(program, e)}
                    disabled={startProgrammeExecution.isPending || !canActivateMore}
                    className="gap-1.5 flex-1"
                    title={!canActivateMore ? `Maximum ${maxActivePrograms} active programmes` : undefined}
                  >
                    {startProgrammeExecution.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Resume — Week {program.current_week}, Day {program.current_day}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => handleStartClick(program, e)}
                    disabled={startProgrammeExecution.isPending || !canActivateMore}
                    className="gap-1.5 flex-1"
                    title={!canActivateMore ? `Maximum ${maxActivePrograms} active programmes` : undefined}
                  >
                    {startProgrammeExecution.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Start Programme
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleExpand(program.id); }}
                  className={`gap-1.5 flex-1 ${expandedId === program.id ? 'border-primary/40 bg-primary/5 text-primary' : ''}`}
                >
                  <Eye className="w-4 h-4" />
                  View Plan
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedId === program.id ? 'rotate-180' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(program.id, e)}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          <AnimatePresence>
            {expandedId === program.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  {/* Next Session Preview — same progress bar + session breakdown as Power */}
                  {(program.status === 'active' || program.status === 'paused') && (
                    <>
                      <CardioNextSessionPreview
                        programId={program.id}
                        currentWeek={program.current_week}
                        currentDay={program.current_day}
                      />
                      <CalendarSyncSection
                        programType="cardio"
                        programId={program.id}
                        programName={program.name}
                        currentWeek={program.current_week}
                      />
                    </>
                  )}
                  <CardioProgramDisplay
                    program={program.program_data}
                    onBack={() => setExpandedId(null)}
                    isSaving={false}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Start Date Picker Dialog */}
      <StartDatePickerDialog
        open={!!startDateProgram}
        onOpenChange={(open) => { if (!open) setStartDateProgram(null); }}
        onConfirm={handleConfirmStart}
        isPending={startProgrammeExecution.isPending}
        programName={startDateProgram?.name || ''}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProgramId} onOpenChange={(open) => { if (!open) setDeletingProgramId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete programme?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this programme and all scheduled sessions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
