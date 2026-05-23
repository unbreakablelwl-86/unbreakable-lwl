import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DailyHabitDiary } from '@/components/programming/DailyHabitDiary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useDailyHabits } from '@/hooks/useDailyHabits';
import { MotivationalPopup } from '@/components/MotivationalPopup';
import { toast } from 'sonner';

const Habits = () => {
  const {
    habits,
    saveHabits,
    selectedDate,
    isToday,
    loading,
    saving,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  } = useDailyHabits();

  const [localJournal, setLocalJournal] = useState(habits.journal);
  const [journalDirty, setJournalDirty] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);

  // Sync local journal when habits load from DB or date changes
  useEffect(() => {
    setLocalJournal(habits.journal);
    setJournalDirty(false);
  }, [habits.journal]);

  // For display purposes, use actual habits for checkboxes but local journal
  const displayHabits = { ...habits, journal: localJournal };

  const wordCount = localJournal.trim().split(/\s+/).filter(Boolean).length;
  const completedCount = [
    habits.train,
    habits.learnDaily,
    habits.water,
    habits.hitYourNumbers,
    habits.breathworkDone,
    habits.sauna,
    habits.coldShower,
  ].filter(Boolean).length;

  const handleChange = (newHabits: typeof habits) => {
    // Check if only journal changed
    const journalChanged = newHabits.journal !== localJournal;
    const checkboxChanged = 
      newHabits.train !== habits.train ||
      newHabits.learnDaily !== habits.learnDaily ||
      newHabits.water !== habits.water ||
      newHabits.hitYourNumbers !== habits.hitYourNumbers;

    if (checkboxChanged) {
      // Auto-save checkboxes immediately (with current local journal)
      saveHabits({ ...newHabits, journal: localJournal });
      toast.success('Habit updated!');
    }

    if (journalChanged) {
      setLocalJournal(newHabits.journal);
      setJournalDirty(true);
    }
  };

  const handleSaveJournal = async () => {
    await saveHabits({ ...habits, journal: localJournal });
    setJournalDirty(false);
    toast.success('Journal saved!');
    // Motivational popup disabled — only triggers on sign-in for now
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader sectionLabel="DAILY 7" />
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl tracking-wide text-foreground">DAILY HABIT TRACKER</h1>
          <p className="text-muted-foreground text-sm">Complete your Daily 7 to stay on track</p>
          <Badge variant="outline" className="text-sm">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {completedCount}/7 Complete
          </Badge>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <button
            onClick={goToToday}
            className="font-display text-sm tracking-wide text-foreground min-w-[140px] text-center"
          >
            {isToday ? 'TODAY' : format(selectedDate, 'EEE, d MMM yyyy')}
          </button>
          <Button variant="ghost" size="icon" onClick={goToNextDay} disabled={isToday}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {saving && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <DailyHabitDiary
              habits={displayHabits}
              onChange={handleChange}
              compact={false}
              readOnly={!isToday}
              dateKey={format(selectedDate, 'yyyy-MM-dd')}
            />

            {/* Save Journal Button */}
            {isToday && journalDirty && (
              <Button
                onClick={handleSaveJournal}
                disabled={saving}
                className="w-full font-display tracking-wider gap-2"
                size="lg"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'SAVING...' : 'SAVE JOURNAL'}
              </Button>
            )}
          </>
        )}

        {!isToday && !loading && (
          <p className="text-center text-xs text-muted-foreground">
            Viewing past entry — tap TODAY to return
          </p>
        )}
      </main>

      <MotivationalPopup
        trigger="habits_logged"
        open={showMotivation}
        onClose={() => setShowMotivation(false)}
      />
    </div>
  );
};

export default Habits;
