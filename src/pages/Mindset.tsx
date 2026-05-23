import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Wind, Gamepad2, Flame, ArrowRight, BookOpen, Snowflake, ThermometerSun,
  Timer, Play, Pause, RotateCcw, ChevronDown, ChevronRight as ChevronRightIcon,
  Check, Plus, Sparkles, Target, Heart, Activity, Droplets, Settings2, Volume2,
  Zap, Trophy, Calendar, BarChart3, Clock, TrendingUp
} from "lucide-react";
import { useDailyHabits } from "@/hooks/useDailyHabits";
import { useMindsetProgrammes } from "@/hooks/useMindsetProgrammes";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

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
    colour: '#38BDF8',
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
    colour: '#38BDF8',
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
    colour: '#38BDF8',
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
    colour: '#818CF8',
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
    colour: '#818CF8',
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
    colour: '#F97316',
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
    colour: '#F97316',
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
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="font-display text-2xl text-white mb-2">SESSION COMPLETE</h2>
        <p className="text-gray-400 mb-6">{protocol.name} — {fmtTime(totalDuration)} total</p>
        <div className="flex gap-3">
          <button onClick={reset} className="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm">
            Repeat
          </button>
          <button onClick={onBack} className="px-4 py-2 rounded-xl bg-[#FF5500] text-white text-sm font-display">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 pt-6">
      <button onClick={onBack} className="self-start text-gray-500 hover:text-gray-300 text-sm mb-4">
        ← Back
      </button>

      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 border"
        style={{ borderColor: `${protocol.colour}33`, background: `${protocol.colour}15` }}>
        <Icon className="w-8 h-8" style={{ color: protocol.colour, filter: `drop-shadow(0 0 8px ${protocol.colour}88)` }} />
      </div>

      <h2 className="font-display text-lg text-white tracking-wide mb-1">{protocol.name}</h2>
      <p className="text-gray-500 text-xs mb-6">Step {stepIdx + 1} of {protocol.steps.length}</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-1.5 bg-gray-800 rounded-full mb-6 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%`, background: protocol.colour }} />
      </div>

      {/* Current step */}
      <div className="text-center mb-8">
        <p className="font-display text-sm tracking-wider mb-3" style={{ color: protocol.colour }}>
          {currentStep.label}
        </p>
        <p className="font-display text-6xl text-white" style={{ textShadow: `0 0 30px ${protocol.colour}44` }}>
          {fmtTime(remaining)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={reset} className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={() => setRunning(!running)}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: protocol.colour, boxShadow: `0 0 25px ${protocol.colour}44` }}
        >
          {running ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-0.5" />}
        </button>
        <div className="w-12" /> {/* spacer */}
      </div>

      {/* Step list */}
      <div className="w-full max-w-xs mt-8 space-y-2">
        {protocol.steps.map((s, i) => (
          <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
            i === stepIdx ? 'bg-white/5 border border-white/10' : ''
          } ${i < stepIdx ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2">
              {i < stepIdx ? <Check className="w-3.5 h-3.5 text-green-400" /> : (
                <span className="w-3.5 h-3.5 rounded-full border" style={{ borderColor: i === stepIdx ? protocol.colour : '#555' }} />
              )}
              <span className={i === stepIdx ? 'text-white' : 'text-gray-500'}>{s.label}</span>
            </div>
            <span className="text-gray-600 font-mono text-xs">{fmtTime(s.duration)}</span>
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
  const { programmes, activeProgrammes, isLoading: progsLoading } = useMindsetProgrammes();

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

  const completedToday = [habits.train, habits.learnDaily, habits.water, habits.hitYourNumbers].filter(Boolean).length;

  /* ─── Active protocol timer ─── */
  if (activeProtocol) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
        <ExposureTimer protocol={activeProtocol} onBack={() => setActiveProtocol(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      {/* ─── Hero Banner ─── */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>UNBREAKABLE</span>
            <span className="text-white"> MINDSET</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1 font-display tracking-wide">
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
                    ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30 shadow-[0_0_12px_rgba(255,85,0,0.1)]'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
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
                <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center">
                  <p className="text-[#FF5500] font-display text-xl">{completedToday}/4</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">TODAY'S HABITS</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center">
                  <p className="text-[#FF5500] font-display text-xl">{activeProgrammes?.length || 0}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">ACTIVE PROGS</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center">
                  <p className="text-[#FF5500] font-display text-xl">{programmes?.length || 0}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">TOTAL PROGS</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl border border-[#FF5500]/15 bg-[#111]">
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your mind is your ultimate weapon. The <span className="text-[#FF5500] font-semibold">Unbreakable Mindset Method</span> combines
                  controlled breathwork, cold & heat exposure, focus training, and daily habit tracking to build 
                  a mind that stays calm in chaos — focused, present, and <span className="text-[#FF5500] font-semibold">UNBREAKABLE</span>.
                </p>
                <p className="text-[#FF5500] font-display text-sm tracking-wide mt-3" style={{ textShadow: '0 0 10px rgba(255,85,0,0.3)' }}>
                  KEEP SHOWING UP.
                </p>
              </div>

              {/* Quick Access Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-display tracking-wider text-gray-400">EXPLORE</h3>
                {[
                  { tab: 'breathwork' as MindsetTab, icon: Wind, title: 'BREATHWORK', desc: 'Voice-guided sessions — Box Breathing, 4-7-8, Tactical Calm', colour: '#FF5500' },
                  { tab: 'exposure' as MindsetTab, icon: Snowflake, title: 'COLD & HEAT', desc: 'Cold showers, ice baths, sauna protocols — guided timers', colour: '#38BDF8' },
                  { tab: 'games' as MindsetTab, icon: Gamepad2, title: 'FOCUS GAMES', desc: 'Reaction training, hand-eye coordination, global leaderboards', colour: '#A78BFA' },
                  { tab: 'habits' as MindsetTab, icon: Target, title: 'DAILY HABITS', desc: 'Track your Daily 5 — train, learn, hydrate, hit your numbers, journal', colour: '#34D399' },
                  { tab: 'programmes' as MindsetTab, icon: Sparkles, title: 'PROGRAMMES', desc: 'AI or manual mindset programmes — breathwork, cold exposure, focus plans', colour: '#FBBF24' },
                ].map(card => (
                  <button
                    key={card.tab}
                    onClick={() => setActiveTab(card.tab)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-800 bg-[#111] hover:border-gray-700 hover:bg-[#151515] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{ borderColor: `${card.colour}33`, background: `${card.colour}10` }}>
                      <card.icon className="w-5 h-5" style={{ color: card.colour, filter: `drop-shadow(0 0 4px ${card.colour}66)` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm text-white tracking-wide">{card.title}</h4>
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{card.desc}</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-600 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Coach CTA */}
              <Link to="/help" className="block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5 hover:bg-[#FF5500]/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#FF5500]/15 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px rgba(255,85,0,0.2)' }}>
                    <Flame className="w-5 h-5 text-[#FF5500]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-white">NEED GUIDANCE? <span className="text-[#FF5500]">ASK YOUR COACH</span></p>
                    <p className="text-gray-500 text-xs mt-0.5">Mindset coaching, stress management & mental performance</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#FF5500]" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* ═══ BREATHWORK TAB ═══ */}
          {activeTab === 'breathwork' && (
            <motion.div key="breathwork" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-[#FF5500]/15 bg-[#111]">
                <h3 className="font-display text-sm text-[#FF5500] mb-1">BREATHE WITH PURPOSE</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Controlled breathing isn't relaxation — it's <span className="text-[#FF5500]">nervous system training</span>. 
                  The 4-7-8 activates parasympathetic response. Box Breathing is used by Navy SEALs. 
                  Choose your weapon.
                </p>
              </div>

              {/* Link to full breathing page */}
              <button
                onClick={() => navigate('/mindset/breathing')}
                className="w-full p-5 rounded-xl border border-[#FF5500]/20 bg-[#111] hover:border-[#FF5500]/40 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#FF5500]/20 flex items-center justify-center"
                    style={{ boxShadow: '0 0 15px rgba(255,85,0,0.15)' }}>
                    <Wind className="w-6 h-6 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-white">BREATHING SESSIONS</h4>
                    <p className="text-gray-500 text-xs">Voice-guided • Timed • Multiple techniques</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Power Breath', 'Box Breathing', 'Tactical Calm', 'Deep Reset'].map(name => (
                    <span key={name} className="px-2.5 py-1 rounded-full bg-[#FF5500]/10 text-[#FF5500] text-[10px] font-display border border-[#FF5500]/20">
                      {name.toUpperCase()}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-3 text-[#FF5500] text-xs font-display">
                  <span>START SESSION</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <div className="p-3 rounded-xl border border-gray-800 bg-[#111]">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-400">Voice guidance available for all breathing sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-400">Sessions: 2, 3, 5, 10, 15 or 20 minutes</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ COLD & HEAT TAB ═══ */}
          {activeTab === 'exposure' && (
            <motion.div key="exposure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-[#38BDF8]/15 bg-[#111]">
                <h3 className="font-display text-sm text-[#38BDF8] mb-1">THE UNBREAKABLE EXPOSURE METHOD</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Cold and heat exposure rewire your stress response. Cold showers, ice baths, and sauna protocols
                  build cardiovascular resilience, boost immune function, and forge <span className="text-[#FF5500]">unbreakable mental control</span>.
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
                        ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30'
                        : 'text-gray-500 border-gray-800'
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
                      className="w-full text-left p-4 rounded-xl border border-gray-800 bg-[#111] hover:border-gray-700 hover:bg-[#151515] transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ borderColor: `${protocol.colour}33`, background: `${protocol.colour}10` }}>
                          <Icon className="w-5 h-5" style={{ color: protocol.colour }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-sm text-white tracking-wide">{protocol.name}</h4>
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{protocol.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-gray-600">{protocol.steps.length} steps</span>
                            <span className="text-[10px] text-gray-600">~{totalMin} min</span>
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border"
                              style={{ color: protocol.colour, borderColor: `${protocol.colour}33`, background: `${protocol.colour}10` }}>
                              {protocol.category}
                            </span>
                          </div>
                        </div>
                        <Play className="w-4 h-4 text-gray-600 mt-1 shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl border border-gray-800 bg-[#111] text-center">
                <p className="text-gray-500 text-xs">
                  Always consult a healthcare professional before starting cold or heat exposure protocols.
                  <br/>Start slow, build gradually. <span className="text-[#FF5500]">Your body adapts.</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* ═══ FOCUS GAMES TAB ═══ */}
          {activeTab === 'games' && (
            <motion.div key="games" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-[#A78BFA]/15 bg-[#111]">
                <h3 className="font-display text-sm text-[#A78BFA] mb-1">SWITCH OFF THE WORLD. SWITCH ON YOUR MIND.</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  These games are your switch-off. No distractions, no noise — just you and the screen. 
                  Auto-scaling difficulty keeps you at your edge. Compete on global leaderboards.
                </p>
              </div>

              {/* Game cards */}
              {[
                { name: 'FUEL', subtitle: 'HUNT. ADAPT. SURVIVE.', desc: 'Split-second reactions. Colours shift, speed climbs. Only relentless focus keeps you alive.', icon: Gamepad2 },
                { name: 'UNBREAKABLE', subtitle: "DESTROY WHAT'S IN YOUR WAY", desc: 'Walls go up, you smash them down. Precision, timing, and relentless aggression.', icon: Zap },
                { name: 'LIMITLESS', subtitle: 'ORDER FROM CHAOS', desc: 'Pieces fall faster. Find clarity in the chaos — stack clean, think ahead, stay composed.', icon: Trophy },
              ].map((game, i) => (
                <button
                  key={game.name}
                  onClick={() => navigate('/mindset/games')}
                  className="w-full text-left p-4 rounded-xl border border-gray-800 bg-[#111] hover:border-gray-700 hover:bg-[#151515] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-center shrink-0">
                      <game.icon className="w-5 h-5 text-[#A78BFA]" style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.5))' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm text-white">{game.name}</h4>
                      <p className="text-[#A78BFA] text-[10px] font-display">{game.subtitle}</p>
                      <p className="text-gray-500 text-xs mt-1">{game.desc}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-600">
                        <span>Endless mode</span>
                        <span>•</span>
                        <span>Auto-scaling difficulty</span>
                        <span>•</span>
                        <span>Global leaderboard</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 mt-1 shrink-0" />
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* ═══ HABITS TAB ═══ */}
          {activeTab === 'habits' && (
            <motion.div key="habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-[#34D399]/15 bg-[#111]">
                <h3 className="font-display text-sm text-[#34D399] mb-1">DAILY 5 — HABIT TRACKER</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Consistency beats intensity. Track your Daily 5 every day to build unstoppable momentum.
                  Small actions, repeated daily, create <span className="text-[#FF5500]">UNBREAKABLE</span> habits.
                </p>
              </div>

              {/* Today's progress */}
              <div className="p-4 rounded-xl border border-gray-800 bg-[#111]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-display text-gray-400 tracking-wider">TODAY'S PROGRESS</span>
                  <span className="text-xs font-display text-[#34D399]">{completedToday}/4</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-[#34D399] rounded-full transition-all" style={{ width: `${(completedToday / 4) * 100}%` }} />
                </div>

                {/* Habit toggles */}
                {[
                  { key: 'train' as const, label: 'TRAIN', icon: '💪' },
                  { key: 'learnDaily' as const, label: 'LEARN', icon: '📚' },
                  { key: 'water' as const, label: 'HYDRATE', icon: '💧' },
                  { key: 'hitYourNumbers' as const, label: 'HIT YOUR NUMBERS', icon: '🎯' },
                ].map(h => (
                  <button
                    key={h.key}
                    onClick={() => {
                      if (isToday && user) {
                        const updated = { ...habits, [h.key]: !habits[h.key] };
                        saveHabits(updated);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all border ${
                      habits[h.key]
                        ? 'bg-[#34D399]/10 border-[#34D399]/20'
                        : 'bg-[#111] border-gray-800 hover:border-gray-700'
                    }`}
                    disabled={!isToday || !user}
                  >
                    <span className="text-lg">{h.icon}</span>
                    <span className={`flex-1 text-left font-display text-sm tracking-wide ${habits[h.key] ? 'text-[#34D399]' : 'text-gray-400'}`}>
                      {h.label}
                    </span>
                    {habits[h.key] && <Check className="w-4 h-4 text-[#34D399]" />}
                  </button>
                ))}
              </div>

              {/* Full tracker link */}
              <button
                onClick={() => navigate('/habits')}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-[#111] hover:border-gray-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#34D399]" />
                  <div className="text-left">
                    <h4 className="font-display text-sm text-white">FULL HABIT TRACKER & JOURNAL</h4>
                    <p className="text-gray-500 text-xs mt-0.5">Daily journal, history & date navigation</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </button>
            </motion.div>
          )}

          {/* ═══ PROGRAMMES TAB ═══ */}
          {activeTab === 'programmes' && (
            <motion.div key="programmes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-[#FBBF24]/15 bg-[#111]">
                <h3 className="font-display text-sm text-[#FBBF24] mb-1">MINDSET PROGRAMMES</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Build a structured mindset training plan. Let AI create one based on your goals, 
                  or build your own from scratch. Combine breathwork, cold exposure, focus training, 
                  and habit stacking.
                </p>
              </div>

              {/* Builder options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/help')}
                  className="p-4 rounded-xl border border-[#FF5500]/20 bg-[#111] hover:border-[#FF5500]/40 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center mb-3"
                    style={{ boxShadow: '0 0 12px rgba(255,85,0,0.12)' }}>
                    <Sparkles className="w-5 h-5 text-[#FF5500]" />
                  </div>
                  <h4 className="font-display text-xs text-white">AI PROGRAMME</h4>
                  <p className="text-gray-500 text-[10px] mt-1">Chat with your coach to build a custom plan</p>
                </button>
                <button
                  onClick={() => {/* Manual builder could link to existing MindsetProgrammes component */}}
                  className="p-4 rounded-xl border border-gray-800 bg-[#111] hover:border-gray-700 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center mb-3">
                    <Settings2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <h4 className="font-display text-xs text-white">MANUAL BUILD</h4>
                  <p className="text-gray-500 text-[10px] mt-1">Set your own breathwork, exposure & focus plan</p>
                </button>
              </div>

              {/* Active programmes */}
              {activeProgrammes && activeProgrammes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-display tracking-wider text-gray-400">ACTIVE PROGRAMMES</h3>
                  {activeProgrammes.map(p => (
                    <div key={p.id} className="p-3.5 rounded-xl border border-[#34D399]/20 bg-[#34D399]/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display text-sm text-white">{p.name}</h4>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {p.duration_weeks} weeks • {p.daily_minutes} min/day
                            {p.focus_areas && ` • ${p.focus_areas.join(', ')}`}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-[#34D399]/15 text-[#34D399] text-[10px] font-display border border-[#34D399]/20">
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
                  <h3 className="text-xs font-display tracking-wider text-gray-400">ALL PROGRAMMES</h3>
                  {programmes.filter(p => !p.is_active).map(p => (
                    <div key={p.id} className="p-3 rounded-xl border border-gray-800 bg-[#111]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display text-sm text-white">{p.name}</h4>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {p.duration_weeks} weeks • {p.daily_minutes} min/day
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-gray-800 text-gray-500 text-[10px] font-display">
                          {p.status?.toUpperCase() || 'SAVED'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!programmes || programmes.length === 0) && !progsLoading && (
                <div className="p-6 rounded-xl border border-gray-800 bg-[#111] text-center">
                  <Brain className="w-8 h-8 text-[#FF5500] mx-auto mb-2" style={{ filter: 'drop-shadow(0 0 8px rgba(255,85,0,0.4))' }} />
                  <p className="text-gray-400 text-sm">No programmes yet. Build one to start your mindset training journey.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Mindset;
