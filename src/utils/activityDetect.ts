import { ActivityType } from '../types';

/**
 * Detect activity type automatically from speed (in km/h)
 * Rules:
 * - walk: < 6.5 km/h
 * - run: 6.5 - 11 km/h
 * - ride: 11 - 30 km/h
 * - travel: > 30 km/h
 */
export function detectActivityFromSpeed(speedKmh: number): ActivityType {
  if (speedKmh <= 0.5) return 'walk'; // default to walk if stationary
  if (speedKmh < 6.5) return 'walk';
  if (speedKmh < 11.0) return 'run';
  if (speedKmh <= 30.0) return 'ride';
  return 'travel';
}

/**
 * Smoothing buffer to prevent flickering activity types from brief acceleration bursts
 */
export class ActivityDetector {
  private speedHistory: number[] = [];
  private maxHistoryLength = 5;

  public addSpeed(speedKmh: number): ActivityType {
    this.speedHistory.push(speedKmh);
    if (this.speedHistory.length > this.maxHistoryLength) {
      this.speedHistory.shift();
    }
    // Calculate weighted moving average
    const sum = this.speedHistory.reduce((acc, val) => acc + val, 0);
    const avgSpeed = sum / this.speedHistory.length;
    return detectActivityFromSpeed(avgSpeed);
  }

  public reset(): void {
    this.speedHistory = [];
  }
}
