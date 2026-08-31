import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Gender, ActivityLevel, Goal, MacroSplit, Unit } from '@/lib/fuelCalculations';
import { activityLabels, goalLabels, macroSplitLabels } from '@/lib/fuelCalculations';
import { User, Activity, Target, PieChart } from 'lucide-react';

interface FuelFormProps {
  onCalculate: (data: {
    gender: Gender;
    age: number;
    heightFt: number;
    heightIn: number;
    weight: number;
    activityLevel: ActivityLevel;
    goal: Goal;
    macroSplit: MacroSplit;
    unit: Unit;
  }) => void;
}

export function FuelForm({ onCalculate }: FuelFormProps) {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('30');
  const [unit, setUnit] = useState<Unit>('imperial');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('10');
  const [heightCm, setHeightCm] = useState('178');
  const [weightLbs, setWeightLbs] = useState('180');
  const [weightKg, setWeightKg] = useState('82');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [macroSplit, setMacroSplit] = useState<MacroSplit>('balanced');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ageNum = parseInt(age);
    const weightNum = unit === 'imperial' ? parseFloat(weightLbs) : parseFloat(weightKg);

    if (isNaN(ageNum) || isNaN(weightNum)) return;
    
    if (unit === 'imperial') {
      const ftNum = parseInt(heightFt) || 0;
      const inNum = parseInt(heightIn) || 0;
      onCalculate({
        gender,
        age: ageNum,
        heightFt: ftNum,
        heightIn: inNum,
        weight: weightNum,
        activityLevel,
        goal,
        macroSplit,
        unit,
      });
    } else {
      const cmNum = parseFloat(heightCm) || 0;
      onCalculate({
        gender,
        age: ageNum,
        heightFt: cmNum, // In metric, we pass cm as heightFt
        heightIn: 0,
        weight: weightNum,
        activityLevel,
        goal,
        macroSplit,
        unit,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Stats Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <User className="w-5 h-5" />
          <span className="font-display text-xl tracking-wide">PERSONAL STATS</span>
        </div>
        
        {/* Gender */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={gender === 'male' ? 'default' : 'outline'}
            onClick={() => setGender('male')}
            className="w-full"
          >
            Male
          </Button>
          <Button
            type="button"
            variant={gender === 'female' ? 'default' : 'outline'}
            onClick={() => setGender('female')}
            className="w-full"
          >
            Female
          </Button>
        </div>

        {/* Age */}
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="15"
            max="100"
            className="mt-1"
          />
        </div>

        {/* Unit Toggle */}
        <div className="flex justify-end">
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setUnit('imperial')}
              className={`px-4 py-2 text-sm transition-colors ${
                unit === 'imperial'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              Imperial
            </button>
            <button
              type="button"
              onClick={() => setUnit('metric')}
              className={`px-4 py-2 text-sm transition-colors ${
                unit === 'metric'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              Metric
            </button>
          </div>
        </div>

        {/* Height */}
        <div>
          <Label>Height</Label>
          {unit === 'imperial' ? (
            <div className="flex gap-2 mt-1">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    min="3"
                    max="8"
                  />
                  <span className="text-muted-foreground">ft</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    min="0"
                    max="11"
                  />
                  <span className="text-muted-foreground">in</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                min="100"
                max="250"
              />
              <span className="text-muted-foreground">cm</span>
            </div>
          )}
        </div>

        {/* Weight */}
        <div>
          <Label htmlFor="weight">Weight</Label>
          <div className="flex items-center gap-2 mt-1">
            {unit === 'imperial' ? (
              <Input
                id="weight"
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                min="50"
                max="500"
              />
            ) : (
              <Input
                id="weight"
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                min="25"
                max="250"
              />
            )}
            <span className="text-muted-foreground">{unit === 'imperial' ? 'lbs' : 'kg'}</span>
          </div>
        </div>
      </div>

      {/* Activity Level Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="w-5 h-5" />
          <span className="font-display text-xl tracking-wide">ACTIVITY LEVEL</span>
        </div>
        
        <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(activityLabels) as ActivityLevel[]).map((level) => (
              <SelectItem key={level} value={level}>
                {activityLabels[level]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Goal Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Target className="w-5 h-5" />
          <span className="font-display text-xl tracking-wide">YOUR GOAL</span>
        </div>
        
        <RadioGroup value={goal} onValueChange={(v) => setGoal(v as Goal)} className="grid grid-cols-2 gap-2">
          {(Object.keys(goalLabels) as Goal[]).map((g) => (
            <div key={g}>
              <RadioGroupItem value={g} id={`goal-${g}`} className="peer sr-only" />
              <Label
                htmlFor={`goal-${g}`}
                className="flex items-center justify-center rounded-md border-2 border-border bg-card p-3 cursor-pointer transition-colors hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
              >
                {goalLabels[g]}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Macro Split Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <PieChart className="w-5 h-5" />
          <span className="font-display text-xl tracking-wide">MACRO SPLIT</span>
        </div>
        
        <Select value={macroSplit} onValueChange={(v) => setMacroSplit(v as MacroSplit)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(macroSplitLabels) as MacroSplit[]).filter(s => s !== 'custom').map((split) => (
              <SelectItem key={split} value={split}>
                {macroSplitLabels[split]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full font-display text-lg tracking-wide">
        CALCULATE MY MACROS
      </Button>
    </form>
  );
}
