import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrainingPrograms, TrainingProgram, ProgramStatus } from '@/hooks/useTrainingPrograms';
import { useAuth } from '@/hooks/useAuth';
import { ProgramDisplay } from './ProgramDisplay';
import { ProgrammeExecutionView } from './ProgrammeExecutionView';
import { ProgrammeCTA } from '@/components/coaching/ProgrammeCTA';
import { 
  Calendar, 
  Play, 
  Pause,
  Trash2, 
  ChevronRight,
  Dumbbell,
  Clock,
  Loader2,
  FolderOpen,
  AlertCircle,
  Target,
  Sparkles,
} from 'lucide-react';
import { InlineProgramEditor } from './InlineProgramEditor';
import { StartDatePickerDialog } from '@/components/cardio/StartDatePickerDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Wrench } from 'lucide-react';

const statusConfig: Record<ProgramStatus, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-muted text-muted-foreground border-muted' },
  active: { label: 'Active', className: 'bg-primary text-primary-foreground border-primary' },
  completed: { label: 'Completed', className: 'bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30' },
  paused: { label: 'Paused', className: 'bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30' },
};

export function MyProgramsSection() {
  const { user } = useAuth();
  const { 
    programs, 
    isLoading, 
    activeProgramCount,
    canActivateMore,
    maxActivePrograms,
    startProgrammeExecution,
    deactivateProgram,
    deleteProgram 
  } = useTrainingPrograms();
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [executingProgramId, setExecutingProgramId] = useState<string | null>(null);
  const [startDateProgramId, setStartDateProgramId] = useState<string | null>(null);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const startDateProgram = programs?.find(p => p.id === startDateProgramId);

  // Find the program being executed
  const executingProgram = programs?.find(p => p.id === executingProgramId);

  if (!user) {
    return (
      <Card className="p-6 border border-border text-center border-border bg-card">
        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">Sign in to view your programmes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Save and track your generated training programmes by signing in.
        </p>
        <Link to="/tracker">
          <Button variant="default">Sign In</Button>
        </Link>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 border border-border flex items-center justify-center border-border bg-card">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <Card className="p-6 border border-border text-center border-border bg-card">
        <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg text-foreground mb-2">No saved programmes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Generate a bespoke programme with the Unbreakable Coach or build one manually above.
        </p>
        <ProgrammeCTA variant="default" className="mx-auto" />
      </Card>
    );
  }

  const handleExpandProgram = (programId: string) => {
    if (executingProgramId) return; // Don't expand while executing
    setExpandedProgramId(expandedProgramId === programId ? null : programId);
  };

  const handleStartProgramme = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStartDateProgramId(programId);
  };

  const handleConfirmStart = async (date: Date) => {
    if (!startDateProgramId) return;
    try {
      await startProgrammeExecution.mutateAsync(startDateProgramId);
      setStartDateProgramId(null);
      setExecutingProgramId(startDateProgramId);
      setExpandedProgramId(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleResumeProgramme = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExecutingProgramId(programId);
    setExpandedProgramId(null);
  };

  const handleDeactivate = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deactivateProgram.mutate(programId);
  };

  const handleDelete = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this programme? This will also delete all scheduled sessions.')) {
      deleteProgram.mutate(programId);
      if (expandedProgramId === programId) {
        setExpandedProgramId(null);
      }
      if (executingProgramId === programId) {
        setExecutingProgramId(null);
      }
    }
  };

  // Show inline editor if editing a program
  if (editingProgramId) {
    const editingProgram = programs?.find(p => p.id === editingProgramId);
    if (editingProgram) {
      return (
        <InlineProgramEditor
          programId={editingProgramId}
          programData={editingProgram.program_data}
          onClose={() => setEditingProgramId(null)}
          onSaved={() => setEditingProgramId(null)}
        />
      );
    }
  }

  // Show execution view if a program is being executed
  if (executingProgram) {
    return (
      <ProgrammeExecutionView
        program={executingProgram}
        onClose={() => setExecutingProgramId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with AI CTA + Manual Edit */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-surface rounded-lg border border-border">
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
        <div className="flex items-center gap-2">
          <ProgrammeCTA 
            variant="outline" 
            size="sm" 
            label="Build with Coach"
            className="shrink-0"
          />
        </div>
      </div>

      {programs.map((program) => (
        <div key={program.id}>
          <Card 
            className={`p-5 border bg-card cursor-pointer transition-all hover:border-primary/50 ${
              program.is_active ? 'border-primary shadow-[0_0_15px_hsl(var(--primary)/0.15)]' : 'border-border'
            }`}
            onClick={() => handleExpandProgram(program.id)}
          >
            {/* Top row: name + status badge + expand chevron */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-xl text-foreground leading-tight">
                    {program.name}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={statusConfig[program.status].className}
                  >
                    {statusConfig[program.status].label}
                  </Badge>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 mt-1 ${
                expandedProgramId === program.id ? 'rotate-90' : ''
              }`} />
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {program.overview || 'Custom training programme'}
            </p>

            {/* Meta row: date + progress */}
            <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary/60" />
                {format(new Date(program.created_at), 'MMM d, yyyy')}
              </span>
              {program.is_active && program.current_week && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary/60" />
                  Week {program.current_week}, Day {program.current_day}
                </span>
              )}
            </div>

            {/* Actions row — full width buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-border/50">
              {program.is_active ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => handleResumeProgramme(program.id, e)}
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
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => handleStartProgramme(program.id, e)}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); setEditingProgramId(program.id); }}
                title="Edit programme"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDelete(program.id, e)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <AnimatePresence>
            {expandedProgramId === program.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <ProgramDisplay 
                    program={program.program_data} 
                    onReset={() => setExpandedProgramId(null)}
                    savedProgramId={program.id}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      {/* Start Date Picker Dialog */}
      <StartDatePickerDialog
        open={!!startDateProgramId}
        onOpenChange={(open) => { if (!open) setStartDateProgramId(null); }}
        onConfirm={handleConfirmStart}
        isPending={startProgrammeExecution.isPending}
        programName={startDateProgram?.name || ''}
      />
    </div>
  );
}
