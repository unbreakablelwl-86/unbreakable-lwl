import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
  elevation?: number;
}

interface RunMapProps {
  positions: Position[];
  isTracking?: boolean;
  showReplay?: boolean;
  showElevation?: boolean;
  showExport?: boolean;
  className?: string;
}

// Lazy-loaded Leaflet map component (avoids SSR issues)
function LeafletMap({ 
  positions, 
  isTracking, 
  replayPath, 
  currentPosition 
}: { 
  positions: Position[];
  isTracking: boolean;
  replayPath: { lat: number; lng: number }[];
  currentPosition: { lat: number; lng: number } | null;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  // Initialize Leaflet and map
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      // Dynamically import leaflet
      const L = await import('leaflet');
      if (cancelled) return;
      leafletRef.current = L;

      // Fix default icon paths (leaflet asset issue with bundlers)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const center: [number, number] = positions.length > 0
        ? [positions[positions.length - 1].lat, positions[positions.length - 1].lng]
        : [53.4084, -2.9916]; // Default Liverpool

      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark tile layer (CartoDB Dark Matter — free, no API key)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(map);

      // Small attribution in corner
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>')
        .addTo(map);

      mapInstanceRef.current = map;

      // Draw initial polyline if positions exist
      if (positions.length > 1) {
        const latlngs = positions.map(p => [p.lat, p.lng] as [number, number]);
        polylineRef.current = L.polyline(latlngs, {
          color: '#FF6600',
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        map.fitBounds(polylineRef.current.getBounds(), { padding: [30, 30] });
      }

      // Start marker (green)
      if (positions.length > 0) {
        startMarkerRef.current = L.circleMarker(
          [positions[0].lat, positions[0].lng],
          {
            radius: 8,
            fillColor: '#22C55E',
            fillOpacity: 1,
            color: '#FFFFFF',
            weight: 2,
          }
        ).addTo(map);
      }

      // Current position marker (orange)
      if (currentPosition) {
        markerRef.current = L.circleMarker(
          [currentPosition.lat, currentPosition.lng],
          {
            radius: 10,
            fillColor: '#FF6600',
            fillOpacity: 1,
            color: '#FFFFFF',
            weight: 3,
          }
        ).addTo(map);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update polyline when replayPath or positions change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    const pathToShow = replayPath.length > 0 ? replayPath : positions;
    const latlngs = pathToShow.map(p => [p.lat, p.lng] as [number, number]);

    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latlngs);
    } else if (latlngs.length > 1) {
      polylineRef.current = L.polyline(latlngs, {
        color: '#FF6600',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    }

    // Pan to latest point if tracking
    if (isTracking && latlngs.length > 0) {
      const last = latlngs[latlngs.length - 1];
      map.panTo(last);
    }
  }, [positions, replayPath, isTracking]);

  // Update current position marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    if (currentPosition) {
      if (markerRef.current) {
        markerRef.current.setLatLng([currentPosition.lat, currentPosition.lng]);
      } else {
        markerRef.current = L.circleMarker(
          [currentPosition.lat, currentPosition.lng],
          {
            radius: 10,
            fillColor: '#FF6600',
            fillOpacity: 1,
            color: '#FFFFFF',
            weight: 3,
          }
        ).addTo(map);
      }
    }
  }, [currentPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '300px' }}
      className="rounded-lg overflow-hidden border border-border"
    />
  );
}

export function RunMap({ 
  positions, 
  isTracking = false, 
  showReplay = false,
  showElevation = false,
  showExport = false,
  className = ''
}: RunMapProps) {
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const replayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [leafletCSSLoaded, setLeafletCSSLoaded] = useState(false);

  // Load Leaflet CSS
  useEffect(() => {
    if (document.querySelector('link[href*="leaflet"]')) {
      setLeafletCSSLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.onload = () => setLeafletCSSLoaded(true);
    document.head.appendChild(link);
  }, []);

  // Get path for polyline
  const path = useMemo(() => {
    return positions.map(p => ({ lat: p.lat, lng: p.lng }));
  }, [positions]);

  // Replay path (partial during replay)
  const replayPath = useMemo(() => {
    if (!isReplaying && replayIndex === 0) return [];
    return path.slice(0, replayIndex + 1);
  }, [path, isReplaying, replayIndex]);

  // Current marker position
  const currentPosition = useMemo(() => {
    if (isReplaying && positions[replayIndex]) {
      return { lat: positions[replayIndex].lat, lng: positions[replayIndex].lng };
    }
    if (positions.length > 0) {
      const last = positions[positions.length - 1];
      return { lat: last.lat, lng: last.lng };
    }
    return null;
  }, [positions, isReplaying, replayIndex]);

  // Elevation data for chart — real GPS altitude only, never fabricated.
  // A position with no altitude reading is stored as 0, which is indistinguishable
  // from genuine sea-level, so we only show the chart when the route has some real
  // variation in it (a dead-flat 0m reading for every single point almost always
  // means the data isn't there, not that the run was literally at sea level throughout).
  const hasElevationData = useMemo(() => {
    if (!showElevation) return false;
    return positions.some(p => typeof p.elevation === 'number' && p.elevation !== 0);
  }, [positions, showElevation]);

  const elevationData = useMemo(() => {
    if (!hasElevationData) return [];
    return positions.map((p, i) => ({
      distance: i,
      elevation: p.elevation ?? 0,
    }));
  }, [positions, hasElevationData]);

  // Start replay
  const startReplay = useCallback(() => {
    setIsReplaying(true);
    setReplayIndex(0);
    
    replayIntervalRef.current = setInterval(() => {
      setReplayIndex(prev => {
        if (prev >= positions.length - 1) {
          if (replayIntervalRef.current) {
            clearInterval(replayIntervalRef.current);
          }
          setIsReplaying(false);
          return positions.length - 1;
        }
        return prev + 1;
      });
    }, 200);
  }, [positions.length]);

  // Stop replay
  const stopReplay = useCallback(() => {
    if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
    }
    setIsReplaying(false);
  }, []);

  // Reset replay
  const resetReplay = useCallback(() => {
    stopReplay();
    setReplayIndex(0);
  }, [stopReplay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (replayIntervalRef.current) {
        clearInterval(replayIntervalRef.current);
      }
    };
  }, []);

  // Export to GPX
  const exportToGPX = useCallback(() => {
    const gpxContent = generateGPX(positions);
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `run-${new Date().toISOString().split('T')[0]}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [positions]);

  if (!leafletCSSLoaded) {
    return (
      <div className={`w-full h-[300px] bg-muted flex items-center justify-center ${className}`}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Map Container */}
      <LeafletMap
        positions={positions}
        isTracking={isTracking}
        replayPath={replayPath}
        currentPosition={currentPosition}
      />

      {/* Controls */}
      {(showReplay || showExport) && positions.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {showReplay && (
            <>
              {!isReplaying ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startReplay}
                  className="font-display tracking-wide"
                >
                  <Play className="w-4 h-4 mr-1" />
                  REPLAY
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopReplay}
                  className="font-display tracking-wide"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  PAUSE
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetReplay}
                className="font-display tracking-wide"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
          
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportToGPX}
              className="font-display tracking-wide"
            >
              <Download className="w-4 h-4 mr-1" />
              GPX
            </Button>
          )}
        </div>
      )}

      {/* Elevation Chart — only rendered when we actually have real altitude data */}
      {hasElevationData && elevationData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-card rounded-lg border border-border p-4"
        >
          <p className="text-xs text-muted-foreground mb-2 font-display tracking-wide">ELEVATION</p>
          <ChartContainer
            config={{
              elevation: {
                label: 'Elevation',
                color: 'hsl(var(--primary))',
              },
            }}
            className="h-[100px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={elevationData}>
                <defs>
                  <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="distance" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="elevation"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#elevationGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </motion.div>
      )}
    </div>
  );
}

// Helper function to generate GPX content
function generateGPX(positions: Position[]): string {
  const timestamp = new Date().toISOString();
  const trackpoints = positions
    .map(p => `      <trkpt lat="${p.lat}" lon="${p.lng}">
        <time>${new Date(p.timestamp).toISOString()}</time>
        ${p.elevation ? `<ele>${p.elevation}</ele>` : ''}
      </trkpt>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Live Without Limits Run Tracker"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <time>${timestamp}</time>
  </metadata>
  <trk>
    <name>Run ${timestamp.split('T')[0]}</name>
    <trkseg>
${trackpoints}
    </trkseg>
  </trk>
</gpx>`;
}

// Helper function to convert positions to GeoJSON
export function positionsToGeoJSON(positions: Position[]): string {
  const coordinates = positions.map(p => [p.lng, p.lat, p.elevation || 0, p.timestamp]);
  
  return JSON.stringify({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates,
    },
    properties: {
      timestamps: positions.map(p => p.timestamp),
    },
  });
}

// Helper function to parse GeoJSON or legacy format back to positions
export function geoJSONToPositions(routeData: string): Position[] {
  if (!routeData) return [];
  
  try {
    const data = JSON.parse(routeData);
    if (data.geometry?.type === 'LineString' && data.geometry?.coordinates) {
      return data.geometry.coordinates.map((coord: number[], i: number) => ({
        lng: coord[0],
        lat: coord[1],
        elevation: coord[2] || undefined,
        timestamp: data.properties?.timestamps?.[i] || Date.now(),
      }));
    }
  } catch {
    const points = routeData.split('|');
    if (points.length > 0 && points[0].includes(',')) {
      return points.map((point, i) => {
        const [lat, lng] = point.split(',').map(Number);
        return {
          lat: lat || 0,
          lng: lng || 0,
          timestamp: Date.now() - (points.length - i) * 1000,
        };
      }).filter(p => p.lat !== 0 && p.lng !== 0);
    }
  }
  
  return [];
}
