// The relay, segment by segment. This is the file to edit.
//
// - `distanceKm` is how long the segment is. Segments run in order, so
//   segment 2 starts where segment 1 ends, and so on.
// - `runners` is everyone running that segment together. Add as many names as
//   you like, e.g. runners: ['Janet', 'Sam', 'Alex'].
// - `place` is a short description of where the segment starts.
//
// Handover points on the map are worked out from the distances, so nothing
// else needs updating when you change this list.

// `color` is used on the map, the 37 km bar and the handover list (not the flag).
const RELAY = [
  { id: 1, distanceKm: 10,  runners: ['Braden'],  place: 'Plataan Road, Aurora',               color: '#e4572e' },
  { id: 2, distanceKm: 10,  runners: ['Janet'],   place: 'Contermanskloof Road',               color: '#e8a317' },
  { id: 3, distanceKm: 10,  runners: ['Tynan'],   place: 'Tygerberg Valley Road, past Nitida', color: '#2a9d8f' },
  { id: 4, distanceKm: 6.8, runners: ['Kim'],     place: 'Sonstraal Heights',                  color: '#3a6ea5' },
  { id: 5, distanceKm: 0.2, runners: ['Charlie'], place: 'The final 200 m home',               color: '#b07ad6' },
];

// ---------------------------------------------------------------------------

const round = (n) => Math.round(n * 1000) / 1000;

/** Each segment with its startKm and endKm along the run. */
export const SEGMENTS = RELAY.reduce((list, s) => {
  const startKm = list.length ? list[list.length - 1].endKm : 0;
  list.push({ ...s, startKm, endKm: round(startKm + s.distanceKm) });
  return list;
}, []);

export const TOTAL_KM = SEGMENTS[SEGMENTS.length - 1].endKm;

/** Everyone taking part, each name once. */
export const ALL_RUNNERS = [...new Set(SEGMENTS.flatMap((s) => s.runners))];

/** "10 km", "6.8 km", "200 m" */
export function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${+km.toFixed(2)} km`;
}

/** "Braden", "Braden & Sam", "Braden, Sam & Alex" */
export function joinNames(names) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}
