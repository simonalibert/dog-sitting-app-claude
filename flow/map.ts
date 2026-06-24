// Mapbox Static Images API helper — returns a real map as a plain image URL.
// Works on web (Vercel) + native with no native module / dev build.
// NB: logo/attribution are hidden for the demo; production use must show attribution per Mapbox ToS.
const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

export const hasMapbox = !!TOKEN;

// Demo neighbourhood: Parc des Buttes-Chaumont, Paris (green + streets — a nice dog-walking vibe).
export const MAP_CENTER = { lon: 2.3822, lat: 48.8799 };

type StaticMapOpts = {
  lon?: number;
  lat?: number;
  zoom?: number;
  width?: number; // logical px (max 1280); served @2x
  height?: number;
  style?: string; // e.g. 'streets-v12', 'light-v11', 'outdoors-v12'
};

export function staticMapUrl({
  lon = MAP_CENTER.lon,
  lat = MAP_CENTER.lat,
  zoom = 14.4,
  width = 600,
  height = 900,
  style = 'streets-v12',
}: StaticMapOpts = {}): string | null {
  if (!TOKEN) return null;
  const w = Math.min(Math.round(width), 1280);
  const h = Math.min(Math.round(height), 1280);
  return (
    `https://api.mapbox.com/styles/v1/mapbox/${style}/static/` +
    `${lon},${lat},${zoom},0/${w}x${h}@2x` +
    `?access_token=${TOKEN}&attribution=false&logo=false`
  );
}
