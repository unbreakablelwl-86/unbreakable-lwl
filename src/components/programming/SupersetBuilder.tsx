import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  GripVertical,
  Trash2,
  Link2,
  Unlink,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SupersetExercise {
  id: string;
  name: string;
  equipment: string;
  sets: number;
  reps: string;
  notes?: string;
}

export interface Superset {
  id: string;
  exercises: SupersetExercise[];
  restSeconds?: number;
}

interface SupersetBuilderProps {
  exercises: SupersetExercise[];
  supersets: Superset[];
  onUpdateExercises: (exercises: SupersetExercise[]) => void;
  onUpdateSupersets: (supersets: Superset[]) => void;
  onRemoveExercise: (id: string) => void;
}

export function SupersetBuilder({
  exercises,
  supersets,
  onUpdateExercises,
  onUpdateSupersets,
  onRemoveExercise,
}: SupersetBuilderProps) {
  const [selectedForSuperset, setSelectedForSuperset] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedForSuperset(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const createSuperset = () => {
    if (selectedForSuperset.length < 2) return;

    // Get exercises to group
    const exercisesToGroup = exercises.filter(e => selectedForSuperset.includes(e.id));
    
    // Remove from main list
    const remainingExercises = exercises.filter(e => !selectedForSuperset.includes(e.id));
    
    // Create new superset
    const newSuperset: Superset = {
      id: `ss-${Date.now()}`,
      exercises: exercisesToGroup,
      restSeconds: 60,
    };

    onUpdateExercises(remainingExercises);
    onUpdateSupersets([...supersets, newSuperset]);
    setSelectedForSuperset([]);
  };

  const ungroupSuperset = (supersetId: string) => {
    const superset = supersets.find(s => s.id === supersetId);
    if (!superset) return;

    // Add exercises back to main list
    onUpdateExercises([...exercises, ...superset.exercises]);
    onUpdateSupersets(supersets.filter(s => s.id !== supersetId));
  };

  const removeFromSuperset = (supersetId: string, exerciseId: string) => {
    const superset = supersets.find(s => s.id === supersetId);
    if (!superset) return;

    const exercise = superset.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const updatedExercises = superset.exercises.filter(e => e.id !== exerciseId);
    
    if (updatedExercises.length < 2) {
      // Ungroup if less than 2 exercises
      onUpdateExercises([...exercises, ...superset.exercises]);
      onUpdateSupersets(supersets.filter(s => s.id !== supersetId));
    } else {
      onUpdateSupersets(
        supersets.map(s =>
          s.id === supersetId ? { ...s, exercises: updatedExercises } : s
        )
      );
      onUpdateExercises([...exercises, exercise]);
    }
  };

  const updateSupersetRest = (supersetId: string, restSeconds: number) => {
    onUpdateSupersets(
      supersets.map(s =>
        s.id === supersetId ? { ...s, restSeconds } : s
      )
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Superset Creation Controls */}
      {selectedForSuperset.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {selectedForSuperset.length} exercises selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedForSuperset([])}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={createSuperset}
              disabled={selectedForSuperset.length < 2}
              className="gap-1"
            >
              <Link2 className="w-3 h-3" />
              Create Superset
            </Button>
          </div>
        </motion.div>
      )}

      {/* Supersets */}
      <AnimatePresence>
        {supersets.map((superset) => (
          <motion.div
            key={superset.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-primary/40 bg-primary/5 p-3 space-y-3 border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <Badge className="gap-1 bg-primary/20 text-primary border-primary/40">
                    <Link2 className="w-3 h-3" />
                    Superset ({superset.exercises.length})
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Rest:</span>
                    <Input
                      type="number"
                      value={superset.restSeconds || 60}
                      onChange={(e) => updateSupersetRest(superset.id, parseInt(e.target.value) || 60)}
                      className="w-16 h-7 text-xs"
                      min={15}
                      max={300}
                    />
                    <span className="text-xs text-muted-foreground">s</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => ungroupSuperset(superset.id)}
                    className="h-7 w-7"
                    title="Ungroup superset"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pl-6 border-l-2 border-primary/30">
                {superset.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="bg-card border border-border rounded-lg p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display text-primary w-5 shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm truncate block">
                          {exercise.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromSuperset(superset.id, exercise.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground pl-6">
                Perform exercises back-to-back, rest {superset.restSeconds || 60}s after each round.
              </p>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Regular Exercises */}
      <Reorder.Group
        axis="y"
        values={exercises}
        onReorder={onUpdateExercises}
        className="space-y-2"
      >
        {exercises.map((exercise) => {
          const isSelected = selectedForSuperset.includes(exercise.id);
          const isExpanded = expandedItems.has(exercise.id);

          return (
            <Reorder.Item
              key={exercise.id}
              value={exercise}
              className={cn(
                "bg-card border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-colors",
                isSelected ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSelect(exercise.id)}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground hover:border-primary"
                    )}
                  >
                    {isSelected && <Link2 className="w-3 h-3" />}
                  </button>
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate block">
                      {exercise.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {exercise.sets} × {exercise.reps} · {exercise.equipment}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleExpand(exercise.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onRemoveExercise(exercise.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t border-border text-sm text-muted-foreground">
                        <p>Click the link icon to select exercises for superset grouping.</p>
                        {exercise.notes && (
                          <p className="mt-2">Notes: {exercise.notes}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {exercises.length === 0 && supersets.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No exercises added yet.</p>
        </div>
      )}
    </div>
  );
}
