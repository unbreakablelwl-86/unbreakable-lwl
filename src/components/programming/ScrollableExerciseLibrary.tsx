import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  Plus,
  ChevronDown,
  Lightbulb,
  MessageCircle,
  Filter,
  Link2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  EXERCISE_LIBRARY,
  EQUIPMENT_OPTIONS,
  getExercisesByBodyPart,
  searchExercises,
  LibraryExercise,
  BodyPart,
  Equipment,
} from '@/lib/exerciseLibrary';
import { BodyPartIcon, BODY_PART_ICONS } from './BodyPartIcon';
import { cn } from '@/lib/utils';
import { findCoachingDataByName } from '@/lib/exerciseCoachingData';
import { ExerciseCoachingPanel } from './ExerciseCoachingPanel';

interface ScrollableExerciseLibraryProps {
  onSelectExercise: (exercise: LibraryExercise) => void;
  selectedExercises?: string[];
  onToggleSuperset?: (exerciseId: string) => void;
  supersetMode?: boolean;
  className?: string;
}

export function ScrollableExerciseLibrary({
  onSelectExercise,
  selectedExercises = [],
  onToggleSuperset,
  supersetMode = false,
  className,
}: ScrollableExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'all'>('all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredExercises = useMemo(() => {
    let exercises = EXERCISE_LIBRARY;

    if (searchQuery) {
      exercises = searchExercises(searchQuery);
    } else if (selectedBodyPart !== 'all') {
      exercises = getExercisesByBodyPart(selectedBodyPart);
    }

    if (selectedEquipment !== 'all') {
      exercises = exercises.filter((ex) =>
        ex.equipment.includes(selectedEquipment)
      );
    }

    return exercises;
  }, [searchQuery, selectedBodyPart, selectedEquipment]);

  // Group exercises by body part for sticky headers
  const groupedExercises = useMemo(() => {
    if (selectedBodyPart !== 'all' || searchQuery) {
      return { [selectedBodyPart === 'all' ? 'results' : selectedBodyPart]: filteredExercises };
    }
    
    const groups: Record<string, LibraryExercise[]> = {};
    BODY_PART_ICONS.forEach(({ value }) => {
      const exercises = filteredExercises.filter((ex) => ex.bodyPart === value);
      if (exercises.length > 0) {
        groups[value] = exercises;
      }
    });
    return groups;
  }, [filteredExercises, selectedBodyPart, searchQuery]);

  const handleSelect = useCallback((exercise: LibraryExercise) => {
    onSelectExercise(exercise);
  }, [onSelectExercise]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search & Filters Header */}
      <div className="space-y-3 pb-4 border-b border-border">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedBodyPart('all');
            }}
            className="pl-10 border-primary/40 focus:border-primary"
          />
        </div>

        {/* Body Part Tabs */}
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={selectedBodyPart === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedBodyPart('all');
              setSearchQuery('');
            }}
            className="h-8 text-xs"
          >
            All
          </Button>
          {BODY_PART_ICONS.map(({ value, label, Icon }) => (
            <Button
              key={value}
              variant={selectedBodyPart === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedBodyPart(value);
                setSearchQuery('');
              }}
              className={cn(
                'h-8 text-xs gap-1.5',
                selectedBodyPart === value && ''
              )}
            >
              <Icon className={cn(
                'w-3.5 h-3.5',
                selectedBodyPart === value && 'drop-shadow-[0_0_4px_hsl(var(--primary-foreground)/0.6)]'
              )} />
              {label}
            </Button>
          ))}
        </div>

        {/* Equipment Filter Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-7 text-xs gap-1"
          >
            <Filter className="w-3 h-3" />
            Equipment
            <ChevronDown className={cn('w-3 h-3 transition-transform', showFilters && 'rotate-180')} />
          </Button>
          
          {supersetMode && (
            <Badge variant="outline" className="text-xs border-primary text-primary gap-1">
              <Link2 className="w-3 h-3" />
              Superset Mode
            </Badge>
          )}
        </div>

        {/* Equipment Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 pt-2">
                <Button
                  variant={selectedEquipment === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedEquipment('all')}
                  className="h-7 text-xs"
                >
                  All
                </Button>
                {EQUIPMENT_OPTIONS.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={selectedEquipment === value ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedEquipment(value)}
                    className="h-7 text-xs"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable Exercise List */}
      <ScrollArea className="flex-1 min-h-0 max-h-[60vh]">
        <div className="space-y-1 py-3 px-1">
          {Object.entries(groupedExercises).map(([bodyPart, exercises]) => (
            <div key={bodyPart} className="mb-4">
              {/* Sticky Header */}
              {selectedBodyPart === 'all' && !searchQuery && (
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-1 px-1 mb-2 border-b border-primary/20">
                  <div className="flex items-center gap-2">
                    <BodyPartIcon bodyPart={bodyPart as BodyPart} size="sm" />
                    <span className="font-display text-sm text-primary uppercase tracking-wide">
                      {BODY_PART_ICONS.find(bp => bp.value === bodyPart)?.label || bodyPart}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {exercises.length}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Exercise Cards */}
              <div className="space-y-2">
                {exercises.map((exercise) => (
                  <Collapsible
                    key={exercise.id}
                    open={expandedExercise === exercise.id}
                    onOpenChange={(open) =>
                      setExpandedExercise(open ? exercise.id : null)
                    }
                  >
                    <div className="border border-border rounded-lg overflow-hidden bg-card hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {supersetMode && onToggleSuperset && (
                            <Checkbox
                              checked={selectedExercises.includes(exercise.id)}
                              onCheckedChange={() => onToggleSuperset(exercise.id)}
                              className="border-primary data-[state=checked]:bg-primary"
                            />
                          )}
                          <CollapsibleTrigger asChild>
                            <button className="flex items-center gap-2 flex-1 min-w-0 text-left">
                              <BodyPartIcon bodyPart={exercise.bodyPart} size="sm" showGlow={false} />
                              <div className="min-w-0">
                                <h4 className="font-medium text-sm truncate">{exercise.name}</h4>
                                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                  <Badge variant="outline" className="text-[10px] h-4 capitalize">
                                    {exercise.equipment[0]}
                                  </Badge>
                                  <Badge variant="secondary" className="text-[10px] h-4 capitalize">
                                    {exercise.difficulty}
                                  </Badge>
                                </div>
                              </div>
                              <ChevronDown
                                className={cn(
                                  'w-4 h-4 text-muted-foreground transition-transform shrink-0',
                                  expandedExercise === exercise.id && 'rotate-180'
                                )}
                              />
                            </button>
                          </CollapsibleTrigger>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSelect(exercise)}
                          className="gap-1 shrink-0 ml-2 h-8"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </Button>
                      </div>

                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-0 border-t border-border mt-1 space-y-3">
                          <p className="text-sm text-muted-foreground pt-3">
                            {exercise.description}
                          </p>

                          {/* Equipment Tags */}
                          <div className="flex flex-wrap gap-1">
                            {exercise.equipment.map((eq) => (
                              <Badge key={eq} variant="outline" className="text-xs capitalize">
                                {eq}
                              </Badge>
                            ))}
                          </div>

                          {/* Full Coaching Panel or Fallback */}
                          {(() => {
                            const coaching = findCoachingDataByName(exercise.name);
                            if (coaching) {
                              return (
                                <ExerciseCoachingPanel
                                  coachingData={coaching}
                                  exerciseName={exercise.name}
                                />
                              );
                            }
                            return (
                              <>
                                <div className="bg-surface/50 rounded-lg p-3 border border-primary/10">
                                  <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                                    <Lightbulb className="w-4 h-4" />
                                    Tips
                                  </div>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {exercise.tips.map((tip, i) => (
                                      <li key={i}>• {tip}</li>
                                    ))}
                                  </ul>
                                </div>

                                {exercise.alternatives.length > 0 && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Alternatives: </span>
                                    <span>{exercise.alternatives.join(', ')}</span>
                                  </div>
                                )}

                                <Link
                                  to={`/help?q=${encodeURIComponent(exercise.name)}`}
                                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Get coaching tips for {exercise.name}
                                </Link>
                              </>
                            );
                          })()}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </div>
          ))}

          {filteredExercises.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No exercises found. Try a different search or filter.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
