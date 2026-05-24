import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GripVertical, Trash2, Link2, Unlink } from 'lucide-react';
import { EQUIPMENT_OPTIONS } from '@/lib/exerciseLibrary';
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
}

interface SupersetGroupProps {
  superset: Superset;
  onUpdate: (updates: Partial<Superset>) => void;
  onUpdateExercise: (exerciseId: string, updates: Partial<SupersetExercise>) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onUngroup: () => void;
  onRemove: () => void;
}

export function SupersetGroup({
  superset,
  onUpdate,
  onUpdateExercise,
  onRemoveExercise,
  onUngroup,
  onRemove,
}: SupersetGroupProps) {
  return (
    <Card className="border-primary/40 bg-primary/5 p-3 space-y-2 border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          <Badge className="gap-1 bg-primary/20 text-primary border-primary/40">
            <Link2 className="w-3 h-3" />
            Superset ({superset.exercises.length})
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUngroup}
            className="h-7 w-7"
            title="Ungroup superset"
          >
            <Unlink className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-7 w-7 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 pl-6 border-l-2 border-primary/30">
        {superset.exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            layout
            className="bg-card border border-border rounded-lg p-2.5 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-display text-primary w-5 shrink-0">
                {String.fromCharCode(65 + index)}
              </span>
              <Input
                value={exercise.name}
                onChange={(e) =>
                  onUpdateExercise(exercise.id, { name: e.target.value })
                }
                placeholder="Exercise name"
                className="h-7 text-sm font-medium flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveExercise(exercise.id)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <Select
                value={exercise.equipment}
                onValueChange={(v) =>
                  onUpdateExercise(exercise.id, { equipment: v })
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <SelectItem key={eq.value} value={eq.value}>
                      {eq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={exercise.sets}
                onChange={(e) =>
                  onUpdateExercise(exercise.id, {
                    sets: parseInt(e.target.value) || 1,
                  })
                }
                placeholder="Sets"
                className="h-7 text-xs text-center"
                min={1}
              />
              <Input
                value={exercise.reps}
                onChange={(e) =>
                  onUpdateExercise(exercise.id, { reps: e.target.value })
                }
                placeholder="Reps"
                className="h-7 text-xs"
              />
              <Input
                value={exercise.notes || ''}
                onChange={(e) =>
                  onUpdateExercise(exercise.id, { notes: e.target.value })
                }
                placeholder="Notes"
                className="h-7 text-xs"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground pl-6">
        Perform exercises back-to-back with minimal rest between.
      </p>
    </Card>
  );
}
