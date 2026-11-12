import React, { useState } from 'react';
import { Activity, UserProfile } from '../types';
import { LiveRouteMap } from '../components/LiveRouteMap';
import { ElevationSpeedChart } from '../components/ElevationSpeedChart';
import { ShareRouteCard } from '../components/ShareRouteCard';
import { formatDistance, formatDuration, formatPace, formatSpeed, formatDate } from '../utils/formatters';
import { generateGPX, downloadFile } from '../utils/gpx';
import {
  ArrowLeft,
  Share2,
  Download,
  Trash2,
  MapPin,
  Flame,
  Footprints,
  TrendingUp,
  Clock,
  Gauge,
  Lock,
  Edit3,
  Check,
} from 'lucide-react';

interface ActivityDetailScreenProps {
  activity: Activity;
  profile: UserProfile;
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdateActivity: (updated: Activity) => void;
}

export const ActivityDetailScreen: React.FC<ActivityDetailScreenProps> = ({
  activity,
  profile,
  onBack,
  onDelete,
  onUpdateActivity,
}) => {
  const unit = profile.unit;
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>(activity.title);
  const [notesInput, setNotesInput] = useState<string>(activity.notes || '');

  const handleExportGPX = () => {
    const xml = generateGPX(activity);
    const filename = `WayFit-${activity.title.replace(/\s+/g, '_')}.gpx`;
    downloadFile(xml, filename, 'application/gpx+xml');
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    onUpdateActivity({
      ...activity,
      title: titleInput.trim() || activity.title,
      notes: notesInput.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this activity permanently? This action cannot be undone.')) {
      onDelete(activity.id);
      onBack();
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-24 text-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-2xl bg-[#1B2027] border border-gray-800 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Share Image Card button */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            title="Generate Share Card (PNG)"
            className="p-2 rounded-2xl bg-[#1B2027] border border-gray-800 text-[#FC4C02] hover:bg-orange-500/10 transition"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Export GPX button */}
          <button
            type="button"
            onClick={handleExportGPX}
            title="Export standard GPX route file"
            className="p-2 rounded-2xl bg-[#1B2027] border border-gray-800 text-green-400 hover:bg-green-500/10 transition"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={handleDelete}
            title="Delete activity"
            className="p-2 rounded-2xl bg-[#1B2027] border border-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Title & Date */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#FC4C02] uppercase tracking-wider font-mono">
            {activity.type} WORKOUT
          </span>
          <button
            type="button"
            onClick={() => setIsEditingTitle(!isEditingTitle)}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingTitle ? 'Done' : 'Edit'}</span>
          </button>
        </div>

        {isEditingTitle ? (
          <div className="flex flex-col gap-2 mt-1">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#1B2027] border border-orange-500 text-white text-base font-bold focus:outline-none"
            />
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Add workout notes..."
              rows={2}
              className="px-3 py-1.5 rounded-xl bg-[#1B2027] border border-gray-700 text-white text-xs focus:outline-none resize-none"
            />
            <button
              type="button"
              onClick={handleSaveTitle}
              className="self-start px-3 py-1 rounded-lg bg-[#FC4C02] text-white text-xs font-bold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-white tracking-tight">{activity.title}</h1>
            <p className="text-xs text-gray-400">{formatDate(activity.startTime)}</p>
            {activity.notes && (
              <p className="text-xs text-gray-300 bg-[#1B2027] p-2.5 rounded-xl border border-gray-800 mt-2">
                "{activity.notes}"
              </p>
            )}
          </>
        )}
      </div>

      {/* Finished Route Map with Start & End pins */}
      <div className="rounded-3xl overflow-hidden border border-gray-800">
        <LiveRouteMap
          points={activity.points}
          currentPoint={null}
          isRecording={false}
          heightClass="h-72"
          showControls={true}
          interactive={true}
          autoCenter={false}
        />
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-3xl bg-[#1B2027] border border-gray-800 text-center font-mono">
        <div className="p-2.5 rounded-2xl bg-[#111418]">
          <span className="text-[10px] text-gray-400 uppercase block">Distance</span>
          <span className="text-lg font-black text-white block mt-0.5">
            {formatDistance(activity.distanceMeters, unit)}
          </span>
          <span className="text-[10px] text-orange-400 font-bold uppercase">{unit === 'imperial' ? 'mi' : 'km'}</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#111418]">
          <span className="text-[10px] text-gray-400 uppercase block">Moving Time</span>
          <span className="text-lg font-black text-white block mt-0.5">
            {formatDuration(activity.movingTimeSeconds)}
          </span>
          <span className="text-[10px] text-gray-500">
            Total {formatDuration(activity.totalTimeSeconds)}
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#111418]">
          <span className="text-[10px] text-gray-400 uppercase block">Avg Pace</span>
          <span className="text-lg font-black text-white block mt-0.5">
            {formatPace(activity.avgPaceSecondsPerKm, unit)}
          </span>
          <span className="text-[10px] text-gray-500">{unit === 'imperial' ? '/mi' : '/km'}</span>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-4 gap-2 text-center font-mono">
        <div className="p-3 rounded-2xl bg-[#1B2027] border border-gray-800">
          <span className="text-[9px] text-gray-400 uppercase block">Calories</span>
          <span className="text-sm font-bold text-orange-400 block mt-0.5">{activity.calories}</span>
          <span className="text-[8px] text-gray-500">kcal</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#1B2027] border border-gray-800">
          <span className="text-[9px] text-gray-400 uppercase block">Elevation</span>
          <span className="text-sm font-bold text-green-400 block mt-0.5">+{activity.elevationGainMeters}</span>
          <span className="text-[8px] text-gray-500">meters</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#1B2027] border border-gray-800">
          <span className="text-[9px] text-gray-400 uppercase block">Avg Speed</span>
          <span className="text-sm font-bold text-white block mt-0.5">{formatSpeed(activity.avgSpeedKmh, unit)}</span>
          <span className="text-[8px] text-gray-500">{unit === 'imperial' ? 'mph' : 'km/h'}</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#1B2027] border border-gray-800">
          <span className="text-[9px] text-gray-400 uppercase block">Steps</span>
          <span className="text-sm font-bold text-blue-400 block mt-0.5">{activity.steps.toLocaleString()}</span>
          <span className="text-[8px] text-gray-500">steps</span>
        </div>
      </div>

      {/* Speed & Elevation Interactive Profile Charts */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2">
          Performance Charts
        </h3>
        <ElevationSpeedChart points={activity.points} unit={unit} />
      </div>

      {/* Splits Table (if available) */}
      {activity.splits && activity.splits.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#1B2027] border border-gray-800 flex flex-col gap-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-1">
            Kilometer Splits
          </h3>
          <div className="flex flex-col divide-y divide-gray-800/80 font-mono text-xs">
            {activity.splits.map((s) => (
              <div key={s.km} className="flex justify-between items-center py-2">
                <span className="font-bold text-white">KM {s.km}</span>
                <span className="text-orange-400 font-bold">{formatPace(s.paceSecondsPerKm, unit)}</span>
                <span className="text-gray-400">{formatDuration(s.timeSeconds)}</span>
                <span className="text-green-400">+{s.elevationGain}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Route Card Modal */}
      {showShareModal && (
        <ShareRouteCard
          activity={activity}
          unit={unit}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
