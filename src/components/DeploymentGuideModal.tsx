import React, { useState } from 'react';
import {
  Globe,
  GitBranch,
  Smartphone,
  Database,
  Flame,
  Check,
  Copy,
  X,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Server,
  FileText,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface DeploymentGuideModalProps {
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'playstore' | 'git' | 'hosting' | 'cloud'>('playstore');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const gitCommands = `# 1. Initialize local Git repository (if not already initialized)
git init

# 2. Stage all files (respecting .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: complete MyWayTrack fitness tracking app with Cloud SQL & Firebase"

# 4. Create a new repository on GitHub (https://github.com/new)
# Then link your local repository:
git remote add origin https://github.com/YOUR_USERNAME/mywaytrack-app.git

# 5. Set main branch and push code
git branch -M main
git push -u origin main`;

  const playstoreCommands = `# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Log in with your Expo account
eas login

# 3. Configure EAS Build for MyWayTrack
eas build:configure

# 4. Build Production Google Play Store Android App Bundle (.aab)
eas build --platform android --profile production

# 5. Optional: Submit directly to Google Play Console via EAS Submit
eas submit --platform android`;

  const storeListingDescription = `App Name: MyWayTrack - Every step. Every route.
Short Description (under 80 chars):
Track your walks, runs, and rides with live GPS, telemetry, and progress rings.

Full Description:
MyWayTrack is a modern, high-precision GPS route and fitness tracking app built for runners, walkers, cyclists, and outdoor enthusiasts.

KEY FEATURES:
• Real-Time GPS Route Mapping: High-precision orange route polyline, live speed, elevation profile, and cadence.
• Auto-Tracking & Activity Detection: Automatically classifies walks, runs, cycling, and travel with auto-pause when stationary.
• Outdoor-Optimized Telemetry: High-contrast HUD showing distance, moving time, current and average pace, speed, elevation climb, and MET calories.
• Pedometer & Goals: Daily step progress ring, weekly distance goal, streaks, and milestone badges.
• Activity History & Performance Charts: Detailed route recap, kilometer split breakdowns, speed-over-time charts, and GPX file export.
• Privacy Zones: Protect your home address by masking the starting and ending 400m of your routes.
• Cloud Sync: Secure storage with Cloud SQL and Firebase.

Privacy & Safety:
MyWayTrack only accesses GPS location during active workout recording. Your location is never tracked secretly or sold to advertisers.`;

  const privacyPolicySnippet = `MyWayTrack Privacy Policy Summary:
1. Data Collected: Precise GPS Location and motion sensor data solely while recording an activity.
2. Purpose: Calculate distance, pace, elevation gain, and draw your route map.
3. Storage: Data is stored securely in your user account using Google Cloud SQL and Firebase Firestore.
4. Privacy Zones: Users can enable privacy masking to hide routes within a custom radius of home or work.
5. Deletion: You can export or permanently delete your workouts and profile at any time in App Settings.`;

  const cloudRunDeploy = `# Deploy full-stack Node.js + Express + React app to Google Cloud Run:
gcloud run deploy mywaytrack-app \\
  --source . \\
  --region asia-southeast1 \\
  --allow-unauthenticated \\
  --port 3000`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-[#1B2027] border border-gray-700 p-6 shadow-2xl flex flex-col text-white animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FC4C02] to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 font-black text-lg">
              M
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Publish MyWayTrack to Google Play Store</h2>
              <p className="text-xs text-gray-400">Complete release guide, EAS Build commands, and Google Play Console checklist</p>
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

        {/* Tab switcher */}
        <div className="flex gap-2 pt-3 pb-2 border-b border-gray-800/80 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('playstore')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'playstore'
                ? 'bg-[#FC4C02] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-400 hover:text-white bg-[#111418]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1. Google Play Store</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('git')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'git'
                ? 'bg-[#FC4C02] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-400 hover:text-white bg-[#111418]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>2. Push to Git</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hosting')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'hosting'
                ? 'bg-[#FC4C02] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-400 hover:text-white bg-[#111418]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>3. Web Hosting</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'cloud'
                ? 'bg-[#FC4C02] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-400 hover:text-white bg-[#111418]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Connected Services</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs text-gray-300">
          {/* TAB 1: GOOGLE PLAY STORE PUBLISHING */}
          {activeTab === 'playstore' && (
            <div className="space-y-4">
              {/* Overview Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/15 to-transparent border border-orange-500/30">
                <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  Publishing MyWayTrack to Google Play: Step-by-Step
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  To release <strong>MyWayTrack</strong> on Android devices worldwide via Google Play Store, follow these 5 core milestones.
                </p>
              </div>

              {/* Step 1: Developer Account */}
              <div className="p-4 rounded-2xl bg-[#111418] border border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-[#FC4C02] flex items-center justify-center text-white text-[11px] font-bold">1</span>
                  <span>Set Up Google Play Developer Account</span>
                </div>
                <p className="text-gray-400 text-xs">
                  Go to <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-orange-400 underline font-semibold">play.google.com/console</a> and register a Developer account ($25 one-time fee). Verify your identity with government ID.
                </p>
              </div>

              {/* Step 2: Build AAB via EAS */}
              <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#FC4C02] flex items-center justify-center text-white text-[11px] font-bold">2</span>
                    <span>Generate Android App Bundle (.aab) with EAS Build</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(playstoreCommands, 'play')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition"
                  >
                    {copiedKey === 'play' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'play' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <p className="text-gray-400 text-xs">
                  Run these commands in your project directory. Expo EAS automatically manages your keystore signing credentials and outputs a Google Play-compliant <code className="text-white">.aab</code> file:
                </p>
                <pre className="text-[11px] font-mono text-gray-300 bg-black/50 p-3 rounded-xl overflow-x-auto leading-relaxed">
                  {playstoreCommands}
                </pre>
              </div>

              {/* Step 3: Play Console Store Listing Metadata */}
              <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#FC4C02] flex items-center justify-center text-white text-[11px] font-bold">3</span>
                    <span>Store Listing Details (Ready to Copy)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(storeListingDescription, 'storelisting')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition"
                  >
                    {copiedKey === 'storelisting' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'storelisting' ? 'Copied' : 'Copy Listing Text'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-black/40 p-3 rounded-xl">
                  <div>Package Name: <span className="text-orange-400 font-bold">com.mywaytrack.app</span></div>
                  <div>Category: <span className="text-white font-bold">Health & Fitness</span></div>
                  <div>Content Rating: <span className="text-white font-bold">Everyone (3+)</span></div>
                  <div>Pricing: <span className="text-white font-bold">Free</span></div>
                </div>
                <pre className="text-[10px] font-mono text-gray-300 bg-black/50 p-3 rounded-xl overflow-x-auto max-h-36">
                  {storeListingDescription}
                </pre>
              </div>

              {/* Step 4: Location Permissions & Data Safety Questionnaire */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/40 space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[11px] font-bold">4</span>
                  <span>Google Play Location & Data Safety Declaration</span>
                </div>
                <p className="text-blue-100 text-xs leading-relaxed">
                  Because fitness apps record routes in the background while the phone is locked, Google requires specific questionnaire answers:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-[11px] pl-1">
                  <li><strong>Location Purpose</strong>: Choose <em>App Functionality (Fitness Tracking)</em>.</li>
                  <li><strong>Background Location Declaration</strong>: Provide a 15-second screen recording showing: tapping Start Workout $\to$ turning off screen $\to$ turning on screen with route preserved.</li>
                  <li><strong>Prominent In-App Disclosure</strong>: MyWayTrack already includes this in the initial Onboarding screen.</li>
                </ul>

                <div className="mt-2 pt-2 border-t border-blue-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-300">Privacy Policy Template</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(privacyPolicySnippet, 'privacy')}
                    className="text-[10px] bg-blue-900/60 hover:bg-blue-800 text-blue-200 px-2 py-0.5 rounded font-mono"
                  >
                    {copiedKey === 'privacy' ? 'Copied Policy!' : 'Copy Privacy Text'}
                  </button>
                </div>
              </div>

              {/* Step 5: Testing Tracks & Rollout */}
              <div className="p-4 rounded-2xl bg-[#111418] border border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-[#FC4C02] flex items-center justify-center text-white text-[11px] font-bold">5</span>
                  <span>Upload .aab & Rollout on Play Console</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-gray-300 text-xs">
                  <li>In Play Console, go to <strong>Release &gt; Production</strong> (or <strong>Internal Testing</strong> for instant team test).</li>
                  <li>Click <strong>Create New Release</strong>, drag and drop the <code className="text-white">.aab</code> file built by EAS.</li>
                  <li>Add release notes: <em>"Initial release of MyWayTrack: GPS route mapping, auto-tracking, and progress rings."</em></li>
                  <li>Click <strong>Review Release</strong> &gt; <strong>Start rollout to Production</strong>! Google review usually takes 24–48 hours.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: GIT */}
          {activeTab === 'git' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#111418] border border-gray-800">
                <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-orange-400" />
                  How to Push MyWayTrack to GitHub / GitLab
                </h3>
                <p className="text-gray-400 text-xs">
                  Use these standard Git commands to push your project to a remote Git repository.
                </p>
              </div>

              <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase font-mono">Terminal Commands</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(gitCommands, 'git')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition"
                  >
                    {copiedKey === 'git' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'git' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-gray-300 bg-black/50 p-3 rounded-xl overflow-x-auto leading-relaxed">
                  {gitCommands}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: HOSTING */}
          {activeTab === 'hosting' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#111418] border border-gray-800">
                <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <Server className="w-4 h-4 text-green-400" />
                  Web Hosting & Deployment Options
                </h3>
                <p className="text-gray-400 text-xs">
                  Deploy MyWayTrack full-stack with Cloud SQL backend in region <code className="text-white">asia-southeast1</code>.
                </p>
              </div>

              <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Google Cloud Run (Recommended for Cloud SQL)</span>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-mono">Zero Egress</span>
                </div>
                <pre className="text-[11px] font-mono text-gray-300 bg-black/50 p-3 rounded-xl overflow-x-auto">
                  {cloudRunDeploy}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTED CLOUD STATUS */}
          {activeTab === 'cloud' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#111418] border border-green-500/40 space-y-2">
                <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                  <Check className="w-5 h-5" />
                  <span>Cloud SQL PostgreSQL: Active & Configured</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-gray-300">
                  <div>Region: <span className="text-white font-bold">asia-southeast1</span></div>
                  <div>Instance: <span className="text-white font-bold">ai-studio-110f575c</span></div>
                  <div>Tables: <span className="text-white font-bold">users, activities</span></div>
                  <div>Driver: <span className="text-white font-bold">pg + Drizzle ORM</span></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#111418] border border-orange-500/40 space-y-2">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                  <Flame className="w-5 h-5" />
                  <span>Firebase Services: Active & Provisioned</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-gray-300">
                  <div>Project ID: <span className="text-white font-bold">argon-oxide-wxq1s</span></div>
                  <div>Auth: <span className="text-white font-bold">Google Sign-In</span></div>
                  <div>Firestore DB: <span className="text-white font-bold">ai-studio-wayfit-110f575c...</span></div>
                  <div>Rules: <span className="text-white font-bold">Deployed (ABAC)</span></div>
                </div>
              </div>
            </div>
          )}
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
