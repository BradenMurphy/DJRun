import { SEGMENTS, TBC, TOTAL_KM, formatDistance } from '../data/legs.js';
import { elevationBetween } from '../lib/elevation.js';
import Flag from './Flag.jsx';

const ELEVATION = Object.fromEntries(SEGMENTS.map((s) => [s.id, elevationBetween(s.startKm, s.endKm)]));

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const sectionCount = NUMBER_WORDS[SEGMENTS.length] ?? String(SEGMENTS.length);

/** The 37 km drawn to scale, then each section with the people running it. */
function Ribbon() {
  return (
    <div className="ribbon">
      <div className="ribbon-bar" role="img" aria-label={`The ${TOTAL_KM} km route in ${SEGMENTS.length} sections, drawn to scale`}>
        {SEGMENTS.map((s) => (
          <span key={s.id} className="ribbon-band" style={{ flexGrow: s.distanceKm, background: s.color }} />
        ))}
      </div>
      <div className="ribbon-scale" aria-hidden="true">
        <span>0 km</span>
        <span>{TOTAL_KM} km</span>
      </div>

      <ol className="sections" aria-label="Sections and who is running them">
        {SEGMENTS.map((s) => (
          <li key={s.id} className="section-card" style={{ '--seg': s.color }}>
            <h3 className="section-name">{s.name}</h3>
            <p className="section-meta">
              {formatDistance(s.distanceKm)}, km {s.startKm} to {s.endKm}
            </p>
            <p className="section-elevation">
              <span aria-label={`${ELEVATION[s.id].climb} metres up`}>↑ {ELEVATION[s.id].climb} m</span>
              <span aria-label={`${ELEVATION[s.id].descent} metres down`}>↓ {ELEVATION[s.id].descent} m</span>
            </p>
            {s.runners.length ? (
              <ul className="section-runners">
                {s.runners.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            ) : (
              <p className="section-runners section-runners--tbc">{TBC}</p>
            )}
          </li>
        ))}
      </ol>
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
          {TOTAL_KM} km around Contermanskloof, Durbanville, in {sectionCount} sections. One flag,
          passed from hand to hand, and it doesn't touch the ground until we're home.
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
