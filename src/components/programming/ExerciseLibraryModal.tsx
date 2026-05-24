import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  Plus,
  ChevronDown,
  Dumbbell,
  Lightbulb,
  MessageCircle,
} from 'lucide-react';
import {
  BODY_PARTS,
  EXERCISE_LIBRARY,
  getExercisesByBodyPart,
  searchExercises,
  LibraryExercise,
  BodyPart,
} from '@/lib/exerciseLibrary';
import { BodyPartIcon, BODY_PART_ICONS } from './BodyPartIcon';
import { Link } from 'react-router-dom';

interface ExerciseLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: LibraryExercise) => void;
}

export function ExerciseLibraryModal({
  open,
  onOpenChange,
  onSelectExercise,
}: ExerciseLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | 'all'>('all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const filteredExercises = useMemo(() => {
    let exercises = EXERCISE_LIBRARY;

    if (searchQuery) {
      exercises = searchExercises(searchQuery);
    } else if (selectedBodyPart !== 'all') {
      exercises = getExercisesByBodyPart(selectedBodyPart);
    }

    return exercises;
  }, [searchQuery, selectedBodyPart]);

  const handleSelect = (exercise: LibraryExercise) => {
    onSelectExercise(exercise);
    onOpenChange(false);
    setSearchQuery('');
    setExpandedExercise(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            EXERCISE LIBRARY
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Body Part Tabs */}
        <Tabs
          value={selectedBodyPart}
          onValueChange={(v) => {
            setSelectedBodyPart(v as BodyPart | 'all');
            setSearchQuery('');
          }}
          className="w-full"
        >
          <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All
            </TabsTrigger>
            {BODY_PART_ICONS.map((bp) => (
              <TabsTrigger
                key={bp.value}
                value={bp.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1"
              >
                <BodyPartIcon bodyPart={bp.value} size="sm" showGlow={false} />
                {bp.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Exercise List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2 pb-4">
            <AnimatePresence mode="popLayout">
              {filteredExercises.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  No exercises found. Try a different search or body part.
                </motion.div>
              ) : (
                filteredExercises.map((exercise) => (
                  <motion.div
                    key={exercise.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Collapsible
                      open={expandedExercise === exercise.id}
                      onOpenChange={(open) =>
                        setExpandedExercise(open ? exercise.id : null)
                      }
                    >
                      <div className="border border-border rounded-lg overflow-hidden bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    expandedExercise === exercise.id ? 'rotate-180' : ''
                                  }`}
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <div className="min-w-0">
                              <h4 className="font-medium truncate">{exercise.name}</h4>
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {exercise.bodyPart.replace('_', ' ')}
                                </Badge>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {exercise.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSelect(exercise)}
                            className="gap-1 shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </Button>
                        </div>

                        <CollapsibleContent>
                          <div className="px-3 pb-3 pt-0 border-t border-border mt-1 space-y-3">
                            <p className="text-sm text-muted-foreground pt-3">
                              {exercise.description}
                            </p>

                            {/* Equipment */}
                            <div className="flex flex-wrap gap-1">
                              {exercise.equipment.map((eq) => (
                                <Badge key={eq} variant="outline" className="text-xs capitalize">
                                  {eq}
                                </Badge>
                              ))}
                            </div>

                            {/* Tips */}
                            <div className="bg-surface/50 rounded-lg p-3">
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

                            {/* Alternatives */}
                            {exercise.alternatives.length > 0 && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Alternatives: </span>
                                <span>{exercise.alternatives.join(', ')}</span>
                              </div>
                            )}

                            {/* Help Hub Link */}
                            <Link
                              to={`/help?q=${encodeURIComponent(exercise.name)}`}
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Get coaching tips for {exercise.name}
                            </Link>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
