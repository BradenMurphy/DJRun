// Small geometry helpers for working with a route stored as [[lat, lng], ...].

const EARTH_RADIUS_KM = 6371.0088;
const toRad = (deg) => (deg * Math.PI) / 180;

/** Great-circle distance between two [lat, lng] points, in km. */
export function haversineKm([lat1, lng1], [lat2, lng2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Cumulative distance (km) at each vertex of the route. */
export function cumulativeKm(route) {
  const out = [0];
  for (let i = 1; i < route.length; i++) {
    out.push(out[i - 1] + haversineKm(route[i - 1], route[i]));
  }
  return out;
}

/** Total length of the route in km. */
export function routeLengthKm(route) {
  const cum = cumulativeKm(route);
  return cum[cum.length - 1];
}

function interpolate(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** The [lat, lng] point found by walking `km` along the route. */
export function pointAtKm(route, km, cum = cumulativeKm(route)) {
  if (km <= 0) return route[0];
  const total = cum[cum.length - 1];
  if (km >= total) return route[route.length - 1];
  let i = 1;
  while (cum[i] < km) i++;
  const t = (km - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
  return interpolate(route[i - 1], route[i], t);
}

/** The part of the route between `fromKm` and `toKm`, as a polyline. */
export function sliceRouteByKm(route, fromKm, toKm, cum = cumulativeKm(route)) {
  const out = [pointAtKm(route, fromKm, cum)];
  for (let i = 0; i < route.length; i++) {
    if (cum[i] > fromKm && cum[i] < toKm) out.push(route[i]);
  }
  out.push(pointAtKm(route, toKm, cum));
  return out;
}
