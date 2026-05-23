import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft, Search, Filter, X, ChevronDown, ChevronUp,
  Dumbbell, ArrowRight, Flame, Info, Lightbulb, Target,
} from 'lucide-react';
import { getExerciseGifUrl } from '@/lib/exercise-images';
import type { Exercise } from '@/lib/exercise-types';

/* ── Filter options ── */
const MUSCLE_FILTERS = [
  'chest', 'shoulders', 'biceps', 'triceps', 'lats', 'middle back', 'lower back',
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'abdominals', 'forearms', 'traps', 'neck',
  'adductors', 'abductors',
];
const EQUIPMENT_FILTERS = [
  'barbell', 'dumbbell', 'body only', 'cable', 'machine', 'kettlebells',
  'bands', 'e-z curl bar', 'exercise ball', 'medicine ball',
];
const LEVEL_FILTERS = ['beginner', 'intermediate', 'expert'];

/* ── Enriched exercise type ── */
interface EnrichedExercise extends Exercise {
  unbreakableDescription?: string;
  unbreakableTips?: string[];
  defaultSets?: number;
  defaultReps?: string;
}

/* ── Exercise Detail Panel ── */
function ExerciseDetail({
  exercise,
  onClose,
}: {
  exercise: EnrichedExercise;
  onClose: () => void;
}) {
  const gifSrc = getExerciseGifUrl(exercise);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-[#FF5500]/20 bg-[#0C0C0C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated GIF */}
        <div className="relative bg-[#111] border-b border-gray-800">
          <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center p-4 min-h-[280px]">
            {gifSrc ? (
              <img
                src={gifSrc}
                alt={exercise.name}
                className="max-h-[280px] object-contain rounded-lg"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/25 flex items-center justify-center">
                <Dumbbell className="w-10 h-10 text-[#FF5500]/40" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <div>
            <h2 className="font-display text-xl text-white tracking-wide">{exercise.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-display tracking-wider border border-[#FF5500]/30 bg-[#FF5500]/10 text-[#FF5500]">
                {exercise.level?.toUpperCase() || 'ALL LEVELS'}
              </span>
              {exercise.equipment && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-display tracking-wider border border-gray-700 bg-[#111] text-gray-400">
                  {exercise.equipment.toUpperCase()}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md text-[10px] font-display tracking-wider border border-gray-700 bg-[#111] text-gray-400">
                {exercise.category.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Muscles */}
          <div>
            <h3 className="font-display text-xs text-[#FF5500] tracking-wider mb-2">MUSCLES TARGETED</h3>
            <div className="flex flex-wrap gap-1.5">
              {exercise.primaryMuscles.map(m => (
                <span key={m} className="px-2.5 py-1 rounded-lg text-xs border border-[#FF5500]/25 bg-[#FF5500]/10 text-[#FF5500]">
                  {m}
                </span>
              ))}
              {exercise.secondaryMuscles.map(m => (
                <span key={m} className="px-2.5 py-1 rounded-lg text-xs border border-gray-700 text-gray-500">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Defaults */}
          {(exercise.defaultSets || exercise.defaultReps) && (
            <div className="flex gap-4">
              {exercise.defaultSets && (
                <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center flex-1">
                  <p className="text-[#FF5500] font-display text-lg">{exercise.defaultSets}</p>
                  <p className="text-gray-500 text-[10px]">SETS</p>
                </div>
              )}
              {exercise.defaultReps && (
                <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center flex-1">
                  <p className="text-[#FF5500] font-display text-lg">{exercise.defaultReps}</p>
                  <p className="text-gray-500 text-[10px]">REPS</p>
                </div>
              )}
            </div>
          )}

          {/* Unbreakable coaching description */}
          {exercise.unbreakableDescription && (
            <div className="p-4 rounded-xl border border-[#FF5500]/15 bg-[#FF5500]/5">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-[#FF5500]" />
                <h3 className="font-display text-xs text-[#FF5500] tracking-wider">UNBREAKABLE COACHING</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{exercise.unbreakableDescription}</p>
            </div>
          )}

          {/* Unbreakable tips */}
          {exercise.unbreakableTips && exercise.unbreakableTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#FF5500]" />
                <h3 className="font-display text-xs text-[#FF5500] tracking-wider">COACHING TIPS</h3>
              </div>
              <ul className="space-y-1.5">
                {exercise.unbreakableTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-[#FF5500] mt-0.5 text-xs">▸</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Standard instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-display text-xs text-gray-400 tracking-wider">STEP-BY-STEP</h3>
              <ol className="space-y-2">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] text-[10px] flex items-center justify-center font-display">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Force / Mechanic */}
          <div className="flex gap-4 text-xs text-gray-500">
            {exercise.force && <span>Force: <span className="text-gray-400">{exercise.force}</span></span>}
            {exercise.mechanic && <span>Mechanic: <span className="text-gray-400">{exercise.mechanic}</span></span>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Exercise Library Page
   ═══════════════════════════════════════════════════════════════════ */
export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMuscle = searchParams.get('muscle') || '';

  const [exercises, setExercises] = useState<EnrichedExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState(initialMuscle);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showFilters, setShowFilters] = useState(!!initialMuscle);
  const [selectedExercise, setSelectedExercise] = useState<EnrichedExercise | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  useEffect(() => {
    fetch('/data/exercises.json')
      .then(r => r.json())
      .then((data: EnrichedExercise[]) => {
        setExercises(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = exercises;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        ex.primaryMuscles.some(m => m.includes(q)) ||
        (ex.equipment || '').toLowerCase().includes(q)
      );
    }
    if (selectedMuscle) {
      result = result.filter(ex =>
        ex.primaryMuscles.includes(selectedMuscle) ||
        ex.secondaryMuscles.includes(selectedMuscle)
      );
    }
    if (selectedEquipment) {
      result = result.filter(ex => ex.equipment === selectedEquipment);
    }
    if (selectedLevel) {
      result = result.filter(ex => ex.level === selectedLevel);
    }
    return result;
  }, [exercises, query, selectedMuscle, selectedEquipment, selectedLevel]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;
  const hasFilters = selectedMuscle || selectedEquipment || selectedLevel;

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [query, selectedMuscle, selectedEquipment, selectedLevel]);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      {/* Hero */}
      <section className="pt-24 pb-10 md:pt-28 md:pb-14 border-b border-primary/20">
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
              {exercises.length} exercises with animated demos, coaching tips, and step-by-step breakdowns.
              Master every movement.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search + Filters */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/programming')} className="p-2 rounded-lg text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search exercises..."
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
                  : 'border-border text-muted-foreground hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

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
                  {/* Muscle */}
                  <div>
                    <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1.5">MUSCLE GROUP</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MUSCLE_FILTERS.map(m => (
                        <button
                          key={m}
                          onClick={() => setSelectedMuscle(selectedMuscle === m ? '' : m)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            selectedMuscle === m
                              ? 'bg-primary/20 border border-primary/40 text-primary'
                              : 'bg-card border border-border text-muted-foreground hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Equipment */}
                  <div>
                    <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1.5">EQUIPMENT</p>
                    <div className="flex flex-wrap gap-1.5">
                      {EQUIPMENT_FILTERS.map(e => (
                        <button
                          key={e}
                          onClick={() => setSelectedEquipment(selectedEquipment === e ? '' : e)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            selectedEquipment === e
                              ? 'bg-primary/20 border border-primary/40 text-primary'
                              : 'bg-card border border-border text-muted-foreground hover:text-white'
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Level */}
                  <div>
                    <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1.5">LEVEL</p>
                    <div className="flex flex-wrap gap-1.5">
                      {LEVEL_FILTERS.map(l => (
                        <button
                          key={l}
                          onClick={() => setSelectedLevel(selectedLevel === l ? '' : l)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            selectedLevel === l
                              ? 'bg-primary/20 border border-primary/40 text-primary'
                              : 'bg-card border border-border text-muted-foreground hover:text-white'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  {hasFilters && (
                    <button
                      onClick={() => { setSelectedMuscle(''); setSelectedEquipment(''); setSelectedLevel(''); }}
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

      {/* Results count */}
      <div className="container mx-auto px-4 py-3 max-w-4xl">
        <p className="text-xs text-muted-foreground font-display tracking-wider">
          {filtered.length} EXERCISE{filtered.length !== 1 ? 'S' : ''}
          {hasFilters || query ? ' FOUND' : ''}
        </p>
      </div>

      {/* Exercise Grid */}
      <main className="container mx-auto px-4 pb-12 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No exercises found. Try different filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {paginated.map(ex => {
                const gifSrc = getExerciseGifUrl(ex);
                const hasCoaching = !!ex.unbreakableDescription;
                return (
                  <motion.div
                    key={ex.id}
                    whileTap={{ scale: 0.97 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedExercise(ex)}
                  >
                    <Card className={`overflow-hidden border-2 transition-all h-full ${
                      hasCoaching
                        ? 'border-primary/25 hover:border-primary/50'
                        : 'border-border hover:border-primary/30'
                    }`}>
                      {/* Animated GIF */}
                      <div className="relative bg-[#111] aspect-square flex items-center justify-center p-2">
                        {gifSrc ? (
                          <img
                            src={gifSrc}
                            alt={ex.name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              // Show fallback icon
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.fallback-icon')) {
                                const div = document.createElement('div');
                                div.className = 'fallback-icon flex items-center justify-center w-full h-full';
                                div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5500" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>';
                                parent.appendChild(div);
                              }
                            }}
                          />
                        ) : (
                          <Dumbbell className="w-8 h-8 text-[#FF5500]/30" />
                        )}
                        {hasCoaching && (
                          <div className="absolute top-1.5 right-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center"
                              title="Unbreakable coaching available">
                              <Flame className="w-2.5 h-2.5 text-primary" />
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-2.5">
                        <h3 className="font-display text-[11px] text-foreground tracking-wide leading-tight line-clamp-2 min-h-[28px]">
                          {ex.name.toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            ex.level === 'beginner' ? 'bg-green-500' :
                            ex.level === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-[9px] text-muted-foreground">{ex.primaryMuscles[0] || ''}</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-6 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-display tracking-wider hover:bg-primary/10 transition-all"
                >
                  LOAD MORE ({filtered.length - paginated.length} remaining)
                </button>
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}
