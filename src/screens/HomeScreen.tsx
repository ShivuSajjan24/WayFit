import React from 'react';
import { Activity, UserProfile, Achievement } from '../types';
import { ProgressRing } from '../components/ProgressRing';
import { formatDistance, formatDuration, formatPace, formatDate } from '../utils/formatters';
import {
  Flame,
  Footprints,
  TrendingUp,
  ChevronRight,
  Play,
  Trophy,
  Compass,
  Bike,
  Activity as ActivityIcon,
  Sparkles,
} from 'lucide-react';

interface HomeScreenProps {
  profile: UserProfile;
  activities: Activity[];
  achievements: Achievement[];
  onStartActivity: (type: 'walk' | 'run' | 'ride' | 'hike') => void;
  onSelectActivity: (activity: Activity) => void;
  onNavigateTab: (tab: 'record' | 'activities' | 'profile') => void;
  onOpenExpoGuide: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  activities,
  achievements,
  onStartActivity,
  onSelectActivity,
  onNavigateTab,
  onOpenExpoGuide,
}) => {
  const unit = profile.unit;

  // Calculate today's steps and week stats
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfDay - (now.getDay() === 0 ? 6 : now.getDay() - 1) * 86400000;

  const todayActivities = activities.filter((a) => a.startTime >= startOfDay);
  const weekActivities = activities.filter((a) => a.startTime >= startOfWeek);

  const todaySteps = todayActivities.reduce((acc, a) => acc + a.steps, 0) || 5420; // fallback to realistic step count for demo
  const todayCalories = todayActivities.reduce((acc, a) => acc + a.calories, 0) || 315;

  const weekDistanceMeters = weekActivities.reduce((acc, a) => acc + a.distanceMeters, 0);
  const weekDistanceKm = weekDistanceMeters / 1000;

  const stepProgress = todaySteps / profile.dailyStepGoal;
  const weekDistanceProgress = weekDistanceKm / profile.weeklyDistanceGoalKm;

  const lastActivity = activities.length > 0 ? activities[0] : null;

  return (
    <div className="flex flex-col gap-6 pb-24 text-white">
      {/* Top Welcome & Notification Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FC4C02] to-[#E03E00] flex items-center justify-center shadow-lg shadow-orange-500/25 border border-orange-400/30">
            {/* Location pin with footstep trail icon */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" fill="#FFFFFF" stroke="none" />
              <path d="M10 17l1 1M13 19l1 1" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest font-mono">WayFit</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                PRO
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">
              Hello, {profile.name.split(' ')[0]}
            </h1>
          </div>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#1B2027] border border-gray-800 shadow-sm">
          <Flame className="w-4 h-4 text-orange-500 animate-pulse fill-orange-500" />
          <span className="text-xs font-extrabold text-white font-mono">5</span>
          <span className="text-[10px] text-gray-400 font-semibold">DAY STREAK</span>
        </div>
      </div>

      {/* Goal Rings Section */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Ring 1: Today's Steps */}
        <div className="p-4 rounded-3xl bg-[#1B2027] border border-gray-800 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-3 left-3 text-[10px] font-bold text-gray-400 uppercase font-mono flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5 text-[#FC4C02]" /> Today's Steps
          </div>
          
          <div className="mt-5 mb-2">
            <ProgressRing
              progress={stepProgress}
              size={105}
              strokeWidth={9}
              color="#FC4C02"
              backgroundColor="#242B35"
            >
              <span className="text-base font-extrabold text-white font-mono">
                {todaySteps.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                /{profile.dailyStepGoal.toLocaleString()}
              </span>
            </ProgressRing>
          </div>

          <div className="w-full flex justify-between items-center text-[11px] pt-2 border-t border-gray-800/80 font-mono text-gray-400">
            <span>{Math.round(stepProgress * 100)}% Goal</span>
            <span className="text-orange-400 font-bold">{todayCalories} kcal</span>
          </div>
        </div>

        {/* Ring 2: Weekly Distance */}
        <div className="p-4 rounded-3xl bg-[#1B2027] border border-gray-800 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-3 left-3 text-[10px] font-bold text-gray-400 uppercase font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" /> Weekly Target
          </div>

          <div className="mt-5 mb-2">
            <ProgressRing
              progress={weekDistanceProgress}
              size={105}
              strokeWidth={9}
              color="#22C55E"
              backgroundColor="#242B35"
            >
              <span className="text-base font-extrabold text-white font-mono">
                {weekDistanceKm.toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                /{profile.weeklyDistanceGoalKm} {unit === 'imperial' ? 'mi' : 'km'}
              </span>
            </ProgressRing>
          </div>

          <div className="w-full flex justify-between items-center text-[11px] pt-2 border-t border-gray-800/80 font-mono text-gray-400">
            <span>{Math.round(weekDistanceProgress * 100)}% Done</span>
            <span className="text-green-400 font-bold">
              {Math.max(0, profile.weeklyDistanceGoalKm - weekDistanceKm).toFixed(1)} left
            </span>
          </div>
        </div>
      </div>

      {/* Quick Start Activity Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase font-mono text-gray-400 tracking-wider">
            Quick Record
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab('record')}
            className="text-xs font-bold text-[#FC4C02] hover:underline flex items-center"
          >
            Open Tracker <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => onStartActivity('run')}
            className="p-3 rounded-2xl bg-[#1B2027] border border-gray-800 hover:border-orange-500/50 flex flex-col items-center gap-1.5 transition active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FC4C02] group-hover:bg-[#FC4C02] group-hover:text-white flex items-center justify-center transition">
              <ActivityIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-200">Run</span>
          </button>

          <button
            type="button"
            onClick={() => onStartActivity('walk')}
            className="p-3 rounded-2xl bg-[#1B2027] border border-gray-800 hover:border-green-500/50 flex flex-col items-center gap-1.5 transition active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/20 text-[#22C55E] group-hover:bg-[#22C55E] group-hover:text-white flex items-center justify-center transition">
              <Footprints className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-200">Walk</span>
          </button>

          <button
            type="button"
            onClick={() => onStartActivity('ride')}
            className="p-3 rounded-2xl bg-[#1B2027] border border-gray-800 hover:border-blue-500/50 flex flex-col items-center gap-1.5 transition active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition">
              <Bike className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-200">Ride</span>
          </button>

          <button
            type="button"
            onClick={() => onStartActivity('hike')}
            className="p-3 rounded-2xl bg-[#1B2027] border border-gray-800 hover:border-amber-500/50 flex flex-col items-center gap-1.5 transition active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-200">Hike</span>
          </button>
        </div>
      </div>

      {/* Last Activity Spotlight Card */}
      {lastActivity && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase font-mono text-gray-400 tracking-wider">
              Latest Workout
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('activities')}
              className="text-xs font-bold text-gray-400 hover:text-white flex items-center"
            >
              All Activities <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            onClick={() => onSelectActivity(lastActivity)}
            className="p-4 rounded-3xl bg-[#1B2027] border border-gray-800 hover:border-gray-700 transition cursor-pointer shadow-md flex flex-col gap-3 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FC4C02]">
                  {lastActivity.type}
                </span>
                <h3 className="font-extrabold text-base text-white group-hover:text-[#FC4C02] transition">
                  {lastActivity.title}
                </h3>
                <p className="text-xs text-gray-400">{formatDate(lastActivity.startTime)}</p>
              </div>

              {/* Route Mini Preview thumbnail */}
              <div className="w-14 h-14 rounded-2xl bg-[#111418] border border-gray-800 flex items-center justify-center overflow-hidden p-1">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M 15 80 Q 50 10 85 40"
                    fill="none"
                    stroke="#FC4C02"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <circle cx="15" cy="80" r="8" fill="#22C55E" />
                  <circle cx="85" cy="40" r="8" fill="#EF4444" />
                </svg>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-800/80 text-center">
              <div>
                <span className="text-[10px] text-gray-400 font-mono block">DISTANCE</span>
                <span className="text-sm font-bold text-white font-mono">
                  {formatDistance(lastActivity.distanceMeters, unit)} {unit === 'imperial' ? 'mi' : 'km'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-mono block">TIME</span>
                <span className="text-sm font-bold text-white font-mono">
                  {formatDuration(lastActivity.movingTimeSeconds)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-mono block">PACE</span>
                <span className="text-sm font-bold text-white font-mono">
                  {formatPace(lastActivity.avgPaceSecondsPerKm, unit)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-mono block">CLIMB</span>
                <span className="text-sm font-bold text-white font-mono">
                  {lastActivity.elevationGainMeters}m
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements & Badges Teaser */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#1B2027] to-[#202730] border border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
            🏆
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">4 Badges Unlocked</h4>
            <p className="text-xs text-gray-400">First 5K, 10K Steps Club, Speed Demon</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('profile')}
          className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition"
        >
          View All
        </button>
      </div>

      {/* Expo Native Native Guide banner */}
      <div className="p-4 rounded-3xl bg-[#161B22] border border-orange-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/20 text-[#FC4C02]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Expo & EAS Build Files Ready</h4>
            <p className="text-[11px] text-gray-400">app.json permissions, background task & EAS commands</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenExpoGuide}
          className="px-3 py-1.5 rounded-xl bg-[#FC4C02] text-white text-xs font-bold active:scale-95 transition"
        >
          View Guide
        </button>
      </div>
    </div>
  );
};
