import { ALL_RUNNERS, SEGMENTS, TOTAL_KM, formatDistance, joinNames } from '../data/legs.js';
import Flag from './Flag.jsx';

const runnerCount = ALL_RUNNERS.length;

/** The 37 km drawn to scale, one band per segment. */
function Ribbon() {
  return (
    <div className="ribbon" role="img" aria-label={`The ${TOTAL_KM} km relay drawn to scale`}>
      <div className="ribbon-bar">
        {SEGMENTS.map((s) => (
          <span
            key={s.id}
            className="ribbon-band"
            style={{ flexGrow: s.distanceKm, background: s.color }}
          />
        ))}
      </div>
      <div className="ribbon-scale" aria-hidden="true">
        <span>0 km</span>
        <span>{TOTAL_KM} km</span>
      </div>
      <ul className="ribbon-legend">
        {SEGMENTS.map((s) => (
          <li key={s.id} style={{ '--seg': s.color }}>
            <strong>{joinNames(s.runners)}</strong> {formatDistance(s.distanceKm)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Hero() {
  return (
    <header className="hero">
      <div className="wrap hero-grid">
        <h1 className="hero-title">
          DJ Run
          <span className="hero-year">2027</span>
        </h1>
        <p className="hero-sub">
          {TOTAL_KM} km around Contermanskloof, Durbanville. {runnerCount} runners, one flag, and
          it doesn't touch the ground until we're home.
        </p>
        <div className="hero-flag">
          <Flag />
        </div>
      </div>
      <div className="wrap">
        <Ribbon />
      </div>
    </header>
  );
}
