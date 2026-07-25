import { motion } from "framer-motion";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "rest" | "complete";

export type BreathPattern = "orb" | "wave" | "bars" | "morph" | "guidedLine";

interface BreathingVisualProps {
  phase: BreathPhase;
  progress: number;
  phaseDuration: number;
  phaseProgress?: number;
  pattern?: BreathPattern;
}

/* ── Neon constants — use CSS vars so colour follows pillar theme ── */
const NEON = "hsl(var(--primary))";
const NEON_GLOW = "hsl(var(--primary) / 0.6)";
const NEON_SOFT = "hsl(var(--primary) / 0.25)";
const NEON_DIM = "hsl(var(--primary) / 0.1)";

const getSubtext = (phase: BreathPhase) => {
  switch (phase) {
    case "inhale": return "Breathe In";
    case "hold": return "Hold";
    case "exhale": return "Breathe Out";
    case "rest": return "Rest";
    case "complete": return "Complete";
    default: return "";
  }
};

/* ═══════════════════════════════════════════════
   PATTERN 1 — ORB (reworked original)
   Expanding/contracting neon orb with ring + trail dot
   ═══════════════════════════════════════════════ */
function OrbVisual({ phase, progress, phaseDuration }: BreathingVisualProps) {
  const size = 280;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = center - strokeWidth - 20;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  const dotAngle = (progress / 100) * 360 - 90;
  const dotAngleRad = (dotAngle * Math.PI) / 180;
  const dotX = center + radius * Math.cos(dotAngleRad);
  const dotY = center + radius * Math.sin(dotAngleRad);

  const trailDots = Array.from({ length: 5 }, (_, i) => {
    const tp = Math.max(0, progress - (i + 1) * 1.5);
    const ta = (tp / 100) * 360 - 90;
    const tr = (ta * Math.PI) / 180;
    return { x: center + radius * Math.cos(tr), y: center + radius * Math.sin(tr), opacity: 0.6 - i * 0.1, size: 8 - i * 1.2 };
  });

  const getScale = () => (phase === "inhale" || phase === "hold") ? 1.6 : 1;

  const getGlow = () => {
    switch (phase) {
      case "inhale": return `0 0 80px 30px ${NEON_GLOW}`;
      case "hold": return `0 0 100px 40px ${NEON_GLOW}`;
      case "exhale": return `0 0 40px 15px ${NEON_SOFT}`;
      default: return `0 0 20px 10px ${NEON_DIM}`;
    }
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Progress ring */}
      <svg width={size} height={size} className="absolute transform -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} opacity={0.3} />
        <motion.circle cx={center} cy={center} r={radius} fill="none" stroke={NEON} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: progressOffset }} transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${NEON})` }} />
      </svg>

      {/* Trail + lead dot */}
      <svg width={size} height={size} className="absolute">
        {progress > 2 && trailDots.map((d, i) => (
          <motion.circle key={i} cx={d.x} cy={d.y} r={d.size / 2} fill={NEON} opacity={d.opacity} animate={{ cx: d.x, cy: d.y }} transition={{ duration: 0.1 }} />
        ))}
        {progress > 0 && (
          <motion.circle cx={dotX} cy={dotY} r={6} fill={NEON} animate={{ cx: dotX, cy: dotY }} transition={{ duration: 0.1 }} style={{ filter: `drop-shadow(0 0 8px ${NEON})` }} />
        )}
      </svg>

      {/* Central orb */}
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <motion.div
          animate={{ scale: getScale(), boxShadow: getGlow() }}
          transition={{ duration: phaseDuration, ease: "easeInOut" }}
          className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-primary via-primary to-orange-500 relative z-10"
        >
          <motion.div
            animate={{ scale: phase === "hold" ? [1, 1.1, 1] : 1, opacity: phase === "hold" ? [0.5, 0.8, 0.5] : 0.3 }}
            transition={{ duration: 2, repeat: phase === "hold" ? Infinity : 0, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2 border-primary-foreground/30"
          />
        </motion.div>
      </div>

      {/* Outer glow ring */}
      <motion.div
        animate={{ scale: (phase === "inhale" || phase === "hold") ? 1.3 : 1, opacity: (phase === "inhale" || phase === "hold") ? 0.4 : 0.1 }}
        transition={{ duration: phaseDuration, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-52 md:h-52 rounded-full"
        style={{ border: `1px solid ${NEON_SOFT}`, boxShadow: `inset 0 0 20px ${NEON_DIM}` }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PATTERN 2 — WAVE
   Sine wave that rises on inhale, falls on exhale
   ═══════════════════════════════════════════════ */
function WaveVisual({ phase, phaseDuration, phaseProgress = 0 }: BreathingVisualProps) {
  const width = 300;
  const height = 200;
  const midY = height / 2;

  // Wave amplitude scales with phase
  const amplitude = (phase === "inhale" || phase === "hold") ? 60 : (phase === "exhale" ? 60 * (1 - phaseProgress) : 15);
  const freq = 3; // number of wave cycles

  const points: string[] = [];
  for (let x = 0; x <= width; x += 2) {
    const y = midY - amplitude * Math.sin((x / width) * freq * Math.PI * 2 + phaseProgress * Math.PI * 2);
    points.push(`${x},${y}`);
  }
  const pathD = `M ${points.join(" L ")}`;

  // Filled area below wave
  const fillD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="relative flex items-center justify-center" style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Glow fill */}
        <motion.path
          d={fillD}
          fill={NEON_DIM}
          animate={{ opacity: (phase === "inhale" || phase === "hold") ? 0.4 : 0.15 }}
          transition={{ duration: phaseDuration }}
        />
        {/* Wave line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={NEON}
          strokeWidth={3}
          strokeLinecap="round"
          animate={{ opacity: 1 }}
          style={{ filter: `drop-shadow(0 0 8px ${NEON_GLOW})` }}
        />
        {/* Center line */}
        <line x1={0} y1={midY} x2={width} y2={midY} stroke="hsl(var(--muted))" strokeWidth={1} opacity={0.2} strokeDasharray="4 4" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PATTERN 3 — BARS
   Equaliser-style vertical bars that pulse up/down
   ═══════════════════════════════════════════════ */
function BarsVisual({ phase, phaseDuration, phaseProgress = 0 }: BreathingVisualProps) {
  const barCount = 12;
  const barWidth = 14;
  const gap = 6;
  const maxHeight = 160;
  const totalWidth = barCount * (barWidth + gap) - gap;

  // Height multiplier per phase
  const heightMultiplier = phase === "inhale" ? phaseProgress
    : phase === "hold" ? 1
    : phase === "exhale" ? (1 - phaseProgress)
    : 0.15;

  return (
    <div className="relative flex items-end justify-center gap-[6px]" style={{ width: totalWidth, height: maxHeight }}>
      {Array.from({ length: barCount }, (_, i) => {
        // Each bar has a slightly different height (sine pattern across bars)
        const barPhase = Math.sin((i / barCount) * Math.PI);
        const barH = Math.max(8, maxHeight * heightMultiplier * (0.4 + 0.6 * barPhase));

        return (
          <motion.div
            key={i}
            animate={{ height: barH }}
            transition={{ duration: phaseDuration * 0.5, ease: "easeInOut", delay: i * 0.02 }}
            className="rounded-t-full"
            style={{
              width: barWidth,
              background: `linear-gradient(to top, ${NEON}, ${NEON_GLOW})`,
              boxShadow: `0 0 ${6 + barH * 0.08}px ${NEON_GLOW}`,
              opacity: 0.5 + heightMultiplier * 0.5,
            }}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PATTERN 4 — SHAPE MORPH
   Morphs between shapes using border-radius
   ═══════════════════════════════════════════════ */
function MorphVisual({ phase, phaseDuration, phaseProgress = 0 }: BreathingVisualProps) {
  const size = 200;

  // Different border-radius values for different shapes
  const shapes: Record<string, string> = {
    circle: "50%",
    squircle: "30%",
    diamond: "15% 50% 15% 50%",
    blob: "60% 40% 55% 45% / 45% 55% 40% 60%",
  };

  const getBorderRadius = () => {
    switch (phase) {
      case "inhale": return shapes.circle;
      case "hold": return shapes.blob;
      case "exhale": return shapes.diamond;
      case "rest": return shapes.squircle;
      default: return shapes.circle;
    }
  };

  const getScale = () => (phase === "inhale" || phase === "hold") ? 1.3 : 0.85;

  const getRotation = () => {
    switch (phase) {
      case "inhale": return 0;
      case "hold": return 45;
      case "exhale": return 90;
      case "rest": return 135;
      default: return 0;
    }
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size + 80, height: size + 80 }}>
      {/* Outer glow */}
      <motion.div
        animate={{
          scale: getScale() * 1.15,
          borderRadius: getBorderRadius(),
          rotate: getRotation(),
          opacity: 0.2,
        }}
        transition={{ duration: phaseDuration, ease: "easeInOut" }}
        className="absolute"
        style={{
          width: size,
          height: size,
          border: `2px solid ${NEON_SOFT}`,
          boxShadow: `0 0 30px ${NEON_DIM}`,
        }}
      />

      {/* Main shape */}
      <motion.div
        animate={{
          scale: getScale(),
          borderRadius: getBorderRadius(),
          rotate: getRotation(),
          boxShadow: (phase === "inhale" || phase === "hold")
            ? `0 0 60px 20px ${NEON_GLOW}, inset 0 0 30px ${NEON_SOFT}`
            : `0 0 20px 5px ${NEON_DIM}, inset 0 0 10px ${NEON_DIM}`,
        }}
        transition={{ duration: phaseDuration, ease: "easeInOut" }}
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: `linear-gradient(135deg, ${NEON}, ${NEON_GLOW}, ${NEON_SOFT})`,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PATTERN 5 — GUIDED LINE
   A dot traces up on inhale, holds, down on exhale
   ═══════════════════════════════════════════════ */
function GuidedLineVisual({ phase, phaseDuration, phaseProgress = 0 }: BreathingVisualProps) {
  const width = 280;
  const height = 240;
  const padY = 30;
  const topY = padY;
  const bottomY = height - padY;
  const centerX = width / 2;

  // Dot Y position based on phase
  const getDotY = () => {
    switch (phase) {
      case "inhale": return bottomY - (bottomY - topY) * phaseProgress;
      case "hold": return topY;
      case "exhale": return topY + (bottomY - topY) * phaseProgress;
      case "rest": return bottomY;
      default: return bottomY;
    }
  };

  const dotY = getDotY();

  // Trail path from bottom to current dot position
  return (
    <div className="relative flex items-center justify-center" style={{ width, height }}>
      <svg width={width} height={height}>
        {/* Track line */}
        <line x1={centerX} y1={topY} x2={centerX} y2={bottomY} stroke="hsl(var(--muted))" strokeWidth={2} opacity={0.15} strokeDasharray="6 6" />

        {/* Top marker */}
        <line x1={centerX - 20} y1={topY} x2={centerX + 20} y2={topY} stroke={NEON} strokeWidth={2} opacity={0.3} />
        <text x={centerX + 28} y={topY + 4} fill={NEON} fontSize={10} opacity={0.5} className="font-display">IN</text>

        {/* Bottom marker */}
        <line x1={centerX - 20} y1={bottomY} x2={centerX + 20} y2={bottomY} stroke={NEON} strokeWidth={2} opacity={0.3} />
        <text x={centerX + 28} y={bottomY + 4} fill={NEON} fontSize={10} opacity={0.5} className="font-display">OUT</text>

        {/* Hold zone indicator */}
        {phase === "hold" && (
          <motion.rect
            x={centerX - 30} y={topY - 8} width={60} height={16} rx={8}
            fill={NEON_DIM} stroke={NEON_SOFT} strokeWidth={1}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Trail glow */}
        <motion.line
          x1={centerX} y1={bottomY} x2={centerX}
          animate={{ y2: dotY }}
          transition={{ duration: 0.1 }}
          stroke={NEON} strokeWidth={4} opacity={0.15}
          style={{ filter: `blur(4px)` }}
        />

        {/* Active line from bottom to dot */}
        <motion.line
          x1={centerX} y1={bottomY} x2={centerX}
          animate={{ y2: dotY }}
          transition={{ duration: 0.1 }}
          stroke={NEON} strokeWidth={2} opacity={0.4}
          strokeLinecap="round"
        />

        {/* Dot */}
        <motion.circle
          cx={centerX}
          animate={{ cy: dotY }}
          transition={{ duration: 0.1 }}
          r={12}
          fill={NEON}
          style={{ filter: `drop-shadow(0 0 12px ${NEON_GLOW}) drop-shadow(0 0 24px ${NEON_SOFT})` }}
        />
        <motion.circle
          cx={centerX}
          animate={{ cy: dotY }}
          transition={{ duration: 0.1 }}
          r={6}
          fill="white"
          opacity={0.8}
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════ */
export function BreathingVisual(props: BreathingVisualProps) {
  const { phase, pattern = "orb" } = props;

  const VisualComponent = {
    orb: OrbVisual,
    wave: WaveVisual,
    bars: BarsVisual,
    morph: MorphVisual,
    guidedLine: GuidedLineVisual,
  }[pattern] || OrbVisual;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <VisualComponent {...props} />

      {phase !== "idle" && phase !== "complete" && (
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="mt-8 text-lg text-muted-foreground font-display tracking-widest uppercase"
        >
          {getSubtext(phase)}
        </motion.p>
      )}
    </div>
  );
}
