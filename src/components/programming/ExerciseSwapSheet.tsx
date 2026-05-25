import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shuffle, Loader2, Search, Dumbbell } from 'lucide-react';
import type { Exercise } from '@/lib/exercise-types';
import { getExerciseGifUrl } from '@/lib/exercise-images';

interface ExerciseSwapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  currentSets?: number;
  currentReps?: string;
  onSwap: (oldName: string, newExercise: { name: string; equipment: string; sets?: number; reps?: string }) => void;
  isSwapping?: boolean;
}

export function ExerciseSwapSheet({
  open,
  onOpenChange,
  exerciseName,
  currentSets,
  onSwap,
  isSwapping,
}: ExerciseSwapSheetProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load exercise library from JSON
  useEffect(() => {
    if (open && exercises.length === 0) {
      fetch('/data/exercises.json')
        .then(r => r.json())
        .then((data: Exercise[]) => setExercises(data))
        .catch(() => {});
    }
  }, [open, exercises.length]);

  // Find the current exercise to determine smart suggestions
  const currentExercise = useMemo(() => {
    const nameLower = exerciseName.toLowerCase();
    return exercises.find(e => e.name.toLowerCase() === nameLower);
  }, [exercises, exerciseName]);

  // Smart suggestions: same primary muscles, same category, then same equipment
  const suggestions = useMemo(() => {
    if (!currentExercise || exercises.length === 0) return [];
    const nameLower = exerciseName.toLowerCase();
    const primaryMuscles = new Set((currentExercise.primaryMuscles || []).map(m => m.toLowerCase()));

    const scored = exercises
      .filter(e => e.name.toLowerCase() !== nameLower)
      .map(e => {
        let score = 0;
        const ePrimary = (e.primaryMuscles || []).map(m => m.toLowerCase());
        const muscleOverlap = ePrimary.filter(m => primaryMuscles.has(m)).length;
        score += muscleOverlap * 3;
        if (e.category === currentExercise.category) score += 2;
        if (e.equipment === currentExercise.equipment) score += 1;
        return { exercise: e, score };
      })
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    return scored.map(s => ({
      exercise: s.exercise,
      reason: `${(s.exercise.primaryMuscles || []).join(', ')} — ${s.exercise.equipment || 'bodyweight'}`,
    }));
  }, [exercises, currentExercise, exerciseName]);

  // When searching, filter from full library
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return suggestions;
    const q = searchQuery.toLowerCase();
    const nameLower = exerciseName.toLowerCase();
    const matches = exercises
      .filter(e =>
        e.name.toLowerCase() !== nameLower &&
        (e.name.toLowerCase().includes(q) ||
         (e.primaryMuscles || []).some(m => m.toLowerCase().includes(q)) ||
         (e.equipment || '').toLowerCase().includes(q) ||
         (e.category || '').toLowerCase().includes(q))
      )
      .slice(0, 20)
      .map(e => ({
        exercise: e,
        reason: `${(e.primaryMuscles || []).join(', ')} — ${e.equipment || 'bodyweight'}`,
      }));
    return matches;
  }, [exercises, searchQuery, suggestions, exerciseName]);

  const handleSwapDirect = (exercise: Exercise) => {
    onSwap(exerciseName, {
      name: exercise.name,
      equipment: exercise.equipment || 'bodyweight',
      sets: currentSets,
      reps: undefined,
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setSearchQuery('');
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="z-[80] p-0">
        <div className="flex flex-col" style={{ maxHeight: '70vh' }}>
          {/* Fixed header */}
          <div className="p-6 pb-3">
            <SheetHeader>
              <SheetTitle className="font-display tracking-wide flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-primary" />
                SWAP EXERCISE
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                Swap <span className="text-foreground font-medium">{exerciseName}</span> for an alternative:
              </p>
            </SheetHeader>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search 1500+ exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Scrollable suggestions list */}
          <div
            className="flex-1 overflow-y-auto px-6 pb-6"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="space-y-2">
              {isSwapping && (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm font-display tracking-wide">SWAPPING...</span>
                </div>
              )}

              {!isSwapping && filteredResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {exercises.length === 0 ? 'Loading exercises...' : 'No alternatives found. Try a different search.'}
                </p>
              )}

              {!isSwapping && filteredResults.map(({ exercise, reason }) => {
                const gifUrl = getExerciseGifUrl(exercise);
                return (
                  <Card
                    key={exercise.id}
                    className="p-3 border border-border bg-card hover:border-primary/50 active:bg-primary/5 transition-colors cursor-pointer"
                    onClick={() => handleSwapDirect(exercise)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Exercise GIF thumbnail */}
                      {gifUrl && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img
                            src={gifUrl}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-display text-sm text-foreground">
                            {exercise.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {exercise.primaryMuscles?.slice(0, 2).map(m => (
                            <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                          ))}
                          {exercise.equipment && (
                            <Badge variant="secondary" className="text-[10px]">{exercise.equipment}</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1 font-display tracking-wide"
                      >
                        <Shuffle className="w-3 h-3" />
                        SWAP
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
