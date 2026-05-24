import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link2 } from 'lucide-react';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Dumbbell,
  Clock,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { findCoachingDataByName } from '@/lib/exerciseCoachingData';
import { ExerciseCoachingPanel } from '@/components/programming/ExerciseCoachingPanel';

interface ManualExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  duration?: number;
  notes?: string;
  equipment: string;
  group?: string;
}

const EQUIPMENT_OPTIONS = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'machine', label: 'Machine' },
  { value: 'cable', label: 'Cable' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'bands', label: 'Resistance Bands' },
  { value: 'cardio', label: 'Cardio / Circuit' },
];

const QUICK_TEMPLATES = [
  {
    name: 'Upper Body',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '8-10', equipment: 'barbell' },
      { name: 'Bent Over Row', sets: 4, reps: '8-10', equipment: 'barbell' },
      { name: 'Overhead Press', sets: 3, reps: '10-12', equipment: 'dumbbell' },
      { name: 'Pull Ups', sets: 3, reps: '8-12', equipment: 'bodyweight' },
    ],
  },
  {
    name: 'Leg Day',
    exercises: [
      { name: 'Squat', sets: 4, reps: '6-8', equipment: 'barbell' },
      { name: 'Romanian Deadlift', sets: 4, reps: '8-10', equipment: 'barbell' },
      { name: 'Leg Press', sets: 3, reps: '10-12', equipment: 'machine' },
      { name: 'Lunges', sets: 3, reps: '12 each', equipment: 'dumbbell' },
    ],
  },
  {
    name: 'Push Day',
    exercises: [
      { name: 'Incline Bench Press', sets: 4, reps: '8-10', equipment: 'barbell' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', equipment: 'dumbbell' },
      { name: 'Cable Flyes', sets: 3, reps: '12-15', equipment: 'cable' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', equipment: 'cable' },
    ],
  },
  {
    name: 'Pull Day',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: '5-6', equipment: 'barbell' },
      { name: 'Lat Pulldown', sets: 4, reps: '10-12', equipment: 'cable' },
      { name: 'Seated Cable Row', sets: 3, reps: '10-12', equipment: 'cable' },
      { name: 'Bicep Curls', sets: 3, reps: '12-15', equipment: 'dumbbell' },
    ],
  },
  {
    name: 'Conditioning',
    exercises: [
      { name: 'Kettlebell Swings', sets: 4, reps: '15', equipment: 'kettlebell' },
      { name: 'Battle Ropes', sets: 4, reps: '30s', equipment: 'cardio' },
      { name: 'Sled Push', sets: 4, reps: '20m', equipment: 'cardio' },
      { name: 'Burpees', sets: 3, reps: '10', equipment: 'bodyweight' },
      { name: 'Medicine Ball Slams', sets: 3, reps: '12', equipment: 'cardio' },
    ],
  },
];

export function ManualWorkoutBuilder() {
  const { user } = useAuth();
  const { startSession } = useWorkoutSessions();
  const { toast } = useToast();
  
  const [exercises, setExercises] = useState<ManualExercise[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [expandedCoachingIds, setExpandedCoachingIds] = useState<Set<string>>(new Set());
  
  // Form state for adding new exercise
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: '8-10',
    weight: '',
    duration: '',
    notes: '',
    equipment: 'barbell',
    group: '',
  });

  // Live coaching data lookup as user types exercise name
  const liveCoachingData = useMemo(() => {
    if (newExercise.name.trim().length < 2) return undefined;
    return findCoachingDataByName(newExercise.name.trim());
  }, [newExercise.name]);

  const toggleCoaching = (id: string) => {
    setExpandedCoachingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleAddExercise = () => {
    if (!newExercise.name.trim()) {
      toast({
        title: 'Exercise name required',
        description: 'Please enter an exercise name.',
        variant: 'destructive',
      });
      return;
    }

    const exercise: ManualExercise = {
      id: generateId(),
      name: newExercise.name.trim(),
      sets: newExercise.sets,
      reps: newExercise.reps,
      weight: newExercise.weight ? parseFloat(newExercise.weight) : undefined,
      duration: newExercise.duration ? parseInt(newExercise.duration) : undefined,
      notes: newExercise.notes || undefined,
      equipment: newExercise.equipment,
      group: newExercise.group || undefined,
    };

    setExercises([...exercises, exercise]);
    setNewExercise({
      name: '',
      sets: 3,
      reps: '8-10',
      weight: '',
      duration: '',
      notes: '',
      equipment: 'barbell',
      group: '',
    });
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const handleLoadTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    const templateExercises = template.exercises.map((ex) => ({
      ...ex,
      id: generateId(),
    }));
    setExercises([...exercises, ...templateExercises]);
    setSessionName(template.name);
    toast({
      title: 'Template loaded',
      description: `${template.name} exercises added to your workout.`,
    });
  };

  const handleLogSession = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please sign in to log your workout.',
        variant: 'destructive',
      });
      return;
    }

    if (exercises.length === 0) {
      toast({
        title: 'No exercises',
        description: 'Add at least one exercise to your workout.',
        variant: 'destructive',
      });
      return;
    }

    setIsLogging(true);

    try {
      await startSession.mutateAsync({
        weekNumber: 1,
        dayName: sessionName || 'Manual Workout',
        sessionType: sessionName || 'Manual Workout',
        exercises: exercises.map((ex) => ({
          name: ex.name,
          equipment: ex.equipment,
          sets: ex.sets,
          reps: ex.reps,
        })),
      });

      // Reset form
      setExercises([]);
      setSessionName('');
      
      toast({
        title: 'Workout started!',
        description: 'Your workout session is now active.',
      });
    } catch (error) {
      console.error('Failed to log session:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const handleClearAll = () => {
    setExercises([]);
    setSessionName('');
  };

  return (
    <Card className="border-primary/20 border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          MANUAL WORKOUT BUILDER
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Name */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Workout Name (optional)
          </label>
          <Input
            placeholder="e.g., Upper Body, Leg Day..."
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>

        {/* Quick Templates */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Quick Templates
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((template) => (
              <Button
                key={template.name}
                variant="outline"
                size="sm"
                onClick={() => handleLoadTemplate(template)}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Add Exercise Form */}
        <div className="p-4 border border-border rounded-lg bg-surface/50 space-y-4">
          <h4 className="font-display text-sm text-foreground">ADD EXERCISE</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Exercise Name</label>
              <Input
                placeholder="e.g., Bench Press, Squat..."
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddExercise()}
              />
              {/* Live coaching data preview */}
              <AnimatePresence>
                {liveCoachingData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="text-xs font-display text-primary tracking-wide">COACHING DATA FOUND</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{liveCoachingData.purpose}</p>
                    <ExerciseCoachingPanel
                      coachingData={liveCoachingData}
                      exerciseName={newExercise.name}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Equipment</label>
              <Select
                value={newExercise.equipment}
                onValueChange={(v) => setNewExercise({ ...newExercise, equipment: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Sets</label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Reps</label>
                <Input
                  placeholder="8-10"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Weight (kg) - optional</label>
              <Input
                type="number"
                step="2.5"
                placeholder="0"
                value={newExercise.weight}
                onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Duration (mins) - optional
              </label>
              <Input
                type="number"
                placeholder="0"
                value={newExercise.duration}
                onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                Group (optional)
              </label>
              <Select
                value={newExercise.group || 'none'}
                onValueChange={(v) => setNewExercise({ ...newExercise, group: v === 'none' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Superset A">Superset A</SelectItem>
                  <SelectItem value="Superset B">Superset B</SelectItem>
                  <SelectItem value="Superset C">Superset C</SelectItem>
                  <SelectItem value="Superset D">Superset D</SelectItem>
                  <SelectItem value="Circuit">Circuit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
              <Textarea
                placeholder="Any notes for this exercise..."
                value={newExercise.notes}
                onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <Button onClick={handleAddExercise} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add to Workout
          </Button>
        </div>

        {/* Current Session Display */}
        <AnimatePresence>
          {exercises.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm text-foreground">
                  CURRENT WORKOUT ({exercises.length} exercises)
                </h4>
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-destructive">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>

              <Reorder.Group
                axis="y"
                values={exercises}
                onReorder={setExercises}
                className="space-y-2"
              >
                {exercises.map((exercise) => {
                  const coaching = findCoachingDataByName(exercise.name);
                  const isExpanded = expandedCoachingIds.has(exercise.id);
                  return (
                    <Reorder.Item
                      key={exercise.id}
                      value={exercise}
                      className="rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs capitalize">
                              {exercise.equipment}
                            </Badge>
                            <span className="font-medium text-sm">{exercise.name}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{exercise.sets} sets</span>
                            <span>×</span>
                            <span>{exercise.reps} reps</span>
                            {exercise.weight && <span>{exercise.weight}kg</span>}
                            {exercise.duration && <span>{exercise.duration}min</span>}
                            {exercise.group && (
                              <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">
                                {exercise.group}
                              </Badge>
                            )}
                          </div>
                          {exercise.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {coaching && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:text-primary"
                              onClick={() => toggleCoaching(exercise.id)}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveExercise(exercise.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {coaching && isExpanded && (
                          <ExerciseCoachingPanel
                            coachingData={coaching}
                            exerciseName={exercise.name}
                          />
                        )}
                      </AnimatePresence>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>

              <Button
                onClick={handleLogSession}
                disabled={isLogging || exercises.length === 0}
                className="w-full gap-2"
                size="lg"
              >
                <Save className="w-5 h-5" />
                {isLogging ? 'Starting Session...' : 'Start Workout Session'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
