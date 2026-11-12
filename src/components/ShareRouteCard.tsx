import React, { useRef } from 'react';
import { Activity } from '../types';
import { formatDistance, formatDuration, formatPace, formatDate } from '../utils/formatters';
import { Download, Share2, X } from 'lucide-react';

interface ShareRouteCardProps {
  activity: Activity;
  unit?: 'metric' | 'imperial';
  onClose: () => void;
}

export const ShareRouteCard: React.FC<ShareRouteCardProps> = ({
  activity,
  unit = 'metric',
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderAndDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350; // 4:5 Instagram / social portrait ratio
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Dark Gradient Background (#111418 to #1B2027)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#111418');
    bgGrad.addColorStop(0.5, '#161B22');
    bgGrad.addColorStop(1, '#0D1014');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle background mesh grid
    ctx.strokeStyle = '#1E2530';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 2. Header Brand
    ctx.fillStyle = '#FC4C02';
    ctx.font = 'bold 44px -apple-system, sans-serif';
    ctx.fillText('WayFit', 80, 110);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('Every step. Every route.', 80, 148);

    // Activity Title & Date
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px -apple-system, sans-serif';
    ctx.fillText(activity.title, 80, 240);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '28px -apple-system, sans-serif';
    ctx.fillText(`${activity.type.toUpperCase()} • ${formatDate(activity.startTime)}`, 80, 285);

    // 3. Draw Route Polyline in the center box
    if (activity.points.length > 1) {
      const minLat = Math.min(...activity.points.map((p) => p.latitude));
      const maxLat = Math.max(...activity.points.map((p) => p.latitude));
      const minLon = Math.min(...activity.points.map((p) => p.longitude));
      const maxLon = Math.max(...activity.points.map((p) => p.longitude));

      const boxX = 80;
      const boxY = 340;
      const boxW = canvas.width - 160;
      const boxH = 480;

      // Draw route boundary card
      ctx.fillStyle = '#1A202A';
      ctx.roundRect(boxX, boxY, boxW, boxH, 24);
      ctx.fill();
      ctx.strokeStyle = '#2B3545';
      ctx.lineWidth = 2;
      ctx.stroke();

      const spanLat = maxLat - minLat || 0.0001;
      const spanLon = maxLon - minLon || 0.0001;
      const pad = 60;

      // Map to canvas
      const mapX = (lon: number) => boxX + pad + ((lon - minLon) / spanLon) * (boxW - pad * 2);
      const mapY = (lat: number) => boxY + boxH - pad - ((lat - minLat) / spanLat) * (boxH - pad * 2);

      // Draw glowing polyline
      ctx.shadowColor = '#FC4C02';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#FC4C02';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      activity.points.forEach((p, idx) => {
        const x = mapX(p.longitude);
        const y = mapY(p.latitude);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // Start marker (Green)
      const startX = mapX(activity.points[0].longitude);
      const startY = mapY(activity.points[0].latitude);
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(startX, startY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();

      // End marker (Red)
      const last = activity.points[activity.points.length - 1];
      const endX = mapX(last.longitude);
      const endY = mapY(last.latitude);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(endX, endY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // 4. Large Telemetry Metric Grid
    const statY = 880;
    const statColW = (canvas.width - 160) / 3;

    // Stat 1: Distance
    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('DISTANCE', 80, statY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px -apple-system, sans-serif';
    const distText = formatDistance(activity.distanceMeters, unit);
    ctx.fillText(distText, 80, statY + 70);

    ctx.fillStyle = '#FC4C02';
    ctx.font = '28px -apple-system, sans-serif';
    ctx.fillText(unit === 'imperial' ? 'mi' : 'km', 80 + ctx.measureText(distText).width + 12, statY + 70);

    // Stat 2: Moving Time
    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('MOVING TIME', 80 + statColW, statY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px -apple-system, sans-serif';
    ctx.fillText(formatDuration(activity.movingTimeSeconds), 80 + statColW, statY + 70);

    // Stat 3: Avg Pace
    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('AVG PACE', 80 + statColW * 2, statY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px -apple-system, sans-serif';
    ctx.fillText(formatPace(activity.avgPaceSecondsPerKm, unit), 80 + statColW * 2, statY + 70);

    // Row 2 stats: Elevation gain, Calories, Steps
    const statY2 = 1060;

    // Elevation
    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('ELEVATION GAIN', 80, statY2);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px -apple-system, sans-serif';
    ctx.fillText(`${activity.elevationGainMeters} m`, 80, statY2 + 60);

    // Calories
    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('CALORIES', 80 + statColW, statY2);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px -apple-system, sans-serif';
    ctx.fillText(`${activity.calories} kcal`, 80 + statColW, statY2 + 60);

    // Steps
    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('STEPS', 80 + statColW * 2, statY2);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px -apple-system, sans-serif';
    ctx.fillText(activity.steps.toLocaleString(), 80 + statColW * 2, statY2 + 60);

    // 5. Footer Watermark
    ctx.fillStyle = '#64748B';
    ctx.font = '22px -apple-system, sans-serif';
    ctx.fillText('Tracked with WayFit App • GPS Verified Route', 80, 1260);

    // Download PNG
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `WayFit-${activity.title.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#1B2027] border border-gray-700 p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FC4C02] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/20">
              W
            </div>
            <span className="font-bold text-white text-base">Share Route Card</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="rounded-2xl bg-[#111418] border border-gray-800 p-4 text-white flex flex-col gap-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-[#FC4C02] tracking-wider uppercase">WayFit</span>
              <h3 className="font-bold text-sm mt-0.5">{activity.title}</h3>
              <p className="text-[11px] text-gray-400">{formatDate(activity.startTime)}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/30">
              {activity.type}
            </span>
          </div>

          {/* Mini Route representation */}
          <div className="w-full h-28 rounded-xl bg-[#1B2027] flex items-center justify-center border border-gray-800 overflow-hidden relative">
            <svg viewBox="0 0 200 80" className="w-full h-full p-2">
              <path
                d="M 20 60 Q 60 10 100 40 T 180 20"
                fill="none"
                stroke="#FC4C02"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="20" cy="60" r="4" fill="#22C55E" />
              <circle cx="180" cy="20" r="4" fill="#EF4444" />
            </svg>
            <span className="absolute bottom-1 right-2 text-[9px] text-gray-500 font-mono">
              {activity.points.length} GPS Points
            </span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-gray-800">
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-mono">Distance</div>
              <div className="text-base font-extrabold text-white">
                {formatDistance(activity.distanceMeters, unit)}
                <span className="text-xs text-orange-400 ml-0.5">{unit === 'imperial' ? 'mi' : 'km'}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-mono">Time</div>
              <div className="text-base font-extrabold text-white">
                {formatDuration(activity.movingTimeSeconds)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-mono">Pace</div>
              <div className="text-base font-extrabold text-white">
                {formatPace(activity.avgPaceSecondsPerKm, unit)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={renderAndDownload}
            className="flex-1 py-3 px-4 rounded-xl bg-[#FC4C02] hover:bg-[#E03E00] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition"
          >
            <Download className="w-4 h-4" />
            Download High-Res Card
          </button>
        </div>
      </div>
    </div>
  );
};
