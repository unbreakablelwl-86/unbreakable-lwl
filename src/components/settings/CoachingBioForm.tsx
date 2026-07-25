import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useCoachingProfile, 
  cmToFeetInches, 
  feetInchesToCm, 
  kgToLb, 
  lbToKg,
  type CoachingProfile,
} from '@/hooks/useCoachingProfile';
import { toast } from 'sonner';
import { 
  Loader2, Flame, ChevronDown, User, Zap, Activity, Utensils, Brain 
} from 'lucide-react';

/* ── option lists (match onboarding exactly) ── */
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
const TRAINING_GOAL_OPTIONS = ['Hypertrophy', 'Strength', 'Fat Loss', 'General Fitness', 'Athletic Performance'];
const FITNESS_LEVEL_OPTIONS = ['Sedentary', 'Lightly Active', 'Active', 'Very Active', 'Athlete'];
const CARDIO_OPTIONS = ['Walking', 'Running', 'Cycling', 'Rowing', 'Swimming'];
const NUTRITION_GOAL_OPTIONS = ['Bulk', 'Cut', 'Maintain', 'Recomp', 'Performance'];
const DIET_OPTIONS = ['No Restrictions', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Halal', 'Kosher'];
const MOTIVATION_OPTIONS = ['Health', 'Aesthetics', 'Performance', 'Mental Health', 'Confidence', 'Longevity'];
const CHALLENGE_OPTIONS = ['Consistency', 'Nutrition', 'Time Management', 'Motivation', 'Recovery', 'Knowledge'];
const SLEEP_QUALITY_OPTIONS = ['Poor', 'Fair', 'Good', 'Excellent'];
const STRESS_OPTIONS = ['Low', 'Moderate', 'High', 'Very High'];

/* ── helpers ── */
const numVal = (v: string): number | null => {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
};

/* ── pill selector (reusable) ── */
function PillSelect({ value, options, onChange, accentColor }: { value: string | null; options: string[]; onChange: (v: string) => void; accentColor?: string }) {
  return (
    <RadioGroup value={value ?? ''} onValueChange={onChange} className="flex flex-wrap gap-2 mt-1.5">
      {options.map(opt => (
        <Label
          key={opt}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
            value === opt
              ? ''
              : 'border-border bg-card hover:border-muted-foreground'
          }`}
          style={value === opt ? { borderColor: accentColor || 'hsl(var(--primary))', backgroundColor: `${accentColor || 'hsl(var(--primary))'}1A`, color: accentColor || 'hsl(var(--primary))' } : undefined}
        >
          <RadioGroupItem value={opt} className="sr-only" />
          {opt}
        </Label>
      ))}
    </RadioGroup>
  );
}

/* ── section wrapper ── */
function Section({
  icon: Icon,
  title,
  description,
  defaultOpen = false,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  defaultOpen?: boolean;
  color?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 group">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: color || 'hsl(var(--primary))' }} />
          <span className="font-display text-sm tracking-wide">{title}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">— {description}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
export function CoachingBioForm() {
  const { profile, loading, updateProfile } = useCoachingProfile();
  const [saving, setSaving] = useState(false);

  /* ── local form state ── */
  // Personal
  const [gender, setGender] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightLb, setWeightLb] = useState('');
  const [useMetricHeight, setUseMetricHeight] = useState(true);
  const [useMetricWeight, setUseMetricWeight] = useState(true);

  // Power
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [trainingGoal, setTrainingGoal] = useState<string | null>(null);
  const [daysPerWeek, setDaysPerWeek] = useState<string>('');
  const [sessionLength, setSessionLength] = useState<string>('');
  const [benchMax, setBenchMax] = useState('');
  const [squatMax, setSquatMax] = useState('');
  const [deadliftMax, setDeadliftMax] = useState('');

  // Movement
  const [fitnessLevel, setFitnessLevel] = useState<string | null>(null);
  const [preferredCardio, setPreferredCardio] = useState<string | null>(null);
  const [weeklyCardio, setWeeklyCardio] = useState<string>('');
  const [raceGoals, setRaceGoals] = useState('');

  // Fuel
  const [nutritionGoal, setNutritionGoal] = useState<string | null>(null);
  const [dietaryPreferences, setDietaryPreferences] = useState<string | null>(null);
  const [allergies, setAllergies] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState<string>('');

  // Mindset
  const [primaryMotivation, setPrimaryMotivation] = useState<string | null>(null);
  const [biggestChallenge, setBiggestChallenge] = useState<string | null>(null);
  const [sleepHours, setSleepHours] = useState<string>('');
  const [sleepQuality, setSleepQuality] = useState<string>('');
  const [stressLevel, setStressLevel] = useState<string | null>(null);
  const [injuries, setInjuries] = useState('');
  const [mentalHealth, setMentalHealth] = useState('');

  /* ── populate from profile ── */
  useEffect(() => {
    if (!profile) return;
    // Personal
    setGender(profile.gender ?? null);
    setCity(profile.city ?? '');
    setAge(profile.age_years?.toString() ?? '');
    setUseMetricHeight(profile.preferred_height_unit === 'cm');
    setUseMetricWeight(profile.preferred_weight_unit === 'kg');
    if (profile.height_cm) {
      setHeightCm(profile.height_cm.toString());
      const { feet, inches } = cmToFeetInches(profile.height_cm);
      setHeightFeet(feet.toString());
      setHeightInches(inches.toString());
    }
    if (profile.weight_kg) {
      setWeightKg(profile.weight_kg.toString());
      setWeightLb(kgToLb(profile.weight_kg).toString());
    }

    // Power
    setExperienceLevel(profile.experience_level ?? null);
    setTrainingGoal(profile.training_goal ?? null);
    setDaysPerWeek(profile.days_per_week?.toString() ?? '');
    setSessionLength(profile.session_length_minutes?.toString() ?? '');
    if (profile.bench_max_kg != null) setBenchMax(profile.preferred_weight_unit === 'lb' ? kgToLb(profile.bench_max_kg).toString() : profile.bench_max_kg.toString());
    if (profile.squat_max_kg != null) setSquatMax(profile.preferred_weight_unit === 'lb' ? kgToLb(profile.squat_max_kg).toString() : profile.squat_max_kg.toString());
    if (profile.deadlift_max_kg != null) setDeadliftMax(profile.preferred_weight_unit === 'lb' ? kgToLb(profile.deadlift_max_kg).toString() : profile.deadlift_max_kg.toString());

    // Movement
    setFitnessLevel(profile.fitness_level ?? null);
    setPreferredCardio(profile.preferred_cardio ?? null);
    setWeeklyCardio(profile.weekly_cardio_frequency?.toString() ?? '');
    setRaceGoals(profile.race_goals ?? '');

    // Fuel
    setNutritionGoal(profile.nutrition_goal ?? null);
    setDietaryPreferences(profile.dietary_preferences ?? null);
    setAllergies(profile.allergies ?? '');
    setMealsPerDay(profile.meals_per_day?.toString() ?? '');

    // Mindset
    setPrimaryMotivation(profile.primary_motivation ?? null);
    setBiggestChallenge(profile.biggest_challenge ?? null);
    setSleepHours(profile.sleep_hours?.toString() ?? '');
    setSleepQuality(profile.sleep_quality ?? '');
    setStressLevel(profile.stress_level ?? null);
    setInjuries(profile.injuries ?? '');
    setMentalHealth(profile.mental_health ?? '');
  }, [profile]);

  /* ── unit toggles ── */
  const handleHeightUnitToggle = (metric: boolean) => {
    setUseMetricHeight(metric);
    if (metric && heightFeet && heightInches) {
      setHeightCm(feetInchesToCm(parseInt(heightFeet) || 0, parseInt(heightInches) || 0).toString());
    } else if (!metric && heightCm) {
      const { feet, inches } = cmToFeetInches(parseFloat(heightCm));
      setHeightFeet(feet.toString());
      setHeightInches(inches.toString());
    }
  };

  const handleWeightUnitToggle = (metric: boolean) => {
    setUseMetricWeight(metric);
    if (metric && weightLb) {
      const kg = lbToKg(parseFloat(weightLb));
      setWeightKg(kg.toString());
      // Convert lift values back to kg display
      if (benchMax) setBenchMax(lbToKg(parseFloat(benchMax)).toString());
      if (squatMax) setSquatMax(lbToKg(parseFloat(squatMax)).toString());
      if (deadliftMax) setDeadliftMax(lbToKg(parseFloat(deadliftMax)).toString());
    } else if (!metric && weightKg) {
      const lb = kgToLb(parseFloat(weightKg));
      setWeightLb(lb.toString());
      // Convert lift values to lb display
      if (benchMax) setBenchMax(kgToLb(parseFloat(benchMax)).toString());
      if (squatMax) setSquatMax(kgToLb(parseFloat(squatMax)).toString());
      if (deadliftMax) setDeadliftMax(kgToLb(parseFloat(deadliftMax)).toString());
    }
  };

  /* ── save ── */
  const handleSave = async () => {
    setSaving(true);

    // Resolve height
    let finalHeightCm: number | null = null;
    if (useMetricHeight && heightCm) {
      finalHeightCm = parseFloat(heightCm);
    } else if (!useMetricHeight && (heightFeet || heightInches)) {
      finalHeightCm = feetInchesToCm(parseInt(heightFeet) || 0, parseInt(heightInches) || 0);
    }

    // Resolve weight
    let finalWeightKg: number | null = null;
    if (useMetricWeight && weightKg) {
      finalWeightKg = parseFloat(weightKg);
    } else if (!useMetricWeight && weightLb) {
      finalWeightKg = lbToKg(parseFloat(weightLb));
    }

    // Resolve lifts (always store in kg)
    const liftToKg = (v: string) => {
      const n = numVal(v);
      if (n === null) return null;
      return useMetricWeight ? n : lbToKg(n);
    };

    const updates: Partial<CoachingProfile> = {
      // Personal
      gender: gender || null,
      city: city || null,
      age_years: age ? parseInt(age) : null,
      height_cm: finalHeightCm,
      weight_kg: finalWeightKg,
      preferred_height_unit: useMetricHeight ? 'cm' : 'ft_in',
      preferred_weight_unit: useMetricWeight ? 'kg' : 'lb',
      // Power
      experience_level: experienceLevel || null,
      training_goal: trainingGoal || null,
      days_per_week: daysPerWeek ? parseInt(daysPerWeek) : null,
      session_length_minutes: sessionLength ? parseInt(sessionLength) : null,
      bench_max_kg: liftToKg(benchMax),
      squat_max_kg: liftToKg(squatMax),
      deadlift_max_kg: liftToKg(deadliftMax),
      // Movement
      fitness_level: fitnessLevel || null,
      preferred_cardio: preferredCardio || null,
      weekly_cardio_frequency: weeklyCardio ? parseInt(weeklyCardio) : null,
      race_goals: raceGoals || null,
      // Fuel
      nutrition_goal: nutritionGoal || null,
      dietary_preferences: dietaryPreferences || null,
      allergies: allergies || null,
      meals_per_day: mealsPerDay ? parseInt(mealsPerDay) : null,
      // Mindset
      primary_motivation: primaryMotivation || null,
      biggest_challenge: biggestChallenge || null,
      sleep_hours: sleepHours ? parseInt(sleepHours) : null,
      sleep_quality: sleepQuality || null,
      stress_level: stressLevel || null,
      injuries: injuries || null,
      mental_health: mentalHealth || null,
    };

    const { error } = await updateProfile(updates);
    setSaving(false);

    if (error) {
      toast.error('Failed to save coaching profile');
    } else {
      toast.success('Coaching profile updated!');
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/30 border-border bg-card">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const weightUnit = useMetricWeight ? 'kg' : 'lb';

  return (
    <Card className="border-primary/30 border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <CardTitle className="font-display tracking-wide">COACHING PROFILE</CardTitle>
        </div>
        <CardDescription>
          This data powers your Unbreakable Coach — update any time as your goals or circumstances change.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">

        {/* ═══ PERSONAL ═══ */}
        <Section icon={User} title="PERSONAL" description="basics about you" defaultOpen>
          {/* Gender */}
          <div>
            <Label>Gender</Label>
            <PillSelect value={gender} options={GENDER_OPTIONS} onChange={setGender} accentColor="#FF5500" />
          </div>

          {/* City */}
          <div className="space-y-1">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              placeholder="e.g. Liverpool, Manchester, London"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          {/* Age */}
          <div className="space-y-1">
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              min="13"
              max="100"
              placeholder="e.g. 28"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Height</Label>
              <div className="flex items-center gap-2 text-sm">
                <span className={useMetricHeight ? 'text-muted-foreground' : 'text-primary font-semibold'}>ft/in</span>
                <Switch checked={useMetricHeight} onCheckedChange={handleHeightUnitToggle} />
                <span className={useMetricHeight ? 'text-primary font-semibold' : 'text-muted-foreground'}>cm</span>
              </div>
            </div>
            {useMetricHeight ? (
              <Input
                type="number" min="30" max="300" placeholder="e.g. 180"
                value={heightCm} onChange={(e) => setHeightCm(e.target.value)}
                className="bg-input border-border"
              />
            ) : (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input type="number" min="0" max="8" placeholder="Feet"
                    value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)}
                    className="bg-input border-border"
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">ft</span>
                </div>
                <div className="flex-1">
                  <Input type="number" min="0" max="11" placeholder="Inches"
                    value={heightInches} onChange={(e) => setHeightInches(e.target.value)}
                    className="bg-input border-border"
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">in</span>
                </div>
              </div>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Weight</Label>
              <div className="flex items-center gap-2 text-sm">
                <span className={useMetricWeight ? 'text-muted-foreground' : 'text-primary font-semibold'}>lb</span>
                <Switch checked={useMetricWeight} onCheckedChange={handleWeightUnitToggle} />
                <span className={useMetricWeight ? 'text-primary font-semibold' : 'text-muted-foreground'}>kg</span>
              </div>
            </div>
            <Input
              type="number" min="20" max={useMetricWeight ? 400 : 880}
              placeholder={useMetricWeight ? 'e.g. 80' : 'e.g. 176'}
              value={useMetricWeight ? weightKg : weightLb}
              onChange={(e) => useMetricWeight ? setWeightKg(e.target.value) : setWeightLb(e.target.value)}
              className="bg-input border-border"
            />
          </div>
        </Section>

        <div className="border-t border-border" />

        {/* ═══ POWER ═══ */}
        <Section icon={Zap} title="POWER" description="strength & training" color="#FF5500">
          {/* Experience */}
          <div>
            <Label>Experience Level</Label>
            <PillSelect value={experienceLevel} options={EXPERIENCE_OPTIONS} onChange={setExperienceLevel} accentColor="#FF5500" />
          </div>

          {/* Training Goal */}
          <div>
            <Label>Training Goal</Label>
            <PillSelect value={trainingGoal} options={TRAINING_GOAL_OPTIONS} onChange={setTrainingGoal} accentColor="#FF5500" />
          </div>

          {/* Days + Session length */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Days Per Week</Label>
              <Select value={daysPerWeek} onValueChange={setDaysPerWeek}>
                <SelectTrigger className="mt-1 bg-input border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7].map(d => (
                    <SelectItem key={d} value={d.toString()}>{d} days</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Session Length</Label>
              <Select value={sessionLength} onValueChange={setSessionLength}>
                <SelectTrigger className="mt-1 bg-input border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {[30, 45, 60, 75, 90, 120].map(m => (
                    <SelectItem key={m} value={m.toString()}>{m} mins</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Key lifts */}
          <div>
            <Label className="text-sm text-muted-foreground">Key Lifts ({weightUnit})</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div>
                <Label className="text-xs">Bench</Label>
                <Input type="number" placeholder="--" value={benchMax}
                  onChange={(e) => setBenchMax(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div>
                <Label className="text-xs">Squat</Label>
                <Input type="number" placeholder="--" value={squatMax}
                  onChange={(e) => setSquatMax(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div>
                <Label className="text-xs">Deadlift</Label>
                <Input type="number" placeholder="--" value={deadliftMax}
                  onChange={(e) => setDeadliftMax(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </div>
          </div>
        </Section>

        <div className="border-t border-border" />

        {/* ═══ MOVEMENT ═══ */}
        <Section icon={Activity} title="MOVEMENT" description="cardio & fitness" color="#EF4444">
          {/* Fitness level */}
          <div>
            <Label>Current Fitness Level</Label>
            <PillSelect value={fitnessLevel} options={FITNESS_LEVEL_OPTIONS} onChange={setFitnessLevel} accentColor="#EF4444" />
          </div>

          {/* Preferred cardio */}
          <div>
            <Label>Preferred Cardio</Label>
            <PillSelect value={preferredCardio} options={CARDIO_OPTIONS} onChange={setPreferredCardio} accentColor="#EF4444" />
          </div>

          {/* Weekly cardio */}
          <div>
            <Label>Weekly Cardio Sessions</Label>
            <Select value={weeklyCardio} onValueChange={setWeeklyCardio}>
              <SelectTrigger className="mt-1 bg-input border-border"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                  <SelectItem key={d} value={d.toString()}>{d} sessions</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Race goals */}
          <div className="space-y-1">
            <Label htmlFor="raceGoals">Race / Distance Goals</Label>
            <Input
              id="raceGoals"
              placeholder="e.g. Sub-25 min 5K, Complete a half marathon"
              value={raceGoals}
              onChange={(e) => setRaceGoals(e.target.value)}
              className="bg-input border-border"
            />
          </div>
        </Section>

        <div className="border-t border-border" />

        {/* ═══ FUEL ═══ */}
        <Section icon={Utensils} title="FUEL" description="nutrition & diet" color="#10B981">
          {/* Nutrition goal */}
          <div>
            <Label>Nutrition Goal</Label>
            <PillSelect value={nutritionGoal} options={NUTRITION_GOAL_OPTIONS} onChange={setNutritionGoal} accentColor="#10B981" />
          </div>

          {/* Dietary preferences */}
          <div>
            <Label>Dietary Preferences</Label>
            <PillSelect value={dietaryPreferences} options={DIET_OPTIONS} onChange={setDietaryPreferences} accentColor="#10B981" />
          </div>

          {/* Allergies */}
          <div className="space-y-1">
            <Label htmlFor="allergies">Allergies / Intolerances</Label>
            <Input
              id="allergies"
              placeholder="e.g. Gluten, Dairy, Nuts"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          {/* Meals per day */}
          <div>
            <Label>Meals Per Day</Label>
            <Select value={mealsPerDay} onValueChange={setMealsPerDay}>
              <SelectTrigger className="mt-1 bg-input border-border"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6].map(m => (
                  <SelectItem key={m} value={m.toString()}>{m} meals</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Section>

        <div className="border-t border-border" />

        {/* ═══ MINDSET ═══ */}
        <Section icon={Brain} title="MINDSET" description="goals, sleep & recovery" color="#8B5CF6">
          {/* Primary motivation */}
          <div>
            <Label>Primary Motivation</Label>
            <PillSelect value={primaryMotivation} options={MOTIVATION_OPTIONS} onChange={setPrimaryMotivation} accentColor="#8B5CF6" />
          </div>

          {/* Biggest challenge */}
          <div>
            <Label>Biggest Challenge</Label>
            <PillSelect value={biggestChallenge} options={CHALLENGE_OPTIONS} onChange={setBiggestChallenge} accentColor="#8B5CF6" />
          </div>

          {/* Sleep */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Avg Sleep (hours)</Label>
              <Select value={sleepHours} onValueChange={setSleepHours}>
                <SelectTrigger className="mt-1 bg-input border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {[4, 5, 6, 7, 8, 9, 10].map(h => (
                    <SelectItem key={h} value={h.toString()}>{h}h</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sleep Quality</Label>
              <Select value={sleepQuality} onValueChange={setSleepQuality}>
                <SelectTrigger className="mt-1 bg-input border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {SLEEP_QUALITY_OPTIONS.map(q => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stress */}
          <div>
            <Label>Stress Level</Label>
            <PillSelect value={stressLevel} options={STRESS_OPTIONS} onChange={setStressLevel} accentColor="#8B5CF6" />
          </div>

          {/* Injuries */}
          <div className="space-y-1">
            <Label htmlFor="injuries">Physical Injuries / Conditions</Label>
            <Textarea
              id="injuries"
              placeholder="e.g. Lower back disc issue, shoulder impingement..."
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
              className="bg-input border-border min-h-[60px]"
            />
            <p className="text-xs text-muted-foreground">List any physical injuries, pain points, or medical conditions that affect training.</p>
          </div>

          {/* Mental health */}
          <div className="space-y-1">
            <Label htmlFor="mentalHealth">Mental Health & Wellbeing</Label>
            <Textarea
              id="mentalHealth"
              placeholder="e.g. Managing anxiety, ADHD, low motivation periods..."
              value={mentalHealth}
              onChange={(e) => setMentalHealth(e.target.value)}
              className="bg-input border-border min-h-[60px]"
            />
            <p className="text-xs text-muted-foreground">Any mental health considerations your coach should be aware of. This is kept confidential.</p>
          </div>
        </Section>

        {/* ── SAVE ── */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full font-display tracking-wide"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            SAVE COACHING PROFILE
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-3">
            This data is private and only used by your Unbreakable Coach.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
