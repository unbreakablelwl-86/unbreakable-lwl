import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Calendar,
  Library,
  Sparkles,
  RotateCcw,
  Edit3,
  MessageCircle,
  Link2,
  Unlink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useAuth } from '@/hooks/useAuth';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { InlineExerciseLibrary } from './InlineExerciseLibrary';
import {
  SplitType,
  SPLIT_TYPES,
  EQUIPMENT_OPTIONS,
  getSplitDayNames,
  LibraryExercise,
} from '@/lib/exerciseLibrary';
import { GeneratedProgram, WorkoutDay, Exercise } from '@/lib/programTypes';
import { Link } from 'react-router-dom';

interface ProgrammeExercise {
  id: string;
  name: string;
  equipment: string;
  sets: number;
  reps: string;
  notes?: string;
  supersetGroupId?: string; // Links exercises together in a superset
}

interface ProgrammeDay {
  id: string;
  name: string;
  exercises: ProgrammeExercise[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function ProgrammeBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveProgram } = useTrainingPrograms();

  // Builder state
  const [step, setStep] = useState<'setup' | 'build' | 'preview'>('setup');
  const [programmeName, setProgrammeName] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [splitType, setSplitType] = useState<SplitType>('upper_lower');
  const [days, setDays] = useState<ProgrammeDay[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [targetDayId, setTargetDayId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [showInlineLibrary, setShowInlineLibrary] = useState<string | null>(null);

  // Initialize days based on split
  const initializeDays = useCallback(() => {
    const dayNames = getSplitDayNames(splitType, daysPerWeek);
    const newDays: ProgrammeDay[] = dayNames.map((name, index) => ({
      id: generateId(),
      name,
      exercises: [],
    }));
    setDays(newDays);
    setExpandedDay(newDays[0]?.id || null);
    setStep('build');
  }, [splitType, daysPerWeek]);

  // Add exercise from library (modal)
  const handleAddFromLibrary = (dayId: string) => {
    setTargetDayId(dayId);
    setLibraryOpen(true);
  };

  // Toggle inline library for a specific day
  const handleToggleInlineLibrary = (dayId: string) => {
    setShowInlineLibrary(showInlineLibrary === dayId ? null : dayId);
    setTargetDayId(dayId);
  };

  // Handle exercise selection from inline library
  const handleInlineSelect = (exercise: LibraryExercise, dayId: string) => {
    const newExercise: ProgrammeExercise = {
      id: generateId(),
      name: exercise.name,
      equipment: exercise.equipment[0],
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
    };

    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      )
    );

    toast({
      title: 'Exercise Added',
      description: `${exercise.name} added to your workout.`,
    });
  };

  const handleSelectExercise = (exercise: LibraryExercise) => {
    if (!targetDayId) return;

    const newExercise: ProgrammeExercise = {
      id: generateId(),
      name: exercise.name,
      equipment: exercise.equipment[0],
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
    };

    setDays((prev) =>
      prev.map((day) =>
        day.id === targetDayId
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      )
    );

    toast({
      title: 'Exercise Added',
      description: `${exercise.name} added to your workout.`,
    });
  };

  // Add custom exercise
  const handleAddCustomExercise = (dayId: string) => {
    const newExercise: ProgrammeExercise = {
      id: generateId(),
      name: '',
      equipment: 'barbell',
      sets: 3,
      reps: '8-10',
    };

    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      )
    );
  };

  // Update exercise
  const handleUpdateExercise = (
    dayId: string,
    exerciseId: string,
    updates: Partial<ProgrammeExercise>
  ) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, ...updates } : ex
              ),
            }
          : day
      )
    );
  };

  // Remove exercise
  const handleRemoveExercise = (dayId: string, exerciseId: string) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? { ...day, exercises: day.exercises.filter((ex) => ex.id !== exerciseId) }
          : day
      )
    );
  };

  // Reorder exercises within a day
  const handleReorderExercises = (dayId: string, newOrder: ProgrammeExercise[]) => {
    setDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, exercises: newOrder } : day))
    );
  };

  // Toggle exercise selection for superset
  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  // Create superset from selected exercises
  const handleCreateSuperset = (dayId: string) => {
    if (selectedExercises.size < 2) {
      toast({
        title: 'Select More Exercises',
        description: 'Select at least 2 exercises to create a superset.',
        variant: 'destructive',
      });
      return;
    }

    const supersetGroupId = generateId();
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((ex) =>
                selectedExercises.has(ex.id)
                  ? { ...ex, supersetGroupId }
                  : ex
              ),
            }
          : day
      )
    );

    setSelectedExercises(new Set());
    toast({
      title: 'Superset Created',
      description: `${selectedExercises.size} exercises grouped into a superset.`,
    });
  };

  // Remove exercise from superset (unlink)
  const handleRemoveFromSuperset = (dayId: string, exerciseId: string) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, supersetGroupId: undefined } : ex
              ),
            }
          : day
      )
    );
  };

  // Get unique superset groups in a day
  const getSupersetGroups = (exercises: ProgrammeExercise[]) => {
    const groups = new Map<string, ProgrammeExercise[]>();
    exercises.forEach((ex) => {
      if (ex.supersetGroupId) {
        const existing = groups.get(ex.supersetGroupId) || [];
        groups.set(ex.supersetGroupId, [...existing, ex]);
      }
    });
    return groups;
  };

  // Update day name
  const handleUpdateDayName = (dayId: string, name: string) => {
    setDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, name } : day))
    );
  };

  // Save programme
  const handleSaveProgramme = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to save your programme.',
        variant: 'destructive',
      });
      return;
    }

    if (!programmeName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please give your programme a name.',
        variant: 'destructive',
      });
      return;
    }

    const hasExercises = days.some((day) => day.exercises.length > 0);
    if (!hasExercises) {
      toast({
        title: 'No Exercises',
        description: 'Add at least one exercise to your programme.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Convert to GeneratedProgram format
      const program: GeneratedProgram = {
        programName: programmeName,
        overview: `Custom ${SPLIT_TYPES.find((s) => s.value === splitType)?.label} programme with ${daysPerWeek} training days per week.`,
        weeklySchedule: days.map((day) => ({
          day: day.name,
          focus: day.name,
          type: 'strength' as const,
        })),
        phases: [
          {
            name: 'Main Phase',
            weeks: '1-12',
            focus: 'Progressive overload',
            notes: 'Focus on consistent training and gradual progression.',
          },
        ],
        templateWeek: {
          days: days.map((day) => ({
            day: day.name,
            sessionType: day.name,
            duration: '45-60 mins',
            warmup: '5-10 mins light cardio and dynamic stretching',
            exercises: day.exercises.map((ex) => ({
              name: ex.name,
              equipment: ex.equipment as Exercise['equipment'],
              sets: ex.sets,
              reps: ex.reps,
              intensity: 'RPE 7-8',
              rest: '90-120s',
              notes: ex.notes,
            })),
            cooldown: '5 mins stretching',
          })),
        },
        progressionRules: [
          'Increase weight by 2.5-5kg when you can complete all sets with good form',
          'If you fail a weight, use the same weight next session',
          'Take a deload week every 4-6 weeks',
        ],
        nutritionTips: [
          'Aim for 1.6-2.2g protein per kg bodyweight',
          'Stay hydrated - drink at least 2-3L water daily',
          'Eat 300-500 calories above maintenance for muscle gain',
        ],
      };

      await saveProgram.mutateAsync({ program });

      // Reset builder
      setStep('setup');
      setProgrammeName('');
      setDays([]);
      setExpandedDay(null);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset builder
  const handleReset = () => {
    setStep('setup');
    setProgrammeName('');
    setDays([]);
    setExpandedDay(null);
  };

  return (
    <>
      <Card className="border-primary/20 border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            BUILD YOUR OWN PROGRAMME
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Select your days, splits, and exercises from our library to create a programme
            tailored to you.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Setup */}
            {step === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Programme Name */}
                <div className="space-y-2">
                  <Label>Programme Name</Label>
                  <Input
                    placeholder="e.g., My Strength Programme"
                    value={programmeName}
                    onChange={(e) => setProgrammeName(e.target.value)}
                  />
                </div>

                {/* Days Per Week */}
                <div className="space-y-2">
                  <Label>Training Days Per Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {[2, 3, 4, 5, 6].map((num) => (
                      <Button
                        key={num}
                        variant={daysPerWeek === num ? 'default' : 'outline'}
                        onClick={() => setDaysPerWeek(num)}
                        className="w-12"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Split Type */}
                <div className="space-y-2">
                  <Label>Split Type</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SPLIT_TYPES.filter((split) =>
                      split.daysRequired.includes(daysPerWeek)
                    ).map((split) => (
                      <Button
                        key={split.value}
                        variant={splitType === split.value ? 'default' : 'outline'}
                        onClick={() => setSplitType(split.value)}
                        className="justify-start h-auto py-3 px-4"
                      >
                        <div className="text-left">
                          <div className="font-medium">{split.label}</div>
                          <div className="text-xs opacity-80">{split.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Start Building */}
                <Button
                  onClick={initializeDays}
                  disabled={!programmeName.trim()}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Calendar className="w-5 h-5" />
                  Start Building
                </Button>
              </motion.div>
            )}

            {/* Step 2: Build */}
            {step === 'build' && (
              <motion.div
                key="build"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Programme Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg">{programmeName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {daysPerWeek} days •{' '}
                      {SPLIT_TYPES.find((s) => s.value === splitType)?.label}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Start Over
                  </Button>
                </div>

                {/* Days */}
                <div className="space-y-3">
                  {days.map((day, dayIndex) => (
                    <Collapsible
                      key={day.id}
                      open={expandedDay === day.id}
                      onOpenChange={(open) => setExpandedDay(open ? day.id : null)}
                    >
                      <div className="border border-border rounded-lg overflow-hidden bg-card">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display">
                                {dayIndex + 1}
                              </div>
                              <div>
                                <h4 className="font-medium">{day.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {day.exercises.length} exercises
                                </p>
                              </div>
                            </div>
                            {expandedDay === day.id ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t border-border p-4 space-y-4">
                            {/* Day Name Edit */}
                            <div className="flex items-center gap-2">
                              <Edit3 className="w-4 h-4 text-muted-foreground" />
                              <Input
                                value={day.name}
                                onChange={(e) =>
                                  handleUpdateDayName(day.id, e.target.value)
                                }
                                className="h-8"
                              />
                            </div>

                            {/* Superset Creation Button */}
                            {selectedExercises.size >= 2 && (
                              <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg">
                                <Link2 className="w-4 h-4 text-primary" />
                                <span className="text-sm text-primary flex-1">
                                  {selectedExercises.size} exercises selected
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => handleCreateSuperset(day.id)}
                                  className="gap-1"
                                >
                                  <Link2 className="w-3 h-3" />
                                  Create Superset
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedExercises(new Set())}
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}

                            {/* Exercises */}
                            {day.exercises.length > 0 ? (
                              <Reorder.Group
                                axis="y"
                                values={day.exercises}
                                onReorder={(newOrder) =>
                                  handleReorderExercises(day.id, newOrder)
                                }
                                className="space-y-2"
                              >
                                {day.exercises.map((exercise) => {
                                  const isInSuperset = !!exercise.supersetGroupId;
                                  const supersetGroup = exercise.supersetGroupId 
                                    ? day.exercises.filter(e => e.supersetGroupId === exercise.supersetGroupId)
                                    : [];
                                  const isFirstInSuperset = isInSuperset && supersetGroup[0]?.id === exercise.id;
                                  const supersetLetter = isInSuperset 
                                    ? String.fromCharCode(65 + supersetGroup.findIndex(e => e.id === exercise.id))
                                    : null;

                                  return (
                                    <Reorder.Item
                                      key={exercise.id}
                                      value={exercise}
                                      className={`bg-surface border rounded-lg p-3 cursor-grab active:cursor-grabbing ${
                                        isInSuperset 
                                          ? 'border-primary/40 bg-primary/5' 
                                          : 'border-border'
                                      } ${selectedExercises.has(exercise.id) ? 'ring-2 ring-primary' : ''}`}
                                    >
                                      <div className="flex items-start gap-3">
                                        {/* Checkbox for superset selection */}
                                        <Checkbox
                                          checked={selectedExercises.has(exercise.id)}
                                          onCheckedChange={() => toggleExerciseSelection(exercise.id)}
                                          className="mt-2"
                                        />
                                        <GripVertical className="w-4 h-4 text-muted-foreground mt-2 shrink-0" />
                                        
                                        {/* Superset indicator */}
                                        {isInSuperset && (
                                          <div className="flex flex-col items-center shrink-0">
                                            <Badge 
                                              variant="outline" 
                                              className="h-6 w-6 p-0 flex items-center justify-center text-xs bg-primary/20 text-primary border-primary/40"
                                            >
                                              {supersetLetter}
                                            </Badge>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-5 w-5 mt-1"
                                              onClick={() => handleRemoveFromSuperset(day.id, exercise.id)}
                                              title="Remove from superset"
                                            >
                                              <Unlink className="w-3 h-3 text-muted-foreground" />
                                            </Button>
                                          </div>
                                        )}

                                        <div className="flex-1 space-y-2">
                                          <Input
                                            value={exercise.name}
                                            onChange={(e) =>
                                              handleUpdateExercise(day.id, exercise.id, {
                                                name: e.target.value,
                                              })
                                            }
                                            placeholder="Exercise name"
                                            className="h-8 font-medium"
                                          />
                                          <div className="grid grid-cols-4 gap-2">
                                            <Select
                                              value={exercise.equipment}
                                              onValueChange={(v) =>
                                                handleUpdateExercise(day.id, exercise.id, {
                                                  equipment: v,
                                                })
                                              }
                                            >
                                              <SelectTrigger className="h-8 text-xs">
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
                                                handleUpdateExercise(day.id, exercise.id, {
                                                  sets: parseInt(e.target.value) || 1,
                                                })
                                              }
                                              placeholder="Sets"
                                              className="h-8 text-xs"
                                            />
                                            <Input
                                              value={exercise.reps}
                                              onChange={(e) =>
                                                handleUpdateExercise(day.id, exercise.id, {
                                                  reps: e.target.value,
                                                })
                                              }
                                              placeholder="Reps"
                                              className="h-8 text-xs"
                                            />
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-destructive hover:text-destructive"
                                              onClick={() =>
                                                handleRemoveExercise(day.id, exercise.id)
                                              }
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                          <Input
                                            value={exercise.notes || ''}
                                            onChange={(e) =>
                                              handleUpdateExercise(day.id, exercise.id, {
                                                notes: e.target.value,
                                              })
                                            }
                                            placeholder="Notes (tempo, rest, etc.)"
                                            className="h-8 text-xs"
                                          />
                                        </div>
                                      </div>
                                    </Reorder.Item>
                                  );
                                })}
                              </Reorder.Group>
                            ) : (
                              <div className="text-center py-6 text-muted-foreground text-sm">
                                No exercises yet. Add from the library or create custom.
                              </div>
                            )}

                            {/* Add Exercise Buttons */}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={showInlineLibrary === day.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleInlineLibrary(day.id)}
                                className="gap-1"
                              >
                                <Library className="w-4 h-4" />
                                {showInlineLibrary === day.id ? 'Hide Library' : 'Browse Library'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddFromLibrary(day.id)}
                                className="gap-1"
                              >
                                <Sparkles className="w-4 h-4" />
                                Full Library
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddCustomExercise(day.id)}
                                className="gap-1"
                              >
                                <Plus className="w-4 h-4" />
                                Custom
                              </Button>
                            </div>

                            {/* Inline Exercise Library */}
                            <AnimatePresence>
                              {showInlineLibrary === day.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <InlineExerciseLibrary
                                    onSelectExercise={(exercise) => handleInlineSelect(exercise, day.id)}
                                    onClose={() => setShowInlineLibrary(null)}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Superset Instructions */}
                            {day.exercises.length >= 2 && selectedExercises.size === 0 && !showInlineLibrary && (
                              <p className="text-xs text-muted-foreground text-center">
                                Tip: Select exercises using checkboxes to group them into a superset
                              </p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>

                {/* Help Hub Link */}
                <Link
                  to="/help"
                  className="flex items-center gap-2 text-sm text-primary hover:underline justify-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  Need help building your programme? Chat with our coach
                </Link>

                {/* Save Button */}
                <Button
                  onClick={handleSaveProgramme}
                  disabled={isSaving}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save to My Programmes'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Exercise Library Modal */}
      <ExerciseLibraryModal
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onSelectExercise={handleSelectExercise}
      />
    </>
  );
}
