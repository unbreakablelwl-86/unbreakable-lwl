/**
 * useTiltEffect — Gyroscope (mobile) / Mouse (desktop) tilt for card effects
 * Used on Gold+ rarity cards for foil/holographic/chrome finish
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  /** Normalized 0-1 values for gradient positioning */
  gradientX: number;
  gradientY: number;
  /** Is user actively interacting */
  isActive: boolean;
}

const DEFAULT_TILT: TiltState = {
  rotateX: 0, rotateY: 0,
  gradientX: 0.5, gradientY: 0.5,
  isActive: false,
};

interface UseTiltOptions {
  /** Max tilt degrees (default 15) */
  maxTilt?: number;
  /** Enable gyroscope on mobile (default true) */
  enableGyroscope?: boolean;
  /** Respect prefers-reduced-motion (default true) */
  respectReducedMotion?: boolean;
  /** Smoothing factor 0-1 (default 0.1) */
  smoothing?: number;
}

export function useTiltEffect(options: UseTiltOptions = {}) {
  const {
    maxTilt = 15,
    enableGyroscope = true,
    respectReducedMotion = true,
    smoothing = 0.1,
  } = options;

  const [tilt, setTilt] = useState<TiltState>(DEFAULT_TILT);
  const elementRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);
  const targetRef = useRef<TiltState>(DEFAULT_TILT);
  const rafRef = useRef<number>();

  // Check reduced motion preference
  useEffect(() => {
    if (respectReducedMotion) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotion.current = mq.matches;
      const handler = (e: MediaQueryListEvent) => { reducedMotion.current = e.matches; };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [respectReducedMotion]);

  // Smoothing animation loop
  useEffect(() => {
    const animate = () => {
      setTilt(prev => {
        const t = targetRef.current;
        const dx = t.rotateX - prev.rotateX;
        const dy = t.rotateY - prev.rotateY;
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
          rafRef.current = requestAnimationFrame(animate);
          return prev;
        }
        return {
          rotateX: prev.rotateX + dx * smoothing,
          rotateY: prev.rotateY + dy * smoothing,
          gradientX: prev.gradientX + (t.gradientX - prev.gradientX) * smoothing,
          gradientY: prev.gradientY + (t.gradientY - prev.gradientY) * smoothing,
          isActive: t.isActive,
        };
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [smoothing]);

  // Mouse tracking (desktop)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (reducedMotion.current) return;
    const el = elementRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    targetRef.current = {
      rotateX: (y - 0.5) * -maxTilt * 2,
      rotateY: (x - 0.5) * maxTilt * 2,
      gradientX: x,
      gradientY: y,
      isActive: true,
    };
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { ...DEFAULT_TILT };
  }, []);

  // Gyroscope tracking (mobile)
  useEffect(() => {
    if (!enableGyroscope || reducedMotion.current) return;
    if (typeof DeviceOrientationEvent === 'undefined') return;

    const handler = (e: DeviceOrientationEvent) => {
      const beta = e.beta || 0;  // -180 to 180 (front-back tilt)
      const gamma = e.gamma || 0; // -90 to 90 (left-right tilt)
      
      // Normalize to ±maxTilt
      const rx = Math.max(-maxTilt, Math.min(maxTilt, beta * 0.3));
      const ry = Math.max(-maxTilt, Math.min(maxTilt, gamma * 0.3));
      
      targetRef.current = {
        rotateX: rx,
        rotateY: ry,
        gradientX: (ry + maxTilt) / (maxTilt * 2),
        gradientY: (rx + maxTilt) / (maxTilt * 2),
        isActive: true,
      };
    };

    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [enableGyroscope, maxTilt]);

  /** CSS transform string */
  const tiltStyle: React.CSSProperties = reducedMotion.current ? {} : {
    transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
    transition: 'transform 0.05s linear',
    willChange: 'transform',
  };

  /** Foil/holographic gradient position style */
  const foilStyle: React.CSSProperties = reducedMotion.current ? {} : {
    backgroundPosition: `${tilt.gradientX * 100}% ${tilt.gradientY * 100}%`,
  };

  return {
    tilt,
    tiltStyle,
    foilStyle,
    elementRef,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    isReducedMotion: reducedMotion.current,
  };
}
