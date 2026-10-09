import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/useUIStore';
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
      {/* ═══════════════════════════════════════════════
          CHASE STRIP
         ═══════════════════════════════════════════════ */}
      <div
        className="relative h-20 overflow-hidden border-y border-white/[0.08] select-none"
        style={{
          background:
            'linear-gradient(180deg, #14121a 0%, #0c0a10 60%, #0a0a0b 100%)',
        }}
        aria-hidden="true"
      >
        {/* warm key light */}
        <div
          className="absolute -top-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(255,180,120,0.12) 0%, transparent 65%)',
            filter: 'blur(20px)',
          }}
        />
        {/* menacing red glow from behind the bull */}
        <div
          className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(180,20,20,0.16) 0%, transparent 70%)',
            filter: 'blur(28px)',
          }}
        />

        {/* dust */}
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${(i * 61) % 100}%`,
              top: `${30 + ((i * 43) % 50)}%`,
              width: 1,
              height: 1,
              background:
                i % 3 === 0
                  ? 'rgba(255,200,140,0.55)'
                  : 'rgba(255,255,255,0.35)',
              animation: `dustDrift ${8 + (i % 3)}s linear infinite`,
              animationDelay: `${(i % 5) * -1.4}s`,
            }}
          />
        ))}

        {/* floor line */}
        <div
          className="absolute left-0 right-0 bottom-3 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,180,120,0.16), rgba(124,92,255,0.16), transparent)',
          }}
        />

        {/* the chase */}
        <div
          className="absolute bottom-3 left-0"
          style={{ animation: 'runAcross 15s linear infinite' }}
        >
          <div className="flex items-end">
            <Bull />
            <div style={{ marginLeft: 10 }}>
              <Runner />
            </div>
          </div>
        </div>

        {/* edge fades */}
        <div
          className="absolute inset-y-0 left-0 w-12 sm:w-20 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(90deg, #0a0a0b 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-12 sm:w-20 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(270deg, #0a0a0b 0%, transparent 100%)',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════
          GLASS BODY
         ═══════════════════════════════════════════════ */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/[0.08]">
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

            <div className="space-y-3">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)]">
                Browse
              </h4>
              <ul className="space-y-1.5">
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
                          background:
                            'linear-gradient(135deg, #7c5cff, #ff6b9d)',
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
                  </button>
                </li>
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

          {/* Bottom bar — bull logo replaces mascot */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[rgba(245,245,247,0.38)]">
            <div className="flex items-center gap-2 tracking-wide">
              <BullLogo size={26} />
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
        @keyframes runAcross {
          from { transform: translateX(-140px); }
          to   { transform: translateX(calc(100vw + 140px)); }
        }

        @keyframes frontThigh {
          0%   { transform: rotate(-40deg); }
          12%  { transform: rotate(-30deg); }
          25%  { transform: rotate(-12deg); }
          37%  { transform: rotate(18deg); }
          50%  { transform: rotate(28deg); }
          62%  { transform: rotate(-2deg); }
          75%  { transform: rotate(-30deg); }
          87%  { transform: rotate(-40deg); }
          100% { transform: rotate(-40deg); }
        }
        @keyframes frontShin {
          0%   { transform: rotate(4deg); }
          12%  { transform: rotate(28deg); }
          25%  { transform: rotate(12deg); }
          37%  { transform: rotate(-2deg); }
          50%  { transform: rotate(95deg); }
          62%  { transform: rotate(120deg); }
          75%  { transform: rotate(60deg); }
          87%  { transform: rotate(18deg); }
          100% { transform: rotate(4deg); }
        }
        @keyframes backThigh {
          0%   { transform: rotate(28deg); }
          12%  { transform: rotate(-2deg); }
          25%  { transform: rotate(-30deg); }
          37%  { transform: rotate(-40deg); }
          50%  { transform: rotate(-40deg); }
          62%  { transform: rotate(-30deg); }
          75%  { transform: rotate(-12deg); }
          87%  { transform: rotate(18deg); }
          100% { transform: rotate(28deg); }
        }
        @keyframes backShin {
          0%   { transform: rotate(95deg); }
          12%  { transform: rotate(120deg); }
          25%  { transform: rotate(60deg); }
          37%  { transform: rotate(18deg); }
          50%  { transform: rotate(4deg); }
          62%  { transform: rotate(28deg); }
          75%  { transform: rotate(12deg); }
          87%  { transform: rotate(-2deg); }
          100% { transform: rotate(95deg); }
        }
        @keyframes freeArmUpper {
          0%   { transform: rotate(-42deg); }
          25%  { transform: rotate(-8deg); }
          50%  { transform: rotate(38deg); }
          75%  { transform: rotate(0deg); }
          100% { transform: rotate(-42deg); }
        }
        @keyframes freeArmLower {
          0%   { transform: rotate(-85deg); }
          25%  { transform: rotate(-45deg); }
          50%  { transform: rotate(-30deg); }
          75%  { transform: rotate(-70deg); }
          100% { transform: rotate(-85deg); }
        }
        @keyframes torsoArc {
          0%   { transform: translateY(0); }
          12%  { transform: translateY(1.6px); }
          25%  { transform: translateY(-0.6px); }
          37%  { transform: translateY(-2.2px); }
          50%  { transform: translateY(-1.6px); }
          62%  { transform: translateY(0.4px); }
          75%  { transform: translateY(1.2px); }
          87%  { transform: translateY(0.6px); }
          100% { transform: translateY(0); }
        }
        @keyframes headLead {
          0%   { transform: translateY(0); }
          12%  { transform: translateY(0.6px); }
          25%  { transform: translateY(-0.4px); }
          37%  { transform: translateY(-0.8px); }
          50%  { transform: translateY(-0.6px); }
          62%  { transform: translateY(0.2px); }
          75%  { transform: translateY(0.5px); }
          87%  { transform: translateY(0.2px); }
          100% { transform: translateY(0); }
        }
        @keyframes rigBounce {
          0%   { transform: translateY(0); }
          15%  { transform: translateY(1.4px); }
          35%  { transform: translateY(-1.2px); }
          55%  { transform: translateY(-0.6px); }
          75%  { transform: translateY(1px); }
          100% { transform: translateY(0); }
        }

        /* ── BULL LEGS — heavier, wider stride ── */
        @keyframes bullFrontThigh {
          0%   { transform: rotate(-46deg); }
          15%  { transform: rotate(-34deg); }
          30%  { transform: rotate(-8deg); }
          45%  { transform: rotate(22deg); }
          60%  { transform: rotate(32deg); }
          75%  { transform: rotate(-4deg); }
          90%  { transform: rotate(-40deg); }
          100% { transform: rotate(-46deg); }
        }
        @keyframes bullFrontShin {
          0%   { transform: rotate(8deg); }
          15%  { transform: rotate(42deg); }
          30%  { transform: rotate(18deg); }
          45%  { transform: rotate(-4deg); }
          60%  { transform: rotate(88deg); }
          75%  { transform: rotate(58deg); }
          90%  { transform: rotate(26deg); }
          100% { transform: rotate(8deg); }
        }
        @keyframes bullBackThigh {
          0%   { transform: rotate(32deg); }
          15%  { transform: rotate(-4deg); }
          30%  { transform: rotate(-40deg); }
          45%  { transform: rotate(-46deg); }
          60%  { transform: rotate(-34deg); }
          75%  { transform: rotate(-8deg); }
          90%  { transform: rotate(22deg); }
          100% { transform: rotate(32deg); }
        }
        @keyframes bullBackShin {
          0%   { transform: rotate(88deg); }
          15%  { transform: rotate(58deg); }
          30%  { transform: rotate(26deg); }
          45%  { transform: rotate(8deg); }
          60%  { transform: rotate(42deg); }
          75%  { transform: rotate(18deg); }
          90%  { transform: rotate(-4deg); }
          100% { transform: rotate(88deg); }
        }

        /* ── BULL BODY — heavier arc ── */
        @keyframes bullArc {
          0%   { transform: translateY(0); }
          15%  { transform: translateY(2.6px); }
          30%  { transform: translateY(-1.2px); }
          45%  { transform: translateY(-3.6px); }
          60%  { transform: translateY(-2.4px); }
          75%  { transform: translateY(1.8px); }
          90%  { transform: translateY(1px); }
          100% { transform: translateY(0); }
        }

        @keyframes tailWhip {
          0%, 100% { transform: rotate(-18deg); }
          50%      { transform: rotate(22deg); }
        }
        @keyframes bullHead {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50%      { transform: translateY(-0.8px) rotate(3deg); }
        }
        /* shoulder muscle swells as he runs */
        @keyframes shoulderSwell {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.05); }
        }
        @keyframes hoofDust {
          0%   { transform: translate(0, 0) scale(0.4); opacity: 0; }
          20%  { opacity: 0.7; }
          100% { transform: translate(-10px, -7px) scale(1.4); opacity: 0; }
        }

        @keyframes lensSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes recPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.2; }
        }
        @keyframes dustDrift {
          from { transform: translate(0, 0); opacity: 0; }
          20%  { opacity: 0.5; }
          80%  { opacity: 0.5; }
          to   { transform: translate(-40px, -5px); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          [style*="animation"], [class*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </footer>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   THE RUNNER — unchanged, sunglasses intact
   ═══════════════════════════════════════════════════════════════════ */
const Runner: React.FC = () => {
  const C = '0.42s';
  const EASE = 'cubic-bezier(0.4, 0, 0.6, 1)';

  const SKIN = '#e7b48a';
  const BODY = '#2e2e3a';
  const DARK = '#1a1a22';
  const RIM = '#ffb47a';
  const ACCENT = '#7c5cff';
  const HOT = '#ff6b9d';
  const LENS = '#12121a';
  const FRAME = '#0a0a0f';

  return (
    <svg
      width="52"
      height="46"
      viewBox="0 0 52 46"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <g transform="translate(22, 44)">
        <g style={{ animation: `torsoArc ${C} ${EASE} infinite` }}>
          <ellipse cx="0" cy="0" rx="8" ry="1.3" fill="#000" opacity="0.35" />
        </g>
      </g>

      <g style={{ animation: `torsoArc ${C} ${EASE} infinite` }}>
        <g transform="translate(22, 30)">
          <g
            style={{
              transformOrigin: '0px 0px',
              animation: `backThigh ${C} ${EASE} infinite`,
            }}
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke={BODY} strokeWidth="3.4" strokeLinecap="round" />
            <g transform="translate(0, 8)">
              <g
                style={{
                  transformOrigin: '0px 0px',
                  animation: `backShin ${C} ${EASE} infinite`,
                }}
              >
                <line x1="0" y1="0" x2="0" y2="8" stroke={BODY} strokeWidth="2.8" strokeLinecap="round" />
                <path d="M-1 8 Q1 9.5 3.4 9" stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>

        <g transform="rotate(16 22 30)">
          <path d="M18.5 16 L25.5 16 L25 30 L19 30 Z" fill={BODY} />
          <path d="M18.5 16 L20 16 L20 30 L19 30 Z" fill={RIM} opacity="0.35" />
          <rect x="19.5" y="19" width="5" height="1.4" rx="0.6" fill={ACCENT} opacity="0.8" />

          <g transform="translate(22, 18.5)">
            <g style={{ transformOrigin: '0px 0px', animation: `freeArmUpper ${C} ${EASE} infinite` }}>
              <line x1="0" y1="0" x2="0" y2="6" stroke={BODY} strokeWidth="2.6" strokeLinecap="round" />
              <g transform="translate(0, 6)">
                <g style={{ transformOrigin: '0px 0px', animation: `freeArmLower ${C} ${EASE} infinite` }}>
                  <line x1="0" y1="0" x2="0" y2="5" stroke={BODY} strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="0" cy="5.5" r="1.6" fill={SKIN} />
                </g>
              </g>
            </g>
          </g>

          <g transform="translate(18, 12)">
            <g style={{ animation: `headLead ${C} ${EASE} infinite`, transformOrigin: '0px 0px' }}>
              <line x1="0" y1="0" x2="0" y2="3" stroke={SKIN} strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="0" cy="-2" r="5" fill={SKIN} />
              <path d="M-5 -4 A5 5 0 0 1 -2 -6.8" stroke={RIM} strokeWidth="1.1" fill="none" strokeLinecap="round" />
              <path d="M-5 -3.2 a5 5 0 0 1 10 0 L5.5 -4.2 L-5 -4.2 Z" fill={ACCENT} />
              <rect x="-5.5" y="-5.2" width="11.5" height="1.4" rx="0.6" fill={HOT} />
              <path d="M-5 -3.5 A5 5 0 0 1 5 -3.5" fill="none" stroke={DARK} strokeWidth="1.2" />
              <circle cx="-5" cy="-2.5" r="1.5" fill={HOT} />
              {/* sunglasses */}
              <rect x="-2" y="-2.4" width="6.4" height="3" rx="0.9" fill={LENS} />
              <rect x="-1.4" y="-2" width="2.4" height="0.8" rx="0.4" fill="#ffffff" opacity="0.28" />
              <line x1="-2.4" y1="-2.6" x2="4.7" y2="-2.6" stroke={FRAME} strokeWidth="0.5" strokeLinecap="round" />
              <line x1="4.4" y1="-1.2" x2="5" y2="-1.6" stroke={FRAME} strokeWidth="0.6" strokeLinecap="round" />
              <path d="M1.5 0.6 Q2.5 1.2 3.5 0.6" stroke={DARK} strokeWidth="0.6" fill="none" strokeLinecap="round" />
            </g>
          </g>

          <g transform="translate(20, 16)">
            <g style={{ animation: `rigBounce ${C} ${EASE} infinite`, transformOrigin: '0px 0px' }}>
              <g transform="rotate(-6)">
                <rect x="0" y="-10" width="18" height="10" rx="2" fill={DARK} stroke={BODY} strokeWidth="0.7" />
                <path d="M0 -10 L3 -10 L3 0 L0 0 Z" fill={RIM} opacity="0.45" />
                <path d="M0 -10 L18 -10" stroke={RIM} strokeWidth="0.8" opacity="0.35" fill="none" />
                <rect x="2.5" y="-7.5" width="6" height="1.8" rx="0.5" fill={ACCENT} opacity="0.9" />
                <rect x="10" y="-7" width="5.5" height="1.4" rx="0.5" fill={HOT} opacity="0.85" />
                <circle cx="5" cy="-13" r="3" fill={DARK} stroke={BODY} strokeWidth="0.7" />
                <circle cx="5" cy="-13" r="1" fill={ACCENT} opacity="0.75" />
                <circle cx="12.5" cy="-12.5" r="2.4" fill={DARK} stroke={BODY} strokeWidth="0.7" />
                <circle cx="12.5" cy="-12.5" r="0.8" fill={HOT} opacity="0.7" />
                <circle cx="20" cy="-4.5" r="3.4" fill={DARK} stroke={BODY} strokeWidth="0.8" />
                <circle
                  cx="20"
                  cy="-4.5"
                  r="2"
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth="0.9"
                  strokeDasharray="1.8 1.2"
                  style={{ transformOrigin: '20px -4.5px', animation: 'lensSpin 3.2s linear infinite' }}
                />
                <circle cx="20" cy="-4.5" r="0.8" fill={HOT} />
                <circle cx="16" cy="-1.5" r="0.7" fill="#ff4040" style={{ animation: 'recPulse 1.2s ease-in-out infinite' }} />
              </g>
            </g>
          </g>

          <g transform="translate(22, 18.5)">
            <g style={{ transform: 'rotate(-80deg)', transformOrigin: '0px 0px' }}>
              <line x1="0" y1="0" x2="0" y2="6" stroke={BODY} strokeWidth="2.8" strokeLinecap="round" />
              <g transform="translate(0, 6)">
                <g style={{ transform: 'rotate(-155deg)', transformOrigin: '0px 0px' }}>
                  <line x1="0" y1="0" x2="0" y2="5" stroke={BODY} strokeWidth="2.4" strokeLinecap="round" />
                  <circle cx="0" cy="5.5" r="1.7" fill={SKIN} />
                  <circle cx="0" cy="5.5" r="1.7" fill="none" stroke={RIM} strokeWidth="0.5" opacity="0.6" />
                </g>
              </g>
            </g>
          </g>

          <g transform="translate(22, 30)">
            <g style={{ transformOrigin: '0px 0px', animation: `frontThigh ${C} ${EASE} infinite` }}>
              <line x1="0" y1="0" x2="0" y2="8" stroke={BODY} strokeWidth="3.4" strokeLinecap="round" />
              <g transform="translate(0, 8)">
                <g style={{ transformOrigin: '0px 0px', animation: `frontShin ${C} ${EASE} infinite` }}>
                  <line x1="0" y1="0" x2="0" y2="8" stroke={BODY} strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M-1 8 Q1 9.5 3.4 9" stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   THE BULL — muscular, menacing
   Bigger body, visible muscle anatomy, red eye, slavering muzzle,
   steam from nostrils, heavier gallop.
   ═══════════════════════════════════════════════════════════════════ */
const Bull: React.FC = () => {
  const C = '0.42s';
  const EASE = 'cubic-bezier(0.4, 0, 0.6, 1)';

  // Palette — deep charcoal hide with warm underlighting
  const HIDE = '#231620';
  const HIDE_DARK = '#160d14';
  const HIDE_MID = '#2e1c28';
  const HIDE_LIGHT = '#3e2634';
  const MUSCLE_SHADOW = '#0f070d';
  const MUSCLE_HI = '#4a2e3c';
  const HORN = '#e8dcc0';
  const HORN_SHADOW = '#a89878';
  const HOOF = '#08050a';
  const EYE = '#ff2a2a';
  const EYE_GLOW = 'rgba(255,42,42,0.6)';
  const RIM = '#ffb47a';
  const STEAM = 'rgba(255,255,255,0.35)';
  const SLOBBER = '#c8b0a0';

  return (
    <svg
      width="92"
      height="52"
      viewBox="0 0 92 52"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* ground shadow — bigger, softer */}
      <g transform="translate(46, 48)">
        <g style={{ animation: `bullArc ${C} ${EASE} infinite` }}>
          <ellipse cx="0" cy="0" rx="20" ry="2.4" fill="#000" opacity="0.45" />
        </g>
      </g>

      <g style={{ animation: `bullArc ${C} ${EASE} infinite` }}>
        {/* ═══════════════════════════════════════════════
            BACK LEGS (far side)
            ═══════════════════════════════════════════════ */}
        <g transform="translate(24, 34)">
          <g style={{ transformOrigin: '0px 0px', animation: `bullBackThigh ${C} ${EASE} infinite` }}>
            <line x1="0" y1="0" x2="0" y2="8" stroke={HIDE_DARK} strokeWidth="5" strokeLinecap="round" />
            <g transform="translate(0, 8)">
              <g style={{ transformOrigin: '0px 0px', animation: `bullBackShin ${C} ${EASE} infinite` }}>
                <line x1="0" y1="0" x2="0" y2="8" stroke={HIDE_DARK} strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="1" cy="9" rx="3" ry="1.6" fill={HOOF} />
              </g>
            </g>
          </g>
        </g>
        <g transform="translate(64, 34)">
          <g style={{ transformOrigin: '0px 0px', animation: `bullFrontThigh ${C} ${EASE} infinite` }}>
            <line x1="0" y1="0" x2="0" y2="8" stroke={HIDE_DARK} strokeWidth="5" strokeLinecap="round" />
            <g transform="translate(0, 8)">
              <g style={{ transformOrigin: '0px 0px', animation: `bullFrontShin ${C} ${EASE} infinite` }}>
                <line x1="0" y1="0" x2="0" y2="8" stroke={HIDE_DARK} strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="1" cy="9" rx="3" ry="1.6" fill={HOOF} />
              </g>
            </g>
          </g>
        </g>

        {/* ═══════════════════════════════════════════════
            TAIL — whips hard
            ═══════════════════════════════════════════════ */}
        <g transform="translate(14, 20)">
          <g style={{ transformOrigin: '0px 0px', animation: `tailWhip ${C} ${EASE} infinite` }}>
            <path
              d="M0 0 Q-6 10 -4 18"
              stroke={HIDE_DARK}
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="-4" cy="19" rx="2.4" ry="3.2" fill={HIDE_DARK} />
            <ellipse cx="-4.3" cy="18.2" rx="1.2" ry="1.6" fill={HIDE_MID} opacity="0.5" />
          </g>
        </g>

        {/* ═══════════════════════════════════════════════
            BODY — massive, muscular silhouette
            Broad chest tapering to a narrower haunch,
            pronounced shoulder hump.
            ═══════════════════════════════════════════════ */}
        <path
          d="
            M14 20
            Q14 12 24 10
            L60 9
            Q70 10 74 16
            Q78 20 78 26
            L78 30
            Q78 36 70 36
            L22 36
            Q14 35 14 28
            Z
          "
          fill={HIDE_MID}
          stroke={HIDE_DARK}
          strokeWidth="0.7"
        />

        {/* chest muscle mass — bigger than the haunch */}
        <path
          d="M60 10 Q74 12 78 24 Q76 32 66 34 Q66 20 60 10 Z"
          fill={HIDE_LIGHT}
          opacity="0.75"
        />

        {/* shoulder hump shadow — sells the muscle */}
        <path
          d="M30 10 Q44 8 58 10 Q54 20 48 22 Q38 22 30 10 Z"
          fill={MUSCLE_SHADOW}
          opacity="0.55"
        />

        {/* visible rib shading on the flank */}
        <path d="M34 18 Q40 20 44 24" stroke={MUSCLE_SHADOW} strokeWidth="0.7" fill="none" opacity="0.5" />
        <path d="M36 22 Q42 24 46 28" stroke={MUSCLE_SHADOW} strokeWidth="0.7" fill="none" opacity="0.45" />
        <path d="M38 26 Q44 28 48 31" stroke={MUSCLE_SHADOW} strokeWidth="0.7" fill="none" opacity="0.4" />

        {/* haunch muscle definition */}
        <path
          d="M14 22 Q22 20 26 28 Q22 34 16 33 Z"
          fill={MUSCLE_SHADOW}
          opacity="0.5"
        />
        <path
          d="M14 18 Q20 18 22 24"
          stroke={MUSCLE_HI}
          strokeWidth="0.8"
          fill="none"
          opacity="0.4"
        />

        {/* warm rim on top of the back */}
        <path
          d="M22 11 Q34 9 48 10"
          stroke={RIM}
          strokeWidth="1.4"
          fill="none"
          opacity="0.55"
          strokeLinecap="round"
        />
        {/* rim on chest crest */}
        <path
          d="M64 11 Q74 15 77 24"
          stroke={RIM}
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
          strokeLinecap="round"
        />

        {/* ═══════════════════════════════════════════════
            HEAD — lowered, aggressive, snorting
            ═══════════════════════════════════════════════ */}
        <g transform="translate(72, 16)">
          <g style={{ animation: `bullHead ${C} ${EASE} infinite`, transformOrigin: '0px 0px' }}>
            {/* thick neck muscle connecting body to head */}
            <path
              d="M-6 4 Q-2 -2 4 -3 L10 4 L8 14 Q0 14 -6 10 Z"
              fill={HIDE_MID}
              stroke={HIDE_DARK}
              strokeWidth="0.6"
            />
            <path
              d="M-4 1 Q2 -2 8 2"
              stroke={MUSCLE_HI}
              strokeWidth="0.7"
              fill="none"
              opacity="0.5"
            />

            {/* head */}
            <path
              d="M4 -4 Q16 -4 18 4 Q20 12 14 16 Q6 18 2 14 Q-2 8 0 0 Z"
              fill={HIDE_LIGHT}
              stroke={HIDE_DARK}
              strokeWidth="0.6"
            />
            {/* head rim */}
            <path
              d="M5 -3 Q14 -3 17 3"
              stroke={RIM}
              strokeWidth="1"
              fill="none"
              opacity="0.55"
              strokeLinecap="round"
            />

            {/* snout / muzzle — lower and forward */}
            <path
              d="M12 6 Q22 6 24 12 Q25 16 20 17 Q14 17 11 14 Q9 10 12 6 Z"
              fill={HIDE_MID}
              stroke={HIDE_DARK}
              strokeWidth="0.6"
            />
            {/* muzzle highlight */}
            <path
              d="M13 8 Q19 8 21 11"
              stroke={RIM}
              strokeWidth="0.7"
              fill="none"
              opacity="0.4"
              strokeLinecap="round"
            />

            {/* nostrils — dark voids */}
            <ellipse cx="18" cy="12" rx="1.4" ry="1" fill={HIDE_DARK} />
            <ellipse cx="18" cy="15" rx="1.2" ry="0.9" fill={HIDE_DARK} />

            {/* steam puffs from nostrils */}
            <circle cx="20" cy="11" r="1.2" fill={STEAM}>
              <animate
                attributeName="opacity"
                values="0;0.55;0"
                dur="1.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="11;6;2"
                dur="1.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="0.8;1.6;2.2"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="21" cy="13" r="1.2" fill={STEAM}>
              <animate
                attributeName="opacity"
                values="0;0.5;0"
                dur="1.4s"
                begin="0.35s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="13;8;3"
                dur="1.4s"
                begin="0.35s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="0.7;1.5;2"
                dur="1.4s"
                begin="0.35s"
                repeatCount="indefinite"
              />
            </circle>

            {/* slobber drip from the jaw */}
            <path
              d="M15 17 Q15 19 14.5 20"
              stroke={SLOBBER}
              strokeWidth="0.9"
              fill="none"
              opacity="0.7"
              strokeLinecap="round"
            >
              <animate
                attributeName="opacity"
                values="0;0.7;0"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </path>

            {/* EYE — glowing red with halo */}
            <circle cx="8" cy="6" r="3.2" fill={EYE_GLOW}>
              <animate
                attributeName="r"
                values="3;3.6;3"
                dur="1.6s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="8" cy="6" r="1.4" fill={EYE} />
            <circle cx="8.4" cy="5.6" r="0.5" fill="#ffffff" opacity="0.9" />

            {/* HORNS — long, curved, threatening */}
            <path
              d="M5 -3 Q2 -8 -4 -10"
              stroke={HORN}
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M6 -3 Q4 -8 0 -11"
              stroke={HORN_SHADOW}
              strokeWidth="0.8"
              fill="none"
              opacity="0.6"
              strokeLinecap="round"
            />
            <path
              d="M11 -3 Q14 -8 18 -11"
              stroke={HORN}
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M12 -3 Q15 -7 17 -10"
              stroke={HORN_SHADOW}
              strokeWidth="0.8"
              fill="none"
              opacity="0.6"
              strokeLinecap="round"
            />
            {/* horn tips — sharp */}
            <circle cx="-4" cy="-10" r="1.4" fill={HORN} />
            <circle cx="18" cy="-11" r="1.4" fill={HORN} />

            {/* ears — small, back against the skull */}
            <ellipse cx="4" cy="-1" rx="2.4" ry="1.3" fill={HIDE_DARK} transform="rotate(-30 4 -1)" />
            <ellipse cx="13" cy="-1" rx="2.4" ry="1.3" fill={HIDE_DARK} transform="rotate(30 13 -1)" />
          </g>
        </g>

        {/* ═══════════════════════════════════════════════
            FRONT LEGS (near side) — thick, muscular
            ═══════════════════════════════════════════════ */}
        <g transform="translate(30, 34)">
          <g style={{ transformOrigin: '0px 0px', animation: `bullFrontThigh ${C} ${EASE} infinite` }}>
            {/* thigh muscle mass */}
            <ellipse cx="0" cy="-2" rx="3.4" ry="4" fill={HIDE_MID} />
            <line x1="0" y1="0" x2="0" y2="8" stroke={HIDE_MID} strokeWidth="5.4" strokeLinecap="round" />
            <g transform="translate(0, 8)">
              <g style={{ transformOrigin: '0px 0px', animation: `bullFrontShin ${C} ${EASE} infinite` }}>
                <line x1="0" y1="0" x2="0" y2="8" stroke={HIDE_MID} strokeWidth="4.4" strokeLinecap="round" />
                <ellipse cx="1" cy="9" rx="3.2" ry="1.7" fill={HOOF} />
              </g>
            </g>
          </g>
        </g>
        <g transform="translate(66, 34)">
          <g style={{ transformOrigin: '0px 0px', animation: `bullBackThigh ${C} ${EASE} infinite` }}>
            <ellipse cx="0" cy="-2" rx="3.4" ry="4" fill={HIDE_MID} />
            <line x1="0" y1="0" x2="0" y2="8" stroke={HIDE_MID} strokeWidth="5.4" strokeLinecap="round" />
            <g transform="translate(0, 8)">
              <g style={{ transformOrigin: '0px 0px', animation: `bullBackShin ${C} ${EASE} infinite` }}>
                <line x1="0" y1="0" x2="0" y2="8" stroke={HIDE_MID} strokeWidth="4.4" strokeLinecap="round" />
                <ellipse cx="1" cy="9" rx="3.2" ry="1.7" fill={HOOF} />
              </g>
            </g>
          </g>
        </g>

        {/* ═══════════════════════════════════════════════
            DUST from the near hooves
            ═══════════════════════════════════════════════ */}
        <g transform="translate(30, 44)">
          <g style={{ animation: `hoofDust ${C} ${EASE} infinite` }}>
            <circle cx="0" cy="0" r="2.6" fill="rgba(200,180,150,0.4)" />
          </g>
        </g>
        <g transform="translate(66, 44)">
          <g style={{ animation: `hoofDust ${C} ${EASE} infinite`, animationDelay: '-0.21s' }}>
            <circle cx="0" cy="0" r="2.6" fill="rgba(200,180,150,0.4)" />
          </g>
        </g>
      </g>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   BULL LOGO — small angular bull-head mark
   Angular geometric, not cartoon. Reads at 26px.
   ═══════════════════════════════════════════════════════════════════ */
const BullLogo: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    style={{ display: 'block' }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="bullLogoGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7c5cff" />
        <stop offset="100%" stopColor="#ff6b9d" />
      </linearGradient>
    </defs>
    {/* outer glow ring */}
    <circle cx="16" cy="16" r="15" fill="none" stroke="url(#bullLogoGrad)" strokeWidth="0.6" opacity="0.5" />
    {/* horns sweeping up */}
    <path
      d="M4 12 Q3 6 8 4 Q7 8 9 12"
      fill="url(#bullLogoGrad)"
      opacity="0.95"
    />
    <path
      d="M28 12 Q29 6 24 4 Q25 8 23 12"
      fill="url(#bullLogoGrad)"
      opacity="0.95"
    />
    {/* head — angular shield shape */}
    <path
      d="
        M9 11
        L23 11
        L23 18
        Q23 25 16 27
        Q9 25 9 18
        Z
      "
      fill="url(#bullLogoGrad)"
    />
    {/* brow / eyes — negative space */}
    <path d="M11 15 L14 15 L13 17 L11 17 Z" fill="#0a0a0b" />
    <path d="M21 15 L18 15 L19 17 L21 17 Z" fill="#0a0a0b" />
    {/* muzzle nostrils */}
    <circle cx="14" cy="22" r="0.9" fill="#0a0a0b" />
    <circle cx="18" cy="22" r="0.9" fill="#0a0a0b" />
    {/* inner highlight */}
    <path
      d="M11 12 L14 12 L14 14 L11 14 Z"
      fill="#ffffff"
      opacity="0.25"
    />
  </svg>
);