import { Activity } from '../types';

/**
 * Generates standard GPX 1.1 XML content for an activity
 */
export function generateGPX(activity: Activity): string {
  const escapeXML = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const startTimeIso = new Date(activity.startTime).toISOString();
  
  const trackPointsXml = activity.points
    .map((pt) => {
      const timeIso = new Date(pt.timestamp).toISOString();
      const eleXml = pt.altitude != null ? `\n        <ele>${pt.altitude.toFixed(1)}</ele>` : '';
      const speedXml = pt.speed != null ? `\n          <speed>${pt.speed.toFixed(2)}</speed>` : '';
      
      return `      <trkpt lat="${pt.latitude}" lon="${pt.longitude}">${eleXml}
        <time>${timeIso}</time>
        <extensions>${speedXml}
        </extensions>
      </trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MyWayTrack - Every step. Every route." xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXML(activity.title)}</name>
    <desc>Recorded with MyWayTrack. Activity: ${activity.type}, Distance: ${(activity.distanceMeters / 1000).toFixed(2)} km, Moving Time: ${activity.movingTimeSeconds}s, Calories: ${activity.calories} kcal</desc>
    <time>${startTimeIso}</time>
  </metadata>
  <trk>
    <name>${escapeXML(activity.title)}</name>
    <type>${activity.type.toUpperCase()}</type>
    <trkseg>
${trackPointsXml}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Triggers a file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType = 'application/gpx+xml') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports all activities to a CSV spreadsheet
 */
export function exportActivitiesToCSV(activities: Activity[]): string {
  const headers = [
    'ID',
    'Title',
    'Type',
    'Date',
    'Distance (km)',
    'Moving Time (s)',
    'Total Time (s)',
    'Avg Speed (km/h)',
    'Max Speed (km/h)',
    'Avg Pace (s/km)',
    'Calories (kcal)',
    'Steps',
    'Elevation Gain (m)',
  ];

  const rows = activities.map((a) => [
    a.id,
    `"${a.title.replace(/"/g, '""')}"`,
    a.type,
    new Date(a.startTime).toISOString(),
    (a.distanceMeters / 1000).toFixed(2),
    a.movingTimeSeconds,
    a.totalTimeSeconds,
    a.avgSpeedKmh.toFixed(1),
    a.maxSpeedKmh.toFixed(1),
    a.avgPaceSecondsPerKm.toFixed(0),
    a.calories,
    a.steps,
    a.elevationGainMeters,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
