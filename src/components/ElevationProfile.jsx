import { useEffect, useMemo, useRef, useState } from 'react';
import { SEGMENTS, TOTAL_KM, runnersLabel } from '../data/legs.js';
import { HEIGHTS, HIGHEST, LOWEST, STEP_KM, heightAtKm } from '../lib/elevation.js';

const MARGIN = { top: 14, right: 14, bottom: 30, left: 48 };
const GRID_STEP_M = 50;

const segmentAt = (km) => SEGMENTS.find((s) => km >= s.startKm && km < s.endKm) ?? SEGMENTS[SEGMENTS.length - 1];

/**
 * Height profile of the whole run, coloured by segment.
 * Hover (or drag a finger along it) to read km, height and runner; the
 * matching spot is marked on the map via onCursor.
 */
export default function ElevationProfile({ activeId, onHover, onCursor }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(720);
  const [hoverKm, setHoverKm] = useState(null);

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const narrow = width < 520;
  const height = narrow ? 190 : 230;
  const plotW = Math.max(1, width - MARGIN.left - MARGIN.right);
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const lo = Math.floor(LOWEST / GRID_STEP_M) * GRID_STEP_M;
  const hi = Math.ceil(HIGHEST / GRID_STEP_M) * GRID_STEP_M;
  const x = (km) => MARGIN.left + (km / TOTAL_KM) * plotW;
  const y = (m) => MARGIN.top + (1 - (m - lo) / (hi - lo)) * plotH;
  const baseline = y(lo);

  const shapes = useMemo(
    () =>
      SEGMENTS.map((s) => {
        const from = Math.round(s.startKm / STEP_KM);
        const to = Math.round(s.endKm / STEP_KM);
        const pts = [];
        for (let i = from; i <= to; i++) pts.push([x(i * STEP_KM), y(HEIGHTS[i])]);
        const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('');
        const area = `${line}L${pts[pts.length - 1][0].toFixed(1)} ${baseline}L${pts[0][0].toFixed(1)} ${baseline}Z`;
        return { s, line, area };
      }),
    [width, height], // x() and y() depend only on these
  );

  const yTicks = [];
  for (let m = lo; m <= hi; m += GRID_STEP_M) yTicks.push(m);
  const kmStep = narrow ? 10 : 5;
  const xTicks = [];
  for (let k = 0; k <= TOTAL_KM; k += kmStep) xTicks.push(k);

  function track(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const km = Math.min(TOTAL_KM, Math.max(0, ((px - MARGIN.left) / plotW) * TOTAL_KM));
    const rounded = Math.round(km / STEP_KM) * STEP_KM;
    setHoverKm(rounded);
    onCursor(rounded);
    onHover(segmentAt(rounded).id);
  }

  function clear() {
    setHoverKm(null);
    onCursor(null);
    onHover(null);
  }

  const hoverSeg = hoverKm == null ? null : segmentAt(hoverKm);
  const tipLeft = hoverKm == null ? 0 : x(hoverKm);
  const tipOnLeft = tipLeft > width * 0.6;

  return (
    <figure className="profile">
      <figcaption className="profile-caption">
        Height above sea level along the run, from {LOWEST} m to {HIGHEST} m. Hover or drag along
        it to see where you are on the map.
      </figcaption>
      <div className="profile-chart" ref={wrapRef}>
        <svg width={width} height={height} role="img" aria-label={`Elevation profile, ${LOWEST} to ${HIGHEST} metres`}>
          {yTicks.map((m) => (
            <g key={m}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(m)} y2={y(m)} className="profile-grid" />
              <text x={MARGIN.left - 8} y={y(m)} dy="0.32em" textAnchor="end" className="profile-tick">
                {m} m
              </text>
            </g>
          ))}
          {xTicks.map((k) => (
            <text key={k} x={x(k)} y={height - 8} textAnchor={k === 0 ? 'start' : 'middle'} className="profile-tick">
              {k} km
            </text>
          ))}

          {shapes.map(({ s, area }) => (
            <path
              key={`a${s.id}`}
              d={area}
              fill={s.color}
              opacity={activeId != null && activeId !== s.id ? 0.08 : 0.22}
            />
          ))}
          {/* Thin surface gaps between segments. */}
          {SEGMENTS.slice(1).map((s) => (
            <line key={`g${s.id}`} x1={x(s.startKm)} x2={x(s.startKm)} y1={y(heightAtKm(s.startKm))} y2={baseline} className="profile-gap" />
          ))}
          {shapes.map(({ s, line }) => (
            <path
              key={`l${s.id}`}
              d={line}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              opacity={activeId != null && activeId !== s.id ? 0.35 : 1}
            />
          ))}

          {hoverKm != null && (
            <g pointerEvents="none">
              <line x1={x(hoverKm)} x2={x(hoverKm)} y1={MARGIN.top} y2={baseline} className="profile-crosshair" />
              <circle cx={x(hoverKm)} cy={y(heightAtKm(hoverKm))} r="5" fill={hoverSeg.color} className="profile-dot" />
            </g>
          )}

          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            className="profile-hit"
            onPointerMove={track}
            onPointerDown={track}
            onPointerLeave={clear}
            onPointerCancel={clear}
          />
        </svg>

        {hoverKm != null && (
          <div
            className="profile-tip"
            style={{
              left: tipLeft,
              transform: tipOnLeft ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
            }}
          >
            <strong>{heightAtKm(hoverKm)} m</strong>
            <span>km {hoverKm.toFixed(1)}</span>
            <span>{hoverSeg.name}</span>
            <span>{runnersLabel(hoverSeg)}</span>
          </div>
        )}
      </div>
    </figure>
  );
}
