import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft, Search, Filter, X,
  Dumbbell, Flame, Lightbulb, Link2,
} from 'lucide-react';
import { getExerciseGifUrl } from '@/lib/exercise-images';
import { EXERCISE_GIF_IDS } from '@/lib/exercise-library-gifs';
import {
  EXERCISE_LIBRARY, CARDIO_EXERCISES, EQUIPMENT_OPTIONS,
  findExerciseByName,
  type LibraryExercise, type BodyPart, type Equipment,
} from '@/lib/exerciseLibrary';
import { BodyPartIcon, BODY_PART_ICONS } from '@/components/programming/BodyPartIcon';
import { findCoachingDataByName } from '@/lib/exerciseCoachingData';
import { ExerciseCoachingPanel } from '@/components/programming/ExerciseCoachingPanel';
import { PaywallGate } from '@/components/paywall';

/* -- All exercises in the curated library (main set + cardio equipment) -- */
const ALL_EXERCISES: LibraryExercise[] = [...EXERCISE_LIBRARY, ...CARDIO_EXERCISES];

const DIFFICULTY_FILTERS: LibraryExercise['difficulty'][] = ['beginner', 'intermediate', 'advanced'];

/* Legacy deep-link support: the old page used ?muscle=<free-exercise-db muscle>,
   e.g. from Programming.tsx's old quick-link chips. Map the ones that still
   have a live link into the new, coarser body part groups. */
const LEGACY_MUSCLE_TO_BODY_PART: Record<string, BodyPart> = {
  chest: 'chest', shoulders: 'shoulders', biceps: 'arms', triceps: 'arms', forearms: 'arms',
  lats: 'back', 'middle back': 'back', 'lower back': 'back', traps: 'back',
  quadriceps: 'legs', hamstrings: 'legs', calves: 'legs', glutes: 'glutes', abdominals: 'core',
};

function getGifUrlFor(exercise: LibraryExercise): string {
  const dbId = EXERCISE_GIF_IDS[exercise.id];
  return dbId ? getExerciseGifUrl({ exerciseDbId: dbId }) : '';
}

/* -- Exercise Detail Panel -- */
function ExerciseDetail({
  exercise,
  onClose,
  onJumpTo,
}: {
  exercise: LibraryExercise;
  onClose: () => void;
  onJumpTo: (ex: LibraryExercise) => void;
}) {
  const gifSrc = getGifUrlFor(exercise);
  const coaching = findCoachingDataByName(exercise.name);

  const relatedNames = [...exercise.alternatives, ...(exercise.machineAlternatives || [])];
  const uniqueRelated = Array.from(new Set(relatedNames)).filter(n => n.toLowerCase() !== exercise.name.toLowerCase());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-primary/20 bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated GIF */}
        <div className="relative bg-card border-b border-border ring-1 ring-inset ring-primary/15">
          <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/60 text-foreground">
            <X className="w-4 h-4" />
          </button>
          <div
            className="absolute top-0 left-0 w-6 h-6 bg-primary z-10"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            aria-hidden="true"
          />
          <div className="flex items-center justify-center p-4 min-h-[280px]">
            {gifSrc ? (
              <img
                src={gifSrc}
                alt={exercise.name}
                className="max-h-[280px] object-contain rounded-lg"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center">
                <BodyPartIcon bodyPart={exercise.bodyPart} size="lg" />
              </div>
            )}
          </div>
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-center py-1 bg-gradient-to-t from-background/80 to-transparent">
            <span className="font-display text-[9px] tracking-[0.25em] text-primary/70">UNBREAKABLE</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <div>
            <h2 className="font-display text-xl text-foreground tracking-wide">{exercise.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-display tracking-wider border border-primary/30 bg-primary/10 text-primary">
                {exercise.difficulty.toUpperCase()}
              </span>
              {exercise.equipment.map(eq => (
                <span key={eq} className="px-2 py-0.5 rounded-md text-[10px] font-display tracking-wider border border-border bg-card text-muted-foreground capitalize">
                  {eq}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded-md text-[10px] font-display tracking-wider border border-border bg-card text-muted-foreground capitalize">
                {exercise.category}
              </span>
            </div>
          </div>

          {/* Defaults */}
          <div className="flex gap-4">
            <div className="p-3 rounded-xl border border-border bg-card text-center flex-1">
              <p className="text-primary font-display text-lg">{exercise.defaultSets}</p>
              <p className="text-muted-foreground text-[10px]">SETS</p>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card text-center flex-1">
              <p className="text-primary font-display text-lg">{exercise.defaultReps}</p>
              <p className="text-muted-foreground text-[10px]">REPS</p>
            </div>
          </div>

          {/* Full Unbreakable coaching breakdown, when we have one -- otherwise the
              curated description + tips every exercise in the library carries. */}
          {coaching ? (
            <ExerciseCoachingPanel coachingData={coaching} exerciseName={exercise.name} />
          ) : (
            <>
              <div className="p-4 rounded-xl border border-primary/15 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-primary" />
                  <h3 className="font-display text-xs text-primary tracking-wider">UNBREAKABLE COACHING</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{exercise.description}</p>
              </div>

              {exercise.tips.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <h3 className="font-display text-xs text-primary tracking-wider">COACHING TIPS</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {exercise.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5 text-xs">&#9656;</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Related exercises -- tap to jump straight to it */}
          {uniqueRelated.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                <h3 className="font-display text-xs text-primary tracking-wider">RELATED EXERCISES</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {uniqueRelated.map(name => {
                  const match = findExerciseByName(name);
                  return match ? (
                    <button
                      key={name}
                      onClick={() => onJumpTo(match)}
                      className="px-2.5 py-1 rounded-lg text-xs border border-primary/25 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {name}
                    </button>
                  ) : (
                    <span key={name} className="px-2.5 py-1 rounded-lg text-xs border border-border text-muted-foreground">
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -- Exercise Card -- */
function ExerciseCard({ exercise, onSelect }: { exercise: LibraryExercise; onSelect: () => void }) {
  const gifSrc = getGifUrlFor(exercise);
  const hasCoaching = !!findCoachingDataByName(exercise.name);

  return (
    <motion.div whileTap={{ scale: 0.97 }} className="cursor-pointer" onClick={onSelect}>
      <Card className={`overflow-hidden border-2 transition-all h-full ${
        hasCoaching ? 'border-primary/25 hover:border-primary/50' : 'border-border hover:border-primary/30'
      }`}>
        <div className="relative bg-card aspect-square flex items-center justify-center p-2 ring-1 ring-inset ring-primary/15">
          <div
            className="absolute top-0 left-0 w-3.5 h-3.5 bg-primary"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            aria-hidden="true"
          />
          {gifSrc ? (
            <img
              src={gifSrc}
              alt={exercise.name}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <BodyPartIcon bodyPart={exercise.bodyPart} size="lg" showGlow={false} className="text-primary/30" />
          )}
          {hasCoaching && (
            <div className="absolute top-1.5 right-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center" title="Full Unbreakable coaching breakdown available">
                <Flame className="w-2.5 h-2.5 text-primary" />
              </div>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <h3 className="font-display text-[11px] text-foreground tracking-wide leading-tight line-clamp-2 min-h-[28px]">
            {exercise.name.toUpperCase()}
          </h3>
          <div className="flex items-center gap-1 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              exercise.difficulty === 'beginner' ? 'bg-green-500' :
              exercise.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-[9px] text-muted-foreground capitalize">{exercise.equipment[0]}</span>
            <span className="text-[9px] text-muted-foreground">&bull; {exercise.defaultSets}&times;{exercise.defaultReps}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* =====================================================================
   Exercise Library Page
   ===================================================================== */
export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bodyPartParam = searchParams.get('bodyPart') as BodyPart | null;
  const legacyMuscleParam = searchParams.get('muscle');
  const initialBodyPart = bodyPartParam || (legacyMuscleParam ? LEGACY_MUSCLE_TO_BODY_PART[legacyMuscleParam] : undefined) || null;

  const [query, setQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(initialBodyPart);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<LibraryExercise['difficulty'] | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<LibraryExercise | null>(null);

  const isSearching = query.trim().length > 0;
  const showCategoryGrid = !isSearching && !selectedBodyPart && !selectedDifficulty && !selectedEquipment;

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<BodyPart, number>> = {};
    for (const ex of ALL_EXERCISES) counts[ex.bodyPart] = (counts[ex.bodyPart] || 0) + 1;
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let result = ALL_EXERCISES;
    if (isSearching) {
      const q = query.toLowerCase();
      result = result.filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        ex.bodyPart.toLowerCase().includes(q) ||
        ex.equipment.some(e => e.toLowerCase().includes(q)) ||
        ex.difficulty.toLowerCase().includes(q)
      );
    } else if (selectedBodyPart) {
      result = result.filter(ex => ex.bodyPart === selectedBodyPart);
    } else if (!selectedDifficulty && !selectedEquipment) {
      return [];
    }
    if (selectedEquipment) result = result.filter(ex => ex.equipment.includes(selectedEquipment));
    if (selectedDifficulty) result = result.filter(ex => ex.difficulty === selectedDifficulty);
    return result;
  }, [query, isSearching, selectedBodyPart, selectedEquipment, selectedDifficulty]);

  const hasFilters = !!selectedEquipment || !!selectedDifficulty;
  const currentBodyPartMeta = selectedBodyPart ? BODY_PART_ICONS.find(bp => bp.value === selectedBodyPart) : null;
  const CurrentBodyPartIcon = currentBodyPartMeta?.Icon;

  return (
    <PaywallGate feature="exercise_library">
    <div className="min-h-screen pb-24" >
      {/* Hero */}
      <section className="pt-6 pb-10 md:pt-8 md:pb-14 border-b border-primary/20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="font-display text-2xl tracking-wide leading-none">
              <span className="text-primary">UNBREAKABLE </span>
              <span className="text-foreground">EXERCISE LIBRARY</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              {ALL_EXERCISES.length} hand-picked exercises, organised by body part, with animated demos,
              coaching breakdowns, and linked alternatives. No clutter, no duplicates.
            </p>
            <div className="flex items-center justify-center gap-4 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[11px] text-muted-foreground">Beginner</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-[11px] text-muted-foreground">Intermediate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[11px] text-muted-foreground">Advanced</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search + Filters */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center gap-2">
            {selectedBodyPart && !isSearching ? (
              <button onClick={() => setSelectedBodyPart(null)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={() => navigate('/programming')} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={currentBodyPartMeta ? `Search ${currentBodyPartMeta.label.toLowerCase()}...` : 'Search all exercises...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all ${
                showFilters || hasFilters
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Current category chip */}
          {currentBodyPartMeta && CurrentBodyPartIcon && !isSearching && (
            <div className="flex items-center gap-2 mt-3">
              <CurrentBodyPartIcon className="w-4 h-4 text-primary" />
              <span className="font-display text-sm tracking-wider text-foreground">{currentBodyPartMeta.label.toUpperCase()}</span>
              <span className="text-xs text-muted-foreground">({categoryCounts[selectedBodyPart!] || 0})</span>
            </div>
          )}

          {/* Filter chips */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {/* Equipment */}
                  <div>
                    <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1.5">EQUIPMENT</p>
                    <div className="flex flex-wrap gap-1.5">
                      {EQUIPMENT_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setSelectedEquipment(selectedEquipment === value ? '' : value)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            selectedEquipment === value
                              ? 'bg-primary/20 border border-primary/40 text-primary'
                              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Difficulty */}
                  <div>
                    <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1.5">DIFFICULTY</p>
                    <div className="flex flex-wrap gap-1.5">
                      {DIFFICULTY_FILTERS.map(d => (
                        <button
                          key={d}
                          onClick={() => setSelectedDifficulty(selectedDifficulty === d ? '' : d)}
                          className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all ${
                            selectedDifficulty === d
                              ? 'bg-primary/20 border border-primary/40 text-primary'
                              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  {hasFilters && (
                    <button
                      onClick={() => { setSelectedEquipment(''); setSelectedDifficulty(''); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-12 max-w-4xl">
        {showCategoryGrid ? (
          /* -- Category tile grid: the default landing flow -- */
          <div className="pt-6">
            <p className="text-xs text-muted-foreground font-display tracking-wider mb-3">BROWSE BY BODY PART</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BODY_PART_ICONS.map(({ value, label, Icon }) => (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedBodyPart(value)}
                  className="text-left"
                >
                  <Card className="p-4 border-2 border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2 aspect-square">
                    <Icon className="w-8 h-8 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
                    <span className="font-display text-sm tracking-wide text-foreground">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{categoryCounts[value] || 0} exercises</span>
                  </Card>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="py-3">
              <p className="text-xs text-muted-foreground font-display tracking-wider">
                {filtered.length} EXERCISE{filtered.length !== 1 ? 'S' : ''}{isSearching ? ' FOUND' : ''}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No exercises found. Try different filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map(ex => (
                  <ExerciseCard key={ex.id} exercise={ex} onSelect={() => setSelectedExercise(ex)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <ExerciseDetail
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            onJumpTo={(ex) => setSelectedExercise(ex)}
          />
        )}
      </AnimatePresence>
    </div>
    </PaywallGate>
  );
}
