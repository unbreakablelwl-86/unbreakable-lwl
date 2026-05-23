import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRuns } from '@/hooks/useRuns';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useMedals } from '@/hooks/useMedals';
import { useSegments } from '@/hooks/useSegments';
// import { useTrophies } from '@/hooks/useTrophies'; // Trophy system hidden for now
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useUserSettings } from '@/hooks/useUserSettings';
import { MedalCheckStats } from '@/lib/medalDefinitions';
// import { getCategoryLabel, TROPHY_ICONS } from '@/lib/trophyDefinitions'; // Trophy system hidden for now
import { toast } from 'sonner';
import { Play, Square, Pause, Timer, Globe, Users, Lock, Footprints, Bike, Edit3, Waves, Droplets, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostSessionSummary } from './PostSessionSummary';
import { CountdownOverlay } from '@/components/CountdownOverlay';
import { useCardioVoice } from '@/hooks/useCardioVoice';
import {
  calculateDistanceIncrement,
  getPersistedTrackerPositions,
  positionsToRouteGeoJSON,
  type CardioTrackerActivity,
} from '@/lib/cardioTracking';
import { encodePolyline } from '@/lib/segmentUtils';

interface CardioTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialActivity?: 'walk' | 'run' | 'cycle' | 'row' | 'swim';
  onSessionSaved?: () => void;
}

type ActivityType = 'walk' | 'run' | 'cycle' | 'row' | 'swim';
type EntryMode = 'live' | 'manual';

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
  speed: number | null;
}

const ACTIVITY_CONFIG = {
  walk: { 
    label: 'WALK', 
    icon: Footprints, 
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30'
  },
  run: { 
    label: 'RUN', 
    icon: Play, 
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30'
  },
  cycle: { 
    label: 'CYCLE', 
    icon: Bike, 
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30'
  },
  row: { 
    label: 'ROW', 
    icon: Waves, 
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30'
  },
  swim: { 
    label: 'SWIM', 
    icon: Droplets, 
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30'
  },
};

export function CardioTrackerModal({ isOpen, onClose, initialActivity, onSessionSaved }: CardioTrackerModalProps) {
  const { createRun } = useRuns();
  const { checkAndUpdatePRs } = usePersonalRecords();
  const { checkAndAwardMedals } = useMedals();
  const { segments, matchRunToSegments, saveSegmentEfforts, autoDetectSegments } = useSegments();
  // const { checkAndAwardTrophies } = useTrophies(); // Trophy system hidden for now
  const { profile } = useProfile();
  const { user } = useAuth();
  const { settings: userSettings } = useUserSettings();
  
  const [entryMode, setEntryMode] = useState<EntryMode>('live');
  const [phase, setPhase] = useState<'select' | 'countdown' | 'tracking' | 'summary' | 'manual'>('select');
  const [activity, setActivity] = useState<ActivityType | null>(initialActivity || null);
  const [loading, setLoading] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const STORAGE_KEY = 'cardio_active_session';

  // GPS tracking state
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [distance, setDistance] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'active' | 'weak' | 'error' | 'paused'>('acquiring');
  const [isPaused, setIsPaused] = useState(false);
  const [pausedDuration, setPausedDuration] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(() => 
    (userSettings as any)?.cardio_voice_enabled ?? true
  );
  const pauseStartRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const lastVoiceKmRef = useRef(0);
  const preAcquireWatchRef = useRef<number | null>(null);
  const pausedDurationRef = useRef(0);
  const activityRef = useRef<ActivityType | null>(initialActivity || null);
  const lastAcceptedPositionRef = useRef<Position | null>(null);
  const distanceRef = useRef(0);
  const voiceEnabledRef = useRef(voiceEnabled);
  const lastSegmentCheckKmRef = useRef(0);
  const liveSegmentResultsRef = useRef<any[]>([]);
  const gpsLastReceivedRef = useRef<number>(0);
  const gpsFallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ElevenLabs TTS voice - works in background / screen off
  const { speak: speakUpdate, cleanup: cleanupVoice } = useCardioVoice({ enabled: voiceEnabled });

  const speakUpdateRef = useRef(speakUpdate);

  // Post-session state (also used for manual entry)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');

  // Manual entry fields
  const [manualDistance, setManualDistance] = useState('');
  const [manualHours, setManualHours] = useState('0');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualSeconds, setManualSeconds] = useState('0');

  useEffect(() => {
    activityRef.current = activity;
  }, [activity]);

  useEffect(() => {
    pausedDurationRef.current = pausedDuration;
  }, [pausedDuration]);
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { speakUpdateRef.current = speakUpdate; }, [speakUpdate]);

  const syncElapsedTime = useCallback(() => {
    if (!sessionStartRef.current) return;

    const totalElapsed = Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000);
    setElapsedSeconds(Math.max(0, totalElapsed - pausedDurationRef.current));
  }, []);

  const restartElapsedTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    syncElapsedTime();
    timerRef.current = setInterval(syncElapsedTime, 1000);
  }, [syncElapsedTime]);

  const buildVoiceMessage = useCallback((km: number, totalDistance: number) => {
    const now = Date.now();
    const elapsed = sessionStartRef.current
      ? Math.max(0, Math.floor((now - sessionStartRef.current.getTime()) / 1000) - pausedDurationRef.current)
      : 0;
    const hrs = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    const secs = elapsed % 60;
    const timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    let paceStr = '--:--';
    if (totalDistance > 0) {
      const ps = Math.round(elapsed / totalDistance);
      paceStr = `${Math.floor(ps / 60)}:${(ps % 60).toString().padStart(2, '0')}`;
    }
    return `${km} kilometre${km > 1 ? 's' : ''} completed. Total distance ${totalDistance.toFixed(2)} K. Total time ${timeStr}. Average pace ${paceStr} per kilometre.`;
  }, []);

  const processGpsPosition = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy, speed } = position.coords;

    setGpsAccuracy(accuracy);
    gpsLastReceivedRef.current = Date.now();

    // We ARE receiving GPS positions → signal is live.
    // Classify signal quality by accuracy:
    if (accuracy <= 100) {
      setGpsStatus('active');       // Good signal
    } else if (accuracy <= 250) {
      setGpsStatus('weak');         // Receiving but poor accuracy
    }
    // >250m — leave status as-is (probably still 'acquiring')

    const nextPosition: Position = {
      lat: latitude,
      lng: longitude,
      timestamp: position.timestamp || Date.now(),
      accuracy,
      speed,
    };

    const distanceResult = calculateDistanceIncrement({
      activity: (activityRef.current || 'run') as CardioTrackerActivity,
      previousPosition: lastAcceptedPositionRef.current,
      nextPosition,
    });

    if (distanceResult.displaySpeedKph !== null) {
      setCurrentSpeed(distanceResult.displaySpeedKph);
    }

    if (!distanceResult.accepted) {
      // Position not used for distance, but GPS is still working — don't flip to 'acquiring'.
      // The only case we accept a position as the "anchor" without adding distance
      // is when there's no previous accepted position yet — lock in the first one.
      if (!lastAcceptedPositionRef.current && accuracy <= 150) {
        lastAcceptedPositionRef.current = nextPosition;
      }
      return;
    }

    lastAcceptedPositionRef.current = nextPosition;

    setPositions((prev) => [...prev, nextPosition]);

    if (distanceResult.incrementKm > 0) {
      setDistance((prev) => {
        const newDist = prev + distanceResult.incrementKm;
        distanceRef.current = newDist;
        const currentKm = Math.floor(newDist);
        if (currentKm > lastVoiceKmRef.current && currentKm >= 1 && voiceEnabledRef.current) {
          lastVoiceKmRef.current = currentKm;
          speakUpdateRef.current(buildVoiceMessage(currentKm, newDist));
        }
        // Per-KM segment matching (fire and forget)
        if (currentKm > lastSegmentCheckKmRef.current && currentKm >= 1) {
          lastSegmentCheckKmRef.current = currentKm;
          // Build polyline from current positions for segment matching
          setPositions((currentPositions) => {
            if (currentPositions.length >= 10) {
              const polyline = encodePolyline(currentPositions.map(p => ({ lat: p.lat, lng: p.lng })));
              const elapsed = Math.round((Date.now() - (sessionStartRef.current?.getTime() || Date.now())) / 1000) - pausedDurationRef.current;
              matchRunToSegments(polyline, elapsed, '').then(results => {
                if (results.length > 0) {
                  liveSegmentResultsRef.current = results;
                }
              }).catch(() => {});
            }
            return currentPositions;
          });
        }
        return newDist;
      });
    }
  }, [buildVoiceMessage]);

  const requestCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      processGpsPosition,
      () => {
        // No-op: watchPosition is still the primary source.
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );
  }, [processGpsPosition]);

  const selectActivity = (type: ActivityType) => {
    setActivity(type);
    if (entryMode === 'live') {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        return;
      }
      setPhase('countdown');
    } else {
      setPhase('manual');
    }
  };

  const startGpsTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (gpsFallbackIntervalRef.current) {
      clearInterval(gpsFallbackIntervalRef.current);
    }

    // Request location permission and start high-accuracy GPS tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      processGpsPosition,
      (error) => {
        console.error('GPS Error:', error.code, error.message);
        
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus('error');
          toast.error('Location access denied. Please enable location permissions.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          // Don't set error immediately — could be temporary
          // Only flag error if we haven't received anything for 30s
          if (Date.now() - gpsLastReceivedRef.current > 30000) {
            setGpsStatus('error');
            toast.error('Location unavailable. Please check GPS is enabled.');
          }
        }
        // TIMEOUT errors are normal on mobile — watchPosition keeps retrying automatically
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    );

    // Fallback: if watchPosition goes silent for 8s, poll getCurrentPosition.
    // This handles some mobile browsers where watchPosition stalls after backgrounding.
    gpsFallbackIntervalRef.current = setInterval(() => {
      const sinceLastFix = Date.now() - gpsLastReceivedRef.current;
      if (sinceLastFix > 8000) {
        navigator.geolocation.getCurrentPosition(
          processGpsPosition,
          () => {},
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
        );
      }
      // If we haven't had any position in 30s, show as acquiring
      if (sinceLastFix > 30000) {
        setGpsStatus('acquiring');
      }
    }, 8000);
  }, [processGpsPosition]);

  const startTracking = useCallback(() => {
    setPhase('tracking');
    const sessionStart = new Date();
    setStartTime(sessionStart);
    sessionStartRef.current = sessionStart;
    setPositions([]);
    setDistance(0);
    distanceRef.current = 0;
    setElapsedSeconds(0);
    setPausedDuration(0);
    pausedDurationRef.current = 0;
    setIsPaused(false);
    setGpsStatus('acquiring');
    setGpsAccuracy(null);
    setCurrentSpeed(null);
    lastAcceptedPositionRef.current = null;

    restartElapsedTimer();
    startGpsTracking();
    requestCurrentPosition();
  }, [requestCurrentPosition, restartElapsedTimer, startGpsTracking]);

  const pauseTracking = useCallback(() => {
    setIsPaused(true);
    pauseStartRef.current = Date.now();
    setGpsStatus('paused');
    
    // Stop GPS tracking
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (gpsFallbackIntervalRef.current) {
      clearInterval(gpsFallbackIntervalRef.current);
      gpsFallbackIntervalRef.current = null;
    }
    // Stop timer updates
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resumeTracking = useCallback(() => {
    // Calculate how long we were paused and add to pausedDuration
    if (pauseStartRef.current) {
      const pausedTime = Math.floor((Date.now() - pauseStartRef.current) / 1000);
      const nextPausedDuration = pausedDurationRef.current + pausedTime;
      pausedDurationRef.current = nextPausedDuration;
      setPausedDuration(nextPausedDuration);
      pauseStartRef.current = null;
    }
    
    setIsPaused(false);
    setGpsStatus('acquiring');

    // Restart timer with updated paused duration
    restartElapsedTimer();

    // Restart GPS tracking
    startGpsTracking();
    requestCurrentPosition();
  }, [requestCurrentPosition, restartElapsedTimer, startGpsTracking]);

  const stopTracking = useCallback(() => {
    // If paused, finalize the paused duration
    if (isPaused && pauseStartRef.current) {
      const pausedTime = Math.floor((Date.now() - pauseStartRef.current) / 1000);
      setPausedDuration((prev) => prev + pausedTime);
      pauseStartRef.current = null;
    }
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (gpsFallbackIntervalRef.current) {
      clearInterval(gpsFallbackIntervalRef.current);
      gpsFallbackIntervalRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(false);
    setPhase('summary');
    // Clear persisted session
    localStorage.removeItem(STORAGE_KEY);
  }, [isPaused]);

  // Restore active session from localStorage on mount
  useEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const session = JSON.parse(saved);
        const restoredPositions = session.positions || [];
        setActivity(session.activity);
        setPhase('tracking');
        const sessionStart = new Date(session.startTime);
        setStartTime(sessionStart);
        sessionStartRef.current = sessionStart;
        setDistance(session.distance || 0);
        distanceRef.current = session.distance || 0;
        setPausedDuration(session.pausedDuration || 0);
        pausedDurationRef.current = session.pausedDuration || 0;
        setIsPaused(session.isPaused || false);
        setPositions(restoredPositions);
        lastAcceptedPositionRef.current = restoredPositions.length > 0 ? restoredPositions[restoredPositions.length - 1] : null;
        lastVoiceKmRef.current = session.lastVoiceKm || 0;
        setCurrentSpeed(session.currentSpeed ?? null);

        // Recalculate elapsed
        const now = Date.now();
        const totalElapsed = Math.floor((now - sessionStart.getTime()) / 1000);
        setElapsedSeconds(Math.max(0, totalElapsed - pausedDurationRef.current));

        // Restart timer
        restartElapsedTimer();

        if (!session.isPaused) {
          startGpsTracking();
          requestCurrentPosition();
        }
        setGpsStatus(session.isPaused ? 'paused' : 'acquiring');
        toast.info('Resumed your active cardio session');
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [isOpen, requestCurrentPosition, restartElapsedTimer, startGpsTracking]);

  // Save session to localStorage whenever tracking state changes
  useEffect(() => {
    if (phase === 'tracking' && startTime && activity) {
      const sessionData = {
        activity,
        startTime: startTime.toISOString(),
        distance,
        pausedDuration,
        isPaused,
        positions: getPersistedTrackerPositions(positions),
        lastVoiceKm: lastVoiceKmRef.current,
        currentSpeed,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    }
  }, [phase, startTime, distance, pausedDuration, isPaused, positions, activity, currentSpeed]);

  useEffect(() => {
    const handleVisibilityRecovery = () => {
      if (!document.hidden && phase === 'tracking' && !isPaused) {
        requestCurrentPosition();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityRecovery);
    window.addEventListener('focus', handleVisibilityRecovery);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityRecovery);
      window.removeEventListener('focus', handleVisibilityRecovery);
    };
  }, [isPaused, phase, requestCurrentPosition]);

  // Cleanup on unmount - DON'T clear localStorage (session persists)
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (gpsFallbackIntervalRef.current) {
        clearInterval(gpsFallbackIntervalRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (preAcquireWatchRef.current !== null) {
        navigator.geolocation.clearWatch(preAcquireWatchRef.current);
      }
      cleanupVoice();
    };
  }, [cleanupVoice]);


  // Pre-acquire GPS signal during countdown
  const handlePreAcquireGps = useCallback(() => {
    if (preAcquireWatchRef.current !== null) return;
    preAcquireWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.accuracy <= 20) {
          setGpsStatus('active');
          setGpsAccuracy(position.coords.accuracy);
        } else {
          setGpsStatus('acquiring');
          setGpsAccuracy(position.coords.accuracy);
        }
      },
      () => { /* ignore errors during pre-acquire */ },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateSpeed = () => {
    if (elapsedSeconds === 0 || distance === 0) return 0;
    return (distance / elapsedSeconds) * 3600; // km/h
  };

  const calculatePace = () => {
    if (distance === 0) return '--:--';
    const paceSeconds = Math.round(elapsedSeconds / distance);
    const mins = Math.floor(paceSeconds / 60);
    const secs = paceSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const triggerConfetti = () => {
    const colors = ['#FF6600', '#FFB366', '#FF8533', '#FFCC99'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          top: -10px;
          left: ${Math.random() * 100}vw;
          width: 10px;
          height: 10px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
          animation: confetti-fall 3s ease-out forwards;
          z-index: 9999;
          pointer-events: none;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }, i * 30);
    }
  };

  const checkAchievements = async (runData: {
    id: string;
    distance_km: number;
    duration_seconds: number;
    started_at: string;
    is_gps_tracked: boolean;
    pace_per_km_seconds: number;
  }) => {
    const prResults = await checkAndUpdatePRs({
      id: runData.id,
      distance_km: runData.distance_km,
      duration_seconds: runData.duration_seconds,
      started_at: runData.started_at,
      activity_type: activity || 'run',
    });

    const totalRuns = (profile?.total_runs || 0) + 1;
    const totalDistanceKm = (Number(profile?.total_distance_km) || 0) + runData.distance_km;

    const stats: MedalCheckStats = {
      totalRuns,
      totalDistanceKm,
      currentRun: {
        distanceKm: runData.distance_km,
        durationSeconds: runData.duration_seconds,
        pacePerKmSeconds: runData.pace_per_km_seconds,
        isGpsTracked: runData.is_gps_tracked,
      },
      weeklyRuns: 1,
      monthlyRuns: 1,
      personalRecords: prResults,
    };

    const newMedals = await checkAndAwardMedals(stats, runData.id);

    const newPRs = prResults.filter(pr => pr.isNewPR);
    if (newPRs.length > 0) {
      setTimeout(() => {
        toast.success(`🏆 New Personal Record!`, {
          description: `You set a PR for ${newPRs.map(pr => pr.distanceType.replace('_', ' ')).join(', ')}`,
        });
      }, 500);
    }

    if (newMedals.length > 0) {
      setTimeout(() => {
        newMedals.forEach((medal, index) => {
          setTimeout(() => {
            toast.success(`${medal.icon} ${medal.name}`, {
              description: medal.description,
            });
          }, index * 800);
        });
      }, newPRs.length > 0 ? 1500 : 500);
    }

    // Trophy system hidden for now
  };

  const handleSave = async () => {
    if (distance < 0.01) {
      toast.error('Distance is too short to save');
      return;
    }

    setLoading(true);

    const paceSeconds = Math.round(elapsedSeconds / distance);
    const speedKph = calculateSpeed();
    const activityLabel = ACTIVITY_CONFIG[activity!].label;
    const routePolyline = positions.length > 1 ? positionsToRouteGeoJSON(positions) : null;

    const { error, data } = await createRun({
      title: title || `${activityLabel} Session`,
      description: description || null,
      distance_km: Math.round(distance * 1000) / 1000,
      duration_seconds: elapsedSeconds,
      started_at: startTime?.toISOString() || new Date().toISOString(),
      ended_at: new Date().toISOString(),
      pace_per_km_seconds: paceSeconds,
      average_speed_kph: Math.round(speedKph * 100) / 100,
      elevation_gain_m: null,
      calories_burned: Math.round(distance * 60),
      route_polyline: routePolyline,
      map_snapshot_url: null,
      is_gps_tracked: true,
      weather_conditions: null,
      temperature_celsius: null,
      notes: null,
      activity_type: activity!,
      is_public: visibility === 'public',
      visibility: visibility,
      comments_enabled: true,
    } as any);

    if (error) {
      setLoading(false);
      toast.error('Failed to save session');
    } else {
      if (data) {
        await checkAchievements({
          id: data.id,
          distance_km: Math.round(distance * 1000) / 1000,
          duration_seconds: elapsedSeconds,
          started_at: startTime?.toISOString() || new Date().toISOString(),
          is_gps_tracked: true,
          pace_per_km_seconds: paceSeconds,
        });

        // Final segment matching and saving with the actual run ID
        if (positions.length >= 10) {
          try {
            const polyline = encodePolyline(positions.map(p => ({ lat: p.lat, lng: p.lng })));
            const segResults = await matchRunToSegments(polyline, elapsedSeconds, data.id);
            if (segResults.length > 0) {
              await saveSegmentEfforts(data.id, segResults);
              const newKOMs = segResults.filter(r => r.isNewKOM);
              const newPRs = segResults.filter(r => r.isNewPR);
              if (newKOMs.length > 0) {
                toast.success(`👑 New KOM on ${newKOMs.length} segment${newKOMs.length > 1 ? 's' : ''}!`);
              } else if (newPRs.length > 0) {
                toast.success(`🏆 Segment PR on ${newPRs.length} segment${newPRs.length > 1 ? 's' : ''}!`);
              }
            }
            // Auto-detect new segments from this run
            if (user) {
              await autoDetectSegments(polyline, user.id);
            }
          } catch (segErr) {
            console.error('Segment processing error:', segErr);
          }
        }
      }
      setLoading(false);
      toast.success('Session saved!');
      onSessionSaved?.();
      resetAndClose();
    }
  };

  const handleManualSave = async () => {
    const distanceKm = parseFloat(manualDistance);
    const hours = parseInt(manualHours) || 0;
    const mins = parseInt(manualMinutes) || 0;
    const secs = parseInt(manualSeconds) || 0;
    const totalSeconds = hours * 3600 + mins * 60 + secs;

    if (isNaN(distanceKm) || distanceKm <= 0) {
      toast.error('Please enter a valid distance');
      return;
    }

    if (totalSeconds <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    setLoading(true);

    const paceSeconds = Math.round(totalSeconds / distanceKm);
    const speedKph = (distanceKm / totalSeconds) * 3600;
    const activityLabel = ACTIVITY_CONFIG[activity!].label;
    const sessionStart = new Date();

    const { error, data } = await createRun({
      title: title || `${activityLabel} Session`,
      description: description || null,
      distance_km: Math.round(distanceKm * 1000) / 1000,
      duration_seconds: totalSeconds,
      started_at: sessionStart.toISOString(),
      ended_at: new Date(sessionStart.getTime() + totalSeconds * 1000).toISOString(),
      pace_per_km_seconds: paceSeconds,
      average_speed_kph: Math.round(speedKph * 100) / 100,
      elevation_gain_m: null,
      calories_burned: Math.round(distanceKm * 60),
      route_polyline: null,
      map_snapshot_url: null,
      is_gps_tracked: false,
      weather_conditions: null,
      temperature_celsius: null,
      notes: null,
      activity_type: activity!,
      is_public: visibility === 'public',
      visibility: visibility,
      comments_enabled: true,
    } as any);

    if (error) {
      setLoading(false);
      toast.error('Failed to save session');
    } else {
      if (data) {
        await checkAchievements({
          id: data.id,
          distance_km: distanceKm,
          duration_seconds: totalSeconds,
          started_at: sessionStart.toISOString(),
          is_gps_tracked: false,
          pace_per_km_seconds: paceSeconds,
        });
      }
      setLoading(false);
      toast.success('Session saved!');
      onSessionSaved?.();
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setPhase('select');
    setActivity(null);
    setEntryMode('live');
    setTitle('');
    setDescription('');
    setVisibility('public');
    setPositions([]);
    setDistance(0);
    distanceRef.current = 0;
    setElapsedSeconds(0);
    setStartTime(null);
    setManualDistance('');
    setManualHours('0');
    setManualMinutes('');
    setManualSeconds('0');
    setPausedDuration(0);
    setIsPaused(false);
    pauseStartRef.current = null;
    sessionStartRef.current = null;
    pausedDurationRef.current = 0;
    lastAcceptedPositionRef.current = null;
    lastVoiceKmRef.current = 0;
    lastSegmentCheckKmRef.current = 0;
    liveSegmentResultsRef.current = [];
    setCurrentSpeed(null);
    setGpsAccuracy(null);
    setGpsStatus('acquiring');
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (gpsFallbackIntervalRef.current) {
      clearInterval(gpsFallbackIntervalRef.current);
      gpsFallbackIntervalRef.current = null;
    }
    if (preAcquireWatchRef.current !== null) {
      navigator.geolocation.clearWatch(preAcquireWatchRef.current);
      preAcquireWatchRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    gpsLastReceivedRef.current = 0;
    onClose();
  };

  const handleClose = () => {
    if (phase === 'tracking') {
      // Don't discard - just close and let session persist in background
      toast.info('Session continues in background. Reopen to resume or end.');
      onClose();
    } else {
      resetAndClose();
    }
  };

  const handleEndSession = () => {
    setShowEndConfirm(true);
  };

  const confirmEndSession = () => {
    setShowEndConfirm(false);
    stopTracking();
  };

  const discardSession = () => {
    setShowEndConfirm(false);
    localStorage.removeItem(STORAGE_KEY);
    resetAndClose();
  };

  const config = activity ? ACTIVITY_CONFIG[activity] : null;
  const ActivityIcon = config?.icon || Play;

  return (
    <>
      <CountdownOverlay
        isActive={phase === 'countdown'}
        onComplete={() => {
          if (preAcquireWatchRef.current !== null) {
            navigator.geolocation.clearWatch(preAcquireWatchRef.current);
            preAcquireWatchRef.current = null;
          }
          lastVoiceKmRef.current = 0;
          startTracking();
        }}
        startFrom={3}
        exerciseName={config?.label}
        onStartGps={handlePreAcquireGps}
      />
      
      <Dialog open={isOpen && phase !== 'countdown'} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto border-[#FF5500]/15 shadow-[0_0_40px_rgba(255,85,0,0.08)]" style={{ background: '#0A0A0A' }}>
          <AnimatePresence mode="wait">
            {/* Activity Selection */}
            {phase === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl tracking-wide text-center text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>
                    CARDIO TRACKER
                  </DialogTitle>
                </DialogHeader>
                
                <div className="py-6 space-y-6">
                  {/* Entry Mode Toggle */}
                  <div className="flex gap-1 p-1 rounded-xl bg-[#111] border border-gray-800">
                    <button
                      onClick={() => setEntryMode('live')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-display tracking-wide transition-all ${
                        entryMode === 'live'
                          ? 'bg-[#FF5500]/20 text-[#FF5500] shadow-[0_0_15px_rgba(255,85,0,0.15)]'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <Timer className="w-4 h-4" />
                      LIVE TRACK
                    </button>
                    <button
                      onClick={() => setEntryMode('manual')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-display tracking-wide transition-all ${
                        entryMode === 'manual'
                          ? 'bg-[#FF5500]/20 text-[#FF5500] shadow-[0_0_15px_rgba(255,85,0,0.15)]'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                      MANUAL LOG
                    </button>
                  </div>

                  <p className="text-center text-gray-500 text-sm">
                    {entryMode === 'live' 
                      ? 'Track with GPS in real-time' 
                      : 'Log a completed session manually'}
                  </p>

                  {/* Voice settings for live mode */}
                  {entryMode === 'live' && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-display tracking-wide transition-all border ${
                          voiceEnabled
                            ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30'
                            : 'bg-[#111] text-gray-500 border-gray-700'
                        }`}
                      >
                        {voiceEnabled ? '🔊 VOICE ON' : '🔇 VOICE OFF'}
                      </button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(Object.keys(ACTIVITY_CONFIG) as ActivityType[]).map((type) => {
                      const cfg = ACTIVITY_CONFIG[type];
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={type}
                          className="p-5 cursor-pointer rounded-xl border border-[#FF5500]/20 bg-[#111] 
                            hover:border-[#FF5500]/50 hover:bg-[#FF5500]/10 hover:shadow-[0_0_20px_rgba(255,85,0,0.15)]
                            transition-all duration-200 active:scale-95"
                          onClick={() => selectActivity(type)}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-[#111] border border-[#FF5500]/20 flex items-center justify-center"
                              style={{ boxShadow: '0 0 15px rgba(255,85,0,0.15)' }}>
                              <Icon className="w-7 h-7 text-[#FF5500]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
                            </div>
                            <span className="font-display text-sm tracking-wide text-[#FF5500]">
                              {cfg.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Manual Entry Phase */}
            {phase === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl tracking-wide text-center">
                    MANUAL LOG
                  </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                  {/* Activity Badge */}
                  <div className="flex justify-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config?.bgColor}`}>
                      <ActivityIcon className={`w-5 h-5 ${config?.color}`} />
                      <span className={`font-display tracking-wide ${config?.color}`}>
                        {config?.label}
                      </span>
                    </div>
                  </div>

                  {/* Distance Input */}
                  <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={manualDistance}
                      onChange={(e) => setManualDistance(e.target.value)}
                      placeholder="5.00"
                      className="bg-input border-border text-center text-2xl font-display"
                    />
                  </div>

                  {/* Duration Inputs */}
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <Input
                          type="number"
                          min="0"
                          value={manualHours}
                          onChange={(e) => setManualHours(e.target.value)}
                          className="bg-input border-border text-center"
                        />
                        <span className="text-xs text-muted-foreground">hrs</span>
                      </div>
                      <div className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={manualMinutes}
                          onChange={(e) => setManualMinutes(e.target.value)}
                          placeholder="30"
                          className="bg-input border-border text-center"
                        />
                        <span className="text-xs text-muted-foreground">mins</span>
                      </div>
                      <div className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={manualSeconds}
                          onChange={(e) => setManualSeconds(e.target.value)}
                          className="bg-input border-border text-center"
                        />
                        <span className="text-xs text-muted-foreground">secs</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title (optional)</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={`${config?.label} Session`}
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="How did it feel?"
                        className="bg-input border-border"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'friends' | 'private')}>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="friends">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Friends Only
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Private
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    className="w-full font-display tracking-wide py-6"
                    onClick={handleManualSave}
                    disabled={loading || !manualDistance}
                  >
                    {loading ? 'Saving...' : 'SAVE SESSION'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Active Tracking */}
            {phase === 'tracking' && (
              <motion.div
                key="tracking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6"
              >
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config?.bgColor} mb-4`}>
                    <ActivityIcon className={`w-5 h-5 ${config?.color}`} />
                    <span className={`font-display tracking-wide ${config?.color}`}>
                      {config?.label}
                    </span>
                  </div>
                  
                  {/* Large Timer Display */}
                  <p className="font-display text-7xl text-primary tracking-wide mb-2">
                    {formatTime(elapsedSeconds)}
                  </p>
                  
                  {/* GPS Status Indicator */}
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: gpsStatus === 'active' ? [1, 1.3, 1] : 1 }}
                        transition={{ repeat: gpsStatus === 'active' ? Infinity : 0, duration: 1.5 }}
                        className={`w-2 h-2 rounded-full ${
                          gpsStatus === 'active' ? 'bg-emerald-500' : 
                          gpsStatus === 'weak' ? 'bg-amber-500' :
                          gpsStatus === 'acquiring' ? 'bg-amber-500' : 
                          gpsStatus === 'paused' ? 'bg-primary' : 'bg-destructive'
                        }`}
                      />
                      <span className={
                        gpsStatus === 'active' ? 'text-emerald-500' : 
                        gpsStatus === 'weak' ? 'text-amber-500' :
                        gpsStatus === 'acquiring' ? 'text-amber-500' : 
                        gpsStatus === 'paused' ? 'text-primary' : 'text-destructive'
                      }>
                        {gpsStatus === 'active' ? 'GPS Tracking' : 
                         gpsStatus === 'weak' ? 'Weak Signal' :
                         gpsStatus === 'acquiring' ? 'Finding GPS...' : 
                         gpsStatus === 'paused' ? 'Paused' : 'GPS Error'}
                      </span>
                    </div>
                    {gpsAccuracy !== null && (gpsStatus === 'active' || gpsStatus === 'weak') && (
                      <span className="text-muted-foreground">
                        ±{Math.round(gpsAccuracy)}m
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-primary/10 rounded-xl p-4 text-center border-2 border-primary/30 neon-border-subtle">
                    <p className="font-display text-3xl text-primary neon-glow-subtle tracking-wide">
                      {distance.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">km</p>
                  </div>
                  <div className="bg-primary/10 rounded-xl p-4 text-center border-2 border-primary/30 neon-border-subtle">
                    <p className="font-display text-3xl text-primary neon-glow-subtle tracking-wide">
                      {currentSpeed !== null ? currentSpeed.toFixed(1) : calculateSpeed().toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">km/h</p>
                  </div>
                  <div className="bg-primary/10 rounded-xl p-4 text-center border-2 border-primary/30 neon-border-subtle">
                    <p className="font-display text-3xl text-primary neon-glow-subtle tracking-wide">
                      {calculatePace()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">/km</p>
                  </div>
                </div>

                {/* Voice Controls */}
                <div className="flex justify-center gap-2 mb-4">
                  <Button
                    variant={voiceEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className="gap-2 font-display tracking-wide text-xs"
                  >
                    {voiceEnabled ? '🔊 VOICE ON' : '🔇 VOICE OFF'}
                  </Button>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center gap-4">
                  {isPaused ? (
                    <Button
                      size="lg"
                      className="font-display text-xl tracking-wide px-12 py-8 rounded-full bg-primary hover:bg-primary/90"
                      onClick={resumeTracking}
                    >
                      <Play className="w-6 h-6 mr-3" />
                      RESUME
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="outline"
                      className="font-display text-xl tracking-wide px-12 py-8 rounded-full border-primary text-primary hover:bg-primary/10"
                      onClick={pauseTracking}
                    >
                      <Pause className="w-6 h-6 mr-3" />
                      PAUSE
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant="destructive"
                    className="font-display text-xl tracking-wide px-12 py-8 rounded-full"
                    onClick={handleEndSession}
                  >
                    <Square className="w-6 h-6 mr-3" />
                    END
                  </Button>
                </div>

                {/* End Session Confirmation */}
                {showEndConfirm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg z-20"
                  >
                    <div className="text-center space-y-4 p-6">
                      <p className="font-display text-xl text-foreground tracking-wide">END SESSION?</p>
                      <p className="text-muted-foreground text-sm">Save your session data or discard it.</p>
                      <div className="flex flex-col gap-2">
                        <Button onClick={confirmEndSession} className="font-display tracking-wide w-full">
                          <Save className="w-4 h-4 mr-2" />
                          SAVE &amp; END
                        </Button>
                        <Button variant="destructive" onClick={discardSession} className="font-display tracking-wide w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          DISCARD
                        </Button>
                        <Button variant="ghost" onClick={() => setShowEndConfirm(false)} className="font-display tracking-wide text-muted-foreground w-full">
                          CONTINUE SESSION
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Summary / Save */}
            {phase === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl tracking-wide text-center neon-glow-subtle">
                    SESSION COMPLETE
                  </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                  {/* Activity Badge */}
                  <div className="flex justify-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config?.bgColor} neon-border-subtle`}>
                      <ActivityIcon className={`w-5 h-5 ${config?.color}`} />
                      <span className={`font-display tracking-wide ${config?.color}`}>
                        {config?.label}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Session Summary with Splits */}
                  <PostSessionSummary
                    distance={distance}
                    elapsedSeconds={elapsedSeconds}
                    positions={positions}
                    activityLabel={config?.label || 'Session'}
                    activityIcon={ActivityIcon}
                  />

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title (optional)</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={`${config?.label} Session`}
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="How did it feel?"
                        className="bg-input border-border"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'friends' | 'private')}>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="friends">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Friends Only
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Private
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    className="w-full font-display tracking-wide py-6"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'SAVE SESSION'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
