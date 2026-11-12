import { Activity, UserProfile, Achievement } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'wayfit_profile',
  ACTIVITIES: 'wayfit_activities',
  DRAFT_ACTIVITY: 'wayfit_draft_activity',
  ACHIEVEMENTS: 'wayfit_achievements',
  PERMISSIONS_GRANTED: 'wayfit_permissions_granted',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  weightKg: 72,
  heightCm: 178,
  dailyStepGoal: 10000,
  weeklyDistanceGoalKm: 30,
  unit: 'metric',
  autoStart: true,
  autoPause: true,
  theme: 'dark',
  privacyZoneRadiusMeters: 400,
  hideStartEndPoints: false,
  onboardingCompleted: true,
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_5k',
    title: 'First 5K',
    description: 'Complete a single run or walk of at least 5 kilometers',
    icon: '🏃',
    category: 'distance',
    progress: 1,
    unlockedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'step_master',
    title: '10K Steps Club',
    description: 'Crush 10,000 steps in a single calendar day',
    icon: '👟',
    category: 'steps',
    progress: 1,
    unlockedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Record an activity 7 consecutive days',
    icon: '🔥',
    category: 'streak',
    progress: 0.71, // 5 / 7
    unlockedAt: null,
  },
  {
    id: 'century_ride',
    title: 'Century Ride',
    description: 'Complete a bike ride of at least 25 kilometers',
    icon: '🚴',
    category: 'distance',
    progress: 0.85,
    unlockedAt: null,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Achieve a running pace faster than 4:30 min/km',
    icon: '⚡',
    category: 'speed',
    progress: 1,
    unlockedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'altitude_junkie',
    title: 'Altitude Junkie',
    description: 'Gain over 200m elevation in a single adventure',
    icon: '⛰️',
    category: 'distance',
    progress: 1,
    unlockedAt: Date.now() - 86400000 * 4,
  },
];

// Helper to generate a realistic GPS route polyline
function generateSampleRoute(
  startLat: number,
  startLon: number,
  pointsCount: number,
  stepDelta: number,
  startTime: number
) {
  const points = [];
  let lat = startLat;
  let lon = startLon;
  let alt = 45;

  for (let i = 0; i < pointsCount; i++) {
    const angle = (i / pointsCount) * Math.PI * 2 + Math.sin(i * 0.4) * 0.5;
    lat += Math.cos(angle) * stepDelta;
    lon += Math.sin(angle) * (stepDelta * 1.3);
    alt += Math.sin(i * 0.3) * 1.5;

    points.push({
      latitude: lat,
      longitude: lon,
      altitude: Math.round(alt * 10) / 10,
      speed: 3.2 + Math.sin(i * 0.2) * 0.8,
      accuracy: 6 + Math.random() * 4,
      heading: (angle * 180) / Math.PI,
      timestamp: startTime + i * 3000,
    });
  }
  return points;
}

export const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: 'act-sample-1',
    title: 'Morning Golden Hour Run',
    type: 'run',
    startTime: Date.now() - 86400000 * 1 - 3600000 * 4,
    endTime: Date.now() - 86400000 * 1 - 3600000 * 3.4,
    distanceMeters: 6240,
    movingTimeSeconds: 2160, // 36 mins
    totalTimeSeconds: 2280,
    elevationGainMeters: 84,
    calories: 512,
    steps: 7420,
    avgSpeedKmh: 10.4,
    maxSpeedKmh: 13.8,
    avgPaceSecondsPerKm: 346, // ~5'46"
    bestPaceSecondsPerKm: 302, // ~5'02"
    points: generateSampleRoute(37.7749, -122.4194, 45, 0.00045, Date.now() - 86400000 * 1 - 3600000 * 4),
    notes: 'Crisp morning air, felt great in the second half. Negative splits!',
    isPrivate: false,
    splits: [
      { km: 1, timeSeconds: 362, paceSecondsPerKm: 362, elevationGain: 12 },
      { km: 2, timeSeconds: 350, paceSecondsPerKm: 350, elevationGain: 18 },
      { km: 3, timeSeconds: 345, paceSecondsPerKm: 345, elevationGain: 22 },
      { km: 4, timeSeconds: 340, paceSecondsPerKm: 340, elevationGain: 15 },
      { km: 5, timeSeconds: 330, paceSecondsPerKm: 330, elevationGain: 9 },
      { km: 6, timeSeconds: 325, paceSecondsPerKm: 325, elevationGain: 8 },
    ],
  },
  {
    id: 'act-sample-2',
    title: 'Coastal Hill Cycling Loop',
    type: 'ride',
    startTime: Date.now() - 86400000 * 2 - 3600000 * 7,
    endTime: Date.now() - 86400000 * 2 - 3600000 * 5.8,
    distanceMeters: 21800,
    movingTimeSeconds: 4320, // 1h 12m
    totalTimeSeconds: 4680,
    elevationGainMeters: 310,
    calories: 785,
    steps: 0,
    avgSpeedKmh: 18.2,
    maxSpeedKmh: 42.1,
    avgPaceSecondsPerKm: 198,
    bestPaceSecondsPerKm: 85,
    points: generateSampleRoute(37.7833, -122.4333, 60, 0.0012, Date.now() - 86400000 * 2 - 3600000 * 7),
    notes: 'Windy along the bluffs, great cadence on the main climb.',
    isPrivate: false,
  },
  {
    id: 'act-sample-3',
    title: 'Sunset Recovery Walk',
    type: 'walk',
    startTime: Date.now() - 86400000 * 3 - 3600000 * 2,
    endTime: Date.now() - 86400000 * 3 - 3600000 * 1.3,
    distanceMeters: 3820,
    movingTimeSeconds: 2520, // 42m
    totalTimeSeconds: 2640,
    elevationGainMeters: 32,
    calories: 210,
    steps: 5120,
    avgSpeedKmh: 5.4,
    maxSpeedKmh: 6.8,
    avgPaceSecondsPerKm: 660, // 11'00"
    bestPaceSecondsPerKm: 580,
    points: generateSampleRoute(37.7690, -122.4467, 35, 0.0003, Date.now() - 86400000 * 3 - 3600000 * 2),
    notes: 'Easy evening stroll with good podcast.',
    isPrivate: false,
  },
];

export const StorageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getActivities(): Activity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (!data) {
        // Seed default sample activities for immediate rich UX
        this.saveActivities(SAMPLE_ACTIVITIES);
        return SAMPLE_ACTIVITIES;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_ACTIVITIES;
    }
  },

  saveActivities(activities: Activity[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to save activities', e);
    }
  },

  saveActivity(activity: Activity): Activity[] {
    const list = this.getActivities();
    const updated = [activity, ...list.filter((a) => a.id !== activity.id)];
    this.saveActivities(updated);
    this.checkAndUpdateAchievements(updated);
    return updated;
  },

  deleteActivity(id: string): Activity[] {
    const list = this.getActivities();
    const updated = list.filter((a) => a.id !== id);
    this.saveActivities(updated);
    return updated;
  },

  getDraftActivity(): Partial<Activity> | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT_ACTIVITY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveDraftActivity(draft: Partial<Activity> | null): void {
    try {
      if (draft) {
        localStorage.setItem(STORAGE_KEYS.DRAFT_ACTIVITY, JSON.stringify(draft));
      } else {
        localStorage.removeItem(STORAGE_KEYS.DRAFT_ACTIVITY);
      }
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  },

  getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : DEFAULT_ACHIEVEMENTS;
    } catch {
      return DEFAULT_ACHIEVEMENTS;
    }
  },

  checkAndUpdateAchievements(activities: Activity[]): Achievement[] {
    const achievements = this.getAchievements();
    let changed = false;

    for (const ach of achievements) {
      if (ach.unlockedAt) continue;

      if (ach.id === 'first_5k') {
        const has5k = activities.some((a) => a.distanceMeters >= 5000);
        if (has5k) {
          ach.unlockedAt = Date.now();
          ach.progress = 1;
          changed = true;
        }
      } else if (ach.id === 'century_ride') {
        const longestRide = Math.max(0, ...activities.filter((a) => a.type === 'ride').map((a) => a.distanceMeters));
        ach.progress = Math.min(1, longestRide / 25000);
        if (longestRide >= 25000) {
          ach.unlockedAt = Date.now();
          changed = true;
        }
      }
    }

    if (changed) {
      try {
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      } catch (e) {
        console.error('Failed to save achievements', e);
      }
    }
    return achievements;
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      localStorage.removeItem(STORAGE_KEYS.DRAFT_ACTIVITY);
      localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  },
};
