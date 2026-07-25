import { useState, useEffect, useRef } from 'react';
import {
  Snowflake, ThermometerSun, Droplets, Activity,
  Check, Play, Pause, RotateCcw,
} from 'lucide-react';

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
    colour: 'hsl(var(--primary))',
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
    colour: 'hsl(var(--primary))',
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
    colour: 'hsl(var(--primary))',
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
    colour: 'hsl(var(--primary))',
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
    colour: 'hsl(var(--primary))',
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
    colour: 'hsl(var(--primary))',
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
    colour: 'hsl(var(--primary))',
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

export { ExposureTimer, EXPOSURE_PROTOCOLS };
export type { ExposureProtocol };
