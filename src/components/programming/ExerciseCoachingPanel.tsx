import { memo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Wind, 
  AlertTriangle, 
  Clock, 
  Lightbulb,
  ChevronRight,
  Dumbbell,
  Shield,
  TrendingUp,
  TrendingDown,
  Gauge,
  ClipboardList
} from 'lucide-react';
import { ExerciseCoachingData } from '@/lib/exerciseCoachingData';

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  primary_lift: 'Primary Lift',
  accessory: 'Accessory',
  assistance: 'Assistance',
  conditioning: 'Conditioning',
  mobility: 'Mobility',
};

interface ExerciseCoachingPanelProps {
  coachingData: ExerciseCoachingData;
  exerciseName: string;
  gifUrl?: string;
}

export const ExerciseCoachingPanel = memo(function ExerciseCoachingPanel({
  coachingData,
  exerciseName,
  gifUrl,
}: ExerciseCoachingPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-4 pt-2"
    >
      {/* GIF Preview */}
      {gifUrl && (
        <div className="flex justify-center">
          <div className="w-full max-w-[200px] aspect-square rounded-xl overflow-hidden bg-muted border border-border/50">
            <img src={gifUrl} alt={exerciseName} className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      )}

      {/* Exercise Type & Purpose */}
      {(coachingData.exerciseType || coachingData.purpose) && (
        <div className="space-y-2">
          {coachingData.exerciseType && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-display tracking-wide">
              {EXERCISE_TYPE_LABELS[coachingData.exerciseType] || coachingData.exerciseType}
            </Badge>
          )}
          {coachingData.purpose && (
            <p className="text-xs text-foreground/80 leading-relaxed">{coachingData.purpose}</p>
          )}
        </div>
      )}

      {/* Movement Phases */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-display text-primary tracking-wide">MOVEMENT PHASES</span>
        </div>
        <div className="space-y-3">
          {coachingData.phases.map((phase, idx) => (
            <div key={idx} className="rounded-lg bg-muted/40 p-3 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="font-display text-sm text-foreground">{phase.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{phase.description}</p>
              <ul className="space-y-1">
                {phase.cues.map((cue, cueIdx) => (
                  <li key={cueIdx} className="text-xs text-foreground/80 flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Breathing Pattern */}
      <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Wind className="w-4 h-4 text-primary" />
          <span className="text-sm font-display text-primary tracking-wide">BREATHING</span>
        </div>
        <div className={`grid gap-3 ${coachingData.breathing.brace ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Inhale</span>
            <span className="text-xs text-foreground">{coachingData.breathing.inhale}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Exhale</span>
            <span className="text-xs text-foreground">{coachingData.breathing.exhale}</span>
          </div>
          {coachingData.breathing.brace && (
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Brace</span>
              <span className="text-xs text-foreground">{coachingData.breathing.brace}</span>
            </div>
          )}
        </div>
      </div>

      {/* Muscles Targeted */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" />
          <span className="text-sm font-display text-primary tracking-wide">MUSCLES TARGETED</span>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Primary</span>
            <div className="flex flex-wrap gap-1">
              {coachingData.musclesTargeted.primary.map((muscle, idx) => (
                <Badge key={idx} className="bg-primary/20 text-primary border-primary/30 text-xs">
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Secondary</span>
            <div className="flex flex-wrap gap-1">
              {coachingData.musclesTargeted.secondary.map((muscle, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Common Mistakes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-display text-orange-400 tracking-wide">COMMON MISTAKES</span>
        </div>
        <div className="space-y-2">
          {coachingData.commonMistakes.map((item, idx) => (
            <div key={idx} className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-2">
              <div className="flex items-start gap-2">
                <span className="text-xs text-orange-400 font-medium">✗</span>
                <span className="text-xs text-orange-400">{item.mistake}</span>
              </div>
              <div className="flex items-start gap-2 mt-1">
                <span className="text-xs text-primary font-medium">✓</span>
                <span className="text-xs text-primary">{item.correction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load & Intensity Guidelines */}
      {coachingData.loadGuidelines && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-sm font-display text-primary tracking-wide">LOAD & INTENSITY</span>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg bg-muted/40 p-2 border border-border/50">
              <span className="text-xs text-muted-foreground block mb-0.5">Technique Focus</span>
              <span className="text-xs text-foreground">{coachingData.loadGuidelines.technique}</span>
            </div>
            <div className="rounded-lg bg-muted/40 p-2 border border-border/50">
              <span className="text-xs text-muted-foreground block mb-0.5">Hypertrophy</span>
              <span className="text-xs text-foreground">{coachingData.loadGuidelines.hypertrophy}</span>
            </div>
            <div className="rounded-lg bg-muted/40 p-2 border border-border/50">
              <span className="text-xs text-muted-foreground block mb-0.5">Strength</span>
              <span className="text-xs text-foreground">{coachingData.loadGuidelines.strength}</span>
            </div>
          </div>
        </div>
      )}

      {/* Regressions & Progressions */}
      {(coachingData.regressions || coachingData.progressions) && (
        <div className="grid grid-cols-2 gap-3">
          {coachingData.regressions && coachingData.regressions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                <span className="text-xs font-display text-primary tracking-wide">REGRESSIONS</span>
              </div>
              <ul className="space-y-1">
                {coachingData.regressions.map((r, idx) => (
                  <li key={idx} className="text-xs text-foreground/80 flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {coachingData.progressions && coachingData.progressions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-display text-primary tracking-wide">PROGRESSIONS</span>
              </div>
              <ul className="space-y-1">
                {coachingData.progressions.map((p, idx) => (
                  <li key={idx} className="text-xs text-foreground/80 flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Safety Notes */}
      {coachingData.safetyNotes && coachingData.safetyNotes.length > 0 && (
        <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-display text-primary tracking-wide">SAFETY NOTES</span>
          </div>
          <ul className="space-y-1">
            {coachingData.safetyNotes.map((note, idx) => (
              <li key={idx} className="text-xs text-foreground/80 flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tempo Guide */}
      <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3 border border-border/50">
        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
        <div>
          <span className="text-xs text-muted-foreground block">Recommended Tempo</span>
          <span className="text-sm text-foreground font-medium">{coachingData.tempoGuide}</span>
        </div>
      </div>

      {/* Logging Instructions */}
      {coachingData.loggingInstructions && coachingData.loggingInstructions.length > 0 && (
        <div className="rounded-lg bg-muted/40 p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-display text-muted-foreground tracking-wide">LOGGING REQUIREMENTS</span>
          </div>
          <ul className="space-y-1">
            {coachingData.loggingInstructions.map((instruction, idx) => (
              <li key={idx} className="text-xs text-foreground/80 flex items-start gap-1.5">
                <span className="text-muted-foreground">•</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coaching Notes */}
      <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-display text-primary tracking-wide">COACH'S NOTES</span>
        </div>
        <p className="text-xs text-foreground/90 leading-relaxed">
          {coachingData.coachingNotes}
        </p>
      </div>
    </motion.div>
  );
});