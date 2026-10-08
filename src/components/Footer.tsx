import React, { useEffect, useState } from 'react';
import { useUIStore } from '../stores/useUIStore';
import { Mascot } from './Mascot';

export const Footer: React.FC = () => {
  const { setActiveTab, setCommandPaletteOpen } = useUIStore();
  const [year, setYear] = useState(new Date().getFullYear());

  const handleNav = (
    tab: 'home' | 'movies' | 'tv' | 'watchlist' | 'genres'
  ) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-20 text-[#f5f5f7] overflow-hidden">
      {/* ── Cinematic film-reel strip at the top ───────────────── */}
      <div
        className="relative h-8 overflow-hidden border-y border-white/[0.08]"
        style={{
          background:
            'linear-gradient(180deg, rgba(20,20,22,0.85), rgba(10,10,11,0.9))',
        }}
        aria-hidden="true"
      >
        {/* Perforation track */}
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
                  boxShadow:
                    'inset 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Soft gradient edges so the strip fades at both ends */}
        <div
          className="absolute inset-y-0 left-0 w-24 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, #0a0a0b 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-24 pointer-events-none"
          style={{
            background:
              'linear-gradient(270deg, #0a0a0b 0%, transparent 100%)',
          }}
        />

        {/* Subtle moving light sweep across the strip */}
        <div
          className="absolute inset-y-0 w-40 pointer-events-none animate-[reelLight_6s_ease-in-out_infinite]"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(124,92,255,0.18), rgba(255,107,157,0.12), transparent)',
            filter: 'blur(8px)',
          }}
        />
      </div>

      {/* ── Main glass body ────────────────────────────────────── */}
      <div
        className="relative border-b border-white/[0.06]"
        style={{
          background: 'rgba(10,10,11,0.55)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        }}
      >
        {/* Ambient violet → pink top glow inside the glass body */}
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
            {/* Column 1: Brand */}
            <div className="space-y-3">
              <div
                onClick={() => handleNav('home')}
                className="group cursor-pointer select-none inline-flex items-baseline font-semibold text-[18px] text-[#f5f5f7] tracking-[-0.02em]"
              >
                <span className="text-[20px] leading-none transition-transform duration-300 group-hover:-translate-y-0.5">
                  C
                </span>
                <span className="transition-opacity duration-300 group-hover:opacity-80">
                  halachitra
                </span>
              </div>
              <p className="text-xs text-[rgba(245,245,247,0.62)] leading-relaxed max-w-xs">
                Cinematic discovery, refined.
              </p>
            </div>

            {/* Column 2: Browse */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)]">
                Browse
              </h4>
              <ul className="space-y-2 text-xs text-[rgba(245,245,247,0.62)]">
                {[
                  { label: 'Movies', tab: 'movies' as const },
                  { label: 'TV Shows', tab: 'tv' as const },
                  { label: 'Genres', tab: 'genres' as const },
                  { label: 'My List', tab: 'watchlist' as const },
                ].map(({ label, tab }) => (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => handleNav(tab)}
                      className="group relative inline-flex items-center hover:text-[#f5f5f7] transition-colors cursor-pointer text-left"
                    >
                      <span className="relative">
                        {label}
                        <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-gradient-to-r from-[#7c5cff] to-[#ff6b9d] group-hover:w-full transition-all duration-300" />
                      </span>
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setCommandPaletteOpen(true)}
                    className="group relative inline-flex items-center gap-1.5 hover:text-[#f5f5f7] transition-colors cursor-pointer text-left"
                  >
                    <span className="relative">
                      Search
                      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-gradient-to-r from-[#7c5cff] to-[#ff6b9d] group-hover:w-full transition-all duration-300" />
                    </span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/[0.08] text-[rgba(245,245,247,0.35)]">
                      ⌘K
                    </kbd>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform */}
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

            {/* Column 4: Legal */}
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

      {/* ── Keyframes ─────────────────────────────────────────── */}
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