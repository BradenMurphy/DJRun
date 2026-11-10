import { useMemo, useRef, useState } from 'react';
import route from './data/route.json';
import { SEGMENTS, TOTAL_KM } from './data/legs.js';
import { cumulativeKm, pointAtKm, sliceRouteByKm } from './lib/geo.js';
import Hero from './components/Hero.jsx';
import RouteMap from './components/RouteMap.jsx';
import RelayTimeline from './components/RelayTimeline.jsx';
import ElevationProfile from './components/ElevationProfile.jsx';
import About from './components/About.jsx';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  // hoverId: segment under the mouse (desktop only).
  // selectedId: segment tapped/clicked; stays highlighted until another is picked.
  const [hoverId, setHoverId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const activeId = hoverId ?? selectedId;

  // Asks the map to zoom: to one segment ({ id }) or the whole route ({ id: null }).
  // `n` changes on every request so picking the same segment again re-zooms.
  const [focus, setFocus] = useState(null);
  const mapRef = useRef(null);

  // Race km currently pointed at on the elevation profile (shown as a dot on the map).
  const [cursorKm, setCursorKm] = useState(null);

  // The plotted line is never exactly TOTAL_KM long, so race km are mapped
  // proportionally onto it and the finish always lands on the end.
  const { cum, scale } = useMemo(() => {
    const c = cumulativeKm(route);
    return { cum: c, scale: c[c.length - 1] / TOTAL_KM };
  }, []);

  // Where each segment starts (the handover) and its stretch of the route.
  const segmentsOnMap = useMemo(
    () =>
      SEGMENTS.map((s) => ({
        ...s,
        start: pointAtKm(route, s.startKm * scale, cum),
        path: sliceRouteByKm(route, s.startKm * scale, s.endKm * scale, cum),
      })),
    [cum, scale],
  );

  const cursorPoint = cursorKm == null ? null : pointAtKm(route, cursorKm * scale, cum);

  /** From the handover list: highlight the segment, zoom to it, bring the map into view. */
  function showOnMap(id) {
    setSelectedId(id);
    setFocus((f) => ({ id, n: (f?.n ?? 0) + 1 }));
    const el = mapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mostlyHidden = rect.top > window.innerHeight * 0.5 || rect.bottom < window.innerHeight * 0.3;
    if (mostlyHidden) {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
    }
  }

  function showWholeRoute() {
    setSelectedId(null);
    setFocus((f) => ({ id: null, n: (f?.n ?? 0) + 1 }));
  }

  return (
    <>
      <Hero />
      <main>
        <section className="section" aria-labelledby="route-title">
          <div className="wrap">
            <h2 id="route-title">The route</h2>
            <p className="lede">
              Out of Aurora along Vissershok Road, around Contermanskloof and back along Tygerberg
              Valley Road past Nitida. Then through Kenridge, past Sonstraal Dam, up through
              Sonstraal Heights and home along Wellington Road.
            </p>

            {/* Desktop: map with the handovers beside it, profile under the map.
                Phones: map, profile, handovers, stacked. */}
            <div className="route-layout">
              <div className="route-map">
                <RouteMap
                  ref={mapRef}
                  route={route}
                  segments={segmentsOnMap}
                  activeId={activeId}
                  focus={focus}
                  zoomedIn={focus?.id != null}
                  cursor={cursorPoint}
                  onHover={setHoverId}
                  onSelect={setSelectedId}
                  onShowWholeRoute={showWholeRoute}
                />
              </div>
              <div className="route-profile">
                <ElevationProfile activeId={activeId} onHover={setHoverId} onCursor={setCursorKm} />
              </div>
              <div className="route-list">
                <RelayTimeline activeId={activeId} onHover={setHoverId} onSelect={showOnMap} />
              </div>
            </div>
          </div>
        </section>
        <About />
      </main>
      <footer className="footer">
        <div className="wrap">
          <p>DJ Run 2027. One flag, {TOTAL_KM} km, carried all the way round.</p>
          <p className="footer-small">
            Route plotted from OpenStreetMap data and may differ slightly from what we run on the
            day.
          </p>
        </div>
      </footer>
    </>
  );
}
