import React, { useState } from 'react';
import { Activity, ActivityType, UserProfile } from '../types';
import { formatDistance, formatDuration, formatPace, formatDate } from '../utils/formatters';
import {
  Activity as ActivityIcon,
  Footprints,
  Bike,
  Compass,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  Layers,
} from 'lucide-react';

interface ActivitiesScreenProps {
  activities: Activity[];
  profile: UserProfile;
  onSelectActivity: (activity: Activity) => void;
  onNewActivity: () => void;
}

export const ActivitiesScreen: React.FC<ActivitiesScreenProps> = ({
  activities,
  profile,
  onSelectActivity,
  onNewActivity,
}) => {
  const unit = profile.unit;
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate Totals at the top
  const totalMeters = activities.reduce((acc, a) => acc + a.distanceMeters, 0);
  const totalSeconds = activities.reduce((acc, a) => acc + a.movingTimeSeconds, 0);
  const totalSteps = activities.reduce((acc, a) => acc + a.steps, 0);
  const totalCalories = activities.reduce((acc, a) => acc + a.calories, 0);

  // Filter activities
  const filtered = activities.filter((a) => {
    const matchesType = filterType === 'all' || a.type === filterType;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'run':
        return <ActivityIcon className="w-5 h-5 text-[#FC4C02]" />;
      case 'walk':
        return <Footprints className="w-5 h-5 text-[#22C55E]" />;
      case 'ride':
        return <Bike className="w-5 h-5 text-blue-400" />;
      case 'hike':
        return <Compass className="w-5 h-5 text-amber-400" />;
      default:
        return <ActivityIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-24 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Activity Log</h1>
          <p className="text-xs text-gray-400">All recorded GPS routes and workouts</p>
        </div>
        <button
          type="button"
          onClick={onNewActivity}
          className="px-3.5 py-1.5 rounded-xl bg-[#FC4C02] hover:bg-[#E03E00] text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition"
        >
          + Record
        </button>
      </div>

      {/* Lifetime / Overall Totals Header Box */}
      <div className="p-4 rounded-3xl bg-[#1B2027] border border-gray-800 shadow-md">
        <span className="text-[10px] font-extrabold uppercase font-mono text-gray-400 tracking-wider block mb-2">
          Career Totals
        </span>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-xl bg-[#111418]">
            <span className="text-[10px] text-gray-400 font-mono block">DISTANCE</span>
            <span className="text-sm font-extrabold text-white font-mono block mt-0.5">
              {formatDistance(totalMeters, unit)}
            </span>
            <span className="text-[9px] text-[#FC4C02] font-mono">{unit === 'imperial' ? 'mi' : 'km'}</span>
          </div>

          <div className="p-2 rounded-xl bg-[#111418]">
            <span className="text-[10px] text-gray-400 font-mono block">TIME</span>
            <span className="text-sm font-extrabold text-white font-mono block mt-0.5">
              {Math.floor(totalSeconds / 3600)}h {Math.floor((totalSeconds % 3600) / 60)}m
            </span>
            <span className="text-[9px] text-gray-500 font-mono">moving</span>
          </div>

          <div className="p-2 rounded-xl bg-[#111418]">
            <span className="text-[10px] text-gray-400 font-mono block">STEPS</span>
            <span className="text-sm font-extrabold text-white font-mono block mt-0.5">
              {totalSteps > 1000000 ? `${(totalSteps / 1000000).toFixed(1)}M` : totalSteps.toLocaleString()}
            </span>
            <span className="text-[9px] text-green-400 font-mono">steps</span>
          </div>

          <div className="p-2 rounded-xl bg-[#111418]">
            <span className="text-[10px] text-gray-400 font-mono block">ACTIVITIES</span>
            <span className="text-sm font-extrabold text-white font-mono block mt-0.5">
              {activities.length}
            </span>
            <span className="text-[9px] text-blue-400 font-mono">saved</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1B2027] border border-gray-800 text-white text-xs focus:border-[#FC4C02] focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          {['all', 'run', 'ride', 'walk', 'hike'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl capitalize transition shrink-0 ${
                filterType === type
                  ? 'bg-[#FC4C02] text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#1B2027] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {type === 'all' ? 'All Activities' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List Feed */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#1B2027] border border-gray-800 text-center flex flex-col items-center">
            <Layers className="w-10 h-10 text-gray-600 mb-2" />
            <h3 className="text-sm font-bold text-gray-300">No activities found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              {searchQuery ? 'Try adjusting your search terms.' : 'Record your first route to see it appear here!'}
            </p>
          </div>
        ) : (
          filtered.map((activity) => (
            <div
              key={activity.id}
              onClick={() => onSelectActivity(activity)}
              className="p-4 rounded-3xl bg-[#1B2027] border border-gray-800 hover:border-gray-700 transition cursor-pointer shadow-sm flex flex-col gap-3 group active:scale-[0.99]"
            >
              {/* Top Row: Type, Title, Date */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#111418] border border-gray-800 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white group-hover:text-[#FC4C02] transition">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="capitalize text-orange-400 font-semibold">{activity.type}</span>
                      <span>•</span>
                      <span>{formatDate(activity.startTime)}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition mt-1" />
              </div>

              {/* Metrics Summary Row */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-800/80 text-center font-mono">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Distance</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {formatDistance(activity.distanceMeters, unit)} {unit === 'imperial' ? 'mi' : 'km'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Time</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {formatDuration(activity.movingTimeSeconds)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Pace</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {formatPace(activity.avgPaceSecondsPerKm, unit)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Calories</span>
                  <span className="text-xs font-bold text-orange-400 block mt-0.5">
                    {activity.calories} kcal
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
