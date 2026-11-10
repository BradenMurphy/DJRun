import { SEGMENTS, formatDistance, joinNames } from '../data/legs.js';
import { elevationBetween } from '../lib/elevation.js';

// Hover only for a real mouse: on phones a tap also fires "hover" events,
// which would otherwise fight with the tap itself.
const isMouse = (e) => e.pointerType === 'mouse';

const ELEVATION = Object.fromEntries(SEGMENTS.map((s) => [s.id, elevationBetween(s.startKm, s.endKm)]));

export default function RelayTimeline({ activeId, onHover, onSelect }) {
  return (
    <div className="handovers">
      <h2 id="relay-title" className="handovers-title">
        The handovers
      </h2>
      <p className="handovers-lede">
        Whoever is on a stretch carries the flag to the next handover. Tap one to see it on the
        map.
      </p>

      <ol className="relay" aria-labelledby="relay-title">
        {SEGMENTS.map((s) => {
          const active = activeId === s.id;
          const e = ELEVATION[s.id];
          return (
            <li key={s.id} className={active ? 'relay-item is-active' : 'relay-item'} style={{ '--seg': s.color }}>
              <button
                type="button"
                className="relay-button"
                aria-pressed={active}
                onClick={() => onSelect(s.id)}
                onPointerEnter={(ev) => isMouse(ev) && onHover(s.id)}
                onPointerLeave={(ev) => isMouse(ev) && onHover(null)}
              >
                <span className="relay-km">km {s.startKm}</span>
                <span className="relay-body">
                  <span className="relay-runners">{joinNames(s.runners)}</span>
                  <span className="relay-place">{s.place}</span>
                  <span className="relay-meta">
                    <span>{formatDistance(s.distanceKm)}</span>
                    <span aria-label={`${e.climb} metres up`}>↑ {e.climb} m</span>
                    <span aria-label={`${e.descent} metres down`}>↓ {e.descent} m</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
