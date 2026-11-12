/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity, UserProfile, Achievement, ActivityType } from './types';
import { StorageService, DEFAULT_PROFILE } from './services/storage';
import { AuthProvider } from './context/AuthContext';
import { HomeScreen } from './screens/HomeScreen';
import { RecordScreen } from './screens/RecordScreen';
import { ActivitiesScreen } from './screens/ActivitiesScreen';
import { ActivityDetailScreen } from './screens/ActivityDetailScreen';
import { ProfileSettingsScreen } from './screens/ProfileSettingsScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { ExpoMobileGuide } from './components/ExpoMobileGuide';
import { UnitTestModal } from './components/UnitTestModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import {
  Home,
  Radio,
  History,
  User,
  Smartphone,
  Award,
  Sun,
  Moon,
  Globe,
  Database,
} from 'lucide-react';

function AppContent() {
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [activities, setActivities] = useState<Activity[]>(StorageService.getActivities());
  const [achievements, setAchievements] = useState<Achievement[]>(StorageService.getAchievements());

  // Navigation tab: 'home' | 'record' | 'activities' | 'profile'
  const [currentTab, setCurrentTab] = useState<'home' | 'record' | 'activities' | 'profile'>('home');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [initialRecordType, setInitialRecordType] = useState<ActivityType>('run');

  // Modals
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!profile.onboardingCompleted);
  const [showExpoGuide, setShowExpoGuide] = useState<boolean>(false);
  const [showUnitTests, setShowUnitTests] = useState<boolean>(false);
  const [showDeploymentGuide, setShowDeploymentGuide] = useState<boolean>(false);
  const [mobileFrameMode, setMobileFrameMode] = useState<boolean>(false);

  const isDark = profile.theme === 'dark';

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    StorageService.saveProfile(updated);
  };

  const handleSaveActivity = (newActivity: Activity) => {
    const updatedList = StorageService.saveActivity(newActivity);
    setActivities(updatedList);
    setAchievements(StorageService.getAchievements());
    setSelectedActivity(newActivity);
  };

  const handleDeleteActivity = (id: string) => {
    const updated = StorageService.deleteActivity(id);
    setActivities(updated);
  };

  const handleUpdateActivity = (updated: Activity) => {
    const list = StorageService.saveActivity(updated);
    setActivities(list);
    setSelectedActivity(updated);
  };

  const handleClearAllData = () => {
    StorageService.clearAllData();
    setProfile(DEFAULT_PROFILE);
    setActivities([]);
    setAchievements(StorageService.getAchievements());
    setSelectedActivity(null);
    setCurrentTab('home');
  };

  const handleQuickStart = (type: ActivityType) => {
    setInitialRecordType(type);
    setSelectedActivity(null);
    setCurrentTab('record');
  };

  const toggleTheme = () => {
    handleUpdateProfile({
      ...profile,
      theme: profile.theme === 'dark' ? 'light' : 'dark',
    });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#111418] text-[#F2F4F7]' : 'bg-gray-100 text-gray-900'} font-sans antialiased flex flex-col items-center justify-start`}>
      {/* Top Desktop Helper Bar (Mobile Frame Toggle & Quick Actions) */}
      <header className="w-full bg-[#161B22] border-b border-gray-800 px-4 py-2 flex items-center justify-between text-xs z-30">
        <div className="flex items-center gap-2.5">
          {/* Logo Pin */}
          <div className="w-6 h-6 rounded-lg bg-[#FC4C02] flex items-center justify-center text-white font-black text-xs shadow-sm shadow-orange-500/20">
            M
          </div>
          <span className="font-extrabold tracking-tight text-white">MyWayTrack</span>
          <span className="text-gray-400 hidden sm:inline">• Cloud SQL & Firebase Connected</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Deploy, Git & Play Store Guide */}
          <button
            type="button"
            onClick={() => setShowDeploymentGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/20 border border-orange-500/50 text-orange-400 hover:bg-orange-500/30 font-bold transition shadow-sm"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Deploy & Git Hub</span>
          </button>

          {/* Expo Native Guide button */}
          <button
            type="button"
            onClick={() => setShowExpoGuide(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-400 hover:bg-blue-500/25 font-semibold transition"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expo Native</span>
          </button>

          {/* Unit tests button */}
          <button
            type="button"
            onClick={() => setShowUnitTests(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/40 text-green-400 hover:bg-green-500/25 font-semibold transition"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unit Tests</span>
          </button>

          {/* Mobile frame bezel toggle */}
          <button
            type="button"
            onClick={() => setMobileFrameMode(!mobileFrameMode)}
            title="Toggle phone frame mockup view"
            className={`p-1.5 rounded-lg border transition ${
              mobileFrameMode
                ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition"
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </header>

      {/* Main Container / Mobile Device Mockup */}
      <main
        className={`w-full flex-1 transition-all duration-300 flex flex-col ${
          mobileFrameMode
            ? 'max-w-[420px] my-4 rounded-[40px] border-[10px] border-[#2A313C] shadow-2xl overflow-hidden min-h-[820px] max-h-[880px] relative bg-[#111418]'
            : 'max-w-md mx-auto px-4'
        }`}
      >
        {/* Mobile speaker notch when in frame mode */}
        {mobileFrameMode && (
          <div className="w-full flex justify-center py-2 bg-[#111418] shrink-0 z-20">
            <div className="w-24 h-4 rounded-full bg-[#1B2027] border border-gray-800 flex items-center justify-center">
              <div className="w-8 h-1.5 rounded-full bg-gray-700" />
            </div>
          </div>
        )}

        {/* Screen View Area */}
        <div className={`flex-1 overflow-y-auto ${mobileFrameMode ? 'px-4' : 'pt-2'}`}>
          {selectedActivity ? (
            <ActivityDetailScreen
              activity={selectedActivity}
              profile={profile}
              onBack={() => setSelectedActivity(null)}
              onDelete={handleDeleteActivity}
              onUpdateActivity={handleUpdateActivity}
            />
          ) : currentTab === 'home' ? (
            <HomeScreen
              profile={profile}
              activities={activities}
              achievements={achievements}
              onStartActivity={handleQuickStart}
              onSelectActivity={(act) => setSelectedActivity(act)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenExpoGuide={() => setShowExpoGuide(true)}
            />
          ) : currentTab === 'record' ? (
            <RecordScreen
              profile={profile}
              initialActivityType={initialRecordType}
              onSaveActivity={handleSaveActivity}
              onDiscard={() => setCurrentTab('home')}
            />
          ) : currentTab === 'activities' ? (
            <ActivitiesScreen
              activities={activities}
              profile={profile}
              onSelectActivity={(act) => setSelectedActivity(act)}
              onNewActivity={() => setCurrentTab('record')}
            />
          ) : (
            <ProfileSettingsScreen
              profile={profile}
              achievements={achievements}
              activities={activities}
              onUpdateProfile={handleUpdateProfile}
              onClearData={handleClearAllData}
              onOpenExpoGuide={() => setShowExpoGuide(true)}
              onOpenUnitTests={() => setShowUnitTests(true)}
              onReopenOnboarding={() => setShowOnboarding(true)}
              onOpenDeploymentGuide={() => setShowDeploymentGuide(true)}
            />
          )}
        </div>

        {/* Bottom Floating Mobile Tab Navigation Bar */}
        {!selectedActivity && (
          <nav
            className={`${
              mobileFrameMode ? 'absolute bottom-0 left-0 right-0' : 'fixed bottom-0 left-0 right-0 max-w-md mx-auto'
            } z-40 px-3 pb-3 pt-1 pointer-events-none`}
          >
            <div className="pointer-events-auto bg-[#1B2027]/95 backdrop-blur-xl border border-gray-800/90 rounded-3xl p-1.5 shadow-2xl flex items-center justify-around">
              {/* Tab 1: Home */}
              <button
                type="button"
                onClick={() => {
                  setSelectedActivity(null);
                  setCurrentTab('home');
                }}
                className={`flex-1 py-2 flex flex-col items-center gap-1 rounded-2xl transition ${
                  currentTab === 'home' ? 'text-[#FC4C02]' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-bold">Home</span>
              </button>

              {/* Tab 2: Record (Center prominent button) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedActivity(null);
                  setCurrentTab('record');
                }}
                className={`flex-1 py-2 flex flex-col items-center gap-1 rounded-2xl transition ${
                  currentTab === 'record' ? 'text-[#FC4C02]' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div
                  className={`w-10 h-10 -mt-5 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    currentTab === 'record'
                      ? 'bg-[#FC4C02] text-white shadow-orange-500/40 ring-4 ring-[#111418]'
                      : 'bg-[#242B35] text-orange-400 border border-orange-500/40 ring-4 ring-[#111418]'
                  }`}
                >
                  <Radio className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Record</span>
              </button>

              {/* Tab 3: Activities */}
              <button
                type="button"
                onClick={() => {
                  setSelectedActivity(null);
                  setCurrentTab('activities');
                }}
                className={`flex-1 py-2 flex flex-col items-center gap-1 rounded-2xl transition ${
                  currentTab === 'activities' ? 'text-[#FC4C02]' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <History className="w-5 h-5" />
                <span className="text-[10px] font-bold">History</span>
              </button>

              {/* Tab 4: Profile / Settings */}
              <button
                type="button"
                onClick={() => {
                  setSelectedActivity(null);
                  setCurrentTab('profile');
                }}
                className={`flex-1 py-2 flex flex-col items-center gap-1 rounded-2xl transition ${
                  currentTab === 'profile' ? 'text-[#FC4C02]' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-bold">You</span>
              </button>
            </div>
          </nav>
        )}
      </main>

      {/* Onboarding & Permissions Tour Modal */}
      {showOnboarding && (
        <OnboardingModal
          initialProfile={profile}
          onComplete={(updated) => {
            handleUpdateProfile(updated);
            setShowOnboarding(false);
          }}
          onDismiss={() => {
            handleUpdateProfile({ ...profile, onboardingCompleted: true });
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Deployment, Git & Play Store Guide Modal */}
      {showDeploymentGuide && <DeploymentGuideModal onClose={() => setShowDeploymentGuide(false)} />}

      {/* Expo Native Guide & EAS Build Modal */}
      {showExpoGuide && <ExpoMobileGuide onClose={() => setShowExpoGuide(false)} />}

      {/* Unit Tests Modal */}
      {showUnitTests && <UnitTestModal onClose={() => setShowUnitTests(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
