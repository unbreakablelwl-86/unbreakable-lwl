import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { CheckIn } from '@/hooks/useCheckIns';
import {
  Scale, Ruler, Heart, Brain, Zap,
  Moon, Activity, Droplets, Footprints,
  Trophy, AlertTriangle, MessageSquare,
  Camera, Send, ArrowLeft, ChevronRight,
  ChevronLeft, Check,
} from 'lucide-react';

interface CheckInFormProps {
  checkIn: CheckIn;
  onSubmit: (id: string, data: Partial<CheckIn>) => void;
  onBack: () => void;
}

const STEPS = ['Body', 'Wellness', 'Compliance', 'Reflections'];

function SliderField({
  label,
  icon: Icon,
  value,
  onChange,
  max = 10,
  labels,
}: {
  label: string;
  icon: React.ElementType;
  value: number | null;
  onChange: (v: number) => void;
  max?: number;
  labels?: [string, string];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 font-display text-xs tracking-wide">
          <Icon className="w-4 h-4 text-primary" />
          {label}
        </Label>
        <span className="text-sm font-display text-primary">{value ?? '-'}/{max}</span>
      </div>
      <Slider
        value={[value ?? Math.round(max / 2)]}
        onValueChange={([v]) => onChange(v)}
        max={max}
        min={max === 100 ? 0 : 1}
        step={max === 100 ? 5 : 1}
        className="w-full"
      />
      {labels && (
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}
    </div>
  );
}

export function CheckInForm({ checkIn, onSubmit, onBack }: CheckInFormProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Body measurements
  const [weightKg, setWeightKg] = useState(checkIn.weight_kg?.toString() || '');
  const [bodyFatPct, setBodyFatPct] = useState(checkIn.body_fat_pct?.toString() || '');
  const [waistCm, setWaistCm] = useState(checkIn.waist_cm?.toString() || '');
  const [chestCm, setChestCm] = useState(checkIn.chest_cm?.toString() || '');
  const [hipsCm, setHipsCm] = useState(checkIn.hips_cm?.toString() || '');
  const [armCm, setArmCm] = useState(checkIn.arm_cm?.toString() || '');
  const [thighCm, setThighCm] = useState(checkIn.thigh_cm?.toString() || '');

  // Wellness
  const [energyLevel, setEnergyLevel] = useState<number | null>(checkIn.energy_level);
  const [sleepQuality, setSleepQuality] = useState<number | null>(checkIn.sleep_quality);
  const [stressLevel, setStressLevel] = useState<number | null>(checkIn.stress_level);
  const [mood, setMood] = useState<number | null>(checkIn.mood);
  const [soreness, setSoreness] = useState<number | null>(checkIn.soreness);

  // Compliance
  const [trainingCompliance, setTrainingCompliance] = useState<number | null>(checkIn.training_compliance);
  const [nutritionCompliance, setNutritionCompliance] = useState<number | null>(checkIn.nutrition_compliance);
  const [stepsAvg, setStepsAvg] = useState(checkIn.steps_avg?.toString() || '');
  const [waterLitres, setWaterLitres] = useState(checkIn.water_litres?.toString() || '');

  // Reflections
  const [wins, setWins] = useState(checkIn.wins || '');
  const [challenges, setChallenges] = useState(checkIn.challenges || '');
  const [athleteNotes, setAthleteNotes] = useState(checkIn.athlete_notes || '');

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(checkIn.id, {
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      body_fat_pct: bodyFatPct ? parseFloat(bodyFatPct) : null,
      waist_cm: waistCm ? parseFloat(waistCm) : null,
      chest_cm: chestCm ? parseFloat(chestCm) : null,
      hips_cm: hipsCm ? parseFloat(hipsCm) : null,
      arm_cm: armCm ? parseFloat(armCm) : null,
      thigh_cm: thighCm ? parseFloat(thighCm) : null,
      energy_level: energyLevel,
      sleep_quality: sleepQuality,
      stress_level: stressLevel,
      mood,
      soreness,
      training_compliance: trainingCompliance,
      nutrition_compliance: nutritionCompliance,
      steps_avg: stepsAvg ? parseInt(stepsAvg) : null,
      water_litres: waterLitres ? parseFloat(waterLitres) : null,
      wins: wins || null,
      challenges: challenges || null,
      athlete_notes: athleteNotes || null,
    });
    setSubmitting(false);
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Body
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-primary" />
              <h3 className="font-display tracking-wide">BODY MEASUREMENTS</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-display tracking-wide text-muted-foreground">WEIGHT (KG)</Label>
                <Input type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="0.0" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-display tracking-wide text-muted-foreground">BODY FAT %</Label>
                <Input type="number" step="0.1" value={bodyFatPct} onChange={e => setBodyFatPct(e.target.value)} placeholder="0.0" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-display tracking-wide text-muted-foreground">WAIST (CM)</Label>
                <Input type="number" step="0.1" value={waistCm} onChange={e => setWaistCm(e.target.value)} placeholder="0.0" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-display tracking-wide text-muted-foreground">CHEST (CM)</Label>
                <Input type="number" step="0.1" value={chestCm} onChange={e => setChestCm(e.target.value)} placeholder="0.0" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-display tracking-wide text-muted-foreground">HIPS (CM)</Label>
                <Input type="number" step="0.1" value={hipsCm} onChange={e => setHipsCm(e.target.value)} placeholder="0.0" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-display tracking-wide text-muted-foreground">ARM (CM)</Label>
                <Input type="number" step="0.1" value={armCm} onChange={e => setArmCm(e.target.value)} placeholder="0.0" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-display tracking-wide text-muted-foreground">THIGH (CM)</Label>
                <Input type="number" step="0.1" value={thighCm} onChange={e => setThighCm(e.target.value)} placeholder="0.0" className="mt-1" />
              </div>
            </div>
          </div>
        );

      case 1: // Wellness
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-display tracking-wide">WELLNESS</h3>
            </div>
            <SliderField label="ENERGY" icon={Zap} value={energyLevel} onChange={setEnergyLevel} labels={['Exhausted', 'Unstoppable']} />
            <SliderField label="SLEEP" icon={Moon} value={sleepQuality} onChange={setSleepQuality} labels={['Terrible', 'Perfect']} />
            <SliderField label="STRESS" icon={Brain} value={stressLevel} onChange={setStressLevel} labels={['None', 'Overwhelming']} />
            <SliderField label="MOOD" icon={Heart} value={mood} onChange={setMood} labels={['Low', 'Great']} />
            <SliderField label="SORENESS" icon={Activity} value={soreness} onChange={setSoreness} labels={['None', 'Can\'t move']} />
          </div>
        );

      case 2: // Compliance
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-primary" />
              <h3 className="font-display tracking-wide">COMPLIANCE</h3>
            </div>
            <SliderField label="TRAINING ADHERENCE" icon={Activity} value={trainingCompliance} onChange={setTrainingCompliance} max={100} labels={['0%', '100%']} />
            <SliderField label="NUTRITION ADHERENCE" icon={Droplets} value={nutritionCompliance} onChange={setNutritionCompliance} max={100} labels={['0%', '100%']} />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <Label className="text-xs font-display tracking-wide text-muted-foreground">AVG DAILY STEPS</Label>
                <Input type="number" value={stepsAvg} onChange={e => setStepsAvg(e.target.value)} placeholder="10000" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-display tracking-wide text-muted-foreground">WATER (LITRES)</Label>
                <Input type="number" step="0.1" value={waterLitres} onChange={e => setWaterLitres(e.target.value)} placeholder="2.5" className="mt-1" />
              </div>
            </div>
          </div>
        );

      case 3: // Reflections
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-display tracking-wide">REFLECTIONS</h3>
            </div>
            <div>
              <Label className="text-xs font-display tracking-wide text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Trophy className="w-3.5 h-3.5" /> WINS THIS WEEK
              </Label>
              <Textarea value={wins} onChange={e => setWins(e.target.value)} placeholder="What went well?" rows={3} />
            </div>
            <div>
              <Label className="text-xs font-display tracking-wide text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> CHALLENGES
              </Label>
              <Textarea value={challenges} onChange={e => setChallenges(e.target.value)} placeholder="What was difficult?" rows={3} />
            </div>
            <div>
              <Label className="text-xs font-display tracking-wide text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> ANYTHING ELSE FOR YOUR COACH?
              </Label>
              <Textarea value={athleteNotes} onChange={e => setAthleteNotes(e.target.value)} placeholder="Questions, requests, updates..." rows={3} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="font-display tracking-wide text-lg">CHECK-IN #{checkIn.check_in_number}</h2>
          {checkIn.due_date && (
            <p className="text-xs text-muted-foreground">Due: {new Date(checkIn.due_date).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1.5">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex-1 py-1.5 rounded text-[10px] font-display tracking-wider transition-colors ${
              i === step
                ? 'bg-primary text-primary-foreground'
                : i < step
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Form content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="border-border border-gray-800 bg-[#111]">
          <CardContent className="p-4">
            {renderStep()}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="font-display text-xs tracking-wide"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          BACK
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            className="font-display text-xs tracking-wide"
          >
            NEXT
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="font-display text-xs tracking-wide gap-1.5"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'SUBMITTING...' : 'SUBMIT CHECK-IN'}
          </Button>
        )}
      </div>
    </div>
  );
}
