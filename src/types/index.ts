export type ActivityType = 'walk' | 'run' | 'ride' | 'travel' | 'hike';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speed?: number | null; // m/s
  accuracy?: number | null; // meters
  heading?: number | null; // degrees
  timestamp: number; // ms
}

export interface ActivitySplit {
  km: number;
  timeSeconds: number;
  paceSecondsPerKm: number;
  elevationGain: number;
}

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  startTime: number;
  endTime: number;
  distanceMeters: number;
  movingTimeSeconds: number;
  totalTimeSeconds: number;
  elevationGainMeters: number;
  calories: number;
  steps: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  avgPaceSecondsPerKm: number;
  bestPaceSecondsPerKm: number;
  points: LocationPoint[];
  splits?: ActivitySplit[];
  notes?: string;
  photos?: string[];
  isPrivate?: boolean;
  privacyRadiusMeters?: number;
}

export interface UserProfile {
  name: string;
  weightKg: number;
  heightCm: number;
  dailyStepGoal: number;
  weeklyDistanceGoalKm: number;
  unit: 'metric' | 'imperial';
  autoStart: boolean;
  autoPause: boolean;
  theme: 'dark' | 'light';
  privacyZoneRadiusMeters: number;
  hideStartEndPoints: boolean;
  onboardingCompleted: boolean;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  steps: number;
  distanceKm: number;
  calories: number;
  activeMinutes: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number | null;
  progress: number; // 0 to 1
  category: 'distance' | 'steps' | 'streak' | 'speed';
}

export type GPSStatus = 'searching' | 'good' | 'moderate' | 'weak' | 'disabled';
