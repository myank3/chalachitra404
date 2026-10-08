import React from 'react';

/**
 * AmbientBackground
 * Fixed full-screen layer behind the app (z-index -1).
 *
 * Layers (bottom to top):
 *   1. Base #0a0a0b
 *   2. Marble veining — SVG turbulence, very faint
 *   3. Two drifting radial orbs — violet + pink at 8%
 *   4. Slow teal orb for depth
 *   5. Vignette — darker edges
 *   6. Fine grain overlay
 *
 * Respects prefers-reduced-motion.
 */
export const AmbientBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0a0a0b]"
    >
      {/* 1 — Marble veining */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.5 }}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <filter id="ambient-marble">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.013 0.026"
              numOctaves="4"
              seed="7"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.05
                      0 0 0 0 0.05
                      0 0 0 0 0.06
                      0 0 0 0.55 0"
            />
          </filter>

          <filter id="ambient-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed="3"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.5
                      0 0 0 0 0.5
                      0 0 0 0 0.5
                      0 0 0 0.04 0"
            />
          </filter>
        </defs>

        <rect width="100%" height="100%" filter="url(#ambient-marble)" />
        <rect width="100%" height="100%" filter="url(#ambient-grain)" />
      </svg>

      {/* 2 — Primary drifting orbs (violet + pink) */}
      <div
        className="absolute -inset-[25%] w-[150%] h-[150%] animate-[ambientDrift_40s_ease-in-out_infinite] will-change-transform"
        style={{
          background:
            'radial-gradient(circle at 25% 25%, rgba(124, 92, 255, 0.09) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgba(255, 107, 157, 0.08) 0%, transparent 45%)',
        }}
      />

      {/* 3 — Slow teal accent for depth */}
      <div
        className="absolute -inset-[25%] w-[150%] h-[150%] animate-[ambientDriftSlow_70s_ease-in-out_infinite] will-change-transform"
        style={{
          background:
            'radial-gradient(circle at 60% 40%, rgba(94, 234, 212, 0.045) 0%, transparent 50%)',
        }}
      />

      {/* 4 — Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(10, 10, 11, 0.65) 100%)',
        }}
      />

      {/* Keyframes */}
      <style>{`
        @keyframes ambientDrift {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-2.5%, -1.5%) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes ambientDriftSlow {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(3%, 2%) scale(1.08); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-[ambientDrift"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AmbientBackground;