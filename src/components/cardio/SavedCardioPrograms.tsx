import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useCardioPrograms, CardioProgram, CardioProgramStatus } from '@/hooks/useCardioPrograms';
import { GeneratedCardioProgram, activityLabels, ActivityType } from '@/lib/cardioTypes';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CardioProgramDisplay } from './CardioProgramDisplay';
import { MovementExecutionView } from './MovementExecutionView';
import { StartDatePickerDialog } from './StartDatePickerDialog';

interface SavedCardioProgramsProps {
  onViewProgram: (program: GeneratedCardioProgram) => void;
}

const statusConfig: Record<CardioProgramStatus, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-muted text-muted-foreground border-muted' },
  active: { label: 'Active', className: 'bg-primary text-primary-foreground border-primary' },
  completed: { label: 'Completed', className: 'bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30' },
  paused: { label: 'Paused', className: 'bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30' },
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
  } = useCardioPrograms();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [executingProgramId, setExecutingProgramId] = useState<string | null>(null);
  const [startDateProgram, setStartDateProgram] = useState<CardioProgram | null>(null);

  const executingProgram = programs?.find(p => p.id === executingProgramId);

  if (isLoading) {
    return (
      <Card className=" border-border border-gray-800 bg-[#111]">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!programs || programs.length === 0) {
    return null;
  }

  // Show execution view if tracking
  if (executingProgram) {
    return (
      <MovementExecutionView
        program={executingProgram}
        onClose={() => setExecutingProgramId(null)}
      />
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
      setStartDateProgram(null);
      setExecutingProgramId(startDateProgram.id);
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

  const handleDeactivate = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deactivateProgram.mutate(programId);
  };

  const handleDelete = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this programme? This will also delete all scheduled sessions.')) {
      deleteProgram.mutate(programId);
      if (expandedId === programId) setExpandedId(null);
      if (executingProgramId === programId) setExecutingProgramId(null);
    }
  };

  const handleExpand = (programId: string) => {
    if (executingProgramId) return;
    setExpandedId(expandedId === programId ? null : programId);
  };

  return (
    <div className="space-y-4">
      {/* Header with status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm md:text-base text-muted-foreground">
            Active: <span className="text-foreground font-medium">{activeProgramCount}</span> / {maxActivePrograms}
          </span>
          {!canActivateMore && (
            <Badge variant="outline" className="border-[#FF5500]/50 text-[#FF5500] shrink-0">
              Max Reached
            </Badge>
          )}
        </div>
      </div>

      {programs.map((program) => (
        <div key={program.id}>
          <Card
            className={`p-4 border bg-card cursor-pointer transition-all hover:border-primary/50 ${
              program.is_active ? 'border-primary' : 'border-border'
            }`}
            onClick={() => handleExpand(program.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {getActivityIcon(program.program_data.activityType)}
                  </div>
                  <h3 className="font-display text-lg text-foreground truncate">
                    {program.name}
                  </h3>
                  <Badge variant="outline" className={statusConfig[program.status].className}>
                    {statusConfig[program.status].label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {activityLabels[program.program_data.activityType]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1 ml-10">
                  {program.overview || 'Custom movement programme'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground ml-10">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {format(new Date(program.created_at), 'MMM d, yyyy')}
                  </span>
                  {program.is_active && program.current_week && (
                    <span className="flex items-center gap-1">
                      Week {program.current_week}, Day {program.current_day}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {program.is_active ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => handleResumeClick(program.id, e)}
                      className="gap-1"
                    >
                      <Target className="w-4 h-4" />
                      Track
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDeactivate(program.id, e)}
                      disabled={deactivateProgram.isPending}
                      className="gap-1"
                    >
                      {deactivateProgram.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                      Pause
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => handleStartClick(program, e)}
                    disabled={startProgrammeExecution.isPending || !canActivateMore}
                    className="gap-1"
                    title={!canActivateMore ? `Maximum ${maxActivePrograms} active programmes` : undefined}
                  >
                    {startProgrammeExecution.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Start
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(program.id, e)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                  expandedId === program.id ? 'rotate-90' : ''
                }`} />
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
    </div>
  );
}
