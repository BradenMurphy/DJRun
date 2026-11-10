// Builds src/data/elevation.json: the height above sea level every 100 m
// along the route, from the free Open-Meteo elevation API (Copernicus 90 m
// terrain data). Run after `npm run route` whenever the route changes:
//
//   npm run elevation

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cumulativeKm, pointAtKm } from '../src/lib/geo.js';
import { TOTAL_KM } from '../src/data/legs.js';

const STEP_KM = 0.1; // in race km
const BATCH = 100; // the API takes up to 100 points per request

const routePath = fileURLToPath(new URL('../src/data/route.json', import.meta.url));
const outPath = fileURLToPath(new URL('../src/data/elevation.json', import.meta.url));

const route = JSON.parse(readFileSync(routePath, 'utf8'));
const cum = cumulativeKm(route);
const scale = cum[cum.length - 1] / TOTAL_KM; // race km -> plotted km, as on the site

const count = Math.round(TOTAL_KM / STEP_KM) + 1;
const points = Array.from({ length: count }, (_, i) => pointAtKm(route, i * STEP_KM * scale, cum));

const heights = [];
for (let i = 0; i < points.length; i += BATCH) {
  const chunk = points.slice(i, i + BATCH);
  const lat = chunk.map((p) => p[0].toFixed(5)).join(',');
  const lng = chunk.map((p) => p[1].toFixed(5)).join(',');
  const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`, {
    headers: { 'User-Agent': 'route-builder-script/1.0' },
  });
  if (!res.ok) throw new Error(`Elevation API returned ${res.status}: ${await res.text()}`);
  const data = await res.json();
  heights.push(...data.elevation.map((m) => Math.round(m)));
  await new Promise((r) => setTimeout(r, 300));
}

writeFileSync(outPath, JSON.stringify({ stepKm: STEP_KM, heights }) + '\n');
const min = Math.min(...heights);
const max = Math.max(...heights);
console.log(`Wrote ${heights.length} heights to ${outPath}`);
console.log(`Lowest ${min} m, highest ${max} m`);
