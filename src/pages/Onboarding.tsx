import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros, type ActivityLevel, type Goal, type MacroSplit } from '@/lib/fuelCalculations';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Dumbbell, Activity, Utensils, Brain, User, Trophy, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const SPORT_OPTIONS = [
  'Football', 'Boxing', 'Rugby', 'Running', 'Swimming',
  'MMA', 'Cycling', 'Tennis', 'Basketball', 'Cricket',
  'None / General Fitness',
];

const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Sport', icon: Trophy },
  { label: 'Power', icon: Dumbbell },
  { label: 'Movement', icon: Activity },
  { label: 'Fuel', icon: Utensils },
  { label: 'Mindset', icon: Brain },
];

interface OnboardingData {
  // Personal
  gender: string;
  city: string;
  age_years: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  preferred_height_unit: string;
  preferred_weight_unit: string;
  // Sport
  sport_preference: string;
  // Power
  experience_level: string;
  training_goal: string;
  days_per_week: number | null;
  session_length_minutes: number | null;
  bench_max_kg: number | null;
  squat_max_kg: number | null;
  deadlift_max_kg: number | null;
  // Movement
  preferred_cardio: string;
  fitness_level: string;
  race_goals: string;
  weekly_cardio_frequency: number | null;
  // Fuel
  dietary_preferences: string;
  nutrition_goal: string;
  allergies: string;
  meals_per_day: number | null;
  // Mindset
  primary_motivation: string;
  biggest_challenge: string;
  sleep_hours: number | null;
  sleep_quality: string;
  stress_level: string;
  injuries: string;
}

const initialData: OnboardingData = {
  gender: '',
  city: '',
  age_years: null,
  height_cm: null,
  weight_kg: null,
  preferred_height_unit: 'cm',
  preferred_weight_unit: 'kg',
  sport_preference: '',
  experience_level: '',
  training_goal: '',
  days_per_week: null,
  session_length_minutes: null,
  bench_max_kg: null,
  squat_max_kg: null,
  deadlift_max_kg: null,
  preferred_cardio: '',
  fitness_level: '',
  race_goals: '',
  weekly_cardio_frequency: null,
  dietary_preferences: '',
  nutrition_goal: '',
  allergies: '',
  meals_per_day: null,
  primary_motivation: '',
  biggest_challenge: '',
  sleep_hours: null,
  sleep_quality: '',
  stress_level: '',
  injuries: '',
};

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [saving, setSaving] = useState(false);

  // Height display helpers
  const [heightFeet, setHeightFeet] = useState<number | null>(null);
  const [heightInches, setHeightInches] = useState<number | null>(null);

  const update = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const numVal = (v: string) => v === '' ? null : Number(v);

  // Only step 0 (Personal) has required fields; all other steps are fully skippable
  const canProceed = () => {
    // All steps are optional — always allow proceeding
    return true;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Upsert coaching profile with all onboarding data
      const saveData = {
        ...data,
        sport_preference: data.sport_preference === 'None / General Fitness' || !data.sport_preference ? null : data.sport_preference,
      };
      const { error } = await supabase
        .from('coaching_profiles')
        .upsert({
          user_id: user.id,
          ...saveData,
          onboarding_completed: true,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Auto-calculate nutrition goals from onboarding data
      try {
        if (data.age_years && data.height_cm && data.weight_kg && data.gender) {
          const genderForCalc = data.gender.toLowerCase() === 'male' ? 'male' : 'female';
          
          // Map fitness level to activity multiplier
          const activityMap: Record<string, ActivityLevel> = {
            'Sedentary': 'sedentary',
            'Lightly Active': 'light',
            'Active': 'moderate',
            'Very Active': 'very',
            'Athlete': 'extreme',
          };
          const activityLevel = activityMap[data.fitness_level] || 'moderate';

          // Map nutrition goal
          const goalMap: Record<string, Goal> = {
            'Bulk': 'build',
            'Cut': 'lose',
            'Maintain': 'maintain',
            'Recomp': 'recomp',
            'Performance': 'maintain',
          };
          const goal = goalMap[data.nutrition_goal] || 'maintain';

          // Pick macro split based on goal
          const splitMap: Record<string, MacroSplit> = {
            'Bulk': 'high_protein',
            'Cut': 'high_protein',
            'Maintain': 'balanced',
            'Recomp': 'high_protein',
            'Performance': 'high_protein',
          };
          const macroSplit = splitMap[data.nutrition_goal] || 'balanced';

          const bmr = calculateBMR(genderForCalc, data.weight_kg, data.height_cm, data.age_years);
          const tdee = calculateTDEE(bmr, activityLevel);
          const targetCalories = Math.round(calculateTargetCalories(tdee, goal));
          const macros = calculateMacros(targetCalories, macroSplit);

          await supabase
            .from('nutrition_goals')
            .upsert({
              user_id: user.id,
              daily_calories: targetCalories,
              daily_protein_g: macros.protein,
              daily_carbs_g: macros.carbs,
              daily_fat_g: macros.fat,
            }, { onConflict: 'user_id' });
        }
      } catch (nutritionErr) {
        console.error('Auto-fill nutrition goals error:', nutritionErr);
        // Non-critical — don't block onboarding
      }

      // Trigger founder welcome (auto-follow, welcome DM)
      try {
        await supabase.functions.invoke('founder-welcome', {
          body: { new_user_id: user.id },
        });
      } catch (welcomeErr) {
        console.error('Founder welcome error (non-critical):', welcomeErr);
      }

      toast({ title: 'Welcome to UNBREAKABLE! 💪', description: 'Your coach profile is set up and ready.' });
      navigate('/plans', { replace: true });
    } catch (err) {
      console.error('Onboarding save error:', err);
      toast({ title: 'Error', description: 'Failed to save profile. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl text-foreground mb-1">PERSONAL INFO</h2>
              <p className="text-sm text-muted-foreground">Tell your coach about you — all fields optional. Your Unbreakable Coach can gather this info later via chat.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Gender</Label>
                <RadioGroup value={data.gender} onValueChange={v => update('gender', v)} className="flex flex-wrap gap-3 mt-2">
                  {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => (
                    <Label key={g} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.gender === g ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={g} className="sr-only" />
                      <span className="text-sm">{g}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" type="text" placeholder="e.g. Liverpool, Manchester, London" value={data.city} onChange={e => update('city', e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" min={13} max={100} placeholder="e.g. 28" value={data.age_years ?? ''} onChange={e => update('age_years', numVal(e.target.value))} className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Height</Label>
                    <Select value={data.preferred_height_unit} onValueChange={v => update('preferred_height_unit', v)}>
                      <SelectTrigger className="w-20 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="ft_in">ft/in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {data.preferred_height_unit === 'cm' ? (
                    <Input type="number" placeholder="175" value={data.height_cm ?? ''} onChange={e => update('height_cm', numVal(e.target.value))} />
                  ) : (
                    <div className="flex gap-2">
                      <Input type="number" placeholder="ft" value={heightFeet ?? ''} onChange={e => {
                        const f = numVal(e.target.value);
                        setHeightFeet(f);
                        if (f !== null) update('height_cm', Math.round((f * 12 + (heightInches || 0)) * 2.54));
                      }} />
                      <Input type="number" placeholder="in" value={heightInches ?? ''} onChange={e => {
                        const i = numVal(e.target.value);
                        setHeightInches(i);
                        if (heightFeet !== null) update('height_cm', Math.round((heightFeet * 12 + (i || 0)) * 2.54));
                      }} />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Weight</Label>
                    <Select value={data.preferred_weight_unit} onValueChange={v => update('preferred_weight_unit', v)}>
                      <SelectTrigger className="w-20 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lb">lb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" placeholder={data.preferred_weight_unit === 'kg' ? '80' : '176'} value={data.weight_kg !== null ? (data.preferred_weight_unit === 'lb' ? Math.round(data.weight_kg * 2.205) : data.weight_kg) : ''} onChange={e => {
                    const v = numVal(e.target.value);
                    update('weight_kg', v !== null && data.preferred_weight_unit === 'lb' ? Math.round(v / 2.205 * 10) / 10 : v);
                  }} />
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl text-foreground mb-1">SPORT PREFERENCE</h2>
              <p className="text-sm text-muted-foreground">Optional — pick your sport and your AI coach will tailor programmes to it. You can change this in settings any time.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>What's your sport?</Label>
                <RadioGroup value={data.sport_preference} onValueChange={v => update('sport_preference', v)} className="flex flex-wrap gap-3 mt-2">
                  {SPORT_OPTIONS.map(s => (
                    <Label key={s} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.sport_preference === s ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={s} className="sr-only" />
                      <span className="text-sm">{s}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl text-foreground mb-1">POWER</h2>
              <p className="text-sm text-muted-foreground">Optional — your Unbreakable Coach can gather this later</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Experience Level</Label>
                <RadioGroup value={data.experience_level} onValueChange={v => update('experience_level', v)} className="flex flex-wrap gap-3 mt-2">
                  {['Beginner', 'Intermediate', 'Advanced', 'Elite'].map(l => (
                    <Label key={l} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.experience_level === l ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={l} className="sr-only" />
                      <span className="text-sm">{l}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Training Goal</Label>
                <RadioGroup value={data.training_goal} onValueChange={v => update('training_goal', v)} className="flex flex-wrap gap-3 mt-2">
                  {['Hypertrophy', 'Strength', 'Fat Loss', 'General Fitness', 'Athletic Performance'].map(g => (
                    <Label key={g} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.training_goal === g ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={g} className="sr-only" />
                      <span className="text-sm">{g}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="daysPerWeek">Days Per Week</Label>
                  <Select value={data.days_per_week?.toString() ?? ''} onValueChange={v => update('days_per_week', Number(v))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7].map(d => <SelectItem key={d} value={d.toString()}>{d} days</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sessionLength">Session Length</Label>
                  <Select value={data.session_length_minutes?.toString() ?? ''} onValueChange={v => update('session_length_minutes', Number(v))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {[30, 45, 60, 75, 90, 120].map(m => <SelectItem key={m} value={m.toString()}>{m} mins</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Key Lifts (optional, {data.preferred_weight_unit})</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <Label className="text-xs">Bench</Label>
                    <Input type="number" placeholder="--" value={data.bench_max_kg !== null ? (data.preferred_weight_unit === 'lb' ? Math.round(data.bench_max_kg * 2.205) : data.bench_max_kg) : ''} onChange={e => {
                      const v = numVal(e.target.value);
                      update('bench_max_kg', v !== null && data.preferred_weight_unit === 'lb' ? Math.round(v / 2.205 * 10) / 10 : v);
                    }} />
                  </div>
                  <div>
                    <Label className="text-xs">Squat</Label>
                    <Input type="number" placeholder="--" value={data.squat_max_kg !== null ? (data.preferred_weight_unit === 'lb' ? Math.round(data.squat_max_kg * 2.205) : data.squat_max_kg) : ''} onChange={e => {
                      const v = numVal(e.target.value);
                      update('squat_max_kg', v !== null && data.preferred_weight_unit === 'lb' ? Math.round(v / 2.205 * 10) / 10 : v);
                    }} />
                  </div>
                  <div>
                    <Label className="text-xs">Deadlift</Label>
                    <Input type="number" placeholder="--" value={data.deadlift_max_kg !== null ? (data.preferred_weight_unit === 'lb' ? Math.round(data.deadlift_max_kg * 2.205) : data.deadlift_max_kg) : ''} onChange={e => {
                      const v = numVal(e.target.value);
                      update('deadlift_max_kg', v !== null && data.preferred_weight_unit === 'lb' ? Math.round(v / 2.205 * 10) / 10 : v);
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl text-foreground mb-1">MOVEMENT</h2>
              <p className="text-sm text-muted-foreground">Optional — your Unbreakable Coach can gather this later</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Current Fitness Level</Label>
                <RadioGroup value={data.fitness_level} onValueChange={v => update('fitness_level', v)} className="flex flex-wrap gap-3 mt-2">
                  {['Sedentary', 'Lightly Active', 'Active', 'Very Active', 'Athlete'].map(l => (
                    <Label key={l} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.fitness_level === l ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={l} className="sr-only" />
                      <span className="text-sm">{l}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Preferred Cardio (optional)</Label>
                <RadioGroup value={data.preferred_cardio} onValueChange={v => update('preferred_cardio', v)} className="flex flex-wrap gap-3 mt-2">
                  {['Walking', 'Running', 'Cycling', 'Rowing', 'Swimming'].map(c => (
                    <Label key={c} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.preferred_cardio === c ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={c} className="sr-only" />
                      <span className="text-sm">{c}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="cardioFreq">Weekly Cardio Sessions (optional)</Label>
                <Select value={data.weekly_cardio_frequency?.toString() ?? ''} onValueChange={v => update('weekly_cardio_frequency', Number(v))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(d => <SelectItem key={d} value={d.toString()}>{d} sessions</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="raceGoals">Race / Distance Goals (optional)</Label>
                <Input id="raceGoals" placeholder="e.g. Sub-25 min 5K, Complete a half marathon" value={data.race_goals} onChange={e => update('race_goals', e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl text-foreground mb-1">FUEL</h2>
              <p className="text-sm text-muted-foreground">Optional — your Unbreakable Coach can gather this later</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Nutrition Goal</Label>
                <RadioGroup value={data.nutrition_goal} onValueChange={v => update('nutrition_goal', v)} className="flex flex-wrap gap-3 mt-2">
                  {['Bulk', 'Cut', 'Maintain', 'Recomp', 'Performance'].map(g => (
                    <Label key={g} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.nutrition_goal === g ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={g} className="sr-only" />
                      <span className="text-sm">{g}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Dietary Preferences (optional)</Label>
                <RadioGroup value={data.dietary_preferences} onValueChange={v => update('dietary_preferences', v)} className="flex flex-wrap gap-3 mt-2">
                  {['No Restrictions', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Halal', 'Kosher'].map(d => (
                    <Label key={d} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.dietary_preferences === d ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={d} className="sr-only" />
                      <span className="text-sm">{d}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="allergies">Allergies / Intolerances (optional)</Label>
                <Input id="allergies" placeholder="e.g. Gluten, Dairy, Nuts" value={data.allergies} onChange={e => update('allergies', e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label>Meals Per Day (optional)</Label>
                <Select value={data.meals_per_day?.toString() ?? ''} onValueChange={v => update('meals_per_day', Number(v))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map(m => <SelectItem key={m} value={m.toString()}>{m} meals</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl text-foreground mb-1">MINDSET</h2>
              <p className="text-sm text-muted-foreground">Optional — your Unbreakable Coach can gather this later</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Primary Motivation</Label>
                <RadioGroup value={data.primary_motivation} onValueChange={v => update('primary_motivation', v)} className="flex flex-wrap gap-3 mt-2">
                  {['Health', 'Aesthetics', 'Performance', 'Mental Health', 'Confidence', 'Longevity'].map(m => (
                    <Label key={m} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.primary_motivation === m ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={m} className="sr-only" />
                      <span className="text-sm">{m}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Biggest Challenge (optional)</Label>
                <RadioGroup value={data.biggest_challenge} onValueChange={v => update('biggest_challenge', v)} className="flex flex-wrap gap-3 mt-2">
                  {['Consistency', 'Nutrition', 'Time Management', 'Motivation', 'Recovery', 'Knowledge'].map(c => (
                    <Label key={c} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.biggest_challenge === c ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={c} className="sr-only" />
                      <span className="text-sm">{c}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Avg Sleep (hours)</Label>
                  <Select value={data.sleep_hours?.toString() ?? ''} onValueChange={v => update('sleep_hours', Number(v))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {[4, 5, 6, 7, 8, 9, 10].map(h => <SelectItem key={h} value={h.toString()}>{h}h</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sleep Quality</Label>
                  <Select value={data.sleep_quality} onValueChange={v => update('sleep_quality', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['Poor', 'Fair', 'Good', 'Excellent'].map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Stress Level</Label>
                <RadioGroup value={data.stress_level} onValueChange={v => update('stress_level', v)} className="flex flex-wrap gap-3 mt-2">
                  {['Low', 'Moderate', 'High', 'Very High'].map(s => (
                    <Label key={s} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${data.stress_level === s ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-muted-foreground'}`}>
                      <RadioGroupItem value={s} className="sr-only" />
                      <span className="text-sm">{s}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="injuries">Current Injuries / Limitations (optional)</Label>
                <Textarea id="injuries" placeholder="e.g. Lower back pain, recovering from knee surgery, shoulder impingement..." value={data.injuries} onChange={e => update('injuries', e.target.value)} className="mt-1" rows={3} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6 text-center">
        <h1 className="font-display text-3xl text-primary tracking-wider">UNBREAKABLE</h1>
        <p className="text-sm text-muted-foreground mt-1">Build your coaching profile — skip what you like, your Unbreakable Coach can fill gaps later</p>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-primary text-primary-foreground scale-110' : isDone ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
        <div className="h-1 bg-muted rounded-full mt-3 max-w-md mx-auto overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-32 max-w-md mx-auto w-full overflow-y-auto">
        {renderStep()}
      </div>

      {/* Fixed bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
        <div className="flex gap-3 max-w-md mx-auto">
          {step > 0 && (
            <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <>
              <Button variant="ghost" className="gap-1 text-muted-foreground" onClick={() => setStep(s => s + 1)}>
                Skip
              </Button>
              <Button className="flex-1 gap-2" onClick={() => setStep(s => s + 1)}>
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="gap-1 text-muted-foreground" onClick={handleSubmit} disabled={saving}>
                Skip & Finish
              </Button>
              <Button className="flex-1 gap-2" disabled={saving} onClick={handleSubmit}>
                {saving ? 'Saving...' : 'Complete Setup'} <Check className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
