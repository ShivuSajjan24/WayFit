import { ActivityType } from '../types';

/**
 * Standard MET (Metabolic Equivalent of Task) values for activities
 */
export const ACTIVITY_MET: Record<ActivityType, number> = {
  walk: 3.8,
  run: 9.8,
  ride: 7.5,
  hike: 6.0,
  travel: 1.3,
};

/**
 * Calculates estimated calories burned using:
 * Calories = MET * Weight (kg) * Duration (hours)
 */
export function calculateCalories(
  activityType: ActivityType,
  weightKg: number,
  durationSeconds: number,
  avgSpeedKmh = 0
): number {
  if (durationSeconds <= 0 || weightKg <= 0) return 0;
  
  let met = ACTIVITY_MET[activityType] || 4.0;
  
  // Adjust running MET based on speed if available
  if (activityType === 'run' && avgSpeedKmh > 0) {
    if (avgSpeedKmh > 13) met = 12.5;
    else if (avgSpeedKmh > 11) met = 11.0;
    else if (avgSpeedKmh > 9) met = 9.8;
    else met = 8.3;
  } else if (activityType === 'ride' && avgSpeedKmh > 0) {
    if (avgSpeedKmh > 25) met = 10.0;
    else if (avgSpeedKmh > 20) met = 8.5;
    else met = 6.8;
  }

  const hours = durationSeconds / 3600;
  const burned = met * weightKg * hours;
  return Math.round(burned);
}

/**
 * Estimates step count from distance and user height using standard anthropometric stride ratio
 */
export function estimateStepsFromDistance(
  distanceMeters: number,
  heightCm: number,
  activityType: ActivityType
): number {
  if (activityType === 'ride' || activityType === 'travel') {
    return 0; // cycling and vehicle travel don't accumulate steps
  }
  if (distanceMeters <= 0 || heightCm <= 0) return 0;

  // Stride factor: ~0.414 for walking, ~0.45 for running
  const strideRatio = activityType === 'run' ? 0.45 : 0.414;
  const strideLengthMeters = (heightCm * strideRatio) / 100;
  
  if (strideLengthMeters <= 0) return 0;
  return Math.round(distanceMeters / strideLengthMeters);
}
