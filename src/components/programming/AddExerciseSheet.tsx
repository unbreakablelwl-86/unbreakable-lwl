import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Search, Dumbbell, Loader2 } from 'lucide-react';
import type { Exercise } from '@/lib/exercise-types';
import { getExerciseGifUrl } from '@/lib/exercise-images';

interface AddExerciseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (exercise: { name: string; equipment: string; sets: number; reps: string }) => void;
  isAdding?: boolean;
}

export function AddExerciseSheet({ open, onOpenChange, onAddExercise, isAdding }: AddExerciseSheetProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customSets, setCustomSets] = useState('3');
  const [customReps, setCustomReps] = useState('10');

  // Load exercise library from JSON
  useEffect(() => {
    if (open && exercises.length === 0) {
      fetch('/data/exercises.json')
        .then(r => r.json())
        .then((data: Exercise[]) => setExercises(data))
        .catch(() => {});
    }
  }, [open, exercises.length]);

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return exercises
      .filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.primaryMuscles || []).some(m => m.toLowerCase().includes(q)) ||
        (e.equipment || '').toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [exercises, searchQuery]);

  const [librarySets, setLibrarySets] = useState<Record<string, string>>({});
  const [libraryReps, setLibraryReps] = useState<Record<string, string>>({});

  const handleLibrarySelect = (exercise: Exercise) => {
    onAddExercise({
      name: exercise.name,
      equipment: exercise.equipment || 'bodyweight',
      sets: parseInt(librarySets[exercise.id]) || 3,
      reps: libraryReps[exercise.id] || '10',
    });
    setSearchQuery('');
    setLibrarySets({});
    setLibraryReps({});
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    onAddExercise({
      name: customName.trim(),
      equipment: 'bodyweight',
      sets: parseInt(customSets) || 3,
      reps: customReps || '10',
    });
    setCustomName('');
    setCustomSets('3');
    setCustomReps('10');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] flex flex-col z-[70]">
        <SheetHeader className="pb-4 shrink-0">
          <SheetTitle className="font-display tracking-wide flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            ADD EXERCISE
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="library" className="flex-1 min-h-0 flex flex-col">
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="library" className="flex-1 font-display text-xs tracking-wide gap-1">
              <Search className="w-3 h-3" />
              LIBRARY
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex-1 font-display text-xs tracking-wide gap-1">
              <Dumbbell className="w-3 h-3" />
              CUSTOM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 min-h-0 flex flex-col gap-3 mt-3">
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search 1500+ exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex-1 min-h-0 max-h-[40vh] overflow-y-auto space-y-2 pb-4" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
              {searchQuery.trim() === '' ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Start typing to search exercises
                </p>
              ) : filteredExercises.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No exercises found. Try the Custom tab.
                </p>
              ) : (
                filteredExercises.map((exercise) => {
                  const gifUrl = getExerciseGifUrl(exercise);
                  return (
                    <Card
                      key={exercise.id}
                      className="p-3 border border-border bg-card hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {/* Exercise GIF thumbnail */}
                        {gifUrl && (
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                            <img
                              src={gifUrl}
                              alt={exercise.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-display text-foreground">{exercise.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {exercise.primaryMuscles?.slice(0, 2).map(m => (
                              <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                            ))}
                            {exercise.equipment && (
                              <Badge variant="secondary" className="text-[10px]">{exercise.equipment}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="Sets"
                            value={librarySets[exercise.id] || ''}
                            onChange={(e) => setLibrarySets(prev => ({ ...prev, [exercise.id]: e.target.value }))}
                            className="h-8 text-center text-xs"
                            min="1"
                            max="10"
                          />
                          <span className="text-[10px] text-muted-foreground text-center block">Sets</span>
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Reps"
                            value={libraryReps[exercise.id] || ''}
                            onChange={(e) => setLibraryReps(prev => ({ ...prev, [exercise.id]: e.target.value }))}
                            className="h-8 text-center text-xs"
                          />
                          <span className="text-[10px] text-muted-foreground text-center block">Reps</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isAdding}
                          onClick={() => !isAdding && handleLibrarySelect(exercise)}
                          className="shrink-0 gap-1 text-xs font-display h-8"
                        >
                          {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          ADD
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-3 space-y-4 pb-6">
            <div>
              <Label className="text-xs font-display tracking-wide">EXERCISE NAME</Label>
              <Input
                placeholder="e.g. Hammer Curls"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-display tracking-wide">SETS</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={customSets}
                  onChange={(e) => setCustomSets(e.target.value)}
                  className="mt-1"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <Label className="text-xs font-display tracking-wide">TARGET REPS</Label>
                <Input
                  placeholder="e.g. 10"
                  value={customReps}
                  onChange={(e) => setCustomReps(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              onClick={handleCustomAdd}
              disabled={!customName.trim() || isAdding}
              className="w-full gap-2 font-display tracking-wide"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              ADD TO SESSION
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
