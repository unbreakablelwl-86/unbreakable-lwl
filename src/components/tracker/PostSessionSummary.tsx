import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  MapPin, Clock, Zap, TrendingUp, Timer,
  Activity, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
  speed: number | null;
}

interface KmSplit {
  km: number;
  paceSeconds: number;
  avgSpeed: number;
  elevDelta: number;
}

interface PostSessionSummaryProps {
  distance: number;
  elapsedSeconds: number;
  positions: Position[];
  activityLabel: string;
  activityIcon: React.ComponentType<any>;
}

function formatPace(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function PostSessionSummary({ distance, elapsedSeconds, positions, activityLabel, activityIcon: ActivityIcon }: PostSessionSummaryProps) {
  const [showSplits, setShowSplits] = useState(true);

  const { splits, avgPace, avgSpeed, calories } = useMemo(() => {
    const splits: KmSplit[] = [];
    
    if (positions.length < 2) {
      const avgSpeed = elapsedSeconds > 0 ? (distance / (elapsedSeconds / 3600)) : 0;
      const avgPace = distance > 0 ? (elapsedSeconds / distance) : 0;
      const calories = Math.round(distance * 65); // rough estimate
      return { splits, avgPace, avgSpeed, calories };
    }

    // Calculate km splits from position data
    let runningDist = 0;
    let kmStart = 0;
    let lastKmTimestamp = positions[0].timestamp;
    let currentKm = 1;

    for (let i = 1; i < positions.length; i++) {
      const d = haversine(positions[i - 1].lat, positions[i - 1].lng, positions[i].lat, positions[i].lng);
      runningDist += d;

      if (runningDist >= currentKm * 1000) {
        const splitTime = (positions[i].timestamp - lastKmTimestamp) / 1000;
        splits.push({
          km: currentKm,
          paceSeconds: splitTime,
          avgSpeed: splitTime > 0 ? 3600 / splitTime : 0,
          elevDelta: 0,
        });
        lastKmTimestamp = positions[i].timestamp;
        currentKm++;
      }
    }

    // Partial last km
    const remainingDist = (runningDist / 1000) - (currentKm - 1);
    if (remainingDist > 0.05) { // Only show if > 50m
      const lastSplitTime = (positions[positions.length - 1].timestamp - lastKmTimestamp) / 1000;
      const projectedPace = remainingDist > 0 ? lastSplitTime / remainingDist : 0;
      splits.push({
        km: currentKm,
        paceSeconds: projectedPace,
        avgSpeed: lastSplitTime > 0 ? (remainingDist * 3600 / lastSplitTime) : 0,
        elevDelta: 0,
      });
    }

    const avgSpeed = elapsedSeconds > 0 ? (distance / (elapsedSeconds / 3600)) : 0;
    const avgPace = distance > 0 ? (elapsedSeconds / distance) : 0;
    const calories = Math.round(distance * 65);

    return { splits, avgPace, avgSpeed, calories };
  }, [positions, distance, elapsedSeconds]);

  const fastestSplit = splits.length > 0 ? Math.min(...splits.map(s => s.paceSeconds)) : 0;
  const slowestSplit = splits.length > 0 ? Math.max(...splits.map(s => s.paceSeconds)) : 0;

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border-border bg-card text-center">
          <MapPin className="w-4 h-4 text-primary mx-auto mb-1" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
          <p className="font-display text-2xl text-foreground">{distance.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Kilometres</p>
        </Card>
        <Card className="p-4 border-border bg-card text-center">
          <Clock className="w-4 h-4 text-primary mx-auto mb-1" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
          <p className="font-display text-2xl text-foreground">{formatDuration(elapsedSeconds)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Duration</p>
        </Card>
        <Card className="p-4 border-border bg-card text-center">
          <Timer className="w-4 h-4 text-primary mx-auto mb-1" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
          <p className="font-display text-2xl text-foreground">{avgPace > 0 ? formatPace(avgPace) : '--:--'}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Pace /km</p>
        </Card>
        <Card className="p-4 border-border bg-card text-center">
          <Zap className="w-4 h-4 text-primary mx-auto mb-1" style={{ filter: 'drop-shadow(0 0 4px rgba(255,85,0,0.5))' }} />
          <p className="font-display text-2xl text-foreground">{avgSpeed.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg km/h</p>
        </Card>
      </div>

      {/* Estimated Calories */}
      {calories > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>~{calories} cal burned</span>
        </div>
      )}

      {/* Km Splits */}
      {splits.length > 0 && (
        <div>
          <button
            onClick={() => setShowSplits(!showSplits)}
            className="flex items-center justify-between w-full mb-2"
          >
            <h4 className="font-display text-xs tracking-widest text-muted-foreground uppercase">
              Kilometre Splits
            </h4>
            {showSplits ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          
          {showSplits && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-1"
            >
              {/* Header */}
              <div className="grid grid-cols-3 text-[10px] text-muted-foreground uppercase tracking-wider px-3 py-1">
                <span>Split</span>
                <span className="text-center">Pace</span>
                <span className="text-right">Speed</span>
              </div>
              {splits.map((split, i) => {
                const isFastest = split.paceSeconds === fastestSplit && splits.length > 1;
                const isSlowest = split.paceSeconds === slowestSplit && splits.length > 1;
                const isLast = i === splits.length - 1 && (distance % 1) > 0.05;
                return (
                  <div
                    key={split.km}
                    className={`grid grid-cols-3 items-center px-3 py-2 rounded-lg text-sm ${
                      isFastest ? 'bg-primary/10 border border-primary/20' : 
                      isSlowest ? 'bg-primary/10 border border-primary/20' : 
                      'bg-card border border-border'
                    }`}
                  >
                    <span className="text-muted-foreground">
                      {isLast ? `${(distance % 1).toFixed(2)} km` : `Km ${split.km}`}
                    </span>
                    <span className={`text-center font-mono ${
                      isFastest ? 'text-primary' : isSlowest ? 'text-primary' : 'text-foreground'
                    }`}>
                      {formatPace(split.paceSeconds)}
                    </span>
                    <span className="text-right text-muted-foreground">
                      {split.avgSpeed.toFixed(1)} km/h
                    </span>
                  </div>
                );
              })}
              
              {/* Legend */}
              {splits.length > 1 && (
                <div className="flex justify-center gap-4 pt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400" /> Fastest
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" /> Slowest
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
