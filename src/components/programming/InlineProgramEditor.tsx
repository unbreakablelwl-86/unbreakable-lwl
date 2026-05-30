import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { canNotify } from '@/lib/notificationPrefs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Trash2, Save, ChevronUp, ChevronDown, Search, Shuffle, Dumbbell } from 'lucide-react';
import { GeneratedProgram, Exercise, WorkoutDay } from '@/lib/programTypes';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { EXERCISE_LIBRARY, BODY_PARTS, type BodyPart } from '@/lib/exerciseLibrary';
import { toast } from 'sonner';

const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'bodyweight', 'machine', 'cable', 'kettlebell', 'bands', 'cardio'] as const;

interface InlineProgramEditorProps {
  programId: string;
  programData: GeneratedProgram;
  onClose: () => void;
  onSaved: () => void;
}

export function InlineProgramEditor({ programId, programData, onClose, onSaved }: InlineProgramEditorProps) {
  const { updateProgram } = useTrainingPrograms();
  const [data, setData] = useState<GeneratedProgram>(JSON.parse(JSON.stringify(programData)));
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Exercise library picker state
  const [swapTarget, setSwapTarget] = useState<{ dayIdx: number; exIdx: number } | null>(null);
  const [addTarget, setAddTarget] = useState<number | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryBodyPart, setLibraryBodyPart] = useState<BodyPart | 'all'>('all');

  const days = data.templateWeek?.days || data.weeks?.[0]?.days || [];

  const updateDay = (dayIdx: number, updates: Partial<WorkoutDay>) => {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const target = copy.templateWeek?.days || copy.weeks?.[0]?.days;
      if (target) target[dayIdx] = { ...target[dayIdx], ...updates };
      return copy;
    });
  };

  const updateExercise = (dayIdx: number, exIdx: number, updates: Partial<Exercise>) => {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const target = copy.templateWeek?.days || copy.weeks?.[0]?.days;
      if (target?.[dayIdx]?.exercises) {
        target[dayIdx].exercises[exIdx] = { ...target[dayIdx].exercises[exIdx], ...updates };
      }
      return copy;
    });
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const target = copy.templateWeek?.days || copy.weeks?.[0]?.days;
      if (target?.[dayIdx]?.exercises) {
        target[dayIdx].exercises.splice(exIdx, 1);
      }
      return copy;
    });
  };

  const moveExercise = (dayIdx: number, exIdx: number, direction: 'up' | 'down') => {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const target = copy.templateWeek?.days || copy.weeks?.[0]?.days;
      if (!target?.[dayIdx]?.exercises) return copy;
      const exercises = target[dayIdx].exercises;
      const newIdx = direction === 'up' ? exIdx - 1 : exIdx + 1;
      if (newIdx < 0 || newIdx >= exercises.length) return copy;
      [exercises[exIdx], exercises[newIdx]] = [exercises[newIdx], exercises[exIdx]];
      return copy;
    });
  };

  const swapExerciseFromLibrary = (libExercise: typeof EXERCISE_LIBRARY[0]) => {
    if (swapTarget) {
      updateExercise(swapTarget.dayIdx, swapTarget.exIdx, {
        name: libExercise.name,
        equipment: libExercise.equipment[0] as any,
        sets: libExercise.defaultSets,
        reps: libExercise.defaultReps,
        notes: `${libExercise.bodyPart} · ${libExercise.equipment.join('/')}`,
      });
      setSwapTarget(null);
      setLibrarySearch('');
      setLibraryBodyPart('all');
    }
  };

  const addExerciseFromLibrary = (libExercise: typeof EXERCISE_LIBRARY[0]) => {
    if (addTarget !== null) {
      setData(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        const target = copy.templateWeek?.days || copy.weeks?.[0]?.days;
        if (target?.[addTarget]) {
          if (!target[addTarget].exercises) target[addTarget].exercises = [];
          target[addTarget].exercises.push({
            name: libExercise.name,
            equipment: libExercise.equipment[0],
            sets: libExercise.defaultSets,
            reps: libExercise.defaultReps,
            intensity: 'moderate',
            rest: '90s',
            notes: `${libExercise.bodyPart} · ${libExercise.equipment.join('/')}`,
          });
        }
        return copy;
      });
      setAddTarget(null);
      setLibrarySearch('');
      setLibraryBodyPart('all');
    }
  };

  const filteredLibrary = useMemo(() => {
    let results = EXERCISE_LIBRARY;
    if (libraryBodyPart !== 'all') {
      results = results.filter(e => e.bodyPart === libraryBodyPart);
    }
    if (librarySearch.trim()) {
      const q = librarySearch.toLowerCase();
      results = results.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.equipment.some(eq => eq.toLowerCase().includes(q)) ||
        e.bodyPart.toLowerCase().includes(q)
      );
    }
    return results.slice(0, 40);
  }, [librarySearch, libraryBodyPart]);

  const handleSave = () => setShowConfirm(true);

  const confirmSave = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      await updateProgram.mutateAsync({ programId, programData: data });

      // Sync pending session planners with updated programme exercises
      try {
        const updatedDays = data.templateWeek?.days || data.weeks?.[0]?.days || [];
        // Fetch all pending planners for this programme
        const { data: pendingPlanners } = await supabase
          .from('session_planners')
          .select('id, day_number')
          .eq('program_id', programId)
          .eq('status', 'pending');

        if (pendingPlanners && pendingPlanners.length > 0) {
          const updates = pendingPlanners.map(planner => {
            // day_number is 1-indexed, match to training days (skip rest days)
            const trainingDays = updatedDays.filter((d: WorkoutDay) => {
              const type = (d.sessionType || '').toLowerCase();
              return type !== 'rest' && type !== 'off' && type !== 'recovery';
            });
            const dayIdx = (planner.day_number - 1) % trainingDays.length;
            const matchedDay = trainingDays[dayIdx];
            if (!matchedDay) return null;

            return supabase
              .from('session_planners')
              .update({
                session_type: matchedDay.sessionType,
                planned_exercises: (matchedDay.exercises || []).map((ex: Exercise) => ({
                  name: ex.name,
                  equipment: ex.equipment,
                  sets: typeof ex.sets === 'number' ? ex.sets : parseInt(String(ex.sets)) || 3,
                  reps: ex.reps,
                  intensity: ex.intensity,
                  rest: ex.rest,
                  notes: ex.notes,
                })),
                warmup: matchedDay.warmup,
                cooldown: matchedDay.cooldown,
              })
              .eq('id', planner.id);
          });

          await Promise.all(updates.filter(Boolean));
        }
      } catch (syncErr) {
        console.error('Failed to sync session planners:', syncErr);
      }

      try {
        const { data: program } = await supabase
          .from('training_programs')
          .select('user_id, name')
          .eq('id', programId)
          .single();

        if (program && program.user_id && await canNotify(program.user_id, 'programme_updated')) {
          await supabase.from('notifications').insert({
            user_id: program.user_id,
            type: 'programme_updated',
            title: 'Programme Updated',
            body: `Your coach has updated your programme: "${program.name || 'Untitled'}"`,
            data: { program_id: programId, link: '/programming/my-programmes' },
          });
        }
      } catch (notifErr) {
        console.error('Failed to notify athlete:', notifErr);
      }

      toast.success('Programme updated and athlete notified');
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Failed to save programme');
    } finally {
      setSaving(false);
    }
  };

  const isLibraryOpen = swapTarget !== null || addTarget !== null;

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm tracking-wide text-foreground">EDIT PROGRAMME</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="font-display text-xs">
            <X className="w-3 h-3 mr-1" /> CANCEL
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="font-display text-xs">
            <Save className="w-3 h-3 mr-1" /> {saving ? 'SAVING...' : 'SAVE & PUBLISH'}
          </Button>
        </div>
      </div>

      {/* Programme Name */}
      <div>
        <label className="text-[10px] font-display tracking-wide text-muted-foreground">PROGRAMME NAME</label>
        <Input
          value={data.programName}
          onChange={e => setData(prev => ({ ...prev, programName: e.target.value }))}
          className="mt-1"
        />
      </div>

      {/* Day Selector Dropdown */}
      <div>
        <label className="text-[10px] font-display tracking-wide text-muted-foreground mb-1 block">SELECT DAY TO EDIT</label>
        <Select
          value={String(selectedDayIdx)}
          onValueChange={v => setSelectedDayIdx(parseInt(v))}
        >
          <SelectTrigger className="w-full font-display tracking-wide">
            <SelectValue placeholder="Select a day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day, idx) => (
              <SelectItem key={idx} value={String(idx)} className="font-display tracking-wide">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-3.5 h-3.5 text-primary" />
                  {day.day || `Day ${idx + 1}`} — {day.sessionType || 'Session'}
                  <span className="text-muted-foreground text-[10px]">({(day.exercises || []).length} exercises)</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {days.map((day, dayIdx) => {
        if (dayIdx !== selectedDayIdx) return null;
        return (
        <Card key={dayIdx} className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-1">
                <Input
                  value={day.day || ''}
                  onChange={e => updateDay(dayIdx, { day: e.target.value })}
                  className="font-display text-sm h-7"
                  placeholder="Day name"
                />
                <Input
                  value={day.sessionType || ''}
                  onChange={e => updateDay(dayIdx, { sessionType: e.target.value })}
                  className="text-xs h-6"
                  placeholder="Session type"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Warmup */}
            <div>
              <label className="text-[10px] font-display tracking-wide text-muted-foreground">WARMUP</label>
              <Textarea
                value={day.warmup || ''}
                onChange={e => updateDay(dayIdx, { warmup: e.target.value })}
                className="mt-1 text-xs min-h-[40px]"
                rows={1}
              />
            </div>

            {/* Exercises */}
            <div className="space-y-2">
              <p className="text-[10px] font-display tracking-wide text-muted-foreground">EXERCISES</p>
              {(day.exercises || []).map((ex, exIdx) => (
                <div key={exIdx} className="border border-border rounded-lg p-2 space-y-2">
                  <div className="flex items-center gap-1">
                    {/* Reorder arrows */}
                    <div className="flex flex-col shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        disabled={exIdx === 0}
                        onClick={() => moveExercise(dayIdx, exIdx, 'up')}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        disabled={exIdx === (day.exercises || []).length - 1}
                        onClick={() => moveExercise(dayIdx, exIdx, 'down')}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Exercise name (read-only, swap via library) */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{ex.name}</p>
                      <Badge variant="outline" className="text-[9px] mt-0.5">{ex.equipment}</Badge>
                    </div>

                    {/* Swap button */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => {
                        setSwapTarget({ dayIdx, exIdx });
                        setLibrarySearch('');
                        setLibraryBodyPart('all');
                      }}
                    >
                      <Shuffle className="w-3 h-3 text-primary" />
                    </Button>

                    {/* Delete */}
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeExercise(dayIdx, exIdx)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>

                  {/* Sets / Reps / RPE / Rest */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <div>
                      <label className="text-[9px] text-muted-foreground">Sets</label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={String(ex.sets)}
                        onChange={e => updateExercise(dayIdx, exIdx, { sets: parseInt(e.target.value) || 3 })}
                        className="text-xs h-6"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Reps</label>
                      <Input
                        value={ex.reps}
                        onChange={e => updateExercise(dayIdx, exIdx, { reps: e.target.value })}
                        className="text-xs h-6"
                        placeholder="8-12"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">RPE / Intensity</label>
                      <Select
                        value={ex.intensity}
                        onValueChange={v => updateExercise(dayIdx, exIdx, { intensity: v })}
                      >
                        <SelectTrigger className="text-xs h-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light" className="text-xs">Light (RPE 5-6)</SelectItem>
                          <SelectItem value="moderate" className="text-xs">Moderate (RPE 7)</SelectItem>
                          <SelectItem value="hard" className="text-xs">Hard (RPE 8)</SelectItem>
                          <SelectItem value="very_hard" className="text-xs">Very Hard (RPE 9)</SelectItem>
                          <SelectItem value="max" className="text-xs">Max (RPE 10)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Rest</label>
                      <Select
                        value={ex.rest}
                        onValueChange={v => updateExercise(dayIdx, exIdx, { rest: v })}
                      >
                        <SelectTrigger className="text-xs h-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30s" className="text-xs">30s</SelectItem>
                          <SelectItem value="60s" className="text-xs">60s</SelectItem>
                          <SelectItem value="90s" className="text-xs">90s</SelectItem>
                          <SelectItem value="120s" className="text-xs">2min</SelectItem>
                          <SelectItem value="180s" className="text-xs">3min</SelectItem>
                          <SelectItem value="300s" className="text-xs">5min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Superset / Circuit tag + Notes */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[9px] text-muted-foreground">Group</label>
                      <Select
                        value={ex.notes?.match(/^(SUPERSET [A-D]|CIRCUIT)$/)?.[0] || 'none'}
                        onValueChange={v => {
                          const cleanNotes = (ex.notes || '').replace(/^(SUPERSET [A-D]|CIRCUIT)\s*·?\s*/, '').trim();
                          const newNotes = v === 'none' ? cleanNotes : `${v}${cleanNotes ? ' · ' + cleanNotes : ''}`;
                          updateExercise(dayIdx, exIdx, { notes: newNotes || undefined });
                        }}
                      >
                        <SelectTrigger className="text-xs h-6">
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
                      <label className="text-[9px] text-muted-foreground">Notes</label>
                      <Input
                        value={ex.notes || ''}
                        onChange={e => updateExercise(dayIdx, exIdx, { notes: e.target.value })}
                        className="text-xs h-6"
                        placeholder="Notes (optional)"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-7 font-display tracking-wide"
                onClick={() => {
                  setAddTarget(dayIdx);
                  setLibrarySearch('');
                  setLibraryBodyPart('all');
                }}
              >
                <Plus className="w-3 h-3 mr-1" /> ADD FROM LIBRARY
              </Button>
            </div>

            {/* Cooldown */}
            <div>
              <label className="text-[10px] font-display tracking-wide text-muted-foreground">COOLDOWN</label>
              <Textarea
                value={day.cooldown || ''}
                onChange={e => updateDay(dayIdx, { cooldown: e.target.value })}
                className="mt-1 text-xs min-h-[40px]"
                rows={1}
              />
            </div>
          </CardContent>
        </Card>
        );
      })}

      {/* Exercise Library Sheet */}
      <Sheet open={isLibraryOpen} onOpenChange={(open) => {
        if (!open) { setSwapTarget(null); setAddTarget(null); }
      }}>
        <SheetContent side="bottom" className="max-h-[80vh] flex flex-col z-[60]">
          <SheetHeader className="pb-4 shrink-0">
            <SheetTitle className="font-display tracking-wide flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              {swapTarget ? 'SWAP EXERCISE' : 'ADD EXERCISE'}
            </SheetTitle>
            {swapTarget && (
              <p className="text-sm text-muted-foreground">
                Replace <span className="text-foreground font-medium">
                  {days[swapTarget.dayIdx]?.exercises?.[swapTarget.exIdx]?.name}
                </span>
              </p>
            )}
          </SheetHeader>

          <div className="flex-1 min-h-0 flex flex-col gap-3">
            {/* Search */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={librarySearch}
                onChange={e => setLibrarySearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Body part filter tabs */}
            <div className="flex gap-1 flex-wrap shrink-0">
              <Button
                variant={libraryBodyPart === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-6 text-[10px] font-display tracking-wide px-2"
                onClick={() => setLibraryBodyPart('all')}
              >
                ALL
              </Button>
              {BODY_PARTS.map(bp => (
                <Button
                  key={bp.value}
                  variant={libraryBodyPart === bp.value ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 text-[10px] font-display tracking-wide px-2"
                  onClick={() => setLibraryBodyPart(bp.value)}
                >
                  {bp.label.toUpperCase()}
                </Button>
              ))}
            </div>

            {/* Results */}
            <div className="flex-1 min-h-0 max-h-[45vh] overflow-y-auto" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
              <div className="space-y-1.5 pb-6">
                {filteredLibrary.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No exercises found</p>
                )}
                {filteredLibrary.map(exercise => (
                  <div
                    key={exercise.id}
                    className="p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between gap-2"
                    onClick={() => {
                      if (swapTarget) swapExerciseFromLibrary(exercise);
                      else addExerciseFromLibrary(exercise);
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded bg-muted text-muted-foreground text-[10px] flex items-center justify-center font-display shrink-0">
                          {exercise.bodyPart[0].toUpperCase()}
                        </span>
                        <p className="text-sm font-medium text-foreground">{exercise.name}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {exercise.equipment.join(', ')} • {exercise.defaultSets}×{exercise.defaultReps}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 h-7 text-xs font-display">
                      {swapTarget ? 'SWAP' : 'ADD'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Publish Programme Changes</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the athlete's programme and notify them of the changes. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Save & Notify</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
