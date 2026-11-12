import { calculateDistance, filterGPSPoint, calculateElevationGain } from '../haversine';
import { detectActivityFromSpeed, ActivityDetector } from '../activityDetect';
import { calculateCalories, estimateStepsFromDistance } from '../calories';
import { formatDistance, formatDuration, formatPace, formatSpeed } from '../formatters';
import { generateGPX } from '../gpx';
import { Activity, LocationPoint } from '../../types';

export function runWayFitUnitTests(): { name: string; passed: boolean; message?: string }[] {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  function assert(name: string, condition: boolean, message?: string) {
    results.push({
      name,
      passed: condition,
      message: condition ? undefined : (message || 'Assertion failed'),
    });
  }

  // 1. Distance Haversine Tests
  try {
    // Distance between SF Ferry Building and Golden Gate Park (~6.5km)
    const d1 = calculateDistance(37.7955, -122.3937, 37.7690, -122.4467);
    assert(
      'Haversine Distance: Known coordinates (~5.4km - 6.5km)',
      d1 > 5000 && d1 < 6500,
      `Calculated ${d1}m`
    );

    // Distance identical coordinates must be 0
    const d0 = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
    assert('Haversine Distance: Identical points is 0', Math.round(d0) === 0);
  } catch (e: any) {
    assert('Haversine Distance Exception', false, e.message);
  }

  // 2. GPS Filtering Tests
  try {
    const pt1: LocationPoint = {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 8,
      timestamp: 10000,
    };
    const badAccuracyPt: LocationPoint = {
      latitude: 37.7750,
      longitude: -122.4195,
      accuracy: 50, // > 35m
      timestamp: 12000,
    };
    const jitterPt: LocationPoint = {
      latitude: 37.774905,
      longitude: -122.419405,
      accuracy: 5,
      timestamp: 11000, // < 3m jump
    };
    const validPt: LocationPoint = {
      latitude: 37.7752,
      longitude: -122.4198,
      accuracy: 6,
      timestamp: 15000, // ~45m jump in 5s (~9 m/s, reasonable run)
    };

    assert(
      'GPS Filter: Reject accuracy > 35m',
      filterGPSPoint(badAccuracyPt, pt1, 'run').valid === false
    );
    assert(
      'GPS Filter: Reject stationary jitter < 3m',
      filterGPSPoint(jitterPt, pt1, 'run').valid === false
    );
    assert(
      'GPS Filter: Accept legitimate movement',
      filterGPSPoint(validPt, pt1, 'run').valid === true
    );
  } catch (e: any) {
    assert('GPS Filter Exception', false, e.message);
  }

  // 3. Activity Type Detection Tests
  try {
    // Walk: under 6.5 km/h
    assert('Activity Detection: 4.5 km/h is Walk', detectActivityFromSpeed(4.5) === 'walk');
    // Run: 6.5 - 11 km/h
    assert('Activity Detection: 9.2 km/h is Run', detectActivityFromSpeed(9.2) === 'run');
    // Ride: 11 - 30 km/h
    assert('Activity Detection: 22.0 km/h is Ride', detectActivityFromSpeed(22.0) === 'ride');
    // Travel: above 30 km/h
    assert('Activity Detection: 45.0 km/h is Travel', detectActivityFromSpeed(45.0) === 'travel');

    // Smoothing detector
    const detector = new ActivityDetector();
    detector.addSpeed(5.0);
    detector.addSpeed(6.0);
    const smoothed = detector.addSpeed(5.5);
    assert('Activity Detector: Smoothed moving average is Walk', smoothed === 'walk');
  } catch (e: any) {
    assert('Activity Detection Exception', false, e.message);
  }

  // 4. Calories & MET Calculation Tests
  try {
    // 70kg runner for 1 hour (3600s) with run MET ~9.8 -> ~686 kcal
    const runCalories = calculateCalories('run', 70, 3600, 10);
    assert(
      'Calories: 70kg 1hr Run (~650-750 kcal)',
      runCalories >= 650 && runCalories <= 750,
      `Calculated: ${runCalories} kcal`
    );

    // 70kg walker for 1 hour (3600s) with walk MET ~3.8 -> ~266 kcal
    const walkCalories = calculateCalories('walk', 70, 3600, 5);
    assert(
      'Calories: 70kg 1hr Walk (~240-300 kcal)',
      walkCalories >= 240 && walkCalories <= 300,
      `Calculated: ${walkCalories} kcal`
    );

    // Steps from distance: 175cm height, 5000m run
    const steps = estimateStepsFromDistance(5000, 175, 'run');
    // Stride = 175 * 0.45 / 100 = 0.7875m. 5000 / 0.7875 ~= 6349 steps
    assert(
      'Pedometer Fallback: 5km step estimation (~6000-6600 steps)',
      steps >= 6000 && steps <= 6600,
      `Calculated: ${steps}`
    );
  } catch (e: any) {
    assert('Calories Calculation Exception', false, e.message);
  }

  // 5. Elevation Gain Filter Tests
  try {
    const pts: LocationPoint[] = [
      { latitude: 0, longitude: 0, altitude: 100, timestamp: 1 },
      { latitude: 0, longitude: 0, altitude: 100.8, timestamp: 2 }, // < 1.5m, ignore jitter
      { latitude: 0, longitude: 0, altitude: 105.0, timestamp: 3 }, // +5.0m gain
      { latitude: 0, longitude: 0, altitude: 103.0, timestamp: 4 }, // descent
      { latitude: 0, longitude: 0, altitude: 110.0, timestamp: 5 }, // +7.0m gain
    ];
    const gain = calculateElevationGain(pts, 1.5);
    assert('Elevation Gain: Ignores micro jitter and sums climb', gain >= 10 && gain <= 14);
  } catch (e: any) {
    assert('Elevation Gain Exception', false, e.message);
  }

  // 6. Formatters Tests
  try {
    assert('Formatter: Duration 3665s is 1:01:05', formatDuration(3665) === '1:01:05');
    assert('Formatter: Duration 245s is 04:05', formatDuration(245) === '04:05');
    assert('Formatter: Distance 5420m metric is 5.42', formatDistance(5420, 'metric') === '5.42');
    assert('Formatter: Pace 324s/km is 5\'24"', formatPace(324, 'metric') === "5'24\"");
    assert('Formatter: Speed 14.28 km/h is 14.3', formatSpeed(14.28, 'metric') === '14.3');
  } catch (e: any) {
    assert('Formatters Exception', false, e.message);
  }

  // 7. GPX Generation Test
  try {
    const mockActivity: Activity = {
      id: 'test-1',
      title: 'Morning Test Run',
      type: 'run',
      startTime: 1700000000000,
      endTime: 1700001000000,
      distanceMeters: 2500,
      movingTimeSeconds: 900,
      totalTimeSeconds: 1000,
      elevationGainMeters: 25,
      calories: 220,
      steps: 3100,
      avgSpeedKmh: 10.0,
      maxSpeedKmh: 12.0,
      avgPaceSecondsPerKm: 360,
      bestPaceSecondsPerKm: 320,
      points: [
        { latitude: 37.7749, longitude: -122.4194, altitude: 45, speed: 2.8, timestamp: 1700000000000 },
        { latitude: 37.7760, longitude: -122.4180, altitude: 50, speed: 3.1, timestamp: 1700000500000 },
      ],
    };
    const gpx = generateGPX(mockActivity);
    assert('GPX Generation: Valid XML with trkpt & metadata', gpx.includes('<trkpt') && gpx.includes('MyWayTrack'));
  } catch (e: any) {
    assert('GPX Generation Exception', false, e.message);
  }

  return results;
}
