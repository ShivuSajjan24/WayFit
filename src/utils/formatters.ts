/**
 * Converts meters to km or miles
 */
export function formatDistance(meters: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (meters == null || isNaN(meters)) return '0.00';
  if (unit === 'imperial') {
    const miles = meters / 1609.344;
    return miles.toFixed(2);
  }
  const km = meters / 1000;
  return km.toFixed(2);
}

export function getDistanceUnitLabel(unit: 'metric' | 'imperial' = 'metric'): string {
  return unit === 'imperial' ? 'mi' : 'km';
}

export function getSpeedUnitLabel(unit: 'metric' | 'imperial' = 'metric'): string {
  return unit === 'imperial' ? 'mph' : 'km/h';
}

export function getPaceUnitLabel(unit: 'metric' | 'imperial' = 'metric'): string {
  return unit === 'imperial' ? '/mi' : '/km';
}

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Formats pace in seconds per km (or seconds per mile) into M'SS" format
 */
export function formatPace(
  secondsPerKm: number,
  unit: 'metric' | 'imperial' = 'metric'
): string {
  if (!secondsPerKm || isNaN(secondsPerKm) || secondsPerKm <= 0 || !isFinite(secondsPerKm)) {
    return "--'--\"";
  }

  let paceSec = secondsPerKm;
  if (unit === 'imperial') {
    // 1 mile = 1.609344 km
    paceSec = secondsPerKm * 1.609344;
  }

  // Cap crazy numbers (e.g. standing still)
  if (paceSec > 3599) {
    return "--'--\"";
  }

  const mins = Math.floor(paceSec / 60);
  const secs = Math.floor(paceSec % 60);
  return `${mins}'${secs.toString().padStart(2, '0')}"`;
}

/**
 * Formats speed in km/h or mph
 */
export function formatSpeed(speedKmh: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (speedKmh == null || isNaN(speedKmh) || speedKmh < 0) return '0.0';
  if (unit === 'imperial') {
    const mph = speedKmh * 0.621371;
    return mph.toFixed(1);
  }
  return speedKmh.toFixed(1);
}

/**
 * Formats timestamp into readable date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
