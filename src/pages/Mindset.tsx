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
import { ExposureTimer, EXPOSURE_PROTOCOLS, type ExposureProtocol } from '@/components/mindset/ExposureTimer';
import { HabitsTab, JournalHistory } from '@/components/mindset/HabitsTab';

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
                  Box Breathing is used by Navy SEALs. The 4-7-8 activates parasympathetic response. 
                  Choose your weapon.
                </p>
              </div>

              {/* Breathing technique cards — same style as games tab */}
              {[
                { id: 'power-breath', name: 'POWER BREATH', subtitle: 'CONTROL YOUR NERVOUS SYSTEM.', desc: 'The 4-7-8 technique. Inhale 4, hold 7, exhale 8. Proven to activate deep parasympathetic response.', pattern: '4-7-8', intensity: 'high' as const },
                { id: 'box-breathing', name: 'BOX BREATHING', subtitle: 'NAVY SEAL CALM UNDER FIRE.', desc: 'Equal 4-4-4-4 phases. Total nervous system balance and razor-sharp focus under pressure.', pattern: '4-4-4-4', intensity: 'medium' as const },
                { id: 'tactical-calm', name: 'TACTICAL CALM', subtitle: 'RAPID STRESS RESET.', desc: 'Short inhale, brief hold, extended exhale. When you need calm NOW — fast parasympathetic activation.', pattern: '4-2-6', intensity: 'high' as const },
                { id: 'deep-reset', name: 'DEEP RESET', subtitle: 'TOTAL RESTORATION.', desc: 'Slow, deep breathing for recovery. Extended exhale with rest phase for complete stress release.', pattern: '4-4-6-2', intensity: 'calm' as const },
                { id: 'fire-breath', name: 'FIRE BREATH', subtitle: 'IGNITE YOUR ENERGY.', desc: 'Fast-paced rapid breathing. Short, sharp cycles with no holds — fire up before training or competition.', pattern: '2-0-2-0', intensity: 'high' as const },
                { id: 'warrior-breath', name: 'WARRIOR BREATH', subtitle: 'THE BREATH BEFORE BATTLE.', desc: 'Double-length exhale forces deep activation while strong inhale keeps you alert and ready.', pattern: '4-4-8', intensity: 'high' as const },
                { id: 'ocean-breath', name: 'OCEAN BREATH', subtitle: 'FLOW LIKE THE TIDE.', desc: 'Continuous flowing breath inspired by Ujjayi pranayama. No pauses — meditative rhythm for focus.', pattern: '5-0-5-0', intensity: 'calm' as const },
                { id: 'resilience-breath', name: 'RESILIENCE BREATH', subtitle: 'MENTAL STEEL.', desc: 'Extended hold training. Builds CO2 tolerance and the composure to stay calm when everything screams quit.', pattern: '4-7-4-7', intensity: 'high' as const },
                { id: 'sleep-breath', name: 'SLEEP MODE', subtitle: 'SWITCH OFF.', desc: 'Gentle 4-7-8 variant designed for winding down. Signals your brain it\'s time to rest.', pattern: '4-7-8', intensity: 'calm' as const },
                { id: 'energise-breath', name: 'ENERGISE', subtitle: 'WAKE UP. QUICK BOX.', desc: 'Faster box breathing — more cycles per minute for a quick energy boost before any challenge.', pattern: '3-3-3-3', intensity: 'medium' as const },
              ].map((technique) => (
                <button
                  key={technique.id}
                  onClick={() => navigate(`/mindset/breathing?exercise=${technique.id}`)}
                  className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-border hover:bg-card transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Wind className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-sm text-foreground">{technique.name}</h4>
                        <span className={`text-[9px] font-display tracking-wider px-1.5 py-0.5 rounded border ${
                          technique.intensity === 'high' ? 'bg-red-500/15 text-red-400 border-red-500/25' :
                          technique.intensity === 'calm' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' :
                          'bg-primary/15 text-primary border-primary/25'
                        }`}>{technique.intensity === 'high' ? 'HIGH' : technique.intensity === 'calm' ? 'CALM' : 'MED'}</span>
                      </div>
                      <p className="text-primary text-[10px] font-display">{technique.subtitle}</p>
                      <p className="text-muted-foreground text-xs mt-1">{technique.desc}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                        <span>{technique.pattern} pattern</span>
                        <span>•</span>
                        <span>Voice-guided</span>
                        <span>•</span>
                        <span>2–20 min</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                  </div>
                </button>
              ))}
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

              {/* Game cards — only games with working components */}
              {[
                { id: 'snake', name: 'HUNT', subtitle: 'CHASE. DEVOUR. NEVER STOP.', desc: 'Split-second reactions. Colours shift, speed climbs. Only relentless focus keeps you alive.', icon: Gamepad2 },
                { id: 'alleyway', name: 'SHATTER', subtitle: 'BREAK EVERY WALL.', desc: 'Walls go up, you smash them down. Precision, timing, and relentless aggression.', icon: Zap },
                { id: 'tetris', name: 'STACK', subtitle: 'ORDER FROM CHAOS.', desc: 'Pieces fall faster. Find clarity in the chaos — stack clean, think ahead, stay composed.', icon: Trophy },
                { id: 'pattern', name: 'LOCK IN', subtitle: 'ONE WRONG MOVE, IT\'S OVER.', desc: 'Watch. Listen. Repeat. Each round adds one more — break focus and you\'re done.', icon: Shapes },
              ].map((game, i) => (
                <button
                  key={game.name}
                  onClick={() => navigate(`/mindset/games?game=${game.id}`)}
                  className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-border hover:bg-card transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <game.icon className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.5))' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-sm text-foreground">{game.name}</h4>
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

export default Mindset;
