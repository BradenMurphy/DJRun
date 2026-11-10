// Builds src/data/route.json from the WAYPOINTS below by asking the public
// OpenStreetMap foot router for a road-following path between them.
//
//   npm run route                              -> fetch, report and write route.json
//   node scripts/build-route.mjs --dry --trace -> fetch and report only
//
// Handover points are worked out by the site from the segment distances in
// src/data/legs.js, so nothing needs copying across after running this.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cumulativeKm, pointAtKm } from '../src/lib/geo.js';
import { SEGMENTS, TOTAL_KM } from '../src/data/legs.js';

// Ordered [lat, lng] waypoints. The router fills in the roads between them.
// Keep waypoints ON the road you want: a point beside it can make the router
// detour down a side street and back (an out-and-back "spur").
const WAYPOINTS = [
  ['Start: Plataan Rd, Aurora', [-33.8273, 18.64409]],
  ['Vissershok Rd', [-33.80478, 18.62125]],
  ['Contermanskloof Rd junction', [-33.7888, 18.5775]],
  ['Contermanskloof Rd', [-33.79913, 18.56543]],
  ['Contermanskloof Rd south', [-33.81668, 18.55757]],
  ['Tygerberg Valley Rd', [-33.82101, 18.57511]],
  ['Nitida', [-33.8363, 18.5917]],
  ['Tygerberg Valley Rd east', [-33.84268, 18.623]],
  ['Durbanville Ave, Kenridge', [-33.85903, 18.64228]],
  ['Sonstraal Rd', [-33.85017, 18.65532]],
  ['Past Sonstraal Dam', [-33.84649, 18.65923]],
  ['Legato Rd, Sonstraal Heights', [-33.8438, 18.6786]],
  ['Brackenfell Blvd', [-33.8145, 18.6728]],
  ['Wellington Rd', [-33.8224, 18.6652]],
  ['Finish: Plataan Rd, Aurora', [-33.8273, 18.64409]],
];

const ROUTER = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';

const coords = WAYPOINTS.map(([, [lat, lng]]) => `${lng},${lat}`).join(';');
const url = `${ROUTER}/${coords}?overview=full&geometries=geojson&steps=false`;

const res = await fetch(url, { headers: { 'User-Agent': 'route-builder-script/1.0' } });
if (!res.ok) throw new Error(`Router returned ${res.status}: ${await res.text()}`);
const data = await res.json();
if (data.code !== 'Ok') throw new Error(`Router error: ${data.code} ${data.message ?? ''}`);

const r = data.routes[0];
const round = (n) => Math.round(n * 1e5) / 1e5;
const route = r.geometry.coordinates.map(([lng, lat]) => [round(lat), round(lng)]);
const cum = cumulativeKm(route);
const total = cum[cum.length - 1];

console.log(`Router distance: ${(r.distance / 1000).toFixed(2)} km`);
console.log(`Polyline length: ${total.toFixed(2)} km (${route.length} points)\n`);

console.log('Waypoint -> leg length:');
let acc = 0;
r.legs.forEach((leg, i) => {
  acc += leg.distance / 1000;
  console.log(`  ${WAYPOINTS[i][0]} -> ${WAYPOINTS[i + 1][0]}: ${(leg.distance / 1000).toFixed(2)} km (at ${acc.toFixed(2)} km)`);
});

if (process.argv.includes('--trace')) {
  console.log('\nPoint every km (paste into a map to eyeball the path):');
  for (let km = 0; km <= total; km += 1) {
    const [lat, lng] = pointAtKm(route, km, cum);
    console.log(`  ${String(km).padStart(2)} km: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  }
}

// The plotted line is never exactly TOTAL_KM long, so race km are mapped
// proportionally onto it (the site does the same) and the finish lands on the end.
const scale = total / TOTAL_KM;
console.log(`\nScale: ${scale.toFixed(4)} plotted km per race km`);

console.log('\nHandover points (for checking on a map):');
for (const s of SEGMENTS) {
  const [lat, lng] = pointAtKm(route, s.startKm * scale, cum);
  console.log(`  segment ${s.id} @ km ${s.startKm} (${s.runners.join(', ')}): ${round(lat)}, ${round(lng)}`);
}

if (!process.argv.includes('--dry')) {
  const out = fileURLToPath(new URL('../src/data/route.json', import.meta.url));
  writeFileSync(out, JSON.stringify(route) + '\n');
  console.log(`\nWrote ${out}`);
}
