// Height along the run, from src/data/elevation.json (one value every
// `stepKm` race km, built by `npm run elevation`).
import elevation from '../data/elevation.json';

export const { stepKm: STEP_KM, heights: HEIGHTS } = elevation;
export const LOWEST = Math.min(...HEIGHTS);
export const HIGHEST = Math.max(...HEIGHTS);

const indexAt = (km) => Math.max(0, Math.min(HEIGHTS.length - 1, Math.round(km / STEP_KM)));

/** Height in metres at a race km. */
export function heightAtKm(km) {
  return HEIGHTS[indexAt(km)];
}

// Changes smaller than this are treated as terrain-data noise, not climbing.
const NOISE_M = 3;

/** Climb, descent, lowest and highest point between two race kms. */
export function elevationBetween(fromKm, toKm) {
  const slice = HEIGHTS.slice(indexAt(fromKm), indexAt(toKm) + 1);
  let climb = 0;
  let descent = 0;
  let ref = slice[0];
  for (const h of slice) {
    if (h - ref >= NOISE_M) {
      climb += h - ref;
      ref = h;
    } else if (ref - h >= NOISE_M) {
      descent += ref - h;
      ref = h;
    }
  }
  return {
    climb: Math.round(climb),
    descent: Math.round(descent),
    low: Math.min(...slice),
    high: Math.max(...slice),
    start: slice[0],
    end: slice[slice.length - 1],
  };
}
