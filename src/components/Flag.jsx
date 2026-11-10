import { useEffect, useState } from 'react';

// The DJ Run 2027 flag: one piece of cloth (no slicing, so nothing can split).
// Its outline gently morphs between two wave shapes and soft fold shadows roll
// out from the pole. Both animations are dropped for reduced motion.

const W = 300;
const H = 200;
const CLOTH_X = 15;
const CLOTH_Y = 18;
const FOLD = 150; // width of one fold (shadow + highlight), in SVG units

const GREEN = '#1d3f33';
const GOLD = '#e8b021';
const CHALK = '#f1f4ee';
const DISPLAY = "'Big Shoulders Display', 'Arial Narrow', sans-serif";

// Same commands in both shapes so the browser can morph between them.
// The edges move more the further they are from the pole.
const WAVE_A = `M0 0 C90 -4 180 9 ${W} -6 L${W} ${H - 4} C180 ${H + 9} 90 ${H - 4} 0 ${H} Z`;
const WAVE_B = `M0 0 C90 7 180 -8 ${W} 6 L${W} ${H + 7} C180 ${H - 8} 90 ${H + 7} 0 ${H} Z`;

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export default function Flag() {
  const still = usePrefersReducedMotion();
  const ease = { calcMode: 'spline', keyTimes: '0;0.5;1', keySplines: '0.45 0 0.55 1;0.45 0 0.55 1' };

  return (
    <svg
      className="flag"
      viewBox={`0 0 ${CLOTH_X + W + 12} 430`}
      role="img"
      aria-label="The DJ Run 2027 flag"
    >
      <defs>
        <clipPath id="flag-shape">
          <path d={WAVE_A}>
            {!still && (
              <animate attributeName="d" dur="2.6s" repeatCount="indefinite" values={`${WAVE_A};${WAVE_B};${WAVE_A}`} {...ease} />
            )}
          </path>
        </clipPath>

        {/* Repeating band: shadow, then a faint highlight. Slides away from the pole. */}
        <linearGradient id="flag-folds" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={FOLD} y2="0" spreadMethod="repeat">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.35" stopColor="#000" stopOpacity="0.2" />
          <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.85" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
          {!still && (
            <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to={`${FOLD} 0`} dur="2.6s" repeatCount="indefinite" />
          )}
        </linearGradient>

        {/* Folds are faint at the pole, where the cloth is held, and full at the free end. */}
        <linearGradient id="flag-fold-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="flag-fold-mask" maskUnits="userSpaceOnUse" x="0" y="-20" width={W} height={H + 40}>
          <rect y="-20" width={W} height={H + 40} fill="url(#flag-fold-fade)" />
        </mask>
      </defs>

      <rect x="6" y="6" width="9" height="420" rx="4" className="flag-pole" />
      <circle cx="10.5" cy="7" r="7" className="flag-pole" />

      <g transform={`translate(${CLOTH_X} ${CLOTH_Y})`} clipPath="url(#flag-shape)">
        <rect y="-20" width={W} height={H + 40} fill={GREEN} />
        <text
          x="22"
          y="104"
          fontFamily={DISPLAY}
          fontWeight="900"
          fontSize="104"
          textLength={W - 44}
          lengthAdjust="spacingAndGlyphs"
          fill={CHALK}
        >
          DJ RUN
        </text>
        <text x="22" y="156" fontFamily={DISPLAY} fontWeight="900" fontSize="56" letterSpacing="1" fill={GOLD}>
          2027
        </text>
        <rect y={H - 22} width={W} height="40" fill={GOLD} />
        <rect y="-20" width={W} height={H + 40} fill="url(#flag-folds)" mask="url(#flag-fold-mask)" />
      </g>
    </svg>
  );
}
