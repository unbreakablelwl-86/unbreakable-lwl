import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  Play, Pause, Square, X, Dumbbell,
  ChevronDown, Footprints, Bike, Waves, Droplets,
  Timer, Maximize2, Activity,
} from 'lucide-react';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';

// ═══════════════════════════════════════════════════════════════
// FLOATING SESSION TRACKER
// Persistent draggable mini overlay for gym & cardio sessions.
// Collapses like Un-Tunes minimisation. Visible over lock screen.
// ═══════════════════════════════════════════════════════════════

const CARDIO_STORAGE_KEY = 'cardio_active_session';

// Wake Lock — keeps the screen on during active sessions
function useWakeLock(active: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) {
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
      return;
    }

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch {
        // silently fail — some browsers don't support it
      }
    };

    requestWakeLock();

    // Re-acquire on visibility change (wake lock is released on tab switch)
    const handleVisibility = () => {
      if (!document.hidden && active) requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [active]);
}

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getCardioIcon(activity: string) {
  switch (activity) {
    case 'walk': return <Footprints className="w-4 h-4" />;
    case 'cycle': return <Bike className="w-4 h-4" />;
    case 'row': return <Waves className="w-4 h-4" />;
    case 'swim': return <Droplets className="w-4 h-4" />;
    default: return <Footprints className="w-4 h-4" />;
  }
}

function getCardioLabel(activity: string) {
  switch (activity) {
    case 'walk': return 'WALK';
    case 'cycle': return 'CYCLE';
    case 'row': return 'ROW';
    case 'swim': return 'SWIM';
    default: return 'RUN';
  }
}

// ─── Gym session mini pill ───
function GymSessionPill({
  session,
  onExpand,
}: {
  session: { session_type: string; started_at: string; exercise_logs?: Array<{ completed: boolean }> };
  onExpand: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!session.started_at) return;
    const start = new Date(session.started_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [session.started_at]);

  const logs = session.exercise_logs || [];
  const completed = logs.filter(l => l.completed).length;
  const total = logs.length;
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div
      className="bg-card/95 backdrop-blur-xl border border-primary/25 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(255,85,0,0.15)] overflow-hidden"
      style={{ width: 260 }}
    >
      {/* Progress bar */}
      <div className="h-1 bg-muted/20">
        <div
          className="h-full bg-primary transition-[width] duration-500 shadow-[0_0_4px_rgba(255,85,0,0.6)]"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2.5" onClick={onExpand}>
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,85,0,0.2)]">
          <Dumbbell className="w-5 h-5 text-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{session.session_type}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-primary font-display tabular-nums">{formatElapsed(elapsed)}</span>
            <span className="text-[10px] text-muted-foreground">{completed}/{total} sets</span>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={(e) => { e.stopPropagation(); onExpand(); }}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(255,85,0,0.3)] active:scale-90 transition-transform shrink-0"
        >
          <Maximize2 className="w-3.5 h-3.5 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}

// ─── Cardio session mini pill ───
function CardioSessionPill({
  session,
  onExpand,
}: {
  session: { activity: string; startTime: string; distance: number; isPaused: boolean; pausedDuration: number };
  onExpand: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!session.startTime) return;
    const start = new Date(session.startTime).getTime();
    const tick = () => {
      const total = Math.floor((Date.now() - start) / 1000);
      setElapsed(Math.max(0, total - (session.pausedDuration || 0)));
    };
    tick();
    if (!session.isPaused) {
      const iv = setInterval(tick, 1000);
      return () => clearInterval(iv);
    }
  }, [session.startTime, session.isPaused, session.pausedDuration]);

  const distanceStr = session.distance >= 1
    ? `${session.distance.toFixed(2)} km`
    : `${Math.round(session.distance * 1000)} m`;

  return (
    <div
      className="bg-card/95 backdrop-blur-xl border border-primary/25 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(255,85,0,0.15)] overflow-hidden"
      style={{ width: 260 }}
    >
      {/* Animated pulse bar for active tracking */}
      <div className="h-1 bg-muted/20">
        <div
          className={`h-full bg-primary shadow-[0_0_4px_rgba(255,85,0,0.6)] ${
            session.isPaused ? 'w-1/2' : 'w-full animate-pulse'
          }`}
        />
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2.5" onClick={onExpand}>
        {/* Activity icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,85,0,0.2)] ${
          session.isPaused ? 'bg-yellow-500/15' : 'bg-primary/15'
        }`}>
          <span className={session.isPaused ? 'text-yellow-400' : 'text-primary'}>
            {getCardioIcon(session.activity)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-foreground">{getCardioLabel(session.activity)}</p>
            {session.isPaused && (
              <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-display tracking-wider">PAUSED</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-primary font-display tabular-nums">{formatElapsed(elapsed)}</span>
            <span className="text-[10px] text-muted-foreground">{distanceStr}</span>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={(e) => { e.stopPropagation(); onExpand(); }}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(255,85,0,0.3)] active:scale-90 transition-transform shrink-0"
        >
          <Maximize2 className="w-3.5 h-3.5 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════
export function FloatingSessionTracker() {
  const { activeSession } = useWorkoutSessions();
  const [cardioSession, setCardioSession] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const dragControls = useDragControls();

  // Poll for cardio session in localStorage
  useEffect(() => {
    const check = () => {
      try {
        const saved = localStorage.getItem(CARDIO_STORAGE_KEY);
        if (saved) {
          setCardioSession(JSON.parse(saved));
        } else {
          setCardioSession(null);
        }
      } catch {
        setCardioSession(null);
      }
    };
    check();
    const iv = setInterval(check, 2000);
    // Also listen for storage events from other tabs
    window.addEventListener('storage', check);
    return () => {
      clearInterval(iv);
      window.removeEventListener('storage', check);
    };
  }, []);

  const hasGymSession = !!activeSession && activeSession.status === 'in_progress';
  const hasCardioSession = !!cardioSession?.startTime;
  const hasAnySession = hasGymSession || hasCardioSession;

  // Wake Lock — screen stays on during any active session
  useWakeLock(hasAnySession);

  // Navigation helpers — navigate to the relevant page
  const handleExpandGym = useCallback(() => {
    // If not on programming page, navigate first then dispatch
    if (!window.location.pathname.startsWith('/programming')) {
      window.location.href = '/programming';
      // The event will be picked up after navigation
      setTimeout(() => window.dispatchEvent(new CustomEvent('open-gym-session')), 500);
    } else {
      window.dispatchEvent(new CustomEvent('open-gym-session'));
    }
  }, []);

  const handleExpandCardio = useCallback(() => {
    if (!window.location.pathname.startsWith('/tracker')) {
      window.location.href = '/tracker';
      setTimeout(() => window.dispatchEvent(new CustomEvent('open-cardio-session')), 500);
    } else {
      window.dispatchEvent(new CustomEvent('open-cardio-session'));
    }
  }, []);

  if (!hasAnySession) return null;

  // Check if the user is currently on a page where the full tracker is visible
  // If so, don't show the floating pill (avoid double UI)
  const isOnGymPage = window.location.pathname.startsWith('/programming');
  const isOnCardioPage = window.location.pathname.startsWith('/tracker');

  const showGymPill = hasGymSession && !isOnGymPage;
  const showCardioPill = hasCardioSession && !isOnCardioPage;

  if (!showGymPill && !showCardioPill) return null;

  const pill = (
    <>
      {/* Drag constraints — full viewport */}
      <div
        ref={constraintsRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9980,
        }}
      />

      <AnimatePresence>
        {/* Gym session pill */}
        {showGymPill && activeSession && (
          <motion.div
            key="gym-pill"
            drag
            dragControls={dragControls}
            dragConstraints={constraintsRef}
            dragMomentum={false}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            whileDrag={{ scale: 1.05 }}
            style={{
              position: 'fixed',
              bottom: showCardioPill ? 150 : 80,
              left: 12,
              zIndex: 9981,
              touchAction: 'none',
            }}
            className="select-none"
          >
            <GymSessionPill session={activeSession} onExpand={handleExpandGym} />
          </motion.div>
        )}

        {/* Cardio session pill */}
        {showCardioPill && cardioSession && (
          <motion.div
            key="cardio-pill"
            drag
            dragConstraints={constraintsRef}
            dragMomentum={false}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            whileDrag={{ scale: 1.05 }}
            style={{
              position: 'fixed',
              bottom: 80,
              left: 12,
              zIndex: 9981,
              touchAction: 'none',
            }}
            className="select-none"
          >
            <CardioSessionPill session={cardioSession} onExpand={handleExpandCardio} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return createPortal(pill, document.body);
}
