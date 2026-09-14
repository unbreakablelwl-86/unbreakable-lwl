import { describe, expect, it } from 'vitest';
import {
  calculateDistanceIncrement,
  getPersistedTrackerPositions,
  positionsToRouteGeoJSON,
} from '@/lib/cardioTracking';

describe('cardioTracking', () => {
  it('accepts normal running movement and accumulates linear distance', () => {
    const result = calculateDistanceIncrement({
      activity: 'run',
      previousPosition: {
        lat: 53.4084,
        lng: -2.9916,
        timestamp: 1_000,
        accuracy: 8,
        speed: 2.8,
      },
      nextPosition: {
        lat: 53.4093,
        lng: -2.9916,
        timestamp: 21_000,
        accuracy: 12,
        speed: 3.1,
      },
    });

    expect(result.accepted).toBe(true);
    expect(result.incrementKm).toBeGreaterThan(0.09);
    expect(result.displaySpeedKph).toBeGreaterThan(10);
  });

  it('allows broader accuracy after long gaps and uses speed to reduce undercount', () => {
    const result = calculateDistanceIncrement({
      activity: 'run',
      previousPosition: {
        lat: 53.4084,
        lng: -2.9916,
        timestamp: 0,
        accuracy: 10,
        speed: 3.1,
      },
      nextPosition: {
        lat: 53.4093,
        lng: -2.9911,
        timestamp: 60_000,
        accuracy: 72,
        speed: 3.2,
      },
    });

    expect(result.accepted).toBe(true);
    expect(result.incrementKm).toBeGreaterThan(0.05);
    expect(result.allowedAccuracyM).toBeGreaterThanOrEqual(70);
  });

  it('rejects implausible GPS jumps', () => {
    const result = calculateDistanceIncrement({
      activity: 'run',
      previousPosition: {
        lat: 53.4084,
        lng: -2.9916,
        timestamp: 0,
        accuracy: 10,
        speed: 3,
      },
      nextPosition: {
        lat: 53.4284,
        lng: -2.9916,
        timestamp: 10_000,
        accuracy: 10,
        speed: 3,
      },
    });

    expect(result.accepted).toBe(false);
    expect(result.incrementKm).toBe(0);
  });

  it('keeps a short route fully intact (no truncation under the cap)', () => {
    const points = Array.from({ length: 300 }, (_, index) => ({
      lat: 53.4 + index / 10_000,
      lng: -2.99,
      timestamp: index * 1000,
      accuracy: 10,
      speed: 3,
    }));

    const persisted = getPersistedTrackerPositions(points);
    const geojson = JSON.parse(positionsToRouteGeoJSON(persisted));

    expect(persisted).toHaveLength(300);
    expect(geojson.geometry.coordinates).toHaveLength(300);
    expect(geojson.properties.timestamps[0]).toBe(0);
    expect(geojson.properties.timestamps.at(-1)).toBe(299_000);
  });

  it('decimates a long route evenly instead of dropping its start', () => {
    // A long session (e.g. an hour+ walk with a GPS fix every second) can
    // exceed the persisted cap. Regression test for a bug where truncation
    // kept only the most recent N points: if the tab was ever reloaded or
    // backgrounded mid-session, everything before that window was lost on
    // restore, even though the total distance (tracked separately) stayed
    // correct — so a real ~7km walk showed as a ~3km route on the map with
    // a "start" marker that was actually somewhere in the middle.
    const points = Array.from({ length: 5000 }, (_, index) => ({
      lat: 53.4 + index / 100_000,
      lng: -2.99,
      timestamp: index * 1000,
      accuracy: 10,
      speed: 3,
    }));

    const persisted = getPersistedTrackerPositions(points, 2000);
    const geojson = JSON.parse(positionsToRouteGeoJSON(persisted));

    expect(persisted).toHaveLength(2000);
    expect(geojson.geometry.coordinates).toHaveLength(2000);
    // The true start and end of the session must survive decimation.
    expect(geojson.properties.timestamps[0]).toBe(0);
    expect(geojson.properties.timestamps.at(-1)).toBe(4_999_000);
  });
});