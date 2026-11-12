import { LocationPoint, ActivityType } from '../types';

/**
 * Calculates great-circle distance between two coordinates in meters using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's mean radius in meters
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
}

/**
 * Maximum reasonable speeds (in m/s) per activity type for filtering out GPS glitches
 */
const MAX_SPEED_MS: Record<ActivityType, number> = {
  walk: 3.5, // ~12.6 km/h (Olympic race walkers ~15 km/h)
  run: 12.0, // ~43.2 km/h (Usain Bolt top speed ~44 km/h)
  ride: 30.0, // ~108 km/h (Downhill pro cyclist max)
  hike: 3.0, // ~10.8 km/h
  travel: 70.0, // ~252 km/h (high-speed train/car)
};

/**
 * Filters incoming GPS points to eliminate noise, jitter, and teleportation glitches:
 * - Rejects accuracy over 35m
 * - Rejects tiny stationary jitter (< 3m) unless enough time has elapsed
 * - Rejects impossible physical speeds for current activity
 */
export function filterGPSPoint(
  newPoint: LocationPoint,
  lastPoint: LocationPoint | null,
  activityType: ActivityType
): { valid: boolean; reason?: string } {
  // 1. Accuracy check: ignore points with uncertainty > 35m
  if (newPoint.accuracy != null && newPoint.accuracy > 35) {
    return { valid: false, reason: 'Accuracy > 35m' };
  }

  if (!lastPoint) {
    return { valid: true };
  }

  const distMeters = calculateDistance(
    lastPoint.latitude,
    lastPoint.longitude,
    newPoint.latitude,
    newPoint.longitude
  );

  const timeDeltaSec = (newPoint.timestamp - lastPoint.timestamp) / 1000;

  // 2. Stationary jitter check: Ignore jumps under 3 meters if time delta is small
  if (distMeters < 3.0) {
    return { valid: false, reason: 'Stationary jitter (< 3m)' };
  }

  // 3. Teleportation / impossible speed check
  if (timeDeltaSec > 0.1) {
    const calculatedSpeedMs = distMeters / timeDeltaSec;
    const maxAllowed = MAX_SPEED_MS[activityType] * 1.5; // allow margin
    if (calculatedSpeedMs > maxAllowed) {
      return { valid: false, reason: `Impossible speed: ${(calculatedSpeedMs * 3.6).toFixed(1)} km/h` };
    }
  }

  return { valid: true };
}

/**
 * Calculates total elevation gain (in meters), applying a threshold filter to avoid barometric/GPS jitter
 */
export function calculateElevationGain(points: LocationPoint[], minThresholdMeters = 1.5): number {
  if (points.length < 2) return 0;
  let gain = 0;
  let lastAlt = points[0].altitude;

  for (let i = 1; i < points.length; i++) {
    const currentAlt = points[i].altitude;
    if (currentAlt != null && lastAlt != null) {
      const diff = currentAlt - lastAlt;
      if (diff >= minThresholdMeters) {
        gain += diff;
        lastAlt = currentAlt;
      } else if (diff <= -minThresholdMeters) {
        lastAlt = currentAlt;
      }
    } else if (currentAlt != null) {
      lastAlt = currentAlt;
    }
  }

  return Math.round(gain * 10) / 10;
}
