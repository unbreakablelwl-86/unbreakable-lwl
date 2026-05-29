/**
 * UNBREAKABLE — Cardio Route Map
 *
 * Visual route map for cardio sessions using Geolocation API.
 * Renders an SVG path from GPS coordinates collected during the run.
 * No external map service needed — pure client-side rendering.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Navigation, Maximize2, Minimize2, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

interface CardioRouteMapProps {
  /** Pass existing coordinates to render a completed route */
  savedCoordinates?: Coordinate[];
  /** If true, actively tracks GPS position */
  isTracking?: boolean;
  /** Callback for new coordinates during tracking */
  onCoordinatesUpdate?: (coords: Coordinate[]) => void;
  /** Compact mini view */
  mini?: boolean;
  className?: string;
}

export function CardioRouteMap({
  savedCoordinates,
  isTracking = false,
  onCoordinatesUpdate,
  mini = false,
  className = '',
}: CardioRouteMapProps) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>(savedCoordinates || []);
  const [expanded, setExpanded] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Start/stop GPS tracking
  useEffect(() => {
    if (!isTracking || !navigator.geolocation) {
      if (isTracking && !navigator.geolocation) {
        setGpsError('GPS not available on this device');
      }
      return;
    }

    setGpsError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newCoord: Coordinate = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
        };

        setCoordinates((prev) => {
          // Skip if too close to last point (< 3 meters)
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const dist = haversineDistance(last.lat, last.lng, newCoord.lat, newCoord.lng);
            if (dist < 3) return prev;
          }

          const updated = [...prev, newCoord];
          onCoordinatesUpdate?.(updated);
          return updated;
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('Location unavailable');
            break;
          default:
            setGpsError('GPS error');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTracking]);

  // Update from saved coordinates
  useEffect(() => {
    if (savedCoordinates && savedCoordinates.length > 0) {
      setCoordinates(savedCoordinates);
    }
  }, [savedCoordinates]);

  // Calculate SVG path from coordinates
  const { svgPath, viewBox, distanceKm, startPoint, endPoint } = useMemo(() => {
    if (coordinates.length < 2) {
      return { svgPath: '', viewBox: '0 0 100 100', distanceKm: 0, startPoint: null, endPoint: null };
    }

    // Find bounds
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    coordinates.forEach(({ lat, lng }) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    // Add padding
    const latPad = (maxLat - minLat) * 0.15 || 0.001;
    const lngPad = (maxLng - minLng) * 0.15 || 0.001;
    minLat -= latPad;
    maxLat += latPad;
    minLng -= lngPad;
    maxLng += lngPad;

    const width = 300;
    const height = 300;

    // Project to SVG coordinates
    const project = (lat: number, lng: number) => ({
      x: ((lng - minLng) / (maxLng - minLng)) * width,
      y: height - ((lat - minLat) / (maxLat - minLat)) * height, // flip Y
    });

    const points = coordinates.map((c) => project(c.lat, c.lng));

    // Build SVG path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    // Calculate total distance
    let totalDist = 0;
    for (let i = 1; i < coordinates.length; i++) {
      totalDist += haversineDistance(
        coordinates[i - 1].lat, coordinates[i - 1].lng,
        coordinates[i].lat, coordinates[i].lng
      );
    }

    return {
      svgPath: path,
      viewBox: `0 0 ${width} ${height}`,
      distanceKm: totalDist / 1000,
      startPoint: points[0],
      endPoint: points[points.length - 1],
    };
  }, [coordinates]);

  if (gpsError && coordinates.length === 0) {
    return (
      <div className={`flex items-center justify-center gap-2 text-xs text-muted-foreground p-3 bg-card/50 rounded-lg border border-border/30 ${className}`}>
        <MapPin className="w-3 h-3 text-red-400" />
        {gpsError}
      </div>
    );
  }

  if (coordinates.length < 2 && !isTracking) {
    return null; // No route to display
  }

  const containerClass = mini && !expanded
    ? 'w-20 h-20 rounded-lg overflow-hidden cursor-pointer'
    : expanded
    ? 'fixed inset-4 z-[9999] rounded-xl overflow-hidden'
    : 'w-full aspect-square max-h-64 rounded-xl overflow-hidden';

  return (
    <div
      className={`relative bg-[#0A0A0A] border border-border/30 ${containerClass} ${className}`}
      onClick={mini && !expanded ? () => setExpanded(true) : undefined}
    >
      {/* Route SVG */}
      <svg viewBox={viewBox} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,85,0,0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Route path with glow */}
        {svgPath && (
          <>
            {/* Glow */}
            <path
              d={svgPath}
              fill="none"
              stroke="rgba(255,85,0,0.3)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main line */}
            <path
              d={svgPath}
              fill="none"
              stroke="#FF5500"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isTracking ? 'animate-pulse' : ''}
            />

            {/* Start point */}
            {startPoint && (
              <circle cx={startPoint.x} cy={startPoint.y} r="6" fill="#22C55E" stroke="#0A0A0A" strokeWidth="2" />
            )}

            {/* End/current point */}
            {endPoint && (
              <circle cx={endPoint.x} cy={endPoint.y} r="6" fill="#FF5500" stroke="#0A0A0A" strokeWidth="2">
                {isTracking && <animate attributeName="r" values="6;9;6" dur="1.5s" repeatCount="indefinite" />}
              </circle>
            )}
          </>
        )}
      </svg>

      {/* Overlay info */}
      {!mini && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Navigation className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-mono text-foreground font-bold">
              {distanceKm.toFixed(2)} km
            </span>
          </div>
          {isTracking && (
            <div className="flex items-center gap-1 bg-red-500/20 rounded-full px-2 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-red-400 font-bold">LIVE</span>
            </div>
          )}
        </div>
      )}

      {/* Expand/collapse */}
      {(expanded || (!mini && coordinates.length > 0)) && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"
        >
          {expanded ? <Minimize2 className="w-4 h-4 text-foreground" /> : <Maximize2 className="w-4 h-4 text-foreground" />}
        </button>
      )}

      {/* Expanded overlay background */}
      {expanded && (
        <div className="fixed inset-0 bg-black/60 -z-10" onClick={() => setExpanded(false)} />
      )}
    </div>
  );
}

/** Haversine distance in meters */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
