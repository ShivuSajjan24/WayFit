import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationPoint } from '../types';
import { Navigation, Layers, Crosshair } from 'lucide-react';

interface LiveRouteMapProps {
  points: LocationPoint[];
  currentPoint: LocationPoint | null;
  isRecording?: boolean;
  isDarkTheme?: boolean;
  heightClass?: string;
  showControls?: boolean;
  interactive?: boolean;
  autoCenter?: boolean;
}

export const LiveRouteMap: React.FC<LiveRouteMapProps> = ({
  points,
  currentPoint,
  isRecording = false,
  isDarkTheme = true,
  heightClass = 'h-72',
  showControls = true,
  interactive = true,
  autoCenter = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [mapStyle, setMapStyle] = useState<'dark' | 'streets' | 'satellite'>('dark');
  const [followUser, setFollowUser] = useState<boolean>(autoCenter);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = currentPoint?.latitude || (points.length > 0 ? points[0].latitude : 37.7749);
    const initialLon = currentPoint?.longitude || (points.length > 0 ? points[0].longitude : -122.4194);

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
    });

    mapInstanceRef.current = map;

    // Set initial tile layer
    updateTileLayer(map, mapStyle);

    // If user drags, disable auto follow
    map.on('dragstart', () => {
      setFollowUser(false);
    });

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const updateTileLayer = (map: L.Map, style: 'dark' | 'streets' | 'satellite') => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';
    let maxZoom = 20;

    if (style === 'streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
      maxZoom = 19;
    } else if (style === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = 'abc';
      maxZoom = 18;
    }

    const layer = L.tileLayer(url, {
      subdomains,
      maxZoom,
    });
    layer.addTo(map);
    tileLayerRef.current = layer;
  };

  // Handle map style changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, mapStyle);
    }
  }, [mapStyle]);

  // Update Polyline & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const latLngs: L.LatLngExpression[] = points.map((p) => [p.latitude, p.longitude]);

    // 1. Draw Polyline
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latLngs);
    } else {
      polylineRef.current = L.polyline(latLngs, {
        color: '#FC4C02', // WayFit Accent Orange
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    }

    // 2. Start Marker (Green Pin)
    if (points.length > 0) {
      const startPt = points[0];
      const startIcon = L.divIcon({
        className: 'custom-start-marker',
        html: `
          <div style="background-color: #22C55E; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 10px rgba(34, 197, 94, 0.6); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; background-color: #FFFFFF; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng([startPt.latitude, startPt.longitude]);
      } else {
        startMarkerRef.current = L.marker([startPt.latitude, startPt.longitude], {
          icon: startIcon,
        }).addTo(map);
      }
    }

    // 3. Current Location Dot (Blue Pulsing Indicator)
    const activePoint = currentPoint || (points.length > 0 ? points[points.length - 1] : null);
    if (activePoint) {
      const pos: [number, number] = [activePoint.latitude, activePoint.longitude];

      const currentIcon = L.divIcon({
        className: 'custom-current-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; inset: -4px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 20px; height: 20px; border-radius: 50%; background-color: #3B82F6; border: 3px solid #FFFFFF; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (currentMarkerRef.current) {
        currentMarkerRef.current.setLatLng(pos);
      } else {
        currentMarkerRef.current = L.marker(pos, { icon: currentIcon }).addTo(map);
      }

      // Accuracy circle
      if (activePoint.accuracy && activePoint.accuracy > 0 && activePoint.accuracy <= 40) {
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng(pos);
          accuracyCircleRef.current.setRadius(activePoint.accuracy);
        } else {
          accuracyCircleRef.current = L.circle(pos, {
            radius: activePoint.accuracy,
            color: '#3B82F6',
            weight: 1,
            fillColor: '#3B82F6',
            fillOpacity: 0.12,
          }).addTo(map);
        }
      }

      // Follow user if auto-center is active
      if (followUser) {
        map.panTo(pos, { animate: true, duration: 0.5 });
      }
    }

    // If static finished view, fit bounds to show entire route nicely
    if (!isRecording && points.length > 1) {
      try {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
      } catch {
        // bounds error
      }
    }
  }, [points, currentPoint, followUser, isRecording]);

  const handleRecenter = () => {
    setFollowUser(true);
    const target = currentPoint || (points.length > 0 ? points[points.length - 1] : null);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.setView([target.latitude, target.longitude], 16, { animate: true });
    }
  };

  const cycleMapLayer = () => {
    if (mapStyle === 'dark') setMapStyle('streets');
    else if (mapStyle === 'streets') setMapStyle('satellite');
    else setMapStyle('dark');
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden shadow-inner border border-gray-800 bg-[#161B22]`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Overlay Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {/* Layer switcher */}
          <button
            type="button"
            onClick={cycleMapLayer}
            title={`Current style: ${mapStyle}. Click to switch`}
            className="p-2.5 rounded-xl bg-[#1B2027]/85 backdrop-blur-md text-white border border-gray-700 hover:border-gray-500 shadow-lg active:scale-95 transition"
          >
            <Layers className="w-4 h-4 text-orange-400" />
          </button>

          {/* Re-center / Follow button */}
          <button
            type="button"
            onClick={handleRecenter}
            title="Re-center location"
            className={`p-2.5 rounded-xl backdrop-blur-md border shadow-lg active:scale-95 transition ${
              followUser
                ? 'bg-[#FC4C02] text-white border-[#FC4C02] shadow-orange-500/30'
                : 'bg-[#1B2027]/85 text-gray-300 border-gray-700 hover:text-white'
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live tracking badge overlay */}
      {isRecording && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111418]/85 backdrop-blur-md border border-orange-500/40 text-xs font-semibold text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FC4C02] animate-ping" />
          <span className="text-orange-400">GPS LIVE</span>
        </div>
      )}
    </div>
  );
};
