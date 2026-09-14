export type CardioTrackerActivity = 'walk' | 'run' | 'cycle' | 'row' | 'swim';

export interface CardioTrackerPosition {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
  speed: number | null;
  altitude?: number | null;
}

interface ActivityTrackingRules {
  minMovementKm: number;
  maxSpeedKph: number;
  baseAccuracyM: number;
  maxAccuracyM: number;
}

// Relaxed accuracy thresholds so mobile GPS actually works in real-world conditions.
// Mobile phones: 5-20m outdoors clear sky, 30-80m urban, 80-150m light indoor/urban canyon.
// Old values were too strict (45-60m base) causing perpetual "acquiring" state.
const ACTIVITY_TRACKING_RULES: Record<CardioTrackerActivity, ActivityTrackingRules> = {
  walk:  { minMovementKm: 0.002,  maxSpeedKph: 12,  baseAccuracyM: 80,  maxAccuracyM: 150 },
  run:   { minMovementKm: 0.002,  maxSpeedKph: 28,  baseAccuracyM: 70,  maxAccuracyM: 140 },
  cycle: { minMovementKm: 0.005,  maxSpeedKph: 75,  baseAccuracyM: 90,  maxAccuracyM: 160 },
  row:   { minMovementKm: 0.003,  maxSpeedKph: 35,  baseAccuracyM: 80,  maxAccuracyM: 150 },
  swim:  { minMovementKm: 0.002,  maxSpeedKph: 12,  baseAccuracyM: 60,  maxAccuracyM: 120 },
};

export interface DistanceIncrementResult {
  accepted: boolean;
  incrementKm: number;
  displaySpeedKph: number | null;
  allowedAccuracyM: number;
  /** Why the position was rejected — helps the UI show a meaningful status */
  rejectReason?: 'accuracy' | 'no_movement' | 'speed_spike';
}

export function haversineDistanceKm(
  first: Pick<CardioTrackerPosition, 'lat' | 'lng'>,
  second: Pick<CardioTrackerPosition, 'lat' | 'lng'>
): number {
  const earthRadiusKm = 6371;
  const deltaLat = ((second.lat - first.lat) * Math.PI) / 180;
  const deltaLng = ((second.lng - first.lng) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos((first.lat * Math.PI) / 180) *
      Math.cos((second.lat * Math.PI) / 180) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function getAcceptedAccuracyMeters(
  activity: CardioTrackerActivity,
  timeDeltaSeconds: number
): number {
  const rules = ACTIVITY_TRACKING_RULES[activity];
  // Ramp up tolerance over time — after 30s between reads, allow full maxAccuracy
  const dynamicBuffer = Math.min(40, Math.floor(timeDeltaSeconds / 8) * 10);
  return Math.min(rules.maxAccuracyM, rules.baseAccuracyM + dynamicBuffer);
}

export function calculateDistanceIncrement({
  activity,
  previousPosition,
  nextPosition,
}: {
  activity: CardioTrackerActivity;
  previousPosition: CardioTrackerPosition | null;
  nextPosition: CardioTrackerPosition;
}): DistanceIncrementResult {
  const rules = ACTIVITY_TRACKING_RULES[activity];
  const reportedSpeedKph =
    nextPosition.speed !== null && nextPosition.speed > 0 ? nextPosition.speed * 3.6 : null;

  // First position — accept if accuracy is within generous limit
  if (!previousPosition) {
    return {
      accepted: nextPosition.accuracy <= rules.maxAccuracyM,
      incrementKm: 0,
      displaySpeedKph: reportedSpeedKph,
      allowedAccuracyM: rules.maxAccuracyM,
      rejectReason: nextPosition.accuracy > rules.maxAccuracyM ? 'accuracy' : undefined,
    };
  }

  const timeDeltaSeconds = Math.max(1, (nextPosition.timestamp - previousPosition.timestamp) / 1000);
  const allowedAccuracyM = getAcceptedAccuracyMeters(activity, timeDeltaSeconds);

  if (nextPosition.accuracy > allowedAccuracyM) {
    return {
      accepted: false,
      incrementKm: 0,
      displaySpeedKph: reportedSpeedKph,
      allowedAccuracyM,
      rejectReason: 'accuracy',
    };
  }

  const linearDistanceKm = haversineDistanceKm(previousPosition, nextPosition);
  const derivedSpeedKph = (linearDistanceKm / timeDeltaSeconds) * 3600;

  if (linearDistanceKm < rules.minMovementKm && (!reportedSpeedKph || reportedSpeedKph < 1.5)) {
    return {
      accepted: false,
      incrementKm: 0,
      displaySpeedKph: reportedSpeedKph,
      allowedAccuracyM,
      rejectReason: 'no_movement',
    };
  }

  if (derivedSpeedKph > rules.maxSpeedKph * 1.2) {
    return {
      accepted: false,
      incrementKm: 0,
      displaySpeedKph: reportedSpeedKph,
      allowedAccuracyM,
      rejectReason: 'speed_spike',
    };
  }

  let incrementKm = linearDistanceKm;

  if (reportedSpeedKph && timeDeltaSeconds >= 12) {
    const speedDistanceKm = (reportedSpeedKph * timeDeltaSeconds) / 3600;
    const maxBoostKm = Math.max(
      linearDistanceKm * 1.6,
      linearDistanceKm + Math.min(nextPosition.accuracy / 1000, 0.08)
    );

    incrementKm = Math.min(Math.max(linearDistanceKm, speedDistanceKm), maxBoostKm);
  }

  return {
    accepted: true,
    incrementKm,
    displaySpeedKph: reportedSpeedKph ?? derivedSpeedKph,
    allowedAccuracyM,
  };
}

export function getPersistedTrackerPositions<T>(positions: T[], maxPoints: number = 2000): T[] {
  if (positions.length <= maxPoints) return positions;

  // Even decimation, not "keep the most recent N": always keep the true first
  // and last points, sampled evenly across the whole session. This function's
  // output is what gets written to localStorage on every tick of a live
  // session, and re-read on mount if the tab was reloaded/backgrounded
  // mid-session. Slicing to the last N points meant a long session that ever
  // restored from localStorage permanently lost every point before that
  // window — the total distance (tracked separately) stayed correct, but the
  // route on the map showed only a trailing fraction of the real walk/run,
  // with a "start" marker that was actually somewhere in the middle.
  const step = (positions.length - 1) / (maxPoints - 1);
  const sampled: T[] = new Array(maxPoints);
  for (let i = 0; i < maxPoints; i++) {
    sampled[i] = positions[Math.round(i * step)];
  }
  return sampled;
}

export function positionsToRouteGeoJSON(
  positions: Array<Pick<CardioTrackerPosition, 'lat' | 'lng' | 'timestamp' | 'altitude'>>
): string {
  return JSON.stringify({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      // Real GPS altitude when we have it, 0 as a neutral placeholder when we don't —
      // never a fabricated value. Consumers (RunMap) treat 0 as "no elevation data".
      coordinates: positions.map((position) => [position.lng, position.lat, position.altitude ?? 0, position.timestamp]),
    },
    properties: {
      timestamps: positions.map((position) => position.timestamp),
    },
  });
}
