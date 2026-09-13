import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  MapPin, Clock, Timer, TrendingUp, Zap, ChevronDown, Thermometer,
} from 'lucide-react';
import { Run, CardioActivityType } from '@/hooks/useRuns';
import { RunMap, geoJSONToPositions } from './RunMap';

interface ActivityRowProps {
  run: Run;
  icon: React.ComponentType<any>;
  label: string;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function formatPace(paceSeconds: number | null): string {
  if (!paceSeconds) return '--:--';
  const m = Math.floor(paceSeconds / 60);
  const s = Math.floor(paceSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * One saved cardio session in the personal Activity tab — click to expand and
 * see the same map + full stats the social feed's ActivityCard shows, without
 * needing to post it publicly first.
 */
export function ActivityRow({ run, icon: Icon, label }: ActivityRowProps) {
  const [expanded, setExpanded] = useState(false);

  const hasRoute = !!run.is_gps_tracked && !!run.route_polyline;
  const mapPositions = useMemo(() => {
    if (!expanded || !hasRoute || !run.route_polyline) return [];
    try {
      return geoJSONToPositions(run.route_polyline);
    } catch {
      return [];
    }
  }, [expanded, hasRoute, run.route_polyline]);

  return (
    <div className="w-full rounded-xl border border-border bg-card hover:border-primary/30 transition-all overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-start gap-3 p-3.5 text-left"
        aria-expanded={expanded}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border">
          <Icon className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.4))' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-display text-sm text-foreground tracking-wide truncate">
              {run.title || `${label} Session`}
            </h4>
            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
              {format(new Date(run.started_at), 'MMM d')}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary/60" />
              {run.distance_km.toFixed(2)} km
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary/60" />
              {formatDuration(run.duration_seconds)}
            </span>
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3 text-primary/60" />
              {formatPace(run.pace_per_km_seconds)}/km
            </span>
          </div>
          {run.elevation_gain_m ? (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
              <TrendingUp className="w-3 h-3" /> {run.elevation_gain_m}m elevation
            </div>
          ) : null}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 pt-1 border-t border-border space-y-3">
              {/* Extra stats not shown on the collapsed row */}
              {(run.calories_burned || run.average_speed_kph || run.weather_conditions) && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-2">
                  {run.calories_burned ? (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary/60" /> {run.calories_burned} cal
                    </span>
                  ) : null}
                  {run.average_speed_kph ? (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary/60" /> {run.average_speed_kph} km/h avg
                    </span>
                  ) : null}
                  {run.weather_conditions ? (
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-primary/60" />
                      {run.weather_conditions}
                      {run.temperature_celsius != null ? `, ${run.temperature_celsius}°C` : ''}
                    </span>
                  ) : null}
                </div>
              )}

              {run.notes ? (
                <p className="text-xs text-muted-foreground italic">"{run.notes}"</p>
              ) : null}

              {hasRoute ? (
                mapPositions.length > 1 ? (
                  <RunMap positions={mapPositions} showElevation showExport />
                ) : (
                  <p className="text-xs text-muted-foreground">Route data for this session couldn't be loaded.</p>
                )
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
