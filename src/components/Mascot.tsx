import React from 'react';

export interface MascotProps {
  state?: 'idle' | 'loading' | 'empty';
  size?: number;
  animate?: boolean;
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({
  state = 'idle',
  size = 48,
  animate = true,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${
        animate && state === 'idle'
          ? 'animate-[mascotBreathe_4s_ease-in-out_infinite]'
          : animate && state === 'empty'
          ? 'animate-[mascotSway_2.5s_ease-in-out_infinite]'
          : ''
      } ${className}`}
      aria-label={`Chitra mascot (${state})`}
      role="img"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Antenna Stem */}
        <line
          x1="24"
          y1="14"
          x2="24"
          y2="6"
          stroke="#ff6b9d"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Antenna Top Element */}
        {state === 'loading' ? (
          <g
            className={animate ? 'origin-[24px_5px] animate-[antennaSpin_1s_linear_infinite]' : ''}
          >
            {/* Spinning radar arc */}
            <circle
              cx="24"
              cy="5"
              r="3.5"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="14"
              strokeDashoffset="6"
            />
            <circle cx="24" cy="5" r="1.5" fill="#5eead4" />
          </g>
        ) : (
          /* Normal Glowing Dot */
          <circle cx="24" cy="5" r="2.5" fill="#ffffff" />
        )}

        {/* Main Body - Pink (#ff6b9d), soft rounded friendly shape */}
        <rect
          x="8"
          y="13"
          width="32"
          height="28"
          rx="12"
          fill="#ff6b9d"
        />

        {/* Soft belly badge indicator (film reel touch) */}
        <circle cx="24" cy="33" r="2" fill="rgba(255, 255, 255, 0.4)" />

        {/* Eyes State Rendering */}
        {state === 'empty' ? (
          /* Closed / Sleepy Curved Eyes */
          <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
            <path d="M16 23 C17.5 25.5, 20.5 25.5, 22 23" />
            <path d="M26 23 C27.5 25.5, 30.5 25.5, 32 23" />
          </g>
        ) : state === 'loading' ? (
          /* Looking Up Eyes */
          <g>
            <circle cx="19" cy="20" r="3" fill="#ffffff" />
            <circle cx="19" cy="19" r="1.5" fill="#0a0a0b" />
            <circle cx="29" cy="20" r="3" fill="#ffffff" />
            <circle cx="29" cy="19" r="1.5" fill="#0a0a0b" />
          </g>
        ) : (
          /* Idle Bright Eyes with friendly catchlight */
          <g>
            <circle cx="19" cy="22" r="3" fill="#ffffff" />
            <circle cx="19.5" cy="21.5" r="1.2" fill="#0a0a0b" />
            <circle cx="29" cy="22" r="3" fill="#ffffff" />
            <circle cx="29.5" cy="21.5" r="1.2" fill="#0a0a0b" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default Mascot;
