import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRuns } from '@/hooks/useRuns';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useMedals } from '@/hooks/useMedals';
// import { useTrophies } from '@/hooks/useTrophies'; // Trophy system hidden for now
import { useProfile } from '@/hooks/useProfile';
import { useSegments } from '@/hooks/useSegments';
import { useAuth } from '@/hooks/useAuth';
import { MedalCheckStats } from '@/lib/medalDefinitions';
// import { getCategoryLabel, TROPHY_ICONS, TrophyRank } from '@/lib/trophyDefinitions'; // Trophy system hidden for now
import { encodePolyline, formatSegmentTime } from '@/lib/segmentUtils';
import { toast } from 'sonner';
import { Play, Square, MapPin, Timer, Pencil, Trophy, Medal, Crown, Globe, Users, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RunMap, positionsToGeoJSON } from './RunMap';
import { CountdownOverlay } from '@/components/CountdownOverlay';

interface RecordRunModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
}

export function RecordRunModal({ isOpen, onClose }: RecordRunModalProps) {
  const { createRun } = useRuns();
  const { checkAndUpdatePRs, records } = usePersonalRecords();
  const { checkAndAwardMedals } = useMedals();
  // const { checkAndAwardTrophies } = useTrophies(); // Trophy system hidden for now
  const { profile } = useProfile();
  const { user } = useAuth();
  const { matchRunToSegments, saveSegmentEfforts, autoDetectSegments } = useSegments();
  const [mode, setMode] = useState<'gps' | 'manual'>('gps');
  const [loading, setLoading] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  // GPS tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [distance, setDistance] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Manual entry state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('0');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [isPublic, setIsPublic] = useState(true);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const initiateTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setShowCountdown(true);
  }, []);

  const startTracking = useCallback(() => {
    setShowCountdown(false);
    setIsTracking(true);
    setStartTime(new Date());
    setPositions([]);
    setDistance(0);
    setElapsedSeconds(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Start GPS tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: Position = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        setPositions((prev) => {
          if (prev.length > 0) {
            const lastPos = prev[prev.length - 1];
            const segmentDistance = calculateDistance(
              lastPos.lat,
              lastPos.lng,
              newPosition.lat,
              newPosition.lng
            );
            // Only add if moved more than 5 meters (0.005 km)
            if (segmentDistance > 0.005) {
              setDistance((d) => d + segmentDistance);
              return [...prev, newPosition];
            }
            return prev;
          }
          return [newPosition];
        });
      },
      (error) => {
        console.error('GPS Error:', error);
        toast.error('Could not get your location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const triggerConfetti = () => {
    // Create confetti effect for KOM
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

  const checkSegmentAchievements = async (runData: {
    id: string;
    route_polyline: string;
    duration_seconds: number;
  }) => {
    if (!user || !runData.route_polyline) return;

    try {
      // Match run against existing segments
      const matchResults = await matchRunToSegments(
        runData.route_polyline,
        runData.duration_seconds,
        runData.id
      );

      // Save segment efforts
      if (matchResults.length > 0) {
        await saveSegmentEfforts(runData.id, matchResults);

        // Check for new KOMs and trigger celebrations
        const newKOMs = matchResults.filter(r => r.isNewKOM);
        const newPRs = matchResults.filter(r => r.isNewPR && !r.isNewKOM);
        const topTen = matchResults.filter(r => r.newRank > 1 && r.newRank <= 10 && !r.isNewPR);

        // Show KOM celebration with confetti
        if (newKOMs.length > 0) {
          triggerConfetti();
          setTimeout(() => {
            newKOMs.forEach((kom, index) => {
              setTimeout(() => {
                toast.success(`👑 NEW KOM!`, {
                  description: `You're #1 on ${kom.segment.name} with ${formatSegmentTime(kom.elapsedTimeSeconds)}!`,
                  duration: 5000,
                });
              }, index * 1000);
            });
          }, 300);
        }

        // Show trophy notifications for top 10
        if (topTen.length > 0) {
          setTimeout(() => {
            topTen.forEach((trophy, index) => {
              setTimeout(() => {
                toast.success(`🏆 Top 10!`, {
                  description: `#${trophy.newRank} on ${trophy.segment.name}`,
                });
              }, index * 600);
            });
          }, newKOMs.length > 0 ? 2000 : 500);
        }

        // Show segment PR notifications
        if (newPRs.length > 0) {
          const delay = (newKOMs.length > 0 ? 2000 : 0) + (topTen.length > 0 ? topTen.length * 600 : 500);
          setTimeout(() => {
            newPRs.forEach((pr, index) => {
              const medalIcon = pr.prRank === 1 ? '🥇' : pr.prRank === 2 ? '🥈' : '🥉';
              setTimeout(() => {
                toast.success(`${medalIcon} Segment PR!`, {
                  description: `${pr.segment.name}: ${formatSegmentTime(pr.elapsedTimeSeconds)}`,
                });
              }, index * 500);
            });
          }, delay);
        }
      }

      // Auto-detect new segments from this run
      await autoDetectSegments(runData.route_polyline, user.id);
    } catch (error) {
      console.error('Error processing segments:', error);
    }
  };

  const checkAchievements = async (runData: {
    id: string;
    distance_km: number;
    duration_seconds: number;
    started_at: string;
    is_gps_tracked: boolean;
    pace_per_km_seconds: number;
    route_polyline?: string;
  }) => {
    // Check for PRs
    const prResults = await checkAndUpdatePRs({
      id: runData.id,
      distance_km: runData.distance_km,
      duration_seconds: runData.duration_seconds,
      started_at: runData.started_at,
      activity_type: 'run',
    });

    // Build stats for medal check
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
      weeklyRuns: 1, // Simplified - would need actual calculation
      monthlyRuns: 1, // Simplified
      personalRecords: prResults,
    };

    // Check and award medals
    const newMedals = await checkAndAwardMedals(stats, runData.id);

    // Show toast notifications for achievements
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

    // Check segment achievements for GPS runs
    if (runData.is_gps_tracked && runData.route_polyline) {
      await checkSegmentAchievements({
        id: runData.id,
        route_polyline: runData.route_polyline,
        duration_seconds: runData.duration_seconds,
      });
    }
  };

  const handleSaveGpsRun = async () => {
    if (distance < 0.01) {
      toast.error('Run distance is too short');
      return;
    }

    setLoading(true);

    // Calculate pace
    const paceSeconds = Math.round(elapsedSeconds / distance);
    const speedKph = (distance / elapsedSeconds) * 3600;

    // Convert positions to GeoJSON for storage
    const geoJSON = positionsToGeoJSON(positions);

    const { error, data } = await createRun({
      title: title || 'GPS Run',
      description: description || null,
      distance_km: Math.round(distance * 1000) / 1000,
      duration_seconds: elapsedSeconds,
      started_at: startTime?.toISOString() || new Date().toISOString(),
      ended_at: new Date().toISOString(),
      pace_per_km_seconds: paceSeconds,
      average_speed_kph: Math.round(speedKph * 100) / 100,
      elevation_gain_m: null,
      calories_burned: Math.round(distance * 60),
      route_polyline: geoJSON,
      map_snapshot_url: null,
      is_gps_tracked: true,
      weather_conditions: null,
      temperature_celsius: null,
      notes: null,
      activity_type: 'run',
      is_public: visibility === 'public',
      visibility: visibility,
      comments_enabled: true,
    });

    if (error) {
      setLoading(false);
      toast.error('Failed to save run');
    } else {
      // Check for achievements
      if (data) {
        await checkAchievements({
          id: data.id,
          distance_km: Math.round(distance * 1000) / 1000,
          duration_seconds: elapsedSeconds,
          started_at: startTime?.toISOString() || new Date().toISOString(),
          is_gps_tracked: true,
          pace_per_km_seconds: paceSeconds,
          route_polyline: geoJSON,
        });
      }
      setLoading(false);
      toast.success('Run saved!');
      resetForm();
      onClose();
    }
  };

  const handleSaveManualRun = async () => {
    const dist = parseFloat(distanceKm);
    const totalSeconds =
      parseInt(hours || '0') * 3600 + parseInt(minutes || '0') * 60 + parseInt(seconds || '0');

    if (isNaN(dist) || dist <= 0) {
      toast.error('Please enter a valid distance');
      return;
    }
    if (totalSeconds <= 0) {
      toast.error('Please enter a valid time');
      return;
    }

    setLoading(true);

    const paceSeconds = Math.round(totalSeconds / dist);
    const speedKph = (dist / totalSeconds) * 3600;

    const { error, data } = await createRun({
      title: title || 'Run',
      description: description || null,
      distance_km: dist,
      duration_seconds: totalSeconds,
      started_at: new Date().toISOString(),
      ended_at: null,
      pace_per_km_seconds: paceSeconds,
      average_speed_kph: Math.round(speedKph * 100) / 100,
      elevation_gain_m: null,
      calories_burned: Math.round(dist * 60),
      route_polyline: null,
      map_snapshot_url: null,
      is_gps_tracked: false,
      weather_conditions: null,
      temperature_celsius: null,
      notes: null,
      activity_type: 'run',
      is_public: visibility === 'public',
      visibility: visibility,
      comments_enabled: true,
    });

    if (error) {
      setLoading(false);
      toast.error('Failed to save run');
    } else {
      // Check for achievements
      if (data) {
        await checkAchievements({
          id: data.id,
          distance_km: dist,
          duration_seconds: totalSeconds,
          started_at: new Date().toISOString(),
          is_gps_tracked: false,
          pace_per_km_seconds: paceSeconds,
        });
      }
      setLoading(false);
      toast.success('Run saved!');
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDistanceKm('');
    setHours('0');
    setMinutes('');
    setSeconds('0');
    setVisibility('public');
    setPositions([]);
    setDistance(0);
    setElapsedSeconds(0);
    setStartTime(null);
    stopTracking();
  };

  const handleClose = () => {
    if (isTracking) {
      stopTracking();
    }
    resetForm();
    onClose();
  };

  return (
    <>
      <CountdownOverlay
        accent="#EF4444"
        isActive={showCountdown}
        onComplete={startTracking}
        startFrom={3}
      />
      
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-wide text-center">
              RECORD YOUR RUN
            </DialogTitle>
          </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'gps' | 'manual')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="gps" className="font-display tracking-wide" disabled={isTracking}>
              <MapPin className="w-4 h-4 mr-2" />
              GPS Track
            </TabsTrigger>
            <TabsTrigger value="manual" className="font-display tracking-wide" disabled={isTracking}>
              <Pencil className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gps" className="space-y-6 mt-6">
            <AnimatePresence mode="wait">
              {!isTracking ? (
                <motion.div
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Tap start to begin tracking your run with GPS
                  </p>
                  <Button
                    size="lg"
                    className="font-display text-lg tracking-wide px-12 py-6"
                    onClick={initiateTracking}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    START RUN
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="tracking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-4"
                >
                  <div className="text-center mb-4">
                    <p className="font-display text-5xl text-primary tracking-wide">
                      {formatTime(elapsedSeconds)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-display text-2xl text-foreground tracking-wide">
                        {distance.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">km</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-display text-2xl text-foreground tracking-wide">
                        {distance > 0
                          ? formatTime(Math.round(elapsedSeconds / distance)).slice(3)
                          : '--:--'}
                      </p>
                      <p className="text-xs text-muted-foreground">/km pace</p>
                    </div>
                  </div>

                  {/* Live GPS Map */}
                  <RunMap 
                    positions={positions} 
                    isTracking={true}
                    className="mb-4"
                  />

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    GPS Active • {positions.length} points
                  </div>

                  <div className="text-center">
                    <Button
                      size="lg"
                      variant="destructive"
                      className="font-display text-lg tracking-wide px-12 py-6"
                      onClick={stopTracking}
                    >
                      <Square className="w-5 h-5 mr-2" />
                      STOP RUN
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isTracking && distance > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 border-t border-border pt-6"
              >
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <p className="font-display text-2xl text-primary">{distance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">km</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-foreground">
                      {formatTime(elapsedSeconds)}
                    </p>
                    <p className="text-xs text-muted-foreground">time</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-foreground">
                      {distance > 0
                        ? formatTime(Math.round(elapsedSeconds / distance)).slice(3)
                        : '--:--'}
                    </p>
                    <p className="text-xs text-muted-foreground">/km</p>
                  </div>
                </div>

                {/* Post-run map with replay and export */}
                <RunMap 
                  positions={positions}
                  showReplay={true}
                  showElevation={true}
                  showExport={true}
                />

                <div className="space-y-2">
                  <Label>Title (optional)</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Morning Run"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="How did it feel?"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Who can see this?</Label>
                  <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'friends' | 'private')}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Public - Everyone
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
                          Private - Only Me
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full font-display tracking-wide"
                  onClick={handleSaveGpsRun}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Run'}
                </Button>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Morning Run"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Distance (km)</Label>
              <Input
                type="number"
                step="0.01"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="5.00"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="bg-input border-border text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-1">hours</p>
                </div>
                <div>
                  <Input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="30"
                    min="0"
                    max="59"
                    className="bg-input border-border text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-1">min</p>
                </div>
                <div>
                  <Input
                    type="number"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="59"
                    className="bg-input border-border text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-1">sec</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="How did it feel?"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Who can see this?</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'friends' | 'private')}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Public - Everyone
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
                      Private - Only Me
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full font-display tracking-wide"
              onClick={handleSaveManualRun}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Run'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
    </>
  );
}
