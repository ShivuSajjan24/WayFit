import React, { useState } from 'react';
import { LocationPoint } from '../types';
import { calculateDistance } from '../utils/haversine';
import { formatDuration, formatSpeed } from '../utils/formatters';

interface ElevationSpeedChartProps {
  points: LocationPoint[];
  unit?: 'metric' | 'imperial';
}

export const ElevationSpeedChart: React.FC<ElevationSpeedChartProps> = ({
  points,
  unit = 'metric',
}) => {
  const [activeTab, setActiveTab] = useState<'elevation' | 'speed'>('speed');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <div className="w-full h-36 flex items-center justify-center rounded-xl bg-[#1B2027] border border-gray-800 text-gray-500 text-xs">
        Not enough GPS points to render chart
      </div>
    );
  }

  // Pre-process points: calculate cumulative distance and filter invalid elevation/speed
  let totalDist = 0;
  const processedData = points.map((pt, idx) => {
    if (idx > 0) {
      const prev = points[idx - 1];
      totalDist += calculateDistance(prev.latitude, prev.longitude, pt.latitude, pt.longitude);
    }
    const speedKmh = pt.speed != null ? Math.max(0, pt.speed * 3.6) : 0;
    const altitude = pt.altitude != null ? pt.altitude : 0;

    return {
      distanceMeters: totalDist,
      timeMs: pt.timestamp - points[0].timestamp,
      speedKmh,
      altitude,
    };
  });

  const width = 600;
  const height = 140;
  const padding = { top: 15, right: 15, bottom: 25, left: 35 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Values based on active tab
  const isSpeed = activeTab === 'speed';
  const values = processedData.map((d) => (isSpeed ? d.speedKmh : d.altitude));
  const minVal = Math.max(0, Math.min(...values));
  const maxVal = Math.max(isSpeed ? 12 : 50, Math.max(...values) * 1.15);

  const getX = (index: number) => {
    return padding.left + (index / (processedData.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    if (maxVal === minVal) return padding.top + chartHeight / 2;
    const norm = (val - minVal) / (maxVal - minVal);
    return padding.top + chartHeight - norm * chartHeight;
  };

  // Generate SVG path points
  const pathD = processedData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(isSpeed ? d.speedKmh : d.altitude).toFixed(1)}`)
    .join(' ');

  const areaD = `${pathD} L ${getX(processedData.length - 1).toFixed(1)} ${(padding.top + chartHeight).toFixed(1)} L ${getX(0).toFixed(1)} ${(padding.top + chartHeight).toFixed(1)} Z`;

  const activeColor = isSpeed ? '#FC4C02' : '#22C55E';
  const gradientId = isSpeed ? 'speedGradient' : 'elevGradient';

  const hoverItem = hoverIndex !== null && processedData[hoverIndex] ? processedData[hoverIndex] : null;

  return (
    <div className="w-full rounded-2xl bg-[#1B2027] border border-gray-800 p-4 shadow-sm">
      {/* Header with Switcher */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('speed');
              setHoverIndex(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              isSpeed
                ? 'bg-orange-500/20 text-[#FC4C02] border border-orange-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Speed ({unit === 'imperial' ? 'mph' : 'km/h'})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('elevation');
              setHoverIndex(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              !isSpeed
                ? 'bg-green-500/20 text-[#22C55E] border border-green-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Elevation (m)
          </button>
        </div>

        {/* Live Hover Info or Max Summary */}
        <div className="text-right">
          {hoverItem ? (
            <div className="text-xs font-mono">
              <span className="text-white font-bold">
                {isSpeed ? `${formatSpeed(hoverItem.speedKmh, unit)} ${unit === 'imperial' ? 'mph' : 'km/h'}` : `${Math.round(hoverItem.altitude)} m`}
              </span>
              <span className="text-gray-400 ml-2">@ {formatDuration(hoverItem.timeMs / 1000)}</span>
            </div>
          ) : (
            <div className="text-xs text-gray-400 font-mono">
              Peak: <span className="text-white font-semibold">{isSpeed ? formatSpeed(maxVal / 1.15, unit) : Math.round(maxVal / 1.15)}</span> {isSpeed ? (unit === 'imperial' ? 'mph' : 'km/h') : 'm'}
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            const clampedX = Math.max(padding.left, Math.min(width - padding.right, relX));
            const normX = (clampedX - padding.left) / chartWidth;
            const idx = Math.min(
              processedData.length - 1,
              Math.max(0, Math.round(normX * (processedData.length - 1)))
            );
            setHoverIndex(idx);
          }}
          onTouchMove={(e) => {
            if (e.touches.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = ((e.touches[0].clientX - rect.left) / rect.width) * width;
              const clampedX = Math.max(padding.left, Math.min(width - padding.right, relX));
              const normX = (clampedX - padding.left) / chartWidth;
              const idx = Math.min(
                processedData.length - 1,
                Math.max(0, Math.round(normX * (processedData.length - 1)))
              );
              setHoverIndex(idx);
            }
          }}
        >
          <defs>
            <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FC4C02" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FC4C02" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="#2D3748"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartHeight / 2}
            x2={width - padding.right}
            y2={padding.top + chartHeight / 2}
            stroke="#2D3748"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            stroke="#2D3748"
            strokeWidth="1"
          />

          {/* Area fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={activeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover indicator */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + chartHeight}
                stroke="#F2F4F7"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(isSpeed ? processedData[hoverIndex].speedKmh : processedData[hoverIndex].altitude)}
                r="4.5"
                fill={activeColor}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Y-axis labels */}
          <text x={padding.left - 6} y={padding.top + 10} fill="#94A3B8" fontSize="10" textAnchor="end">
            {Math.round(maxVal)}
          </text>
          <text x={padding.left - 6} y={padding.top + chartHeight} fill="#94A3B8" fontSize="10" textAnchor="end">
            {Math.round(minVal)}
          </text>
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-1 px-1">
        <span>Start</span>
        <span>Distance: {(totalDist / 1000).toFixed(2)} km</span>
        <span>Finish</span>
      </div>
    </div>
  );
};
