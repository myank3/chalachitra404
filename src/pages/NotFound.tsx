import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Film, Search } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-lg text-center">
        {/* Ambient gradient orb behind the number */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(124,92,255,0.15) 0%, transparent 60%)',
            filter: 'blur(40px)',
            animation: 'notFoundPulse 6s ease-in-out infinite',
          }}
        />

        {/* 404 number with gradient */}
        <div className="relative mb-8">
          <h1
            className="text-[120px] sm:text-[160px] font-bold leading-none tracking-[-0.05em] select-none"
            style={{
              background: 'linear-gradient(135deg, #7c5cff 0%, #ff6b9d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'notFoundGlow 4s ease-in-out infinite',
            }}
          >
            404
          </h1>

          {/* Decorative film strip under the number */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-sm"
                style={{
                  background:
                    i % 2 === 0
                      ? 'rgba(124,92,255,0.4)'
                      : 'rgba(255,107,157,0.3)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="relative mb-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[rgba(245,245,247,0.35)] mb-3">
            Lost in the reel
          </p>
          <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#f5f5f7] tracking-[-0.02em] mb-3">
            This scene doesn't exist
          </h2>
          <p className="text-[14px] leading-relaxed text-[rgba(245,245,247,0.55)] max-w-sm mx-auto">
            The page you're looking for has been cut from the final edit — or
            never made it past the storyboard.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 h-11 px-6 rounded-xl font-semibold text-[13px] text-black transition-all duration-300 active:scale-[0.98] cursor-pointer"
            style={{
              background: '#ffffff',
              boxShadow: '0 8px 32px rgba(255,255,255,0.15)',
            }}
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            <span>Back to Home</span>
          </button>

          <button
            onClick={() => navigate('/movies')}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-semibold text-[13px] text-white border border-white/[0.15] bg-white/[0.05] hover:bg-white/[0.1] transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <Film className="w-4 h-4" strokeWidth={2} />
            <span>Browse Movies</span>
          </button>
        </div>

        {/* Hint */}
        <p className="mt-10 text-[11px] text-[rgba(245,245,247,0.35)] flex items-center justify-center gap-1.5">
          <Search className="w-3 h-3" strokeWidth={2} />
          Or press <kbd className="px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.03] text-[10px] font-mono text-[rgba(245,245,247,0.55)]">⌘K</kbd> to search
        </p>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes notFoundPulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.8; }
          50%      { transform: translateX(-50%) scale(1.15); opacity: 1; }
        }
        @keyframes notFoundGlow {
          0%, 100% { filter: drop-shadow(0 0 24px rgba(124,92,255,0.35)); }
          50%      { filter: drop-shadow(0 0 40px rgba(255,107,157,0.4)); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="notFound"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};