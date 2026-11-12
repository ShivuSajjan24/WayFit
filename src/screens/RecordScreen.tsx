import React, { useState, useEffect, useRef } from 'react';
import { Activity, ActivityType, LocationPoint, GPSStatus, UserProfile } from '../types';
import { LiveRouteMap } from '../components/LiveRouteMap';
import { locationService } from '../services/locationService';
import { calculateDistance, calculateElevationGain } from '../utils/haversine';
import { detectActivityFromSpeed, ActivityDetector } from '../utils/activityDetect';
import { calculateCalories, estimateStepsFromDistance } from '../utils/calories';
import { formatDistance, formatDuration, formatPace, formatSpeed } from '../utils/formatters';
import {
  Play,
  Pause,
  Square,
  AlertTriangle,
  RotateCcw,
  Zap,
  Activity as ActivityIcon,
  Footprints,
  Flame,
  TrendingUp,
  Gauge,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecordScreenProps {
  profile: UserProfile;
  initialActivityType?: ActivityType;
  onSaveActivity: (activity: Activity) => void;
  onDiscard: () => void;
}

export const RecordScreen: React.FC<RecordScreenProps> = ({
  profile,
  initialActivityType = 'run',
  onSaveActivity,
  onDiscard,
}) => {
  const unit = profile.unit;

  // Recording State: 'idle' | 'recording' | 'paused' | 'finishing'
  const [state, setState] = useState<'idle' | 'recording' | 'paused' | 'finishing'>('idle');
  const [activityType, setActivityType] = useState<ActivityType>(initialActivityType);
  const [detectedType, setDetectedType] = useState<ActivityType>(initialActivityType);
  const [autoDetectLocked, setAutoDetectLocked] = useState<boolean>(false);

  // GPS & Live Data
  const [gpsStatus, setGpsStatus] = useState<GPSStatus>(locationService.getCurrentStatus());
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [currentPoint, setCurrentPoint] = useState<LocationPoint | null>(null);

  // Metrics
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [movingTimeSeconds, setMovingTimeSeconds] = useState<number>(0);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState<number>(0);
  const [elevationGain, setElevationGain] = useState<number>(0);
  const [steps, setSteps] = useState<number>(0);
  const [autoPaused, setAutoPaused] = useState<boolean>(false);

  // Title & notes modal when finishing
  const [activityTitle, setActivityTitle] = useState<string>('');
  const [workoutNotes, setWorkoutNotes] = useState<string>('');

  // Simulator mode toggle
  const [useSimulation, setUseSimulation] = useState<boolean>(false);

  // References
  const timerIntervalRef = useRef<any>(null);
  const stationaryTimerRef = useRef<number>(0);
  const activityDetectorRef = useRef<ActivityDetector>(new ActivityDetector());
  const startTimeRef = useRef<number>(Date.now());

  // Subscribe to GPS location service
  useEffect(() => {
    const unsubscribe = locationService.subscribe({
      onLocationUpdate: (point) => {
        handleNewPoint(point);
      },
      onStatusChange: (status) => {
        setGpsStatus(status);
        if (status === 'good' || status === 'moderate') {
          setGpsError(null);
        }
      },
      onError: (err) => {
        setGpsError(err);
      },
    });

    // Auto-start tracking if autoStart setting is enabled and not already recording
    if (profile.autoStart && state === 'idle') {
      startRecording();
    }

    return () => {
      unsubscribe();
      locationService.stopTracking();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Update activity type in location service
  useEffect(() => {
    locationService.setActivityType(activityType);
  }, [activityType]);

  // Handle incoming verified GPS point
  const handleNewPoint = (newPoint: LocationPoint) => {
    setCurrentPoint(newPoint);

    if (state !== 'recording') return;

    setPoints((prev) => {
      if (prev.length === 0) {
        return [newPoint];
      }

      const lastPoint = prev[prev.length - 1];
      const deltaMeters = calculateDistance(
        lastPoint.latitude,
        lastPoint.longitude,
        newPoint.latitude,
        newPoint.longitude
      );

      // Speed calculation
      const speedKmh = newPoint.speed != null ? Math.max(0, newPoint.speed * 3.6) : (deltaMeters / 1.5) * 3.6;
      setCurrentSpeedKmh(speedKmh);
      setMaxSpeedKmh((m) => Math.max(m, speedKmh));

      // Auto-detect activity type
      if (!autoDetectLocked) {
        const detected = activityDetectorRef.current.addSpeed(speedKmh);
        setDetectedType(detected);
        setActivityType(detected);
      }

      // Auto-pause detection (speed < 0.8 km/h for > 10 seconds)
      if (profile.autoPause) {
        if (speedKmh < 0.8) {
          stationaryTimerRef.current += 1.5;
          if (stationaryTimerRef.current >= 10 && !autoPaused) {
            setAutoPaused(true);
          }
        } else {
          stationaryTimerRef.current = 0;
          if (autoPaused) {
            setAutoPaused(false);
          }
        }
      }

      // Add distance
      setDistanceMeters((d) => d + deltaMeters);

      // Accumulate elevation gain
      if (newPoint.altitude != null && lastPoint.altitude != null) {
        const climb = newPoint.altitude - lastPoint.altitude;
        if (climb > 1.0) {
          setElevationGain((e) => Math.round((e + climb) * 10) / 10);
        }
      }

      // Step count (real or stride formula)
      const newEstimatedSteps = estimateStepsFromDistance(deltaMeters, profile.heightCm, activityType);
      setSteps((s) => s + newEstimatedSteps);

      return [...prev, newPoint];
    });
  };

  // Timer loop for moving vs total time
  useEffect(() => {
    if (state === 'recording' && !autoPaused) {
      timerIntervalRef.current = setInterval(() => {
        setMovingTimeSeconds((m) => m + 1);
        setTotalTimeSeconds((t) => t + 1);
      }, 1000);
    } else if (state === 'recording' && autoPaused) {
      timerIntervalRef.current = setInterval(() => {
        setTotalTimeSeconds((t) => t + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [state, autoPaused]);

  const startRecording = () => {
    setState('recording');
    startTimeRef.current = Date.now();
    locationService.startTracking(useSimulation);
  };

  const togglePause = () => {
    if (state === 'recording') {
      setState('paused');
      locationService.stopTracking();
    } else if (state === 'paused') {
      setState('recording');
      locationService.startTracking(useSimulation);
    }
  };

  const promptFinish = () => {
    setState('finishing');
    locationService.stopTracking();

    // Default title based on time of day and activity
    const hour = new Date().getHours();
    let timeLabel = 'Morning';
    if (hour >= 12 && hour < 17) timeLabel = 'Afternoon';
    else if (hour >= 17 && hour < 21) timeLabel = 'Sunset';
    else if (hour >= 21 || hour < 5) timeLabel = 'Night';

    const typeLabel = activityType.charAt(0).toUpperCase() + activityType.slice(1);
    setActivityTitle(`${timeLabel} ${typeLabel}`);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FC4C02', '#22C55E', '#FFFFFF'],
      });
    } catch {
      // confetti
    }
  };

  const handleFinalSave = () => {
    const caloriesBurned = calculateCalories(
      activityType,
      profile.weightKg,
      movingTimeSeconds,
      currentSpeedKmh
    );

    const avgSpeed = movingTimeSeconds > 0 ? (distanceMeters / 1000) / (movingTimeSeconds / 3600) : 0;
    const avgPace = distanceMeters > 0 ? movingTimeSeconds / (distanceMeters / 1000) : 0;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: activityTitle.trim() || `${activityType.toUpperCase()} Workout`,
      type: activityType,
      startTime: startTimeRef.current,
      endTime: Date.now(),
      distanceMeters: Math.round(distanceMeters),
      movingTimeSeconds,
      totalTimeSeconds,
      elevationGainMeters: elevationGain,
      calories: caloriesBurned,
      steps,
      avgSpeedKmh: Math.round(avgSpeed * 10) / 10,
      maxSpeedKmh: Math.round(maxSpeedKmh * 10) / 10,
      avgPaceSecondsPerKm: Math.round(avgPace),
      bestPaceSecondsPerKm: Math.max(120, Math.round(avgPace * 0.85)),
      points,
      notes: workoutNotes.trim() || undefined,
      isPrivate: false,
    };

    onSaveActivity(newActivity);
  };

  const handleDiscard = () => {
    if (confirm('Discard this workout? Recorded GPS coordinates and stats will not be saved.')) {
      locationService.stopTracking();
      onDiscard();
    }
  };

  const toggleSimulation = () => {
    const nextVal = !useSimulation;
    setUseSimulation(nextVal);
    if (state === 'recording') {
      locationService.stopTracking();
      locationService.startTracking(nextVal);
    }
  };

  // Live Pace calculation
  const livePaceSecPerKm = distanceMeters > 50 && movingTimeSeconds > 5
    ? movingTimeSeconds / (distanceMeters / 1000)
    : 0;

  const liveCalories = calculateCalories(
    activityType,
    profile.weightKg,
    movingTimeSeconds,
    currentSpeedKmh
  );

  return (
    <div className="flex flex-col gap-4 pb-24 text-white">
      {/* Top GPS Status & Activity Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {/* Activity Type Badge / Selector */}
          <div className="relative">
            <select
              value={activityType}
              onChange={(e) => {
                setActivityType(e.target.value as ActivityType);
                setAutoDetectLocked(true);
              }}
              className="appearance-none bg-[#1B2027] border border-orange-500/50 text-white font-extrabold text-xs px-3 py-1.5 pr-7 rounded-xl focus:outline-none cursor-pointer uppercase"
            >
              <option value="run">🏃 Run</option>
              <option value="walk">👟 Walk</option>
              <option value="ride">🚴 Ride</option>
              <option value="hike">⛰️ Hike</option>
              <option value="travel">🚗 Travel</option>
            </select>
            <div className="absolute right-2 top-2.5 pointer-events-none text-gray-400 text-xs">▼</div>
          </div>

          {!autoDetectLocked && (
            <span className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              Auto: {detectedType}
            </span>
          )}
        </div>

        {/* GPS Status Indicator & Simulator button */}
        <div className="flex items-center gap-2">
          {/* Simulator button */}
          <button
            type="button"
            onClick={toggleSimulation}
            title={useSimulation ? 'Using Route Simulator' : 'Using Real GPS'}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono transition flex items-center gap-1 border ${
              useSimulation
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            <Zap className="w-3 h-3 text-yellow-400" />
            {useSimulation ? 'SIMULATOR ON' : 'SIMULATE'}
          </button>

          {/* GPS Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold ${
              gpsStatus === 'good'
                ? 'bg-green-500/15 border-green-500/40 text-green-400'
                : gpsStatus === 'moderate'
                ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400'
                : gpsStatus === 'weak'
                ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                : 'bg-red-500/15 border-red-500/40 text-red-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                gpsStatus === 'good' ? 'bg-green-500' : gpsStatus === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
            <span>{gpsStatus.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* GPS Off Alert if permission denied */}
      {gpsStatus === 'disabled' && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>GPS location is disabled or permission denied.</span>
          </div>
          <button
            type="button"
            onClick={() => setUseSimulation(true)}
            className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-bold text-[10px]"
          >
            Use Simulator
          </button>
        </div>
      )}

      {/* Auto-Paused Banner */}
      {autoPaused && (
        <div className="p-2.5 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center gap-2 text-yellow-300 text-xs font-bold animate-pulse">
          <Pause className="w-4 h-4" />
          <span>Auto-Paused (No Movement Detected)</span>
        </div>
      )}

      {/* Interactive Live Map */}
      <div className="relative">
        <LiveRouteMap
          points={points}
          currentPoint={currentPoint}
          isRecording={state === 'recording'}
          heightClass="h-72"
          showControls={true}
          autoCenter={true}
        />
      </div>

      {/* Main Outdoor High-Contrast Telemetry HUD */}
      <div className="p-5 rounded-3xl bg-[#1B2027] border border-gray-800 shadow-xl flex flex-col gap-4">
        {/* Main Distance Hero Display */}
        <div className="flex flex-col items-center justify-center py-2 border-b border-gray-800/80">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 font-mono">
            TOTAL DISTANCE
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-6xl font-black text-white font-mono tracking-tight">
              {formatDistance(distanceMeters, unit)}
            </span>
            <span className="text-xl font-extrabold text-[#FC4C02] font-mono">
              {unit === 'imperial' ? 'mi' : 'km'}
            </span>
          </div>
        </div>

        {/* 2x2 Telemetry Matrix */}
        <div className="grid grid-cols-2 gap-4 text-center">
          {/* Moving Time */}
          <div className="p-3 rounded-2xl bg-[#111418] border border-gray-800/80">
            <span className="text-[11px] font-bold text-gray-400 uppercase font-mono block">
              MOVING TIME
            </span>
            <span className="text-3xl font-extrabold text-white font-mono mt-1 block">
              {formatDuration(movingTimeSeconds)}
            </span>
            <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
              Elapsed: {formatDuration(totalTimeSeconds)}
            </span>
          </div>

          {/* Current / Avg Pace */}
          <div className="p-3 rounded-2xl bg-[#111418] border border-gray-800/80">
            <span className="text-[11px] font-bold text-gray-400 uppercase font-mono block">
              CURRENT PACE
            </span>
            <span className="text-3xl font-extrabold text-[#FC4C02] font-mono mt-1 block">
              {formatPace(livePaceSecPerKm, unit)}
            </span>
            <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
              {unit === 'imperial' ? 'min/mi' : 'min/km'}
            </span>
          </div>

          {/* Speed */}
          <div className="p-3 rounded-2xl bg-[#111418] border border-gray-800/80">
            <span className="text-[11px] font-bold text-gray-400 uppercase font-mono block">
              SPEED
            </span>
            <span className="text-2xl font-extrabold text-white font-mono mt-1 block">
              {formatSpeed(currentSpeedKmh, unit)}
              <span className="text-xs text-gray-400 ml-1">{unit === 'imperial' ? 'mph' : 'km/h'}</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
              Max: {formatSpeed(maxSpeedKmh, unit)}
            </span>
          </div>

          {/* Elevation Gain */}
          <div className="p-3 rounded-2xl bg-[#111418] border border-gray-800/80">
            <span className="text-[11px] font-bold text-gray-400 uppercase font-mono block">
              ELEVATION GAIN
            </span>
            <span className="text-2xl font-extrabold text-[#22C55E] font-mono mt-1 block">
              +{elevationGain} <span className="text-xs text-gray-400 font-normal">m</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
              Barometer / GPS
            </span>
          </div>
        </div>

        {/* Secondary metrics bar (Calories & Steps) */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-800/80">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#111418] border border-gray-800">
            <Flame className="w-4 h-4 text-orange-500" />
            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase block">Calories</span>
              <span className="text-sm font-bold text-white font-mono">{liveCalories} kcal</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#111418] border border-gray-800">
            <Footprints className="w-4 h-4 text-green-400" />
            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase block">Steps</span>
              <span className="text-sm font-bold text-white font-mono">{steps.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Outdoor High-Contrast Controls */}
      <div className="flex items-center justify-center gap-4 py-2">
        {state === 'idle' && (
          <button
            type="button"
            onClick={startRecording}
            className="w-full py-4 rounded-2xl bg-[#FC4C02] hover:bg-[#E03E00] text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-orange-500/30 active:scale-95 transition"
          >
            <Play className="w-6 h-6 fill-white" />
            START RECORDING
          </button>
        )}

        {state === 'recording' && (
          <>
            <button
              type="button"
              onClick={togglePause}
              className="flex-1 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
            >
              <Pause className="w-5 h-5 fill-white" />
              PAUSE
            </button>

            <button
              type="button"
              onClick={promptFinish}
              className="flex-1 py-4 rounded-2xl bg-[#22C55E] hover:bg-green-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95 transition"
            >
              <Square className="w-5 h-5 fill-white" />
              FINISH
            </button>
          </>
        )}

        {state === 'paused' && (
          <>
            <button
              type="button"
              onClick={handleDiscard}
              className="p-4 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition active:scale-95"
              title="Discard workout"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={togglePause}
              className="flex-1 py-4 rounded-2xl bg-[#FC4C02] hover:bg-[#E03E00] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 active:scale-95 transition"
            >
              <Play className="w-5 h-5 fill-white" />
              RESUME
            </button>

            <button
              type="button"
              onClick={promptFinish}
              className="flex-1 py-4 rounded-2xl bg-[#22C55E] hover:bg-green-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95 transition"
            >
              <Square className="w-5 h-5 fill-white" />
              FINISH
            </button>
          </>
        )}
      </div>

      {/* FINISH MODAL */}
      {state === 'finishing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#1B2027] border border-gray-700 p-6 shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-green-500/20 text-[#22C55E] flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Workout Completed!</h3>
                <p className="text-xs text-gray-400">Save and add to your fitness timeline</p>
              </div>
            </div>

            {/* Quick summary stats in modal */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#111418] border border-gray-800 text-center font-mono">
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Distance</span>
                <span className="text-sm font-bold text-white block">
                  {formatDistance(distanceMeters, unit)} {unit === 'imperial' ? 'mi' : 'km'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Time</span>
                <span className="text-sm font-bold text-white block">
                  {formatDuration(movingTimeSeconds)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Calories</span>
                <span className="text-sm font-bold text-orange-400 block">
                  {liveCalories} kcal
                </span>
              </div>
            </div>

            {/* Title & Notes */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase font-mono">Title</label>
              <input
                type="text"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder="Name your workout"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-sm focus:border-[#FC4C02] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase font-mono">Workout Notes</label>
              <textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                rows={2}
                placeholder="How did it feel? Shoes, terrain, weather..."
                className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-xs focus:border-[#FC4C02] focus:outline-none resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setState('paused')}
                className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 transition"
              >
                Back to Track
              </button>
              <button
                type="button"
                onClick={handleFinalSave}
                className="flex-1 py-3 rounded-xl bg-[#FC4C02] hover:bg-[#E03E00] text-xs font-bold text-white shadow-lg shadow-orange-500/25 active:scale-95 transition"
              >
                Save Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
