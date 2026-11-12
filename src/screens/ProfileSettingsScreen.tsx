import React, { useState } from 'react';
import { UserProfile, Achievement, Activity } from '../types';
import { exportActivitiesToCSV, downloadFile } from '../utils/gpx';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Settings,
  Shield,
  Download,
  Trash2,
  Sparkles,
  Award,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  Bell,
  Navigation,
  FileSpreadsheet,
  RefreshCw,
  Globe,
  Database,
  LogIn,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

interface ProfileSettingsScreenProps {
  profile: UserProfile;
  achievements: Achievement[];
  activities: Activity[];
  onUpdateProfile: (updated: UserProfile) => void;
  onClearData: () => void;
  onOpenExpoGuide: () => void;
  onOpenUnitTests: () => void;
  onReopenOnboarding: () => void;
  onOpenDeploymentGuide: () => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  profile,
  achievements,
  activities,
  onUpdateProfile,
  onClearData,
  onOpenExpoGuide,
  onOpenUnitTests,
  onReopenOnboarding,
  onOpenDeploymentGuide,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();

  const [name, setName] = useState(profile.name);
  const [weightKg, setWeightKg] = useState(profile.weightKg);
  const [heightCm, setHeightCm] = useState(profile.heightCm);
  const [dailyStepGoal, setDailyStepGoal] = useState(profile.dailyStepGoal);
  const [weeklyDistanceGoalKm, setWeeklyDistanceGoalKm] = useState(profile.weeklyDistanceGoalKm);
  const [unit, setUnit] = useState<'metric' | 'imperial'>(profile.unit);
  const [autoStart, setAutoStart] = useState<boolean>(profile.autoStart);
  const [autoPause, setAutoPause] = useState<boolean>(profile.autoPause);
  const [hideStartEndPoints, setHideStartEndPoints] = useState<boolean>(profile.hideStartEndPoints);
  const [privacyZoneRadiusMeters, setPrivacyZoneRadiusMeters] = useState<number>(profile.privacyZoneRadiusMeters);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'WayFit Athlete',
      weightKg: Number(weightKg) || 70,
      heightCm: Number(heightCm) || 175,
      dailyStepGoal: Number(dailyStepGoal) || 10000,
      weeklyDistanceGoalKm: Number(weeklyDistanceGoalKm) || 25,
      unit,
      autoStart,
      autoPause,
      hideStartEndPoints,
      privacyZoneRadiusMeters,
    };
    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAuthAction = async () => {
    setAuthLoading(true);
    try {
      if (user) {
        await signOutUser();
      } else {
        await signInWithGoogle();
      }
    } catch (e) {
      console.error('Auth action error:', e);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csv = exportActivitiesToCSV(activities);
    downloadFile(csv, `WayFit_Activities_Export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="flex flex-col gap-5 pb-24 text-white">
      {/* Top Profile Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#FC4C02] to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/20 border-2 border-orange-400/40">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-3xl object-cover" />
            ) : profile.name ? (
              profile.name.charAt(0).toUpperCase()
            ) : (
              'W'
            )}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {user?.displayName || profile.name}
            </h1>
            <p className="text-xs text-gray-400 font-mono">
              {user ? user.email : 'Local Athlete'} • {activities.length} Workouts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FC4C02] hover:bg-[#E03E00] text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition"
        >
          <Save className="w-4 h-4" />
          <span>{saveSuccess ? 'Saved!' : 'Save'}</span>
        </button>
      </div>

      {/* Cloud Authentication & Backend Status Card */}
      <div className="p-4 rounded-3xl bg-[#1B2027] border border-gray-800 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white">Cloud SQL & Firebase Sync</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-[10px] font-bold text-green-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>CONNECTED</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-800 text-xs">
          <div>
            <span className="text-gray-300 font-semibold block">
              {user ? `Signed in as ${user.displayName || user.email}` : 'Signed in as Local Guest'}
            </span>
            <span className="text-[11px] text-gray-400">
              Cloud SQL: <span className="text-white font-mono">asia-southeast1</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleAuthAction}
            disabled={authLoading}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
              user
                ? 'bg-gray-800 text-gray-300 hover:text-white'
                : 'bg-[#FC4C02] text-white shadow-md shadow-orange-500/20'
            }`}
          >
            {user ? (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Sign-In</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Developer, Build & Deployment Tools Grid */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onOpenDeploymentGuide}
          className="p-3 rounded-2xl bg-[#1B2027] border border-orange-500/40 hover:border-orange-500 flex flex-col gap-1 text-left transition active:scale-95 group shadow-sm"
        >
          <div className="flex items-center justify-between text-orange-400">
            <Globe className="w-4 h-4" />
            <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold text-white mt-1">Git & Host</span>
          <span className="text-[9px] text-gray-400">Play Store & Web</span>
        </button>

        <button
          type="button"
          onClick={onOpenExpoGuide}
          className="p-3 rounded-2xl bg-[#1B2027] border border-blue-500/40 hover:border-blue-500 flex flex-col gap-1 text-left transition active:scale-95 group shadow-sm"
        >
          <div className="flex items-center justify-between text-blue-400">
            <Sparkles className="w-4 h-4" />
            <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold text-white mt-1">Expo Native</span>
          <span className="text-[9px] text-gray-400">app.json & EAS</span>
        </button>

        <button
          type="button"
          onClick={onOpenUnitTests}
          className="p-3 rounded-2xl bg-[#1B2027] border border-green-500/40 hover:border-green-500 flex flex-col gap-1 text-left transition active:scale-95 group shadow-sm"
        >
          <div className="flex items-center justify-between text-green-400">
            <Award className="w-4 h-4" />
            <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold text-white mt-1">Unit Tests</span>
          <span className="text-[9px] text-gray-400">Haversine & MET</span>
        </button>
      </div>

      {/* Profile & Goals Settings */}
      <div className="p-5 rounded-3xl bg-[#1B2027] border border-gray-800 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase font-mono text-gray-400 tracking-wider">
          <User className="w-4 h-4 text-orange-400" />
          <span>Athlete Profile & Goals</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase font-mono">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-xs focus:border-[#FC4C02] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase font-mono">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-xs focus:border-[#FC4C02] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase font-mono">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-xs focus:border-[#FC4C02] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase font-mono">Daily Step Goal</label>
            <input
              type="number"
              step="500"
              value={dailyStepGoal}
              onChange={(e) => setDailyStepGoal(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-xs focus:border-[#FC4C02] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase font-mono">
              Weekly Dist ({unit === 'imperial' ? 'mi' : 'km'})
            </label>
            <input
              type="number"
              value={weeklyDistanceGoalKm}
              onChange={(e) => setWeeklyDistanceGoalKm(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-xs focus:border-[#FC4C02] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tracking Preferences */}
      <div className="p-5 rounded-3xl bg-[#1B2027] border border-gray-800 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase font-mono text-gray-400 tracking-wider">
          <Settings className="w-4 h-4 text-orange-400" />
          <span>Tracking Preferences</span>
        </div>

        {/* Units Switcher */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-xs font-bold text-white block">Measurement Units</span>
            <span className="text-[11px] text-gray-400">Kilometers (km/h) or Miles (mph)</span>
          </div>
          <div className="flex rounded-xl bg-[#111418] p-1 border border-gray-800">
            <button
              type="button"
              onClick={() => setUnit('metric')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                unit === 'metric' ? 'bg-[#FC4C02] text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Metric (km)
            </button>
            <button
              type="button"
              onClick={() => setUnit('imperial')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                unit === 'imperial' ? 'bg-[#FC4C02] text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Imperial (mi)
            </button>
          </div>
        </div>

        {/* Auto-Start Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-gray-800/80">
          <div>
            <span className="text-xs font-bold text-white block">Auto-Start on Open</span>
            <span className="text-[11px] text-gray-400">Begin recording immediately once GPS locks</span>
          </div>
          <button
            type="button"
            onClick={() => setAutoStart(!autoStart)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              autoStart ? 'bg-[#FC4C02]' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                autoStart ? 'translate-x-6' : 'translate-x-1'
              } top-0.5 absolute`}
            />
          </button>
        </div>

        {/* Auto-Pause Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-gray-800/80">
          <div>
            <span className="text-xs font-bold text-white block">Auto-Pause</span>
            <span className="text-[11px] text-gray-400">Pause timer when stationary for &gt; 10s</span>
          </div>
          <button
            type="button"
            onClick={() => setAutoPause(!autoPause)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              autoPause ? 'bg-[#FC4C02]' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                autoPause ? 'translate-x-6' : 'translate-x-1'
              } top-0.5 absolute`}
            />
          </button>
        </div>
      </div>

      {/* Privacy & Safety (Strava-like privacy zones) */}
      <div className="p-5 rounded-3xl bg-[#1B2027] border border-gray-800 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase font-mono text-gray-400 tracking-wider">
          <Shield className="w-4 h-4 text-green-400" />
          <span>Privacy & Location Safety</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-xs font-bold text-white block">Hide Start & Finish Points</span>
            <span className="text-[11px] text-gray-400">Masks coordinates within radius of home or office</span>
          </div>
          <button
            type="button"
            onClick={() => setHideStartEndPoints(!hideStartEndPoints)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              hideStartEndPoints ? 'bg-[#22C55E]' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                hideStartEndPoints ? 'translate-x-6' : 'translate-x-1'
              } top-0.5 absolute`}
            />
          </button>
        </div>

        {hideStartEndPoints && (
          <div className="flex items-center justify-between pt-1 border-t border-gray-800/80 text-xs">
            <span className="text-gray-400">Privacy Zone Radius</span>
            <select
              value={privacyZoneRadiusMeters}
              onChange={(e) => setPrivacyZoneRadiusMeters(Number(e.target.value))}
              className="bg-[#111418] border border-gray-700 text-white rounded-lg px-2.5 py-1 text-xs"
            >
              <option value={200}>200 meters (~1/8 mi)</option>
              <option value={400}>400 meters (~1/4 mi)</option>
              <option value={800}>800 meters (~1/2 mi)</option>
            </select>
          </div>
        )}
      </div>

      {/* Achievements Gallery */}
      <div className="p-5 rounded-3xl bg-[#1B2027] border border-gray-800 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase font-mono text-gray-400 tracking-wider">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Badges & Achievements</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                ach.unlockedAt
                  ? 'bg-[#111418] border-amber-500/30'
                  : 'bg-[#111418]/50 border-gray-800/80 opacity-60'
              }`}
            >
              <span className="text-2xl">{ach.icon}</span>
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">{ach.title}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5 leading-snug">
                  {ach.description}
                </span>
                {ach.unlockedAt ? (
                  <span className="text-[9px] font-bold text-amber-400 font-mono mt-1 block">
                    ✓ Unlocked
                  </span>
                ) : (
                  <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${Math.round(ach.progress * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export & Reset Actions */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleExportCSV}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#1B2027] hover:bg-gray-800 border border-gray-800 text-xs font-bold text-white flex items-center justify-center gap-2 transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-green-400" />
          <span>Export All Workouts (CSV Spreadsheet)</span>
        </button>

        <button
          type="button"
          onClick={onReopenOnboarding}
          className="w-full py-3 px-4 rounded-2xl bg-[#1B2027] hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" />
          <span>Replay Onboarding & Permissions Tour</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm('Clear all local workouts and reset profile to initial defaults?')) {
              onClearData();
            }
          }}
          className="w-full py-3 px-4 rounded-2xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-xs font-bold text-red-400 flex items-center justify-center gap-2 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete All Data & Reset</span>
        </button>
      </div>
    </div>
  );
};
