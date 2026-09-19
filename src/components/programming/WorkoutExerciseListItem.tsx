import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, ChevronDown, ChevronUp, BookOpen, Shuffle } from 'lucide-react';

/**
 * One row in a workout exercise list — shared by the main EXERCISES dropdown
 * and the WARM UP / COOL DOWN dropdowns (JJ, Sept 2026: warmup/cooldown
 * needed "their own dropdown, laid out just as main workouts with exercise
 * gif etc") so all three look and behave identically instead of drifting.
 */
export interface WorkoutExerciseListItemProps {
  name: string;
  /** Small muted line under the name — e.g. the parsed rep/duration detail
   * ("x 15", "30 sec each side") for warmup/cooldown steps. */
  subtitle?: string;
  gifUrl?: string;
  /** Right-aligned content before the swap/expand controls — e.g. the
   * main list's "{completed}/{sets}" badge. */
  rightContent?: ReactNode;
  isExpanded: boolean;
  onToggleExpand: () => void;
  hasDetails: boolean;
  detailsContent?: ReactNode;
  onSwap?: () => void;
  /** Warmup/cooldown items are ticked off locally (no set-by-set logging
   * exists for them), rather than driven by real logged-set completion. */
  checked?: boolean;
  onToggleChecked?: () => void;
  /** Main exercises show a static check icon once every set is logged —
   * distinct from the interactive checkbox used for warmup/cooldown. */
  isDone?: boolean;
}

export function WorkoutExerciseListItem({
  name,
  subtitle,
  gifUrl,
  rightContent,
  isExpanded,
  onToggleExpand,
  hasDetails,
  detailsContent,
  onSwap,
  checked,
  onToggleChecked,
  isDone,
}: WorkoutExerciseListItemProps) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      {/* Header row — a div (not a button) since it hosts the swap/checkbox
          controls as their own buttons; nesting <button> inside <button>
          is invalid HTML and was silently happening in the old inline
          version this replaces. */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleExpand(); }}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          {onToggleChecked ? (
            <Checkbox
              checked={!!checked}
              onClick={(e) => { e.stopPropagation(); onToggleChecked(); }}
              className="shrink-0"
            />
          ) : isDone ? (
            <Check className="w-4 h-4 text-primary shrink-0" />
          ) : null}
          {gifUrl ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
              <img src={gifUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ) : null}
          <div className="min-w-0">
            <span className={`text-sm block truncate ${checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {name}
            </span>
            {subtitle && (
              <span className="text-xs text-muted-foreground block truncate">{subtitle}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rightContent}
          {onSwap && (
            <button
              onClick={(e) => { e.stopPropagation(); onSwap(); }}
              className="p-1 rounded hover:bg-primary/10 transition-colors"
              title="Swap exercise"
            >
              <Shuffle className="w-4 h-4 text-primary" />
            </button>
          )}
          {hasDetails && <BookOpen className="w-4 h-4 text-primary" />}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 bg-muted/20">{detailsContent}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {isExpanded && !hasDetails && (
        <div className="p-3 text-xs text-muted-foreground border-t border-border bg-muted/20">
          No additional details available for this exercise.
        </div>
      )}
    </div>
  );
}
