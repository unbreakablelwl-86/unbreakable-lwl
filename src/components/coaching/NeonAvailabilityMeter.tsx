import { useMemo } from 'react';

interface NeonAvailabilityMeterProps {
  current: number;
  max: number;
  size?: number;
}

/**
 * Boss UNBREAKABLE neon availability meter.
 * SVG ring that fills with neon orange glow as coaching spaces are taken.
 * When nearly full → pulses red/orange warning glow.
 */
export function NeonAvailabilityMeter({ current, max, size = 160 }: NeonAvailabilityMeterProps) {
  const pct = Math.min(current / Math.max(max, 1), 1);
  const remaining = max - current;
  const isFull = remaining === 0;
  const isLow = remaining <= 3 && remaining > 0;

  /* SVG circle math */
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const filledLen = circumference * pct;
  const gapLen = circumference - filledLen;

  /* Neon colours */
  const neonOrange = '#FF6600';
  const neonRed = '#FF2222';
  const glowColor = isFull ? neonRed : isLow ? '#FF4400' : neonOrange;

  /* Segments — small tick marks around the ring */
  const segments = useMemo(() => {
    const arr: { x1: number; y1: number; x2: number; y2: number; filled: boolean }[] = [];
    for (let i = 0; i < max; i++) {
      const angle = (i / max) * 360 - 90; // start from top
      const rad = (angle * Math.PI) / 180;
      const innerR = radius - strokeWidth * 0.5;
      const outerR = radius + strokeWidth * 0.5;
      arr.push({
        x1: cx + innerR * Math.cos(rad),
        y1: cy + innerR * Math.sin(rad),
        x2: cx + outerR * Math.cos(rad),
        y2: cy + outerR * Math.sin(rad),
        filled: i < current,
      });
    }
    return arr;
  }, [max, current, radius, strokeWidth, cx, cy]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl">
        <defs>
          {/* Neon glow filter */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="neonGlowStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Gradient for the filled arc */}
          <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={neonOrange} />
            <stop offset="100%" stopColor={glowColor} />
          </linearGradient>
        </defs>

        {/* Background ring (dark) */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="rgba(255,102,0,0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Outer subtle glow ring */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={glowColor}
          strokeWidth={strokeWidth * 0.3}
          opacity={0.15}
          filter="url(#neonGlowStrong)"
        />

        {/* Filled arc — neon orange glow */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="url(#meterGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filledLen} ${gapLen}`}
          strokeDashoffset={circumference * 0.25}
          transform={`rotate(-90 ${cx} ${cy})`}
          filter="url(#neonGlow)"
          className={isFull ? 'animate-pulse' : isLow ? 'animate-pulse' : ''}
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />

        {/* Segment ticks */}
        {segments.map((seg, i) => (
          <line
            key={i}
            x1={seg.x1} y1={seg.y1}
            x2={seg.x2} y2={seg.y2}
            stroke={seg.filled ? glowColor : 'rgba(255,255,255,0.06)'}
            strokeWidth={1.5}
            opacity={seg.filled ? 0.9 : 0.3}
            {...(seg.filled ? { filter: 'url(#neonGlow)' } : {})}
          />
        ))}
      </svg>

      {/* Centre content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Unbreakable icon — brick/shield */}
        <div className="text-2xl mb-0.5" style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}>
          🧱
        </div>
        <p
          className="font-display text-2xl tracking-wider"
          style={{
            color: glowColor,
            textShadow: `0 0 10px ${glowColor}40, 0 0 20px ${glowColor}20`,
          }}
        >
          {current}/{max}
        </p>
        <p
          className="font-display text-[8px] tracking-[0.3em] uppercase"
          style={{
            color: isFull ? neonRed : isLow ? '#FF4400' : 'rgba(255,255,255,0.5)',
            textShadow: isFull || isLow ? `0 0 6px ${glowColor}40` : 'none',
          }}
        >
          {isFull ? 'FULLY BOOKED' : isLow ? 'ALMOST FULL' : 'SPACES LEFT'}
        </p>
      </div>
    </div>
  );
}
