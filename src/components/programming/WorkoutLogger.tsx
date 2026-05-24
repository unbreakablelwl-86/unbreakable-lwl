import { useState } from 'react';
import { ExerciseLog } from '@/hooks/useWorkoutSessions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dumbbell, 
  Footprints, 
  Battery,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutLoggerProps {
  exerciseLogs: ExerciseLog[];
  onUpdateLog: (logId: string, data: {
    actualReps?: number;
    weightKg?: number;
    rpe?: number;
    completed?: boolean;
    notes?: string;
  }) => void;
  onStartRest: (exerciseType: string) => void;
  mode: 'quick' | 'guided';
}

const equipmentIcons: Record<string, React.ReactNode> = {
  barbell: <Dumbbell className="w-4 h-4" />,
  dumbbell: <Dumbbell className="w-4 h-4" />,
  bodyweight: <Battery className="w-4 h-4" />,
  running: <Footprints className="w-4 h-4" />,
};

const equipmentColors: Record<string, string> = {
  barbell: 'bg-primary/20 text-primary border-primary/30',
  dumbbell: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  bodyweight: 'bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30',
  running: 'bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30',
};

// Group logs by exercise
function groupByExercise(logs: ExerciseLog[]) {
  const groups: Record<string, ExerciseLog[]> = {};
  logs.forEach((log) => {
    if (!groups[log.exercise_name]) {
      groups[log.exercise_name] = [];
    }
    groups[log.exercise_name].push(log);
  });
  return Object.entries(groups);
}

export function WorkoutLogger({ exerciseLogs, onUpdateLog, onStartRest, mode }: WorkoutLoggerProps) {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});
  
  const groupedExercises = groupByExercise(exerciseLogs);
  const completedCount = exerciseLogs.filter((l) => l.completed).length;
  const totalCount = exerciseLogs.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSetComplete = (log: ExerciseLog, completed: boolean) => {
    onUpdateLog(log.id, { completed });
    if (completed) {
      onStartRest(log.equipment);
    }
  };

  if (mode === 'guided') {
    // Find the first incomplete set
    const currentLog = exerciseLogs.find((l) => !l.completed);
    const currentIndex = currentLog ? exerciseLogs.indexOf(currentLog) : exerciseLogs.length;

    return (
      <div className="space-y-4">
        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} sets
          </span>
        </div>

        {currentLog ? (
          <GuidedSetCard
            log={currentLog}
            setNumber={currentIndex + 1}
            totalSets={totalCount}
            onComplete={(data) => {
              onUpdateLog(currentLog.id, { ...data, completed: true });
              onStartRest(currentLog.equipment);
            }}
          />
        ) : (
          <Card className="p-8 text-center border-[#FF5500] bg-[#FF5500]/10 border-border bg-card">
            <Check className="w-12 h-12 text-[#FF5500] mx-auto mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">All Sets Complete!</h3>
            <p className="text-muted-foreground">Great work on your workout.</p>
          </Card>
        )}

        {/* Exercise Overview */}
        <div className="space-y-2">
          {groupedExercises.map(([exerciseName, logs]) => {
            const exerciseComplete = logs.every((l) => l.completed);
            const setsComplete = logs.filter((l) => l.completed).length;
            
            return (
              <div
                key={exerciseName}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  exerciseComplete
                    ? 'border-[#FF5500]/30 bg-[#FF5500]/5'
                    : logs[0] === currentLog
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={equipmentColors[logs[0].equipment] || ''}>
                    {equipmentIcons[logs[0].equipment]}
                  </Badge>
                  <span className="text-foreground">{exerciseName}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {setsComplete}/{logs.length} sets
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Quick Log Mode
  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{totalCount} sets
        </span>
      </div>

      {/* Exercise Cards */}
      {groupedExercises.map(([exerciseName, logs]) => {
        const isExpanded = expandedExercise === exerciseName;
        const exerciseComplete = logs.every((l) => l.completed);
        const setsComplete = logs.filter((l) => l.completed).length;

        return (
          <Card
            key={exerciseName}
            className={`border transition-colors ${
              exerciseComplete ? 'border-[#FF5500]/30 bg-[#FF5500]/5' : 'border-border bg-card'
            }`}
          >
            <button
              onClick={() => setExpandedExercise(isExpanded ? null : exerciseName)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`${equipmentColors[logs[0].equipment] || ''} gap-1`}>
                  {equipmentIcons[logs[0].equipment]}
                  {logs[0].equipment}
                </Badge>
                <span className="font-display text-foreground">{exerciseName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {setsComplete}/{logs.length} sets
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
                      <div className="col-span-1">Set</div>
                      <div className="col-span-3">Target</div>
                      <div className="col-span-3">Reps</div>
                      <div className="col-span-3">Weight</div>
                      <div className="col-span-2">Done</div>
                    </div>

                    {logs.map((log) => (
                      <QuickSetRow
                        key={log.id}
                        log={log}
                        onUpdate={(data) => onUpdateLog(log.id, data)}
                        onComplete={(completed) => handleSetComplete(log, completed)}
                        showNotes={showNotes[log.id]}
                        onToggleNotes={() => setShowNotes((prev) => ({ ...prev, [log.id]: !prev[log.id] }))}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}

function QuickSetRow({
  log,
  onUpdate,
  onComplete,
  showNotes,
  onToggleNotes,
}: {
  log: ExerciseLog;
  onUpdate: (data: { actualReps?: number; weightKg?: number; notes?: string }) => void;
  onComplete: (completed: boolean) => void;
  showNotes: boolean;
  onToggleNotes: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-1">
          <span className="font-display text-primary">{log.set_number}</span>
        </div>
        <div className="col-span-3">
          <span className="text-sm text-muted-foreground">{log.target_reps}</span>
        </div>
        <div className="col-span-3">
          <Input
            type="number"
            placeholder="Reps"
            value={log.actual_reps || ''}
            onChange={(e) => onUpdate({ actualReps: parseInt(e.target.value) || undefined })}
            className="h-8 text-center"
          />
        </div>
        <div className="col-span-3">
          <Input
            type="number"
            placeholder="kg"
            step="2.5"
            value={log.weight_kg || ''}
            onChange={(e) => onUpdate({ weightKg: parseFloat(e.target.value) || undefined })}
            className="h-8 text-center"
          />
        </div>
        <div className="col-span-2 flex items-center justify-center gap-1">
          <Checkbox
            checked={log.completed}
            onCheckedChange={(checked) => onComplete(!!checked)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggleNotes}
          >
            <MessageSquare className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Input
              placeholder="Notes for this set..."
              value={log.notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className="h-8 text-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GuidedSetCard({
  log,
  setNumber,
  totalSets,
  onComplete,
}: {
  log: ExerciseLog;
  setNumber: number;
  totalSets: number;
  onComplete: (data: { actualReps: number; weightKg?: number; rpe?: number }) => void;
}) {
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [rpe, setRpe] = useState<string>('');

  const handleComplete = () => {
    onComplete({
      actualReps: parseInt(reps) || 0,
      weightKg: parseFloat(weight) || undefined,
      rpe: parseFloat(rpe) || undefined,
    });
    setReps('');
    setWeight('');
    setRpe('');
  };

  return (
    <Card className="p-6 border-primary bg-primary/5 border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <Badge variant="outline" className={`${equipmentColors[log.equipment] || ''} gap-1`}>
          {equipmentIcons[log.equipment]}
          {log.equipment}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Set {setNumber} of {totalSets}
        </span>
      </div>

      <h3 className="font-display text-2xl text-foreground mb-2">{log.exercise_name}</h3>
      <p className="text-lg text-primary mb-6">Target: {log.target_reps} reps</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Reps Done</label>
          <Input
            type="number"
            placeholder="0"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="text-center text-lg font-display"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
          <Input
            type="number"
            placeholder="0"
            step="2.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="text-center text-lg font-display"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">RPE</label>
          <Input
            type="number"
            placeholder="7"
            min="1"
            max="10"
            step="0.5"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            className="text-center text-lg font-display"
          />
        </div>
      </div>

      <Button onClick={handleComplete} className="w-full gap-2" size="lg">
        <Check className="w-5 h-5" />
        Complete Set
      </Button>
    </Card>
  );
}
