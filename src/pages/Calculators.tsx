import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ThemedLogo } from '@/components/ThemedLogo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { PageNavigation, SwipeNavigationWrapper } from '@/components/PageNavigation';
import { Dumbbell, Flame, Timer, ArrowRight, ArrowLeft } from 'lucide-react';

import { StrengthForm } from '@/components/StrengthForm';
import { StrengthResults } from '@/components/StrengthResults';
import { calculateOneRepMax, calculateStrengthLevel } from '@/lib/strengthCalculations';
import type { Gender as StrengthGender, Exercise, StrengthResult } from '@/lib/strengthCalculations';

import { FuelForm } from '@/components/FuelForm';
import { FuelResults } from '@/components/FuelResults';
import { calculateFuel } from '@/lib/fuelCalculations';
import type { Gender as FuelGender, ActivityLevel, Goal, MacroSplit, Unit, FuelResult } from '@/lib/fuelCalculations';

import { SpeedForm } from '@/components/SpeedForm';
import { SpeedResults } from '@/components/SpeedResults';
import { calculateSpeedLevel, timeToSeconds } from '@/lib/speedCalculations';
import type { Gender as SpeedGender, Distance, SpeedResult } from '@/lib/speedCalculations';

type Tab = 'strength' | 'fuel' | 'speed';

const heroContent = {
  strength: {
    title: 'POWER',
    titleAccent: 'CALCULATOR',
    tagline: 'LIVE WITHOUT LIMITS',
    intro: "Your body is your armour. Strength isn't about lifting heavy once — it's about building a foundation that",
    emphasis: 'CARRIES YOU THROUGH LIFE',
    description: 'Age-adjusted standards mean you\'re measured against what\'s realistic and achievable for you —',
    descEmphasis: 'REGARDLESS OF AGE',
    descEnd: '.',
    goal: 'Build a body that\'s strong, mobile, and resilient.',
    goalEmphasis: 'KEEP SHOWING UP',
    goalEnd: '.',
    hashtag: '#UNBREAKABLEPOWER',
  },
  fuel: {
    title: 'FUEL',
    titleAccent: 'CALCULATOR',
    tagline: 'LIVE WITHOUT LIMITS',
    intro: 'Food is not the enemy — it\'s the weapon. Your body needs',
    emphasis: 'STRATEGIC FUEL',
    description: 'Precise targets based on your body, your activity, and your goals — so you can stop guessing and start',
    descEmphasis: 'EATING WITH PURPOSE',
    descEnd: '.',
    goal: 'Fuel a body built to last — not just look good.',
    goalEmphasis: 'KEEP SHOWING UP',
    goalEnd: '.',
    hashtag: '#UNBREAKABLEFUEL',
  },
  speed: {
    title: 'MOVEMENT',
    titleAccent: 'CALCULATOR',
    tagline: 'LIVE WITHOUT LIMITS',
    intro: "Every finish line is a new starting point. Understand where you stand and",
    emphasis: 'BUILD SPEED THAT LASTS',
    description: 'Age-adjusted ratings mean you\'re competing against the best version of you —',
    descEmphasis: 'NOT SOMEONE ELSE\'S GENETICS',
    descEnd: '.',
    goal: 'Every step forward is a step toward unbreakable endurance.',
    goalEmphasis: 'KEEP SHOWING UP',
    goalEnd: '.',
    hashtag: '#UNBREAKABLEMOVEMENT',
  },
};

const Calculators = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'strength');

  // Strength state
  const [strengthResult, setStrengthResult] = useState<{
    data: StrengthResult;
    exercise: Exercise;
    unit: 'kg' | 'lb';
  } | null>(null);

  // Fuel state
  const [fuelResult, setFuelResult] = useState<FuelResult | null>(null);

  // Speed state
  const [speedResult, setSpeedResult] = useState<SpeedResult | null>(null);

  useEffect(() => {
    if (tabParam && ['strength', 'fuel', 'speed'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleStrengthCalculate = (data: {
    gender: StrengthGender;
    age: number;
    bodyweight: number;
    exercise: Exercise;
    weight: number;
    reps: number;
    unit: 'kg' | 'lb';
  }) => {
    const oneRepMax = calculateOneRepMax(data.weight, data.reps);
    const result = calculateStrengthLevel(
      oneRepMax,
      data.bodyweight,
      data.exercise,
      data.gender,
      data.age
    );
    setStrengthResult({ data: result, exercise: data.exercise, unit: data.unit });
  };

  const handleFuelCalculate = (data: {
    gender: FuelGender;
    age: number;
    heightFt: number;
    heightIn: number;
    weight: number;
    activityLevel: ActivityLevel;
    goal: Goal;
    macroSplit: MacroSplit;
    unit: Unit;
  }) => {
    const result = calculateFuel(
      data.gender,
      data.age,
      data.heightFt,
      data.heightIn,
      data.weight,
      data.activityLevel,
      data.goal,
      data.macroSplit,
      data.unit
    );
    setFuelResult(result);
  };

  const handleSpeedCalculate = (data: {
    gender: SpeedGender;
    age: number;
    distance: Distance;
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
    const totalSeconds = timeToSeconds(data.hours, data.minutes, data.seconds);
    const result = calculateSpeedLevel(totalSeconds, data.distance, data.gender, data.age);
    setSpeedResult(result);
  };

  const hero = heroContent[activeTab];

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'strength', label: 'POWER', icon: <Dumbbell className="w-5 h-5" /> },
    { key: 'fuel', label: 'FUEL', icon: <Flame className="w-5 h-5" /> },
    { key: 'speed', label: 'MOVEMENT', icon: <Timer className="w-5 h-5" /> },
  ];

  return (
    <SwipeNavigationWrapper>
      <div className="min-h-screen pb-24" >
        {/* Header with Theme Toggle */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-3">
                  <ThemedLogo />
                  <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                    UNBREAKABLE
                  </span>
                </Link>
              </div>
</div>
          </div>
        </header>

        {/* Page Navigation */}
        <div className="pt-[72px]">
          <PageNavigation />
        </div>

        {/* Back nav */}
        <div className="px-4 pt-4">
          <button onClick={() => navigate('/programming')} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-muted-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Power
          </button>
        </div>
        {/* Compact Mindset Hero */}
        <div className="relative px-4 pt-3 pb-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
          <div className="relative z-10">
            <h1 className="font-display text-2xl tracking-wider text-center">
              <span className="text-foreground">{hero.title} </span>
              <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>{hero.titleAccent}</span>
            </h1>
            <p className="text-center text-muted-foreground text-sm mt-1 font-display tracking-wide">
              {hero.tagline}
            </p>
          </div>
        </div>

      {/* Tab Navigation - Pill Bar */}
      <div className="px-2 mb-4">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display text-xs tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-muted-foreground border border-transparent hover:text-muted-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Description Card */}
          <div className="p-3.5 rounded-xl border border-primary/15 bg-card mb-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {hero.intro}{' '}
              <span className="text-primary font-semibold">{hero.emphasis}</span>.{' '}
              {hero.description}
            </p>
            <p className="text-primary font-display text-xs tracking-wider mt-2">KEEP SHOWING UP.</p>
          </div>

          {/* Calculator Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-display text-2xl text-primary mb-8 tracking-wide text-center">
                {activeTab === 'strength' && 'ENTER YOUR LIFT'}
                {activeTab === 'fuel' && 'ENTER YOUR DETAILS'}
                {activeTab === 'speed' && 'ENTER YOUR RACE'}
              </h3>
              
              {activeTab === 'strength' && <StrengthForm onCalculate={handleStrengthCalculate} />}
              {activeTab === 'fuel' && <FuelForm onCalculate={handleFuelCalculate} />}
              {activeTab === 'speed' && <SpeedForm onCalculate={handleSpeedCalculate} />}
            </div>

            {/* Results */}
            <div>
              {activeTab === 'strength' && (
                strengthResult ? (
                  <StrengthResults
                    result={strengthResult.data}
                    exercise={strengthResult.exercise}
                    unit={strengthResult.unit}
                  />
                ) : (
                  <EmptyState emoji="🏋️" title="READY TO CALCULATE" description="Enter your lift details to see your estimated 1RM and strength level." />
                )
              )}
              
              {activeTab === 'fuel' && (
                fuelResult ? (
                  <FuelResults result={fuelResult} />
                ) : (
                  <EmptyState emoji="🔥" title="READY TO TRANSFORM?" description="Enter your details to get your personalized calorie and macro targets." />
                )
              )}
              
              {activeTab === 'speed' && (
                speedResult ? (
                  <SpeedResults result={speedResult} />
                ) : (
                  <EmptyState emoji="🏃" title="READY TO ANALYZE" description="Enter your race time to see your speed stats and performance level." />
                )
              )}
            </div>
          </div>
        </div>
      </main>

      
</div>
    </SwipeNavigationWrapper>
  );
};

function EmptyState({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 h-full flex items-center justify-center min-h-[450px]">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">{emoji}</span>
        </div>
        <h3 className="font-display text-2xl text-primary mb-3 tracking-wide">
          {title}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}

export default Calculators;
