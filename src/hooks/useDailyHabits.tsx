import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { HabitState } from '@/components/programming/DailyHabitDiary';
import { format, addDays, subDays } from 'date-fns';

const DEFAULT_HABITS: HabitState = {
  train: false,
  learnDaily: false,
  water: false,
  hitYourNumbers: false,
  sauna: false,
  coldShower: false,
  breathworkDone: false,
  waterGlasses: 0,
  journal: '',
};

export function useDailyHabits() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState<HabitState>(DEFAULT_HABITS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('daily_habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('habit_date', dateStr)
      .maybeSingle();

    if (data) {
      const glasses = data.water_glasses ?? 0;
      setHabits({
        train: data.train,
        learnDaily: data.learn_daily,
        water: glasses >= 8 ? true : data.water,
        hitYourNumbers: data.hit_your_numbers,
        sauna: data.sauna ?? false,
        coldShower: data.cold_shower ?? false,
        breathworkDone: data.breathwork_done ?? false,
        waterGlasses: glasses,
        journal: data.journal || '',
      });
    } else {
      setHabits(DEFAULT_HABITS);
    }
    setLoading(false);
  }, [user, dateStr]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const saveHabits = useCallback(async (newHabits: HabitState) => {
    if (!user) return;
    setHabits(newHabits);
    setSaving(true);

    await supabase
      .from('daily_habits')
      .upsert({
        user_id: user.id,
        habit_date: dateStr,
        train: newHabits.train,
        learn_daily: newHabits.learnDaily,
        water: newHabits.waterGlasses >= 8 ? true : newHabits.water,
        do_the_hard_thing: false,
        hit_your_numbers: newHabits.hitYourNumbers,
        sauna: newHabits.sauna,
        cold_shower: newHabits.coldShower,
        breathwork_done: newHabits.breathworkDone,
        water_glasses: newHabits.waterGlasses,
        journal: newHabits.journal,
      }, { onConflict: 'user_id,habit_date' });

    setSaving(false);
  }, [user, dateStr]);

  const goToPreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const goToNextDay = () => {
    if (!isToday) setSelectedDate(prev => addDays(prev, 1));
  };
  const goToToday = () => setSelectedDate(new Date());

  return {
    habits,
    saveHabits,
    selectedDate,
    dateStr,
    isToday,
    loading,
    saving,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  };
}
