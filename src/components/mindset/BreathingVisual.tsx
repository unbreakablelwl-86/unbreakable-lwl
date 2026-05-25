import { motion } from "framer-motion";
import type { SessionTheme } from "@/pages/MindsetBreathing";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "rest" | "complete";

interface BreathingVisualProps {
  phase: BreathPhase;
  progress: number;
  phaseDuration: number;
  phaseProgress?: number;
  sessionTheme?: SessionTheme;
}

export function BreathingVisual({ 
  phase, 
  progress, 
  phaseDuration,
  phaseProgress = 0,
  sessionTheme,
}: BreathingVisualProps) {
  // Determine colors — use theme ring color or primary
  const ringColor = sessionTheme?.ringColor || 'hsl(var(--primary))';
  const orbGradientClass = sessionTheme?.orbGradient || 'from-primary via-primary to-[hsl(var(--primary-glow))]';

  const getScaleForPhase = () => {
    switch (phase) {
      case "inhale": return 1.6;
      case "hold": return 1.6;
      case "exhale": return 1;
      case "rest": return 1;
      default: return 1;
    }
  };

  const getGlowIntensity = () => {
    const color = ringColor;
    switch (phase) {
      case "inhale": return `0 0 80px 30px color-mix(in srgb, ${color} 50%, transparent)`;
      case "hold": return `0 0 100px 40px color-mix(in srgb, ${color} 60%, transparent)`;
      case "exhale": return `0 0 40px 15px color-mix(in srgb, ${color} 30%, transparent)`;
      case "rest": return `0 0 20px 10px color-mix(in srgb, ${color} 20%, transparent)`;
      default: return `0 0 30px 10px color-mix(in srgb, ${color} 30%, transparent)`;
    }
  };

  const getSubtext = () => {
    switch (phase) {
      case "inhale": return "Breathe In";
      case "hold": return "Hold";
      case "exhale": return "Breathe Out";
      case "rest": return "Rest";
      case "complete": return "Complete";
      default: return "";
    }
  };

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

  const trailCount = 5;
  const trailDots = Array.from({ length: trailCount }, (_, i) => {
    const trailProgress = Math.max(0, progress - (i + 1) * 1.5);
    const trailAngle = (trailProgress / 100) * 360 - 90;
    const trailAngleRad = (trailAngle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(trailAngleRad),
      y: center + radius * Math.sin(trailAngleRad),
      opacity: 0.6 - i * 0.1,
      size: 8 - i * 1.2,
    };
  });

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="absolute transform -rotate-90"
          style={{ left: 0, top: 0 }}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 6px ${ringColor})`,
            }}
          />
        </svg>

        <svg
          width={size}
          height={size}
          className="absolute"
          style={{ left: 0, top: 0 }}
        >
          {progress > 2 && trailDots.map((dot, i) => (
            <motion.circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dot.size / 2}
              fill={ringColor}
              opacity={dot.opacity}
              initial={false}
              animate={{ cx: dot.x, cy: dot.y }}
              transition={{ duration: 0.1 }}
            />
          ))}
          
          {progress > 0 && (
            <motion.circle
              cx={dotX}
              cy={dotY}
              r={6}
              fill={ringColor}
              initial={false}
              animate={{ cx: dotX, cy: dotY }}
              transition={{ duration: 0.1 }}
              style={{
                filter: `drop-shadow(0 0 8px ${ringColor})`,
              }}
            />
          )}
        </svg>

        {/* Central Breathing Orb — uses theme gradient */}
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
          <motion.div
            animate={{
              scale: getScaleForPhase(),
              boxShadow: getGlowIntensity(),
            }}
            transition={{
              duration: phaseDuration,
              ease: "easeInOut",
            }}
            className={`w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br ${orbGradientClass} relative z-10`}
          >
            <motion.div
              animate={{
                scale: phase === "hold" ? [1, 1.1, 1] : 1,
                opacity: phase === "hold" ? [0.5, 0.8, 0.5] : 0.3,
              }}
              transition={{
                duration: 2,
                repeat: phase === "hold" ? Infinity : 0,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full border-2 border-primary-foreground/30"
            />
          </motion.div>
        </div>

        {/* Outer glow ring — uses theme ring color */}
        <motion.div
          animate={{
            scale: phase === "inhale" ? [1, 1.3] : phase === "hold" ? 1.3 : 1,
            opacity: phase === "inhale" || phase === "hold" ? 0.4 : 0.1,
          }}
          transition={{
            duration: phaseDuration,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-52 md:h-52 rounded-full"
          style={{
            border: `1px solid color-mix(in srgb, ${ringColor} 40%, transparent)`,
            boxShadow: `inset 0 0 20px color-mix(in srgb, ${ringColor} 10%, transparent)`,
          }}
        />
      </div>

      {phase !== "idle" && phase !== "complete" && (
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="mt-8 text-lg text-muted-foreground font-display tracking-widest uppercase"
        >
          {getSubtext()}
        </motion.p>
      )}
    </div>
  );
}
