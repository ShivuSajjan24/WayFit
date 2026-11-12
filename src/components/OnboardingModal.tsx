import React, { useState } from 'react';
import { UserProfile } from '../types';
import { MapPin, Footprints, TrendingUp, ShieldCheck, Bell, Activity as ActivityIcon, ChevronRight, Check } from 'lucide-react';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
  onDismiss: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
  onDismiss,
}) => {
  // Steps: 0 = Intro 1, 1 = Intro 2, 2 = Intro 3, 3 = Permissions, 4 = Profile Setup
  const [step, setStep] = useState<number>(0);

  // Permission states
  const [permLocation, setPermLocation] = useState<boolean>(true);
  const [permMotion, setPermMotion] = useState<boolean>(true);
  const [permNotifications, setPermNotifications] = useState<boolean>(true);

  // Profile setup states
  const [name, setName] = useState(initialProfile.name || '');
  const [weightKg, setWeightKg] = useState(initialProfile.weightKg || 70);
  const [heightCm, setHeightCm] = useState(initialProfile.heightCm || 175);
  const [dailyStepGoal, setDailyStepGoal] = useState(initialProfile.dailyStepGoal || 10000);
  const [weeklyDistanceGoalKm, setWeeklyDistanceGoalKm] = useState(initialProfile.weeklyDistanceGoalKm || 25);
  const [unit, setUnit] = useState<'metric' | 'imperial'>(initialProfile.unit || 'metric');

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      const updated: UserProfile = {
        ...initialProfile,
        name: name.trim() || 'MyWayTrack Runner',
        weightKg: Number(weightKg) || 70,
        heightCm: Number(heightCm) || 175,
        dailyStepGoal: Number(dailyStepGoal) || 10000,
        weeklyDistanceGoalKm: Number(weeklyDistanceGoalKm) || 25,
        unit,
        onboardingCompleted: true,
      };
      onComplete(updated);
    }
  };

  const requestBrowserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setPermLocation(true),
        () => setPermLocation(false)
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-[#1B2027] border border-gray-700 p-6 shadow-2xl flex flex-col justify-between min-h-[520px] text-white animate-fade-in relative overflow-hidden">
        
        {/* Step indicator dots */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FC4C02] flex items-center justify-center text-white font-black text-xs shadow-md shadow-orange-500/20">
              M
            </div>
            <span className="text-xs font-bold text-gray-300">MyWayTrack Setup</span>
          </div>

          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-[#FC4C02]' : s < step ? 'w-2 bg-[#22C55E]' : 'w-2 bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 0: Intro 1 - Track Routes */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center my-auto py-4">
            <div className="w-24 h-24 rounded-3xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/10">
              <MapPin className="w-12 h-12 text-[#FC4C02]" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Track Every Route</h2>
            <p className="text-gray-400 text-sm mt-3 max-w-xs leading-relaxed">
              High-precision GPS route mapping with live speed, pace, elevation profile, and automatic activity detection for walks, runs, and rides.
            </p>
          </div>
        )}

        {/* STEP 1: Intro 2 - Count Steps */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center my-auto py-4">
            <div className="w-24 h-24 rounded-3xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6 shadow-lg shadow-green-500/10">
              <Footprints className="w-12 h-12 text-[#22C55E]" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Count Every Step</h2>
            <p className="text-gray-400 text-sm mt-3 max-w-xs leading-relaxed">
              Hardware pedometer tracking, cadence metrics, and intelligent stride length estimation to measure every calorie and pace shift.
            </p>
          </div>
        )}

        {/* STEP 2: Intro 3 - See Your Progress */}
        {step === 2 && (
          <div className="flex flex-col items-center text-center my-auto py-4">
            <div className="w-24 h-24 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10">
              <TrendingUp className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">See Your Progress</h2>
            <p className="text-gray-400 text-sm mt-3 max-w-xs leading-relaxed">
              Streaks, weekly goals, badges, personal bests, and offline-first storage to keep your fitness momentum unstoppable.
            </p>
          </div>
        )}

        {/* STEP 3: Permissions Explanation & Granting */}
        {step === 3 && (
          <div className="flex flex-col my-auto py-2">
            <h2 className="text-xl font-extrabold text-white mb-1">Permissions & Privacy</h2>
            <p className="text-gray-400 text-xs mb-4">
              MyWayTrack strictly respects your data. Location is never recorded secretly or without your active control.
            </p>

            <div className="flex flex-col gap-3">
              {/* Permission 1: Location */}
              <div
                onClick={requestBrowserLocation}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#111418] border border-gray-800 hover:border-gray-700 cursor-pointer transition"
              >
                <div className="p-2 rounded-xl bg-orange-500/20 text-[#FC4C02] mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Location Access</span>
                    <span className="text-[11px] font-semibold text-green-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Records GPS route, distance, and live pace while tracking is active.
                  </p>
                </div>
              </div>

              {/* Permission 2: Motion */}
              <div
                onClick={() => setPermMotion(!permMotion)}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#111418] border border-gray-800 hover:border-gray-700 cursor-pointer transition"
              >
                <div className="p-2 rounded-xl bg-green-500/20 text-[#22C55E] mt-0.5">
                  <ActivityIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Motion & Sensors</span>
                    <span className="text-[11px] font-semibold text-green-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Enabled
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Enables hardware pedometer steps and automatic walk/run detection.
                  </p>
                </div>
              </div>

              {/* Permission 3: Notifications */}
              <div
                onClick={() => setPermNotifications(!permNotifications)}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#111418] border border-gray-800 hover:border-gray-700 cursor-pointer transition"
              >
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Notifications</span>
                    <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Active
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Alerts for split intervals, auto-pause events, and goal completions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Profile Setup */}
        {step === 4 && (
          <div className="flex flex-col my-auto py-2">
            <h2 className="text-xl font-extrabold text-white mb-1">Set Up Your Profile</h2>
            <p className="text-gray-400 text-xs mb-4">
              Used for precise calorie calculation (MET formula) and personal goal rings.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-gray-300 uppercase font-mono">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-sm focus:border-[#FC4C02] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase font-mono">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-sm focus:border-[#FC4C02] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase font-mono">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-sm focus:border-[#FC4C02] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase font-mono">Daily Step Goal</label>
                <input
                  type="number"
                  step="500"
                  value={dailyStepGoal}
                  onChange={(e) => setDailyStepGoal(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-sm focus:border-[#FC4C02] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase font-mono">Weekly Dist ({unit === 'imperial' ? 'mi' : 'km'})</label>
                <input
                  type="number"
                  value={weeklyDistanceGoalKm}
                  onChange={(e) => setWeeklyDistanceGoalKm(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111418] border border-gray-700 text-white text-sm focus:border-[#FC4C02] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-2"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs font-semibold text-gray-500 hover:text-gray-300 px-3 py-2"
            >
              Skip
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 py-3 px-6 rounded-xl bg-[#FC4C02] hover:bg-[#E03E00] text-white font-bold text-xs shadow-lg shadow-orange-500/25 active:scale-95 transition"
          >
            <span>{step === 4 ? 'Get Started' : 'Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
