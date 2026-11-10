import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { TOTAL_KM, joinNames, runnersLabel } from '../data/legs.js';
import { haversineKm } from '../lib/geo.js';

/** Dark text on light colours (the golds), white text on dark ones. */
function textColorFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 140 ? '#1d2b26' : '#ffffff';
}

function flagIcon(color, label, flipped) {
  return L.divIcon({
    className: flipped ? 'flag-marker flag-marker--flipped' : 'flag-marker',
    html: `<span class="flag-marker-pole"></span><span class="flag-marker-cloth" style="background:${color};color:${textColorFor(color)}">${label}</span>`,
    iconSize: [34, 40],
    iconAnchor: flipped ? [31, 38] : [3, 38],
    popupAnchor: flipped ? [-12, -34] : [12, -34],
  });
}

// A handover flag within this distance of an earlier one points the other way,
// so the two don't cover each other (e.g. the start and Charlie's last 200 m).
const CROWDED_KM = 0.6;

// The map starts locked so scrolling the page never gets caught by the map:
// - computers: the scroll wheel scrolls the page (dragging still works);
// - phones/tablets: a swipe scrolls the page instead of dragging the map.
// Unlocking turns on scroll-wheel zoom, dragging and pinch-zoom.
const isTouch = () => window.matchMedia('(pointer: coarse)').matches;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function handoverText(s) {
  const where = s.startKm === 0 ? 'at the start' : `at km ${s.startKm}`;
  if (!s.runners.length) return `The flag changes hands ${where}`;
  const verb = s.runners.length > 1 ? 'take' : 'takes';
  return `${joinNames(s.runners)} ${verb} the flag ${where}`;
}

/** Zooms the map when asked: to one segment, or back out to the whole route. */
function FocusController({ focus, segments, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    const seg = segments.find((s) => s.id === focus.id);
    const target = seg ? L.latLngBounds(seg.path).pad(0.15) : bounds;
    // Extra room at the top so the map buttons don't cover the route.
    const options = { paddingTopLeft: [24, 72], paddingBottomRight: [24, 24], maxZoom: 16 };
    if (reducedMotion()) map.fitBounds(target, options);
    else map.flyToBounds(target, { ...options, duration: 0.8 });
  }, [focus, segments, bounds, map]);
  return null;
}

/** Locks or unlocks the map's scroll-wheel zoom (and, on touch screens, dragging and pinch-zoom). */
function LockController({ locked, touch }) {
  const map = useMap();
  useEffect(() => {
    const handlers = touch ? [map.scrollWheelZoom, map.dragging, map.touchZoom] : [map.scrollWheelZoom];
    handlers.forEach((h) => (locked ? h.disable() : h.enable()));
  }, [locked, touch, map]);
  return null;
}

/** `segments` are the relay segments with `start` (handover point) and `path` added. */
export default function RouteMap({
  ref,
  route,
  segments,
  activeId,
  focus,
  zoomedIn,
  cursor,
  onHover,
  onSelect,
  onShowWholeRoute,
}) {
  const bounds = useMemo(() => L.latLngBounds(route).pad(0.04), [route]);
  const icons = useMemo(
    () =>
      Object.fromEntries(
        segments.map((s, i) => {
          const crowded = segments.slice(0, i).some((p) => haversineKm(p.start, s.start) < CROWDED_KM);
          return [s.id, flagIcon(s.color, s.id, crowded)];
        }),
      ),
    [segments],
  );
  const [touch] = useState(isTouch);
  const [locked, setLocked] = useState(true);

  return (
    <div className="map-shell" ref={ref}>
      <div className="map-frame">
        <MapContainer
          className="map"
          bounds={bounds}
          zoomSnap={0.25}
          scrollWheelZoom={false}
          dragging={!touch}
          touchZoom={!touch}
          aria-label={`Map of the ${TOTAL_KM} km route`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <FocusController focus={focus} segments={segments} bounds={bounds} />
          <LockController locked={locked} touch={touch} />

          {/* Dark casing under the whole loop so the coloured legs read on the tiles. */}
          <Polyline positions={route} pathOptions={{ color: '#1d2b26', weight: 9, opacity: 0.55 }} />

          {segments.map((s) => {
            const dimmed = activeId !== null && activeId !== s.id;
            return (
              <Polyline
                key={s.id}
                positions={s.path}
                pathOptions={{
                  color: s.color,
                  weight: activeId === s.id ? 8 : 5,
                  opacity: dimmed ? 0.3 : 1,
                }}
                eventHandlers={
                  touch
                    ? { click: () => onSelect(s.id) }
                    : {
                        mouseover: () => onHover(s.id),
                        mouseout: () => onHover(null),
                        click: () => onSelect(s.id),
                      }
                }
              >
                {!touch && (
                  <Tooltip sticky>
                    {s.name}: {runnersLabel(s)}
                  </Tooltip>
                )}
              </Polyline>
            );
          })}

          {segments.map((s) => (
            <Marker
              key={s.id}
              position={s.start}
              icon={icons[s.id]}
              zIndexOffset={s.id * 10}
              eventHandlers={{ click: () => onSelect(s.id) }}
            >
              <Popup>
                <strong>{handoverText(s)}</strong>
                <br />
                {s.place}
                <br />
                Section {s.id}: {s.name}
                {s.startKm === 0 && (
                  <>
                    <br />
                    Start and finish
                  </>
                )}
              </Popup>
            </Marker>
          ))}

          {/* The spot being pointed at on the elevation profile. */}
          {cursor && (
            <CircleMarker
              center={cursor}
              radius={7}
              interactive={false}
              pathOptions={{ color: '#1d2b26', weight: 3, fillColor: '#ffffff', fillOpacity: 1 }}
            />
          )}
        </MapContainer>

        <div className="map-actions">
          {zoomedIn && (
            <button type="button" className="map-button" onClick={onShowWholeRoute}>
              Show whole route
            </button>
          )}
          <button
            type="button"
            className="map-button"
            aria-pressed={!locked}
            onClick={() => setLocked((l) => !l)}
          >
            {locked ? 'Unlock map' : 'Lock map'}
          </button>
        </div>
      </div>
      <p className="map-hint">
        {touch
          ? locked
            ? 'Tap a coloured stretch or flag for details, or unlock the map to pan and zoom.'
            : 'Drag to pan and pinch to zoom. Lock the map again to scroll the page.'
          : locked
            ? 'Click a coloured stretch or flag for details. Unlock the map to zoom with your scroll wheel.'
            : 'Scroll to zoom and drag to pan. Lock the map again to scroll the page.'}
      </p>
    </div>
  );
}
