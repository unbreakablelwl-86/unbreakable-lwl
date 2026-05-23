import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Dumbbell, 
  BookOpen, 
  Droplets, 
  Target, 
  PenLine,
  ChevronDown,
  Check,
} from 'lucide-react';

export interface HabitState {
  train: boolean;
  learnDaily: boolean;
  water: boolean;
  hitYourNumbers: boolean;
  sauna: boolean;
  coldShower: boolean;
  breathworkDone: boolean;
  journal: string;
}

interface DailyHabitDiaryProps {
  habits: HabitState;
  onChange: (habits: HabitState) => void;
  compact?: boolean;
  readOnly?: boolean;
  /** Date string (yyyy-MM-dd) used to seed which prompts appear */
  dateKey?: string;
}

const HABITS = [
  { key: 'train' as const, label: 'TRAIN', description: 'Complete your session', icon: Dumbbell },
  { key: 'learnDaily' as const, label: 'LEARN DAILY', description: 'Read, watch, or study something new', icon: BookOpen },
  { key: 'water' as const, label: 'WATER (3L)', description: 'Drink at least 3 litres of water', icon: Droplets },
  { key: 'hitYourNumbers' as const, label: 'HIT YOUR NUMBERS', description: 'Meet your nutrition targets', icon: Target },
];

const MIN_WORDS = 150;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function DailyHabitDiary({ habits, onChange, compact = false, readOnly = false }: DailyHabitDiaryProps) {
  const [isOpen, setIsOpen] = useState(!compact);

  const wordCount = countWords(habits.journal);
  const journalComplete = wordCount >= MIN_WORDS;
  const completedCount = HABITS.filter(h => habits[h.key]).length + (journalComplete ? 1 : 0);
  const totalCount = 5;
  const allComplete = completedCount === totalCount;

  const toggleHabit = (key: keyof Omit<HabitState, 'journal'>) => {
    if (readOnly) return;
    onChange({ ...habits, [key]: !habits[key] });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`border ${allComplete ? 'border-primary/50 bg-primary/5' : 'border-primary/30 bg-card'}`}>
        <CollapsibleTrigger className="w-full p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${allComplete ? 'bg-primary/20 neon-glow' : 'bg-primary/20 neon-glow'}`}>
              {allComplete ? (
                <Check className="w-6 h-6 text-primary" />
              ) : (
                <PenLine className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="text-left">
              <span className="font-display text-foreground tracking-wide text-base">DAILY 5 HABITS</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {completedCount}/{totalCount}
                </Badge>
                {allComplete && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    COMPLETE
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-3">
            {HABITS.map((habit) => (
              <button
                key={habit.key}
                onClick={() => toggleHabit(habit.key)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  habits[habit.key]
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <Checkbox
                  checked={habits[habit.key]}
                  className="pointer-events-none h-5 w-5"
                />
                <habit.icon className={`w-5 h-5 flex-shrink-0 ${habits[habit.key] ? 'text-primary' : 'text-primary'}`} />
                <div className="text-left flex-1">
                  <span className={`font-display text-sm tracking-wide ${habits[habit.key] ? 'text-primary' : 'text-foreground'}`}>
                    {habit.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">{habit.description}</p>
                </div>
              </button>
            ))}

            {/* Journal Entry */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenLine className={`w-5 h-5 ${journalComplete ? 'text-primary' : 'text-primary'}`} />
                  <span className={`font-display text-sm tracking-wide ${journalComplete ? 'text-primary' : 'text-foreground'}`}>
                    DAILY JOURNAL
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${journalComplete ? 'border-primary/40 text-primary' : ''}`}
                >
                  {wordCount}/{MIN_WORDS} words
                </Badge>
              </div>

              <Textarea
                placeholder="Write freely — reflect on your day, your training, your mindset, anything on your mind. Minimum 150 words."
                value={habits.journal}
                onChange={(e) => !readOnly && onChange({ ...habits, journal: e.target.value })}
                className="min-h-[200px] text-sm bg-muted/20 border-border resize-none"
                readOnly={readOnly}
              />

              {!journalComplete && wordCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {MIN_WORDS - wordCount} more word{MIN_WORDS - wordCount !== 1 ? 's' : ''} to complete your journal
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
