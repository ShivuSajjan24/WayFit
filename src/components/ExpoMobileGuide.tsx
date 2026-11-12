import React, { useState } from 'react';
import { Smartphone, Copy, Check, X, Shield, Terminal, FileCode } from 'lucide-react';

interface ExpoMobileGuideProps {
  onClose: () => void;
}

export const ExpoMobileGuide: React.FC<ExpoMobileGuideProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const appJsonCode = `{
  "expo": {
    "name": "WayFit",
    "slug": "wayfit",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#111418"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.wayfit.app",
      "infoPlist": {
        "UIBackgroundModes": ["location", "fetch"],
        "NSLocationWhenInUseUsageDescription": "WayFit needs your location to map your live routes, calculate speed, and record moving pace.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "WayFit requires continuous background location to record your workout when your phone is locked or in your pocket.",
        "NSMotionUsageDescription": "WayFit accesses motion sensors to count your steps, calculate cadence, and automatically detect running vs walking."
      }
    },
    "android": {
      "package": "com.wayfit.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#111418"
      },
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "ACTIVITY_RECOGNITION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION",
        "POST_NOTIFICATIONS",
        "WAKE_LOCK"
      ]
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow WayFit to track your routes in the background.",
          "isAndroidBackgroundLocationEnabled": true,
          "isAndroidForegroundServiceEnabled": true
        }
      ]
    ]
  }
}`;

  const easBuildCode = `# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to your Expo account
eas login

# 3. Configure EAS project
eas build:configure

# 4. Build Android APK directly for local testing
eas build --platform android --profile preview

# 5. Build iOS IPA for TestFlight or AdHoc
eas build --platform ios --profile preview`;

  const backgroundTaskCode = `import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

export const LOCATION_TASK_NAME = 'WAYFIT_BACKGROUND_LOCATION_TASK';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('WayFit Background Task Error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    // Process and append coordinates to SQLite / local storage
  }
});

export async function startBackgroundTracking() {
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.BestForNavigation,
    distanceInterval: 4, // meters
    timeInterval: 2000, // ms
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'WayFit Active Recording',
      notificationBody: 'Recording your route in the background.',
      notificationColor: '#FC4C02',
    },
  });
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-[#1B2027] border border-gray-700 p-6 shadow-2xl flex flex-col text-white animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FC4C02] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">React Native Expo & EAS Build Guide</h2>
              <p className="text-xs text-gray-400">Permissions, app.json, background tasks, and APK/IPA build commands</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Section 1: app.json permissions */}
          <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-white font-mono">app.json (iOS & Android Permissions)</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(appJsonCode, 'appjson')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition"
              >
                {copiedKey === 'appjson' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'appjson' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-gray-300 bg-black/50 p-3 rounded-xl overflow-x-auto max-h-48">
              {appJsonCode}
            </pre>
          </div>

          {/* Section 2: Background Task Engine */}
          <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-white font-mono">expo-task-manager Background Task</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(backgroundTaskCode, 'bgcode')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition"
              >
                {copiedKey === 'bgcode' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'bgcode' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-gray-300 bg-black/50 p-3 rounded-xl overflow-x-auto max-h-40">
              {backgroundTaskCode}
            </pre>
          </div>

          {/* Section 3: EAS Build CLI */}
          <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white font-mono">EAS Build Commands (APK / IPA)</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(easBuildCode, 'eas')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition"
              >
                {copiedKey === 'eas' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'eas' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-gray-300 bg-black/50 p-3 rounded-xl overflow-x-auto">
              {easBuildCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#FC4C02] hover:bg-[#E03E00] text-white font-bold text-xs active:scale-95 transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
