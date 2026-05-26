import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import {
  Brain, Wind, Gamepad2, Flame, ArrowRight, BookOpen, Snowflake, ThermometerSun,
  Timer, Play, Pause, RotateCcw, ChevronDown, ChevronRight as ChevronRightIcon,
  ChevronLeft, ChevronRight,
  Check, Plus, Sparkles, Target, Heart, Activity, Droplets, Settings2, Volume2,
  Zap, Trophy, Calendar, BarChart3, Clock, TrendingUp,
  Crosshair, Grid3X3, Shapes
} from "lucide-react";
import { useDailyHabits } from "@/hooks/useDailyHabits";
import { useMindsetProgrammes } from "@/hooks/useMindsetProgrammes";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

/* ─── Types ─── */
type MindsetTab = 'overview' | 'breathwork' | 'exposure' | 'games' | 'habits' | 'programmes';

interface ExposureProtocol {
  id: string;
  name: string;
  icon: typeof Snowflake;
  description: string;
  steps: { label: string; duration: number }[];
  category: 'cold' | 'heat';
  colour: string;
}

/* ─── Exposure Protocols ─── */
const EXPOSURE_PROTOCOLS: ExposureProtocol[] = [
  {
    id: 'cold-shower-beginner',
    name: 'COLD SHOWER — BEGINNER',
    icon: Snowflake,
    description: 'Start with warm water, transition to cold for the final phase. Build your tolerance progressively.',
    steps: [
      { label: 'Warm Water', duration: 120 },
      { label: 'Cold Transition', duration: 15 },
      { label: 'Full Cold', duration: 30 },
    ],
    category: 'cold',
    colour: '#FF5500',
  },
  {
    id: 'cold-shower-intermediate',
    name: 'COLD SHOWER — INTERMEDIATE',
    icon: Snowflake,
    description: 'Longer cold exposure. Control your breathing throughout. You are the master of your nervous system.',
    steps: [
      { label: 'Warm Water', duration: 60 },
      { label: 'Cold Transition', duration: 15 },
      { label: 'Full Cold', duration: 90 },
    ],
    category: 'cold',
    colour: '#FF5500',
  },
  {
    id: 'cold-shower-advanced',
    name: 'COLD SHOWER — ADVANCED',
    icon: Snowflake,
    description: 'Start cold, stay cold. Full nervous system conditioning. Control your breath, control your mind.',
    steps: [
      { label: 'Full Cold', duration: 180 },
      { label: 'Recovery Breathing', duration: 30 },
    ],
    category: 'cold',
    colour: '#FF5500',
  },
  {
    id: 'ice-bath-standard',
    name: 'ICE BATH — STANDARD',
    icon: Droplets,
    description: 'Full body cold immersion. The ultimate test of mental control and parasympathetic activation.',
    steps: [
      { label: 'Pre-Breathwork', duration: 60 },
      { label: 'Cold Immersion', duration: 120 },
      { label: 'Recovery', duration: 60 },
    ],
    category: 'cold',
    colour: '#FF5500',
  },
  {
    id: 'ice-bath-extended',
    name: 'ICE BATH — EXTENDED',
    icon: Droplets,
    description: 'Extended cold immersion for those with solid cold exposure foundations. Deep parasympathetic reset.',
    steps: [
      { label: 'Pre-Breathwork', duration: 90 },
      { label: 'Cold Immersion', duration: 300 },
      { label: 'Active Recovery', duration: 120 },
    ],
    category: 'cold',
    colour: '#FF5500',
  },
  {
    id: 'sauna-standard',
    name: 'SAUNA — STANDARD',
    icon: ThermometerSun,
    description: 'Heat exposure increases heat-shock proteins, improves cardiovascular health, and builds stress resilience.',
    steps: [
      { label: 'Heat Phase 1', duration: 600 },
      { label: 'Cool Down', duration: 120 },
      { label: 'Heat Phase 2', duration: 600 },
      { label: 'Recovery', duration: 180 },
    ],
    category: 'heat',
    colour: '#FF5500',
  },
  {
    id: 'sauna-contrast',
    name: 'CONTRAST — HOT/COLD PROTOCOL',
    icon: Activity,
    description: 'Alternating heat and cold creates powerful cardiovascular and immune system adaptations.',
    steps: [
      { label: 'Sauna Heat', duration: 480 },
      { label: 'Cold Shower/Plunge', duration: 120 },
      { label: 'Sauna Heat', duration: 480 },
      { label: 'Cold Shower/Plunge', duration: 120 },
      { label: 'Final Recovery', duration: 120 },
    ],
    category: 'heat',
    colour: '#FF5500',
  },
];

/* ─── Helpers ─── */
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `0:${sec.toString().padStart(2, '0')}`;
};

/* ═══════════════════════════════════════════════════════════════════
   Exposure Timer Component
   ═══════════════════════════════════════════════════════════════════ */
function ExposureTimer({ protocol, onBack }: { protocol: ExposureProtocol; onBack: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(protocol.steps[0].duration);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = protocol.steps[stepIdx];
  const totalDuration = protocol.steps.reduce((sum, s) => sum + s.duration, 0);
  const elapsedBefore = protocol.steps.slice(0, stepIdx).reduce((sum, s) => sum + s.duration, 0);
  const elapsed = elapsedBefore + (currentStep.duration - remaining);
  const progressPercent = (elapsed / totalDuration) * 100;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            // Move to next step
            if (stepIdx < protocol.steps.length - 1) {
              setStepIdx(si => si + 1);
              return protocol.steps[stepIdx + 1].duration;
            } else {
              setRunning(false);
              setComplete(true);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, stepIdx, protocol.steps]);

  const reset = () => {
    setStepIdx(0);
    setRemaining(protocol.steps[0].duration);
    setRunning(false);
    setComplete(false);
  };

  const Icon = protocol.icon;

  if (complete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display text-2xl text-foreground mb-2">SESSION COMPLETE</h2>
        <p className="text-muted-foreground mb-6">{protocol.name} — {fmtTime(totalDuration)} total</p>
        <div className="flex gap-3">
          <button onClick={reset} className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm">
            Repeat
          </button>
          <button onClick={onBack} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-display">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 pt-6">
      <button onClick={onBack} className="self-start text-muted-foreground hover:text-muted-foreground text-sm mb-4">
        ← Back
      </button>

      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 border"
        style={{ borderColor: `${protocol.colour}33`, background: `${protocol.colour}15` }}>
        <Icon className="w-8 h-8" style={{ color: protocol.colour, filter: `drop-shadow(0 0 8px ${protocol.colour}88)` }} />
      </div>

      <h2 className="font-display text-lg text-foreground tracking-wide mb-1">{protocol.name}</h2>
      <p className="text-muted-foreground text-xs mb-6">Step {stepIdx + 1} of {protocol.steps.length}</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-1.5 bg-card rounded-full mb-6 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%`, background: protocol.colour }} />
      </div>

      {/* Current step */}
      <div className="text-center mb-8">
        <p className="font-display text-sm tracking-wider mb-3" style={{ color: protocol.colour }}>
          {currentStep.label}
        </p>
        <p className="font-display text-6xl text-foreground" style={{ textShadow: `0 0 30px ${protocol.colour}44` }}>
          {fmtTime(remaining)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={reset} className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={() => setRunning(!running)}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: protocol.colour, boxShadow: `0 0 25px ${protocol.colour}44` }}
        >
          {running ? <Pause className="w-7 h-7 text-foreground" /> : <Play className="w-7 h-7 text-foreground ml-0.5" />}
        </button>
        <div className="w-12" /> {/* spacer */}
      </div>

      {/* Step list */}
      <div className="w-full max-w-xs mt-8 space-y-2">
        {protocol.steps.map((s, i) => (
          <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
            i === stepIdx ? 'bg-white/5 border border-border' : ''
          } ${i < stepIdx ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2">
              {i < stepIdx ? <Check className="w-3.5 h-3.5 text-primary" /> : (
                <span className="w-3.5 h-3.5 rounded-full border" style={{ borderColor: i === stepIdx ? protocol.colour : '#555' }} />
              )}
              <span className={i === stepIdx ? 'text-foreground' : 'text-muted-foreground'}>{s.label}</span>
            </div>
            <span className="text-muted-foreground font-mono text-xs">{fmtTime(s.duration)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Mindset Page
   ═══════════════════════════════════════════════════════════════════ */
const Mindset = () => {
  const [activeTab, setActiveTab] = useState<MindsetTab>('overview');
  const [activeProtocol, setActiveProtocol] = useState<ExposureProtocol | null>(null);
  const [exposureFilter, setExposureFilter] = useState<'all' | 'cold' | 'heat'>('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { habits, saveHabits, isToday, loading: habitsLoading, dateStr } = useDailyHabits();
  const { programmes, activeProgrammes, isLoading: progsLoading, saveProgramme } = useMindsetProgrammes();
  const [showManualBuilder, setShowManualBuilder] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '',
    description: '',
    duration_weeks: 4,
    daily_minutes: 15,
    focus_areas: [] as string[],
  });

  const TABS: { id: MindsetTab; label: string; icon: typeof Brain }[] = [
    { id: 'overview', label: 'Overview', icon: Brain },
    { id: 'breathwork', label: 'Breathwork', icon: Wind },
    { id: 'exposure', label: 'Cold & Heat', icon: Snowflake },
    { id: 'games', label: 'Focus', icon: Gamepad2 },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'programmes', label: 'Programmes', icon: Sparkles },
  ];

  const filteredProtocols = exposureFilter === 'all'
    ? EXPOSURE_PROTOCOLS
    : EXPOSURE_PROTOCOLS.filter(p => p.category === exposureFilter);

  const allHabitKeys: (keyof typeof habits)[] = ['train', 'learnDaily', 'water', 'hitYourNumbers', 'sauna', 'coldShower', 'breathworkDone'];
  const completedToday = allHabitKeys.filter(k => habits[k]).length;

  /* ─── Active protocol timer ─── */
  if (activeProtocol) {
    return (
      <div className="min-h-screen pb-24" >
        <ExposureTimer protocol={activeProtocol} onBack={() => setActiveProtocol(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" >
      {/* ─── Hero Banner ─── */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-foreground"> MINDSET</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-1 font-display tracking-wide">
            THE UNBREAKABLE MINDSET METHOD
          </p>
        </div>
      </div>

      {/* ─── Tab Bar ─── */}
      <div className="px-2 mb-4">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-display tracking-wider shrink-0 transition-all border ${
                  active
                    ? 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                    : 'text-muted-foreground border-transparent hover:text-muted-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-border bg-card text-center">
                  <p className="text-primary font-display text-xl">{completedToday}/7</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">TODAY'S HABITS</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center">
                  <p className="text-primary font-display text-xl">{activeProgrammes?.length || 0}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">ACTIVE PROGS</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center">
                  <p className="text-primary font-display text-xl">{programmes?.length || 0}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">TOTAL PROGS</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your mind is your ultimate weapon. The <span className="text-primary font-semibold">Unbreakable Mindset Method</span> combines
                  controlled breathwork, cold & heat exposure, focus training, and daily habit tracking to build 
                  a mind that stays calm in chaos — focused, present, and <span className="text-primary font-semibold">UNBREAKABLE</span>.
                </p>
                <p className="text-primary font-display text-sm tracking-wide mt-3" style={{ textShadow: '0 0 10px rgba(255,85,0,0.3)' }}>
                  KEEP SHOWING UP.
                </p>
              </div>

              {/* Quick Access Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-display tracking-wider text-muted-foreground">EXPLORE</h3>
                {[
                  { tab: 'breathwork' as MindsetTab, icon: Wind, title: 'BREATHWORK', desc: 'Voice-guided sessions — Box Breathing, 4-7-8, Tactical Calm', colour: '#FF5500' },
                  { tab: 'exposure' as MindsetTab, icon: Snowflake, title: 'COLD & HEAT', desc: 'Cold showers, ice baths, sauna protocols — guided timers', colour: '#FF5500' },
                  { tab: 'games' as MindsetTab, icon: Gamepad2, title: 'FOCUS GAMES', desc: 'Reaction training, hand-eye coordination, global leaderboards', colour: '#FF5500' },
                  { tab: 'habits' as MindsetTab, icon: Target, title: 'DAILY HABITS', desc: 'Track your Daily 7 — train, learn, hydrate, numbers, breathwork, sauna, cold', colour: '#FF5500' },
                  { tab: 'programmes' as MindsetTab, icon: Sparkles, title: 'PROGRAMMES', desc: 'Unbreakable Coach or manual mindset programmes — breathwork, cold exposure, focus plans', colour: '#FF5500' },
                ].map(card => (
                  <button
                    key={card.tab}
                    onClick={() => setActiveTab(card.tab)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-border hover:bg-card transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{ borderColor: `${card.colour}33`, background: `${card.colour}10` }}>
                      <card.icon className="w-5 h-5" style={{ color: card.colour, filter: `drop-shadow(0 0 4px ${card.colour}66)` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm text-foreground tracking-wide">{card.title}</h4>
                      <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{card.desc}</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>

              {/* Coach CTA */}
              <Link to="/help" className="block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px rgba(255,85,0,0.2)' }}>
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-foreground">NEED GUIDANCE? <span className="text-primary">ASK YOUR COACH</span></p>
                    <p className="text-muted-foreground text-xs mt-0.5">Mindset coaching, stress management & mental performance</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* ═══ BREATHWORK TAB ═══ */}
          {activeTab === 'breathwork' && (
            <motion.div key="breathwork" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <h3 className="font-display text-sm text-primary mb-1">BREATHE WITH PURPOSE</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Controlled breathing isn't relaxation — it's <span className="text-primary">nervous system training</span>. 
                  The 4-7-8 activates parasympathetic response. Box Breathing is used by Navy SEALs. 
                  Choose your weapon.
                </p>
              </div>

              {/* Link to full breathing page */}
              <button
                onClick={() => navigate('/mindset/breathing')}
                className="w-full p-5 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-card border border-primary/20 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px rgba(255,85,0,0.15)' }}>
                    <Wind className="w-6 h-6 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-foreground">BREATHING SESSIONS</h4>
                    <p className="text-muted-foreground text-xs">Voice-guided • Timed • Multiple techniques</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Power Breath', 'Box Breathing', 'Tactical Calm', 'Deep Reset'].map(name => (
                    <span key={name} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-display border border-primary/20">
                      {name.toUpperCase()}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-3 text-primary text-xs font-display">
                  <span>START SESSION</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <div className="p-3 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Voice guidance available for all breathing sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Sessions: 2, 3, 5, 10, 15 or 20 minutes</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ COLD & HEAT TAB ═══ */}
          {activeTab === 'exposure' && (
            <motion.div key="exposure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <h3 className="font-display text-sm text-primary mb-1">THE UNBREAKABLE EXPOSURE METHOD</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Cold and heat exposure rewire your stress response. Cold showers, ice baths, and sauna protocols
                  build cardiovascular resilience, boost immune function, and forge <span className="text-primary">unbreakable mental control</span>.
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1">
                {[
                  { id: 'all' as const, label: 'All' },
                  { id: 'cold' as const, label: '❄️ Cold' },
                  { id: 'heat' as const, label: '🔥 Heat' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setExposureFilter(f.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-display border transition-all ${
                      exposureFilter === f.id
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : 'text-muted-foreground border-border'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Protocol cards */}
              <div className="space-y-3">
                {filteredProtocols.map(protocol => {
                  const Icon = protocol.icon;
                  const totalMin = Math.round(protocol.steps.reduce((s, step) => s + step.duration, 0) / 60);
                  return (
                    <button
                      key={protocol.id}
                      onClick={() => setActiveProtocol(protocol)}
                      className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-border hover:bg-card transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ borderColor: `${protocol.colour}33`, background: `${protocol.colour}10` }}>
                          <Icon className="w-5 h-5" style={{ color: protocol.colour }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-sm text-foreground tracking-wide">{protocol.name}</h4>
                          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{protocol.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-muted-foreground">{protocol.steps.length} steps</span>
                            <span className="text-[10px] text-muted-foreground">~{totalMin} min</span>
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border"
                              style={{ color: protocol.colour, borderColor: `${protocol.colour}33`, background: `${protocol.colour}10` }}>
                              {protocol.category}
                            </span>
                          </div>
                        </div>
                        <Play className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl border border-border bg-card text-center">
                <p className="text-muted-foreground text-xs">
                  Always consult a healthcare professional before starting cold or heat exposure protocols.
                  <br/>Start slow, build gradually. <span className="text-primary">Your body adapts.</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* ═══ FOCUS GAMES TAB ═══ */}
          {activeTab === 'games' && (
            <motion.div key="games" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <h3 className="font-display text-sm text-primary mb-1">SWITCH OFF THE WORLD. SWITCH ON YOUR MIND.</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  These games are your switch-off. No distractions, no noise — just you and the screen. 
                  Auto-scaling difficulty keeps you at your edge. Compete on global leaderboards.
                </p>
              </div>

              {/* Game cards */}
              {[
                { name: 'FUEL', subtitle: 'HUNT. ADAPT. SURVIVE.', desc: 'Split-second reactions. Colours shift, speed climbs. Only relentless focus keeps you alive.', icon: Gamepad2 },
                { name: 'UNBREAKABLE', subtitle: "DESTROY WHAT'S IN YOUR WAY", desc: 'Walls go up, you smash them down. Precision, timing, and relentless aggression.', icon: Zap },
                { name: 'LIMITLESS', subtitle: 'ORDER FROM CHAOS', desc: 'Pieces fall faster. Find clarity in the chaos — stack clean, think ahead, stay composed.', icon: Trophy },
                { name: 'REACT', subtitle: 'STRIKE BEFORE IT VANISHES.', desc: 'Targets appear — hit them before they disappear. Pure reflex. Zero hesitation.', icon: Crosshair, isNew: true },
                { name: 'RECALL', subtitle: 'REMEMBER EVERYTHING.', desc: 'Flash. Memorise. Recreate. Grids grow, flash time shrinks — total recall or nothing.', icon: Grid3X3, isNew: true },
                { name: 'SEQUENCE', subtitle: 'BREAK THE PATTERN.', desc: 'Watch. Listen. Repeat. Each round adds one more — one mistake and it\'s over.', icon: Shapes, isNew: true },
              ].map((game, i) => (
                <button
                  key={game.name}
                  onClick={() => navigate('/mindset/games')}
                  className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-border hover:bg-card transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <game.icon className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.5))' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-sm text-foreground">{game.name}</h4>
                        {'isNew' in game && game.isNew && (
                          <span className="text-[9px] font-display tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded" style={{ textShadow: '0 0 4px rgba(255,85,0,0.4)' }}>NEW</span>
                        )}
                      </div>
                      <p className="text-primary text-[10px] font-display">{game.subtitle}</p>
                      <p className="text-muted-foreground text-xs mt-1">{game.desc}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                        <span>Endless mode</span>
                        <span>•</span>
                        <span>Auto-scaling difficulty</span>
                        <span>•</span>
                        <span>Global leaderboard</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* ═══ HABITS TAB ═══ */}
          {activeTab === 'habits' && (
            <HabitsTab
              habits={habits}
              saveHabits={saveHabits}
              isToday={isToday}
              user={user}
              completedToday={completedToday}
              navigate={navigate}
            />
          )}

          {/* ═══ PROGRAMMES TAB ═══ */}
          {activeTab === 'programmes' && (
            <motion.div key="programmes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/15 bg-card">
                <h3 className="font-display text-sm text-primary mb-1">MINDSET PROGRAMMES</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Build a structured mindset training plan. Let AI create one based on your goals, 
                  or build your own from scratch. Combine breathwork, cold exposure, focus training, 
                  and habit stacking.
                </p>
              </div>

              {/* Builder options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/help')}
                  className="p-4 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3"
                    style={{ boxShadow: '0 0 12px rgba(255,85,0,0.12)' }}>
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-display text-xs text-foreground">AI PROGRAMME</h4>
                  <p className="text-muted-foreground text-[10px] mt-1">Chat with your coach to build a custom plan</p>
                </button>
                <button
                  onClick={() => setShowManualBuilder(true)}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center mb-3">
                    <Settings2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h4 className="font-display text-xs text-foreground">MANUAL BUILD</h4>
                  <p className="text-muted-foreground text-[10px] mt-1">Set your own breathwork, exposure & focus plan</p>
                </button>
              </div>

              {/* Manual Builder Form */}
              <AnimatePresence>
                {showManualBuilder && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl border border-primary/20 bg-card space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-sm text-primary">BUILD YOUR PROGRAMME</h3>
                        <button onClick={() => setShowManualBuilder(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                      </div>

                      <div>
                        <label className="text-xs font-display text-muted-foreground block mb-1">PROGRAMME NAME</label>
                        <input
                          type="text"
                          value={manualForm.name}
                          onChange={e => setManualForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Morning Reset Protocol"
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-display text-muted-foreground block mb-1">DESCRIPTION</label>
                        <textarea
                          value={manualForm.description}
                          onChange={e => setManualForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="What's this programme about?"
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-display text-muted-foreground block mb-1">WEEKS</label>
                          <select
                            value={manualForm.duration_weeks}
                            onChange={e => setManualForm(f => ({ ...f, duration_weeks: +e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:border-primary/50 focus:outline-none"
                          >
                            {[1,2,3,4,6,8,12].map(w => <option key={w} value={w}>{w} week{w>1?'s':''}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-display text-muted-foreground block mb-1">DAILY MINS</label>
                          <select
                            value={manualForm.daily_minutes}
                            onChange={e => setManualForm(f => ({ ...f, daily_minutes: +e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:border-primary/50 focus:outline-none"
                          >
                            {[5,10,15,20,30,45,60].map(m => <option key={m} value={m}>{m} min</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-display text-muted-foreground block mb-2">FOCUS AREAS</label>
                        <div className="flex flex-wrap gap-2">
                          {['Breathing', 'Cold Exposure', 'Sauna', 'Meditation', 'Journaling', 'Focus', 'Resilience', 'Sleep'].map(area => {
                            const selected = manualForm.focus_areas.includes(area.toLowerCase());
                            return (
                              <button
                                key={area}
                                onClick={() => setManualForm(f => ({
                                  ...f,
                                  focus_areas: selected
                                    ? f.focus_areas.filter(a => a !== area.toLowerCase())
                                    : [...f.focus_areas, area.toLowerCase()]
                                }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-display transition-all border ${
                                  selected
                                    ? 'bg-primary/15 text-primary border-primary/30'
                                    : 'bg-background text-muted-foreground border-border hover:border-primary/20'
                                }`}
                              >
                                {area}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (!manualForm.name.trim()) return;
                          try {
                            await saveProgramme.mutateAsync({
                              programme: {
                                name: manualForm.name.trim(),
                                description: manualForm.description.trim() || undefined,
                                duration_weeks: manualForm.duration_weeks,
                                daily_minutes: manualForm.daily_minutes,
                                focus_areas: manualForm.focus_areas.length > 0 ? manualForm.focus_areas : undefined,
                                programme_data: {
                                  type: 'manual',
                                  weeks: Array.from({ length: manualForm.duration_weeks }, (_, i) => ({
                                    week: i + 1,
                                    days: Array.from({ length: 7 }, (_, d) => ({
                                      day: d + 1,
                                      activities: manualForm.focus_areas.map(area => ({
                                        type: area,
                                        duration_minutes: Math.round(manualForm.daily_minutes / Math.max(manualForm.focus_areas.length, 1)),
                                        completed: false,
                                      }))
                                    }))
                                  }))
                                },
                              }
                            });
                            setShowManualBuilder(false);
                            setManualForm({ name: '', description: '', duration_weeks: 4, daily_minutes: 15, focus_areas: [] });
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to save programme');
                          }
                        }}
                        disabled={!manualForm.name.trim() || manualForm.focus_areas.length === 0 || saveProgramme.isPending}
                        className="w-full py-2.5 rounded-xl bg-primary text-white font-display text-xs tracking-wider hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        {saveProgramme.isPending ? 'SAVING...' : 'CREATE PROGRAMME'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active programmes */}
              {activeProgrammes && activeProgrammes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-display tracking-wider text-muted-foreground">ACTIVE PROGRAMMES</h3>
                  {activeProgrammes.map(p => (
                    <div key={p.id} className="p-3.5 rounded-xl border border-primary/20 bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display text-sm text-foreground">{p.name}</h4>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {p.duration_weeks} weeks • {p.daily_minutes} min/day
                            {p.focus_areas && ` • ${p.focus_areas.join(', ')}`}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-display border border-primary/20">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Saved programmes */}
              {programmes && programmes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-display tracking-wider text-muted-foreground">ALL PROGRAMMES</h3>
                  {programmes.filter(p => !p.is_active).map(p => (
                    <div key={p.id} className="p-3 rounded-xl border border-border bg-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display text-sm text-foreground">{p.name}</h4>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {p.duration_weeks} weeks • {p.daily_minutes} min/day
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-card text-muted-foreground text-[10px] font-display">
                          {p.status?.toUpperCase() || 'SAVED'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!programmes || programmes.length === 0) && !progsLoading && (
                <div className="p-6 rounded-xl border border-border bg-card text-center">
                  <Brain className="w-8 h-8 text-primary mx-auto mb-2" style={{ filter: 'drop-shadow(0 0 8px rgba(255,85,0,0.4))' }} />
                  <p className="text-muted-foreground text-sm">No programmes yet. Build one to start your mindset training journey.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   HABITS TAB — inline sub-component
   ═══════════════════════════════════════════════════ */
interface HabitsTabProps {
  habits: any;
  saveHabits: (h: any) => void;
  isToday: boolean;
  user: any;
  completedToday: number;
  navigate: (path: string) => void;
}

function HabitsTab({ habits, saveHabits, isToday, user, completedToday, navigate }: HabitsTabProps) {
  const [journalText, setJournalText] = useState(habits.journal || '');
  const [journalSaved, setJournalSaved] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);

  // Sync journal text when habits load
  useEffect(() => { setJournalText(habits.journal || ''); }, [habits.journal]);

  const HABIT_ITEMS = [
    { key: 'train' as const, label: 'TRAIN', LucideIcon: Activity },
    { key: 'learnDaily' as const, label: 'LEARN', LucideIcon: BookOpen },
    { key: 'hitYourNumbers' as const, label: 'HIT YOUR NUMBERS', LucideIcon: Target },
    { key: 'breathworkDone' as const, label: 'BREATHWORK', LucideIcon: Wind },
    { key: 'sauna' as const, label: 'SAUNA', LucideIcon: ThermometerSun },
    { key: 'coldShower' as const, label: 'COLD SHOWER', LucideIcon: Snowflake },
  ];

  const waterGlasses = habits.waterGlasses ?? 0;
  const waterComplete = waterGlasses >= 8;
  const handleGlassTap = (glassIdx: number) => {
    if (!isToday || !user) return;
    // Tap filled glass to unfill from that point; tap empty glass to fill up to it
    const newCount = waterGlasses === glassIdx + 1 ? glassIdx : glassIdx + 1;
    const updated = { ...habits, waterGlasses: newCount, water: newCount >= 8 };
    saveHabits(updated);
  };

  const totalHabits = HABIT_ITEMS.length;
  const journalMinChars = 30;
  const journalValid = journalText.trim().length >= journalMinChars;

  const handleToggle = (key: string) => {
    if (!isToday || !user) return;
    const updated = { ...habits, [key]: !habits[key] };
    saveHabits(updated);
  };

  const handleSaveJournal = () => {
    if (!journalValid || !isToday || !user) return;
    saveHabits({ ...habits, journal: journalText.trim() });
    setJournalSaved(true);
    setConfirmPopup(true);
    setTimeout(() => setConfirmPopup(false), 2000);
  };

  return (
    <motion.div key="habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Description */}
      <div className="p-3.5 rounded-xl border border-primary/15 bg-card">
        <h3 className="font-display text-sm text-primary mb-1">DAILY HABITS</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Consistency beats intensity. Track every day to build unstoppable momentum.
          Small actions, repeated daily, create <span className="text-primary">UNBREAKABLE</span> habits.
        </p>
      </div>

      {/* Today's progress */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-display text-muted-foreground tracking-wider">TODAY'S PROGRESS</span>
          <span className="text-xs font-display text-primary">{completedToday}/{totalHabits}</span>
        </div>
        <div className="h-2 bg-card rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" style={{ width: `${(completedToday / totalHabits) * 100}%` }} />
        </div>

        {/* Habit toggles */}
        <div className="space-y-2">
          {HABIT_ITEMS.map(h => {
            const active = !!habits[h.key];
            const Icon = h.LucideIcon;
            return (
              <button
                key={h.key}
                onClick={() => handleToggle(h.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  active
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-background border-border hover:border-border'
                }`}
                disabled={!isToday || !user}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-primary/20' : 'bg-card/50'}`}>
                  <Icon className="w-4 h-4 text-primary" style={{ filter: active ? 'drop-shadow(0 0 6px rgba(255,85,0,0.6))' : 'none' }} />
                </div>
                <span className={`flex-1 text-left font-display text-sm tracking-wide ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {h.label}
                </span>
                {active && <Check className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Water Tracker — 8 Glasses */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" style={{ filter: waterComplete ? 'drop-shadow(0 0 6px rgba(255,85,0,0.6))' : 'none' }} />
            <span className={`text-xs font-display tracking-wider ${waterComplete ? 'text-primary' : 'text-muted-foreground'}`}>HYDRATE</span>
          </div>
          <span className={`text-xs font-display ${waterComplete ? 'text-primary' : 'text-muted-foreground'}`}>
            {waterGlasses}/8 glasses {waterComplete && '✓'}
          </span>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => {
            const filled = i < waterGlasses;
            return (
              <button
                key={i}
                onClick={() => handleGlassTap(i)}
                disabled={!isToday || !user}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-full aspect-[3/4] rounded-lg border-2 transition-all relative overflow-hidden ${
                    filled
                      ? 'border-primary/40'
                      : 'border-border hover:border-border'
                  }`}
                  style={filled ? { boxShadow: '0 0 8px rgba(255,85,0,0.3)' } : {}}
                >
                  {/* Water fill animation */}
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                    style={{
                      height: filled ? '100%' : '0%',
                      background: 'linear-gradient(180deg, rgba(255,85,0,0.3) 0%, rgba(255,85,0,0.6) 100%)',
                    }}
                  />
                  {/* Glass icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Droplets
                      className={`w-4 h-4 transition-all ${filled ? 'text-primary' : 'text-muted-foreground'}`}
                      style={filled ? { filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' } : {}}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {waterComplete && (
          <p className="text-center text-xs text-primary mt-2 font-display tracking-wider" style={{ textShadow: '0 0 10px rgba(255,85,0,0.3)' }}>
            💧 FULLY HYDRATED — KEEP IT UP
          </p>
        )}
      </div>

      {/* Daily Journal */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-display text-primary tracking-wider">DAILY JOURNAL</span>
          <span className={`text-xs ${journalText.trim().length >= journalMinChars ? 'text-primary' : 'text-muted-foreground'}`}>
            {journalText.trim().length}/{journalMinChars} min
          </span>
        </div>
        <textarea
          value={journalText}
          onChange={(e) => { setJournalText(e.target.value); setJournalSaved(false); }}
          placeholder="Reflect on your day — what went well, what you're grateful for, what you'll improve tomorrow..."
          className="w-full bg-background border border-border rounded-lg p-3 text-sm text-muted-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-primary/30 transition-colors"
          rows={4}
          disabled={!isToday || !user}
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-muted-foreground text-xs">
            {journalText.trim().length < journalMinChars
              ? `${journalMinChars - journalText.trim().length} more characters needed`
              : '✓ Ready to save'}
          </p>
          <button
            onClick={handleSaveJournal}
            disabled={!journalValid || !isToday || !user}
            className={`px-4 py-2 rounded-lg font-display text-xs tracking-wider transition-all ${
              journalValid
                ? 'bg-primary text-black hover:bg-primary/90'
                : 'bg-card text-muted-foreground cursor-not-allowed'
            }`}
          >
            {journalSaved ? 'SAVED ✓' : 'SAVE JOURNAL'}
          </button>
        </div>
      </div>

      {/* Journal history viewer */}
      <JournalHistory userId={user?.id} />

      {/* Confirmation popup */}
      <AnimatePresence>
        {confirmPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-card border border-primary/30 rounded-xl px-6 py-3 shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(255,85,0,0.2)' }}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-display text-sm text-foreground tracking-wider">JOURNAL SAVED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   JOURNAL HISTORY — inline sub-component
   Shows past journal entries with date navigation
   ═══════════════════════════════════════════════════ */
function JournalHistory({ userId }: { userId?: string }) {
  const [entries, setEntries] = useState<{ habit_date: string; journal: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!userId || !expanded) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('daily_habits')
        .select('habit_date, journal')
        .eq('user_id', userId)
        .not('journal', 'eq', '')
        .not('journal', 'is', null)
        .order('habit_date', { ascending: false })
        .limit(14);
      setEntries((data || []).filter((d: any) => d.journal && d.journal.trim().length > 0) as any);
      setLoading(false);
    })();
  }, [userId, expanded]);

  if (!userId) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-card transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(255,85,0,0.5))' }} />
          </div>
          <div className="text-left">
            <h4 className="font-display text-sm text-foreground tracking-wider">JOURNAL HISTORY</h4>
            <p className="text-muted-foreground text-xs mt-0.5">View your past journal entries</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2">
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!loading && entries.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">No journal entries yet — start writing today!</p>
              )}
              {!loading && entries.map((entry) => (
                <div key={entry.habit_date} className="p-3 rounded-lg border border-border/50 bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-display text-primary tracking-wider">
                      {format(new Date(entry.habit_date + 'T12:00:00'), 'EEE d MMM yyyy').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {entry.journal.length > 200
                      ? entry.journal.slice(0, 200) + '…'
                      : entry.journal}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Mindset;
