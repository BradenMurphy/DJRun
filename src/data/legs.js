// The relay, section by section. This is the file to edit.
//
// - `name` is what the section is called on the site.
// - `distanceKm` is how long the section is. Sections run in order, so
//   section 2 starts where section 1 ends, and so on.
// - `runners` is everyone running that section. Add as many names as you
//   like, or leave it empty ([]) until you know: the site then shows
//   "Runners to be confirmed".
// - `place` is where the section starts (where the flag is handed over).
// - `color` is used on the map, the 37 km bar and the handover list (not the flag).
//
// Handover points on the map are worked out from the distances, so nothing
// else needs updating when you change this list.

const RELAY = [
  {
    id: 1,
    name: 'Aurora to Contermanskloof',
    distanceKm: 10,
    runners: ['Braden'],
    place: 'Plataan Road, Aurora',
    color: '#e4572e',
  },
  {
    id: 2,
    name: 'Contermanskloof to Nitida',
    distanceKm: 10,
    runners: ['Janet'],
    place: 'Contermanskloof Road',
    color: '#e8a317',
  },
  {
    id: 3,
    name: 'Nitida to Sonstraal Heights',
    distanceKm: 10,
    runners: ['Tynan'],
    place: 'Tygerberg Valley Road, past Nitida',
    color: '#2a9d8f',
  },
  {
    id: 4,
    name: 'Sonstraal Heights to Aurora',
    distanceKm: 6.8,
    runners: ['Kim'],
    place: 'Sonstraal Heights',
    color: '#3a6ea5',
  },
  {
    id: 5,
    name: 'The final stretch home',
    distanceKm: 0.2,
    runners: ['Charlie'],
    place: 'Around the corner from home',
    color: '#b07ad6',
  },
];

// Where we go after the run. Shown after the last section at the top of the page.
export const AFTER_RUN = {
  title: 'After the run',
  plan: 'Beers at Starke Brews',
  address: 'Starke Estate, Contermanskloof Road, Durbanville',
  directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Starke+Brews+Contermanskloof+Road+Durbanville',
};

// ---------------------------------------------------------------------------

const round = (n) => Math.round(n * 1000) / 1000;

/** Each section with its startKm and endKm along the run. */
export const SEGMENTS = RELAY.reduce((list, s) => {
  const startKm = list.length ? list[list.length - 1].endKm : 0;
  list.push({ ...s, startKm, endKm: round(startKm + s.distanceKm) });
  return list;
}, []);

export const TOTAL_KM = SEGMENTS[SEGMENTS.length - 1].endKm;

export const TBC = 'Runners to be confirmed';

/** "10 km", "6.8 km", "200 m" */
export function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${+km.toFixed(2)} km`;
}

/** "Braden", "Braden & Sam", "Braden, Sam & Alex" */
export function joinNames(names) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

/** The section's runners as one line, or "Runners to be confirmed" if none yet. */
export function runnersLabel(section) {
  return section.runners.length ? joinNames(section.runners) : TBC;
}
