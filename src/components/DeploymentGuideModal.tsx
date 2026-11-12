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
} from 'lucide-react';

interface DeploymentGuideModalProps {
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'git' | 'hosting' | 'playstore' | 'cloud'>('git');
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

# 3. Create your first commit
git commit -m "feat: complete WayFit fitness tracking app with Cloud SQL & Firebase"

# 4. Create a new repository on GitHub (https://github.com/new)
# Then link your local repository:
git remote add origin https://github.com/YOUR_USERNAME/wayfit-app.git

# 5. Set main branch and push code
git branch -M main
git push -u origin main`;

  const playstoreCommands = `# 1. Install EAS CLI and login with your Expo account
npm install -g eas-cli
eas login

# 2. Configure EAS Build for your WayFit project
eas build:configure

# 3. Build Google Play Store Production Android App Bundle (.aab)
eas build --platform android --profile production

# 4. Optional: Submit directly to Google Play Console via EAS Submit
eas submit --platform android`;

  const cloudRunDeploy = `# Deploy full-stack Node.js + Express + React app to Google Cloud Run:
gcloud run deploy wayfit-app \\
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FC4C02] to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Deploy, Git & Play Store Guide</h2>
              <p className="text-xs text-gray-400">Step-by-step instructions for Git, Web Hosting, and Google Play Store</p>
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
            onClick={() => setActiveTab('git')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'git'
                ? 'bg-[#FC4C02] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-400 hover:text-white bg-[#111418]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>1. Push to Git</span>
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
            <span>2. Web Hosting</span>
          </button>

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
            <span>3. Google Play Store</span>
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
          {/* TAB 1: GIT */}
          {activeTab === 'git' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#111418] border border-gray-800">
                <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-orange-400" />
                  How to Push This Project to GitHub or GitLab
                </h3>
                <p className="text-gray-400 text-xs">
                  Follow these terminal commands on your computer to push the full codebase into your GitHub account.
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

              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-gray-300">
                <span className="font-bold text-orange-400 block mb-1">Tip for Secrets:</span>
                Your database connection variables and Firebase credentials are secure. Do not commit <code className="text-white bg-black/40 px-1 py-0.5 rounded">.env</code> with private passwords; instead use environment variable settings in your hosting platform.
              </div>
            </div>
          )}

          {/* TAB 2: HOSTING */}
          {activeTab === 'hosting' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#111418] border border-gray-800">
                <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <Server className="w-4 h-4 text-green-400" />
                  Web Hosting & Deployment Options
                </h3>
                <p className="text-gray-400 text-xs">
                  This app includes an Express Node backend (<code className="text-white">server.ts</code>) connecting to Cloud SQL PostgreSQL and Firebase Auth.
                </p>
              </div>

              {/* Option A: Google Cloud Run */}
              <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Option A: Google Cloud Run (Recommended for Cloud SQL)</span>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-mono">Near Zero-Latency</span>
                </div>
                <p className="text-gray-400 text-xs">
                  Because your Cloud SQL instance is in <code className="text-white">asia-southeast1</code>, deploying to Cloud Run in the same region allows native Unix socket connections with zero egress latency.
                </p>
                <pre className="text-[11px] font-mono text-gray-300 bg-black/50 p-3 rounded-xl overflow-x-auto">
                  {cloudRunDeploy}
                </pre>
              </div>

              {/* Option B: Vercel / Netlify / Render */}
              <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4 space-y-2">
                <span className="font-bold text-white text-xs block">Option B: Vercel, Netlify, or Render</span>
                <p className="text-gray-400 text-xs">
                  Connect your GitHub repo to Vercel or Render. Set Build Command to <code className="text-white">npm run build</code> and Output Directory to <code className="text-white">dist</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE PLAY STORE */}
          {activeTab === 'playstore' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#111418] border border-gray-800">
                <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  How to Build & Publish to Google Play Store
                </h3>
                <p className="text-gray-400 text-xs">
                  Step-by-step procedure to generate the Google Play production bundle (<code className="text-white">.aab</code>) and submit it to the Google Play Console.
                </p>
              </div>

              {/* Step 1: EAS Build */}
              <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Step 1: Generate Android App Bundle (.aab) with Expo EAS</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(playstoreCommands, 'play')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition"
                  >
                    {copiedKey === 'play' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'play' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-gray-300 bg-black/50 p-3 rounded-xl overflow-x-auto leading-relaxed">
                  {playstoreCommands}
                </pre>
              </div>

              {/* Step 2: Google Play Console */}
              <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4 space-y-2">
                <span className="font-bold text-white text-xs block">Step 2: Google Play Console Setup</span>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-300 text-xs leading-relaxed">
                  <li>Log into <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-orange-400 underline">Google Play Console</a> ($25 one-time registration fee).</li>
                  <li>Click <strong>Create App</strong>: Name: <em>WayFit</em>, Type: <em>App</em>, Free or Paid.</li>
                  <li>Under <strong>App Content</strong>, complete Data Safety and Privacy Policy. WayFit only accesses location during active workouts.</li>
                  <li>Go to <strong>Testing &gt; Internal testing</strong> or <strong>Production</strong>, upload the generated <code className="text-white">.aab</code> file, write release notes, and submit for Google review!</li>
                </ol>
              </div>

              {/* Step 3: Location Disclosure Note */}
              <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/40 text-blue-200">
                <span className="font-bold block mb-1">Important for Google Play Location Review:</span>
                Google requires a prominent in-app disclosure explaining why background location is needed. WayFit already includes this in the Onboarding tour ("WayFit records your GPS route when the screen is locked").
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
                  <div>Firestore Rules: <span className="text-white font-bold">Deployed (ABAC)</span></div>
                  <div>Config: <span className="text-white font-bold">firebase-applet-config.json</span></div>
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
