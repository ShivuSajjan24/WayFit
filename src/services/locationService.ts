import { LocationPoint, GPSStatus, ActivityType } from '../types';
import { filterGPSPoint } from '../utils/haversine';

export interface LocationServiceListener {
  onLocationUpdate: (point: LocationPoint) => void;
  onStatusChange: (status: GPSStatus) => void;
  onError: (error: string) => void;
}

export class LocationService {
  private watchId: number | null = null;
  private listeners: LocationServiceListener[] = [];
  private currentStatus: GPSStatus = 'searching';
  private lastPoint: LocationPoint | null = null;
  private currentActivityType: ActivityType = 'run';
  
  // Simulator state
  private isSimulated = false;
  private simIntervalId: any = null;
  private simLat = 37.7749;
  private simLon = -122.4194;
  private simAlt = 35;
  private simAngle = 0;
  private simSpeed = 2.8; // m/s (~10 km/h)

  constructor() {
    this.checkInitialPermission();
  }

  public setActivityType(type: ActivityType) {
    this.currentActivityType = type;
  }

  public subscribe(listener: LocationServiceListener): () => void {
    this.listeners.push(listener);
    listener.onStatusChange(this.currentStatus);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyLocation(point: LocationPoint) {
    this.listeners.forEach((l) => l.onLocationUpdate(point));
  }

  private notifyStatus(status: GPSStatus) {
    this.currentStatus = status;
    this.listeners.forEach((l) => l.onStatusChange(status));
  }

  private notifyError(err: string) {
    this.listeners.forEach((l) => l.onError(err));
  }

  private checkInitialPermission() {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((res) => {
          if (res.state === 'denied') {
            this.notifyStatus('disabled');
          } else if (res.state === 'granted') {
            this.notifyStatus('good');
          } else {
            this.notifyStatus('searching');
          }
          res.onchange = () => {
            if (res.state === 'denied') {
              this.notifyStatus('disabled');
            }
          };
        })
        .catch(() => {
          // Permissions API might not support geolocation in some webviews
        });
    }
  }

  /**
   * Starts tracking GPS points using navigator.geolocation or Simulator
   */
  public startTracking(useSimulation = false): void {
    this.stopTracking();
    this.isSimulated = useSimulation;

    if (useSimulation) {
      this.startSimulation();
      return;
    }

    if (!('geolocation' in navigator)) {
      this.notifyError('Geolocation is not supported by your browser.');
      this.notifyStatus('disabled');
      return;
    }

    this.notifyStatus('searching');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        let status: GPSStatus = 'good';
        if (accuracy > 35) {
          status = 'weak';
        } else if (accuracy > 15) {
          status = 'moderate';
        }
        this.notifyStatus(status);

        const newPoint: LocationPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          timestamp: position.timestamp || Date.now(),
        };

        const filterResult = filterGPSPoint(newPoint, this.lastPoint, this.currentActivityType);
        if (filterResult.valid) {
          this.lastPoint = newPoint;
          this.notifyLocation(newPoint);
        }
      },
      (error) => {
        let msg = 'Failed to get GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please enable GPS in settings.';
          this.notifyStatus('disabled');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS signal lost or unavailable.';
          this.notifyStatus('weak');
        } else if (error.code === error.TIMEOUT) {
          msg = 'GPS signal request timed out.';
          this.notifyStatus('weak');
        }
        this.notifyError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );
  }

  /**
   * Realistic Route Simulator for desktop browser testing & indoor demoing
   */
  private startSimulation(): void {
    this.notifyStatus('good');

    // Adjust simulator speed to activity
    if (this.currentActivityType === 'walk') this.simSpeed = 1.4; // ~5 km/h
    else if (this.currentActivityType === 'run') this.simSpeed = 2.8; // ~10 km/h
    else if (this.currentActivityType === 'ride') this.simSpeed = 5.8; // ~21 km/h
    else if (this.currentActivityType === 'hike') this.simSpeed = 1.1; // ~4 km/h
    else this.simSpeed = 10.0; // ~36 km/h travel

    // If we have an existing point, continue from there
    if (this.lastPoint) {
      this.simLat = this.lastPoint.latitude;
      this.simLon = this.lastPoint.longitude;
    }

    this.simIntervalId = setInterval(() => {
      // Gentle curve in direction
      this.simAngle += (Math.random() - 0.48) * 0.15;
      
      // Calculate delta degrees: 1 degree latitude ~= 111,000m
      const stepMeters = this.simSpeed * 1.5; // distance in 1.5 seconds
      const dLat = (Math.cos(this.simAngle) * stepMeters) / 111000;
      const dLon = (Math.sin(this.simAngle) * stepMeters) / (111000 * Math.cos((this.simLat * Math.PI) / 180));
      
      this.simLat += dLat;
      this.simLon += dLon;
      this.simAlt += (Math.random() - 0.49) * 0.8;

      const simPoint: LocationPoint = {
        latitude: this.simLat,
        longitude: this.simLon,
        altitude: Math.round(this.simAlt * 10) / 10,
        speed: this.simSpeed + (Math.random() - 0.5) * 0.3,
        accuracy: 4 + Math.random() * 3,
        heading: ((this.simAngle * 180) / Math.PI + 360) % 360,
        timestamp: Date.now(),
      };

      this.lastPoint = simPoint;
      this.notifyLocation(simPoint);
    }, 1500);
  }

  public stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.simIntervalId !== null) {
      clearInterval(this.simIntervalId);
      this.simIntervalId = null;
    }
    this.lastPoint = null;
  }

  public getCurrentStatus(): GPSStatus {
    return this.currentStatus;
  }

  public isSimulating(): boolean {
    return this.isSimulated;
  }
}

export const locationService = new LocationService();
