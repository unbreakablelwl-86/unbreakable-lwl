import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Dumbbell,
  Calendar,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Link2,
  Flame,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useToast } from '@/hooks/use-toast';
import { InlineExerciseLibrary } from './InlineExerciseLibrary';
import { LibraryExercise } from '@/lib/exerciseLibrary';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface ProgramExercise {
  id: string;
  name: string;
  equipment: string;
  sets: number;
  reps: string;
  notes?: string;
  supersetGroupId?: string;
}

interface Superset {
  id: string;
  exercises: ProgramExercise[];
  restSeconds: number;
}

interface ProgramDay {
  id: string;
  name: string;
  exercises: ProgramExercise[];
  supersets: Superset[];
}

interface ManualProgramBuilderProps {
  onBack: () => void;
}

const TRAINING_DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'];

export function ManualProgramBuilder({ onBack }: ManualProgramBuilderProps) {
  const { user } = useAuth();
  const { saveProgram } = useTrainingPrograms();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [programName, setProgramName] = useState('My Custom Programme');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Day 1', 'Day 2', 'Day 3']);
  const [days, setDays] = useState<ProgramDay[]>([]);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const [selectedForSuperset, setSelectedForSuperset] = useState<string[]>([]);

  // Initialize days when selection changes
  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      const newSelection = prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => TRAINING_DAYS.indexOf(a) - TRAINING_DAYS.indexOf(b));
      
      setDays(currentDays => {
        const existingDayMap = new Map(currentDays.map(d => [d.name, d]));
        return newSelection.map(dayName => 
          existingDayMap.get(dayName) || {
            id: `day-${dayName.toLowerCase()}`,
            name: dayName,
            exercises: [],
            supersets: [],
          }
        );
      });

      return newSelection;
    });
  };

  const handleAddExercise = useCallback((exercise: LibraryExercise) => {
    if (!activeDay) return;

    const newExercise: ProgramExercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: exercise.name,
      equipment: exercise.equipment[0],
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
      notes: `${exercise.bodyPart} · ${exercise.equipment.join('/')}`,
    };

    setDays(prev => prev.map(day => 
      day.name === activeDay
        ? { ...day, exercises: [...day.exercises, newExercise] }
        : day
    ));

    toast({
      title: 'Exercise Added',
      description: `${exercise.name} added to ${activeDay}`,
    });
  }, [activeDay, toast]);

  const handleRemoveExercise = (dayName: string, exerciseId: string) => {
    setDays(prev => prev.map(day =>
      day.name === dayName
        ? { ...day, exercises: day.exercises.filter(e => e.id !== exerciseId) }
        : day
    ));
  };

  const handleUpdateExercise = (dayName: string, exerciseId: string, updates: Partial<ProgramExercise>) => {
    setDays(prev => prev.map(day =>
      day.name === dayName
        ? {
            ...day,
            exercises: day.exercises.map(e =>
              e.id === exerciseId ? { ...e, ...updates } : e
            ),
          }
        : day
    ));
  };

  const handleReorderExercises = (dayName: string, newOrder: ProgramExercise[]) => {
    setDays(prev => prev.map(day =>
      day.name === dayName ? { ...day, exercises: newOrder } : day
    ));
  };

  const toggleSelectForSuperset = (exerciseId: string) => {
    setSelectedForSuperset(prev =>
      prev.includes(exerciseId) ? prev.filter(id => id !== exerciseId) : [...prev, exerciseId]
    );
  };

  const createSuperset = (dayName: string) => {
    if (selectedForSuperset.length < 2) return;

    setDays(prev => prev.map(day => {
      if (day.name !== dayName) return day;
      const exercisesToGroup = day.exercises.filter(e => selectedForSuperset.includes(e.id));
      const remainingExercises = day.exercises.filter(e => !selectedForSuperset.includes(e.id));
      const newSuperset: Superset = {
        id: `ss-${Date.now()}`,
        exercises: exercisesToGroup,
        restSeconds: 60,
      };
      return {
        ...day,
        exercises: remainingExercises,
        supersets: [...day.supersets, newSuperset],
      };
    }));
    setSelectedForSuperset([]);
  };

  const ungroupSuperset = (dayName: string, supersetId: string) => {
    setDays(prev => prev.map(day => {
      if (day.name !== dayName) return day;
      const superset = day.supersets.find(s => s.id === supersetId);
      if (!superset) return day;
      return {
        ...day,
        exercises: [...day.exercises, ...superset.exercises],
        supersets: day.supersets.filter(s => s.id !== supersetId),
      };
    }));
  };

  const updateSupersetRest = (dayName: string, supersetId: string, restSeconds: number) => {
    setDays(prev => prev.map(day => {
      if (day.name !== dayName) return day;
      return {
        ...day,
        supersets: day.supersets.map(s =>
          s.id === supersetId ? { ...s, restSeconds } : s
        ),
      };
    }));
  };

  const handleSaveProgram = async () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please sign in to save your programme.', variant: 'destructive' });
      return;
    }
    if (days.length === 0 || days.every(d => d.exercises.length === 0)) {
      toast({ title: 'Empty Programme', description: 'Add at least one exercise to save your programme.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const programData = {
        programName,
        overview: `Custom ${selectedDays.length}-day programme`,
        weeklySchedule: days.map(d => ({ day: d.name, focus: d.name, type: 'strength' as const })),
        phases: [{ name: 'Custom Phase', weeks: '1-12', focus: 'Progressive Overload', notes: 'User-created programme' }],
        templateWeek: {
          days: days.map(d => ({
            day: d.name,
            sessionType: d.name,
            duration: '60 mins',
            warmup: '5-10 min dynamic stretching',
            exercises: d.exercises.map(e => ({
              name: e.name,
              equipment: e.equipment as 'barbell' | 'dumbbell' | 'bodyweight' | 'running',
              sets: e.sets,
              reps: e.reps,
              intensity: 'RPE 7-8',
              rest: '90-120s',
              notes: e.notes,
            })),
            cooldown: '5 min stretch',
          })),
        },
        progressionRules: ['Add weight when you complete all reps', 'Deload every 4th week'],
        nutritionTips: ['Prioritize protein intake', 'Stay hydrated'],
      };
      await saveProgram.mutateAsync({ program: programData });
      toast({ title: 'Programme Saved!', description: 'Your custom programme is now in My Programmes.' });
      onBack();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Save Failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExerciseExpand = (exerciseId: string) => {
    setExpandedExercises(prev => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 font-display tracking-wide text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          BACK
        </Button>
        <Button
          onClick={handleSaveProgram}
          disabled={isSaving || days.every(d => d.exercises.length === 0)}
          className="gap-2 font-display tracking-wide"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              SAVING...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              SAVE PROGRAMME
            </>
          )}
        </Button>
      </div>

      {/* Programme Name Card */}
      <Card className="border-primary/30 overflow-hidden border-border bg-card">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1" />
        <CardContent className="pt-5 pb-5">
          <label className="text-xs text-primary mb-2 block font-display tracking-widest">
            PROGRAMME NAME
          </label>
          <Input
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="My Custom Programme"
            className="text-lg font-display border-primary/20 focus:border-primary bg-background/50"
          />
        </CardContent>
      </Card>

      {/* Day Selection Card */}
      <Card className="border-primary/30 overflow-hidden border-border bg-card">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1" />
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wider flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-primary">SELECT</span> TRAINING DAYS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TRAINING_DAYS.map((day) => (
              <Button
                key={day}
                variant={selectedDays.includes(day) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDayToggle(day)}
                className={cn(
                  'font-display tracking-wide',
                  selectedDays.includes(day) && ' shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                )}
              >
                {day.toUpperCase()}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-display tracking-wide">
            {selectedDays.length} DAY{selectedDays.length !== 1 ? 'S' : ''} PER WEEK SELECTED
          </p>
        </CardContent>
      </Card>

      {/* Day Selection & Exercise Builder */}
      {days.length > 0 && (
        <Card className="border-primary/30 overflow-hidden border-border bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1" />
          <CardContent className="pt-5">
            {/* Day Dropdown Selector */}
            <div className="mb-5">
              <label className="text-xs text-primary mb-2 block font-display tracking-widest">
                SELECT DAY TO EDIT
              </label>
              <Select
                value={activeDay || days[0]?.name}
                onValueChange={(v) => setActiveDay(v)}
              >
                <SelectTrigger className="w-full border-primary/30 font-display tracking-wide">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.name} value={day.name} className="font-display tracking-wide">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-3.5 h-3.5 text-primary" />
                        {day.name.toUpperCase()}
                        {day.exercises.length > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 text-[10px] font-display bg-primary/20 text-primary border-primary/30">
                            {day.exercises.length} exercises
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Day Content */}
            {days.map((day) => {
              const isActive = (activeDay || days[0]?.name) === day.name;
              if (!isActive) return null;

              return (
                <div key={day.name}>
                  <div className={cn(!isMobile && 'grid lg:grid-cols-2 gap-4')}>
                    {/* Exercise List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between sticky top-0 z-10 bg-card py-2">
                        <h4 className="font-display text-xs tracking-widest text-primary">
                          {day.name.toUpperCase()} — EXERCISES
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveDay(day.name);
                            if (isMobile) {
                              setShowLibrary(true);
                            } else {
                              setShowLibrary(!showLibrary);
                            }
                          }}
                          className="gap-1.5 font-display tracking-wide text-xs border-primary/30 hover:border-primary hover:bg-primary/5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          ADD EXERCISE
                        </Button>
                      </div>

                      {/* Superset controls */}
                      {selectedForSuperset.length >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-primary" />
                            <span className="text-xs font-display tracking-wide">
                              {selectedForSuperset.length} SELECTED
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedForSuperset([])} className="font-display text-xs tracking-wide">
                              CANCEL
                            </Button>
                            <Button size="sm" onClick={() => createSuperset(day.name)} className="gap-1 font-display text-xs tracking-wide">
                              <Link2 className="w-3 h-3" />
                              CREATE SUPERSET
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {/* Supersets */}
                      {day.supersets.length > 0 && (
                        <div className="space-y-2">
                          {day.supersets.map((superset) => (
                            <Card key={superset.id} className="border-primary/40 bg-primary/5 p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge className="gap-1 bg-primary/20 text-primary border-primary/40 font-display tracking-wide text-[10px]">
                                  <Link2 className="w-3 h-3" />
                                  SUPERSET ({superset.exercises.length})
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground font-display">REST:</span>
                                  <Input
                                    type="number"
                                    value={superset.restSeconds}
                                    onChange={(e) => updateSupersetRest(day.name, superset.id, parseInt(e.target.value) || 60)}
                                    className="w-14 h-6 text-[10px]"
                                    min={15}
                                    max={300}
                                  />
                                  <span className="text-[10px] text-muted-foreground">s</span>
                                  <Button variant="ghost" size="icon" onClick={() => ungroupSuperset(day.name, superset.id)} className="h-6 w-6" title="Ungroup">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1.5 pl-4 border-l-2 border-primary/40">
                                {superset.exercises.map((ex, idx) => (
                                  <div key={ex.id} className="bg-card border border-border rounded p-2 flex items-center gap-2">
                                    <span className="text-xs font-display text-primary font-bold w-5">{String.fromCharCode(65 + idx)}</span>
                                    <div className="flex-1 min-w-0">
                                      <span className="font-medium text-xs truncate block">{ex.name}</span>
                                      <span className="text-[10px] text-muted-foreground">{ex.sets} × {ex.reps}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}

                      {day.exercises.length === 0 && day.supersets.length === 0 ? (
                        <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <Dumbbell className="w-6 h-6 text-primary/40" />
                          </div>
                          <p className="text-xs text-muted-foreground font-display tracking-wide">
                            NO EXERCISES YET
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Add from the library to start building
                          </p>
                        </div>
                      ) : (
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                          <Reorder.Group
                            axis="y"
                            values={day.exercises}
                            onReorder={(newOrder) => handleReorderExercises(day.name, newOrder)}
                            className="space-y-2"
                          >
                            {day.exercises.map((exercise, index) => (
                              <Reorder.Item
                                key={exercise.id}
                                value={exercise}
                                className={cn(
                                  'bg-card border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-colors',
                                  selectedForSuperset.includes(exercise.id)
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/30'
                                )}
                              >
                                <div className="p-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleSelectForSuperset(exercise.id)}
                                      className={cn(
                                        'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                                        selectedForSuperset.includes(exercise.id)
                                          ? 'bg-primary border-primary text-primary-foreground'
                                          : 'border-muted-foreground/40 hover:border-primary'
                                      )}
                                    >
                                      {selectedForSuperset.includes(exercise.id) && <Link2 className="w-3 h-3" />}
                                    </button>
                                    <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-display text-primary text-xs font-bold w-5">
                                          {index + 1}
                                        </span>
                                        <span className="font-medium text-sm truncate">
                                          {exercise.name}
                                        </span>
                                        <Badge variant="outline" className="text-[9px] capitalize shrink-0 font-display">
                                          {exercise.equipment}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => toggleExerciseExpand(exercise.id)}
                                      >
                                        {expandedExercises.has(exercise.id) ? (
                                          <ChevronUp className="w-4 h-4" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => handleRemoveExercise(day.name, exercise.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Quick stats row */}
                                  <div className="flex items-center gap-3 mt-1.5 pl-12 text-[10px] text-muted-foreground font-display tracking-wide">
                                    <span>{exercise.sets} SETS</span>
                                    <span className="text-primary">×</span>
                                    <span>{exercise.reps} REPS</span>
                                  </div>

                                  <AnimatePresence>
                                    {expandedExercises.has(exercise.id) && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="pt-3 mt-3 border-t border-primary/20 space-y-3">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <label className="text-[10px] text-primary font-display tracking-wider">SETS</label>
                                              <Input
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={exercise.sets}
                                                onChange={(e) => handleUpdateExercise(day.name, exercise.id, {
                                                  sets: parseInt(e.target.value) || 1,
                                                })}
                                                className="h-8 border-primary/20"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-primary font-display tracking-wider">REPS</label>
                                              <Input
                                                value={exercise.reps}
                                                onChange={(e) => handleUpdateExercise(day.name, exercise.id, {
                                                  reps: e.target.value,
                                                })}
                                                className="h-8 border-primary/20"
                                                placeholder="8-10"
                                              />
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-3 gap-2">
                                            <div>
                                              <label className="text-[10px] text-primary font-display tracking-wider">GROUP</label>
                                              <Select
                                                value={exercise.supersetGroupId || 'none'}
                                                onValueChange={(v) => handleUpdateExercise(day.name, exercise.id, {
                                                  supersetGroupId: v === 'none' ? undefined : v,
                                                })}
                                              >
                                                <SelectTrigger className="h-8 text-xs border-primary/20">
                                                  <SelectValue placeholder="None" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="none" className="text-xs">None</SelectItem>
                                                  <SelectItem value="SUPERSET A" className="text-xs">Superset A</SelectItem>
                                                  <SelectItem value="SUPERSET B" className="text-xs">Superset B</SelectItem>
                                                  <SelectItem value="SUPERSET C" className="text-xs">Superset C</SelectItem>
                                                  <SelectItem value="SUPERSET D" className="text-xs">Superset D</SelectItem>
                                                  <SelectItem value="CIRCUIT" className="text-xs">Circuit</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="col-span-2">
                                              <label className="text-[10px] text-primary font-display tracking-wider">NOTES</label>
                                              <Input
                                                value={exercise.notes || ''}
                                                onChange={(e) => handleUpdateExercise(day.name, exercise.id, {
                                                  notes: e.target.value,
                                                })}
                                                className="h-8 border-primary/20"
                                                placeholder="Optional notes..."
                                              />
                                            </div>
                                          </div>
                                          <Link
                                            to={`/help?q=${encodeURIComponent(exercise.name + ' form tips')}`}
                                            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-display tracking-wide"
                                          >
                                            <Flame className="w-3 h-3" />
                                            ASK YOUR COACH
                                          </Link>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        </div>
                      )}
                    </div>

                    {/* Exercise Library — Sheet on mobile, inline on desktop */}
                    {isMobile ? (
                      <Sheet open={showLibrary && activeDay === day.name} onOpenChange={setShowLibrary}>
                        <SheetContent side="bottom" className="h-[85vh] p-0">
                          <SheetHeader className="px-4 pt-4 pb-2">
                            <SheetTitle className="font-display tracking-wider text-sm">EXERCISE LIBRARY</SheetTitle>
                          </SheetHeader>
                          <div className="flex-1 overflow-y-auto px-2 pb-4">
                            <InlineExerciseLibrary
                              onSelectExercise={(ex) => { handleAddExercise(ex); }}
                              onClose={() => setShowLibrary(false)}
                              className="h-full"
                            />
                          </div>
                        </SheetContent>
                      </Sheet>
                    ) : (
                      <AnimatePresence>
                        {showLibrary && activeDay === day.name && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                          >
                            <InlineExerciseLibrary
                              onSelectExercise={handleAddExercise}
                              onClose={() => setShowLibrary(false)}
                              className="h-[450px]"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Coach Help Section */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent overflow-hidden border-border bg-card">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center neon-glow shrink-0">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-display tracking-wide">
                NEED HELP? <span className="text-primary">ASK YOUR COACH</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Get personalised guidance on exercise selection, form, and progression
              </p>
            </div>
            <Link to="/help" className="shrink-0">
              <Button variant="outline" size="sm" className="gap-1.5 font-display tracking-wide text-xs border-primary/30 hover:border-primary">
                <Flame className="w-3.5 h-3.5 text-primary" />
                COACH
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
