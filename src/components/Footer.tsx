import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/useUIStore';
import { Mascot } from './Mascot';
import { ChevronRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    });
  };

  return (
    <footer className="relative mt-20 text-[#f5f5f7] overflow-hidden">
      {/* ── Film-reel strip ─────────────────────────── */}
      <div
        className="relative h-8 overflow-hidden border-y border-white/[0.08]"
        style={{
          background:
            'linear-gradient(180deg, rgba(20,20,22,0.85), rgba(10,10,11,0.9))',
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 flex items-center">
          <div
            className="flex gap-3 animate-[reelScroll_14s_linear_infinite]"
            style={{ willChange: 'transform' }}
          >
            {Array.from({ length: 60 }).map((_, i) => (
              <span
                key={i}
                className="shrink-0 w-3 h-3 rounded-[3px]"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03))',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        </div>
        <div
          className="absolute inset-y-0 left-0 w-24 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, #0a0a0b 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-24 pointer-events-none"
          style={{
            background: 'linear-gradient(270deg, #0a0a0b 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-y-0 w-40 pointer-events-none animate-[reelLight_6s_ease-in-out_infinite]"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(124,92,255,0.18), rgba(255,107,157,0.12), transparent)',
            filter: 'blur(8px)',
          }}
        />
      </div>

      {/* ── Glass body ────────────────────────────────── */}
      <div
        className="relative border-b border-white/[0.06]"
        style={{
          background: 'rgba(10,10,11,0.55)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(124,92,255,0.35), rgba(255,107,157,0.35), transparent)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* 4 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/[0.08]">
            {/* Column 1 — Brand */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={go('/')}
                className="group cursor-pointer select-none inline-flex items-baseline font-semibold text-[18px] text-[#f5f5f7] tracking-[-0.02em]"
              >
                <span className="text-[20px] leading-none transition-transform duration-300 group-hover:-translate-y-0.5">
                  C
                </span>
                <span className="transition-opacity duration-300 group-hover:opacity-80">
                  halachitra
                </span>
              </button>
              <p className="text-xs text-[rgba(245,245,247,0.62)] leading-relaxed max-w-xs">
                Cinematic discovery, refined.
              </p>
            </div>

            {/* Column 2 — Browse (My List · For You · Search) */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)]">
                Browse
              </h4>
              <ul className="space-y-1.5">
               {/* My List — highlighted with popup tooltip */}
<li className="relative">
  <button
    type="button"
    onClick={go('/my-list')}
    className="group relative w-full text-left inline-flex items-center justify-between gap-3 px-2.5 py-2 -mx-2.5 rounded-lg text-[#f5f5f7] hover:bg-[rgba(124,92,255,0.10)] transition-all duration-200 cursor-pointer"
  >
    <span className="relative inline-flex items-center gap-2">
      <span
        aria-hidden
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: 'linear-gradient(135deg, #7c5cff, #ff6b9d)',
          boxShadow: '0 0 8px rgba(124,92,255,0.9)',
        }}
      />
      <span className="relative text-[13px] font-semibold">
        My List
        <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-gradient-to-r from-[#7c5cff] to-[#ff6b9d] group-hover:w-full transition-all duration-300" />
      </span>
    </span>
    <ChevronRight
      aria-hidden
      className="w-3.5 h-3.5 text-[#7c5cff]/70 group-hover:text-[#7c5cff] group-hover:translate-x-0.5 transition-all duration-200"
    />

    {/* ⭐ POPUP: "Click again" */}
    <span
      role="tooltip"
      className="
        pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2
        px-2.5 py-1.5 rounded-lg
        bg-[#181818] border border-[rgba(124,92,255,0.35)]
        shadow-[0_8px_28px_-8px_rgba(124,92,255,0.5),0_4px_16px_-4px_rgba(0,0,0,0.8)]
        text-[11px] font-medium text-[#f5f5f7] whitespace-nowrap
        opacity-0 translate-y-1 scale-95
        group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
        transition-all duration-200 ease-out
        z-30
      "
    >
      Click again
      {/* Small arrow pointing down toward the button */}
      <span
        aria-hidden
        className="
          absolute top-full left-1/2 -translate-x-1/2 mt-[1px]
          w-2 h-2 rotate-45
          bg-[#181818]
          border-r border-b border-[rgba(124,92,255,0.35)]
        "
      />
      {/* Subtle glow behind the popup */}
      <span
        aria-hidden
        className="
          absolute inset-0 rounded-lg -z-10
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        "
        style={{
          background:
            'radial-gradient(80% 100% at 50% 100%, rgba(124,92,255,0.25) 0%, transparent 70%)',
        }}
      />
    </span>
  </button>
</li>
                {/* For You */}
                <li>
                  <button
                    type="button"
                    onClick={go('/recommend')}
                    className="group relative w-full text-left inline-flex items-center justify-between gap-3 px-2.5 py-2 -mx-2.5 rounded-lg text-[rgba(245,245,247,0.62)] hover:text-[#f5f5f7] hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                  >
                    <span className="relative text-[13px] font-medium">
                      For You
                      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-gradient-to-r from-[#7c5cff] to-[#ff6b9d] group-hover:w-full transition-all duration-300" />
                    </span>
                    <ChevronRight
                      aria-hidden
                      className="w-3.5 h-3.5 text-white/25 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all duration-200"
                    />
                  </button>
                </li>

                {/* Search */}
                <li>
                  <button
                    type="button"
                    onClick={() => setCommandPaletteOpen(true)}
                    className="group relative w-full text-left inline-flex items-center justify-between gap-3 px-2.5 py-2 -mx-2.5 rounded-lg text-[rgba(245,245,247,0.62)] hover:text-[#f5f5f7] hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                  >
                    <span className="relative inline-flex items-center gap-2">
                      <span className="relative text-[13px] font-medium">
                        Search
                        <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-gradient-to-r from-[#7c5cff] to-[#ff6b9d] group-hover:w-full transition-all duration-300" />
                      </span>
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/[0.08] text-[rgba(245,245,247,0.35)]">
                        ⌘K
                      </kbd>
                    </span>
                    <ChevronRight
                      aria-hidden
                      className="w-3.5 h-3.5 text-white/25 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all duration-200"
                    />
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 — Platform */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)]">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-[rgba(245,245,247,0.62)]">
                {['Dolby Vision', 'Spatial Audio', 'Multi-Server', 'Offline Cache'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{
                          background:
                            'linear-gradient(135deg, #7c5cff, #ff6b9d)',
                          opacity: 0.7,
                        }}
                      />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Column 4 — Legal */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)]">
                Legal
              </h4>
              <ul className="space-y-2 text-xs text-[rgba(245,245,247,0.62)]">
                {[
                  { label: 'Terms', href: '#terms' },
                  { label: 'Privacy', href: '#privacy' },
                  { label: 'DMCA', href: '#dmca' },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group relative inline-block hover:text-[#f5f5f7] transition-colors"
                    >
                      {label}
                      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-gradient-to-r from-[#7c5cff] to-[#ff6b9d] group-hover:w-full transition-all duration-300" />
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="mailto:contact@chalachitra.app"
                    className="group relative inline-block hover:text-[#f5f5f7] transition-colors"
                  >
                    Contact
                    <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-gradient-to-r from-[#7c5cff] to-[#ff6b9d] group-hover:w-full transition-all duration-300" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[rgba(245,245,247,0.38)]">
            <div className="flex items-center gap-2 tracking-wide">
              <Mascot state="idle" size={24} />
              <span>Made by M🔺Y🔺N K</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              {[
                { label: 'X', href: 'https://twitter.com' },
                { label: 'IG', href: 'https://instagram.com' },
                { label: 'GH', href: 'https://github.com' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="relative font-mono text-[rgba(245,245,247,0.55)] hover:text-[#f5f5f7] transition-colors px-1.5 py-0.5 rounded-md hover:bg-white/[0.05]"
                >
                  [{label}]
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes reelScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes reelLight {
          0%   { transform: translateX(-30%); opacity: 0; }
          20%  { opacity: 0.7; }
          50%  { opacity: 0.9; }
          80%  { opacity: 0.7; }
          100% { transform: translateX(130%); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-[reel"] {
            animation: none !important;
          }
        }
      `}</style>
    </footer>
  );
};