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

  /* ── Retry-aware navigation for My List ──
     If the route doesn't land on the first attempt (lazy chunk still loading,
     race with route transitions, or navigation swallowed), this fires up to
     three retries and always ends with the correct path landed + scrolled. */
  const goWithRetry = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();

    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    const attempt = () => {
      attempts += 1;
      try {
        navigate(path);
      } catch {
        // swallow — retried below
      }

      // Verify we landed; if not, retry
      window.setTimeout(() => {
        if (window.location.pathname !== path && attempts < MAX_ATTEMPTS) {
          attempt();
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }
      }, 160);
    };

    attempt();
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
        <div
          className="absolute -top-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(255,180,120,0.12) 0%, transparent 65%)',
            filter: 'blur(20px)',
          }}
        />
        <div
          className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(180,20,20,0.16) 0%, transparent 70%)',
            filter: 'blur(28px)',
          }}
        />

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

        <div
          className="absolute left-0 right-0 bottom-3 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,180,120,0.16), rgba(124,92,255,0.16), transparent)',
          }}
        />

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
                    onClick={goWithRetry('/my-list')}
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
   THE RUNNER
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
   THE BULL — proper bull: wide-set horns, broad muzzle, angry brow,
   heavy front quarter, narrow haunches.
   ═══════════════════════════════════════════════════════════════════ */
const Bull: React.FC = () => {
  const C = '0.42s';
  const EASE = 'cubic-bezier(0.4, 0, 0.6, 1)';

  const HIDE_DARK = '#160d14';
  const HIDE_MID = '#2e1c28';
  const HIDE_LIGHT = '#3e2634';
  const MUSCLE_SHADOW = '#0f070d';
  const MUSCLE_HI = '#4a2e3c';
  const HORN = '#e8dcc0';
  const HORN_TIP = '#f5ecd6';
  const HORN_SHADOW = '#a89878';
  const HOOF = '#08050a';
  const EYE = '#ff2a2a';
  const EYE_GLOW = 'rgba(255,42,42,0.6)';
  const RIM = '#ffb47a';
  const STEAM = 'rgba(255,255,255,0.35)';
  const SLOBBER = '#c8b0a0';
  const NOSE = '#1a0f18';

  return (
    <svg
      width="100"
      height="56"
      viewBox="0 0 100 56"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <g transform="translate(50, 52)">
        <g style={{ animation: `bullArc ${C} ${EASE} infinite` }}>
          <ellipse cx="0" cy="0" rx="22" ry="2.6" fill="#000" opacity="0.45" />
        </g>
      </g>

      <g style={{ animation: `bullArc ${C} ${EASE} infinite` }}>
        {/* BACK LEGS */}
        <g transform="translate(26, 38)">
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
        <g transform="translate(70, 38)">
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

        {/* TAIL */}
        <g transform="translate(14, 22)">
          <g style={{ transformOrigin: '0px 0px', animation: `tailWhip ${C} ${EASE} infinite` }}>
            <path d="M0 0 Q-6 10 -4 18" stroke={HIDE_DARK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <ellipse cx="-4" cy="19" rx="2.4" ry="3.2" fill={HIDE_DARK} />
            <ellipse cx="-4.3" cy="18.2" rx="1.2" ry="1.6" fill={HIDE_MID} opacity="0.5" />
          </g>
        </g>

        {/* BODY */}
        <path
          d="
            M16 22
            Q14 14 22 11
            Q34 8 48 9
            Q62 9 72 12
            Q82 14 84 22
            Q86 28 84 33
            Q82 39 74 39
            L24 39
            Q16 38 16 30
            Z
          "
          fill={HIDE_MID}
          stroke={HIDE_DARK}
          strokeWidth="0.7"
        />

        {/* shoulder hump — bull signature */}
        <path
          d="M52 9 Q66 8 76 12 Q80 16 80 22 Q74 18 62 17 Q54 17 48 19 Q48 12 52 9 Z"
          fill={HIDE_LIGHT}
          opacity="0.85"
        />

        {/* chest mass */}
        <path
          d="M68 13 Q82 16 84 26 Q82 36 72 38 Q74 24 68 13 Z"
          fill={HIDE_LIGHT}
          opacity="0.7"
        />

        {/* shoulder shadow */}
        <path
          d="M32 11 Q46 9 60 11 Q56 20 50 22 Q40 22 32 11 Z"
          fill={MUSCLE_SHADOW}
          opacity="0.55"
        />

        {/* rib shading */}
        <path d="M34 20 Q40 22 44 26" stroke={MUSCLE_SHADOW} strokeWidth="0.7" fill="none" opacity="0.5" />
        <path d="M36 24 Q42 26 46 30" stroke={MUSCLE_SHADOW} strokeWidth="0.7" fill="none" opacity="0.45" />
        <path d="M38 28 Q44 30 48 33" stroke={MUSCLE_SHADOW} strokeWidth="0.7" fill="none" opacity="0.4" />

        {/* haunch — narrower than chest */}
        <path d="M16 24 Q24 22 28 30 Q24 36 18 35 Z" fill={MUSCLE_SHADOW} opacity="0.5" />
        <path d="M16 20 Q22 20 24 26" stroke={MUSCLE_HI} strokeWidth="0.8" fill="none" opacity="0.4" />

        {/* rim on back */}
        <path d="M24 13 Q36 10 50 11" stroke={RIM} strokeWidth="1.4" fill="none" opacity="0.55" strokeLinecap="round" />
        <path d="M56 10 Q70 10 78 14" stroke={RIM} strokeWidth="1.3" fill="none" opacity="0.6" strokeLinecap="round" />

        {/* HEAD */}
        <g transform="translate(78, 20)">
          <g style={{ animation: `bullHead ${C} ${EASE} infinite`, transformOrigin: '0px 0px' }}>
            <path
              d="M-10 4 Q-4 -4 6 -5 L12 6 L8 16 Q-2 16 -10 10 Z"
              fill={HIDE_MID}
              stroke={HIDE_DARK}
              strokeWidth="0.6"
            />
            <path d="M-6 0 Q2 -3 9 4" stroke={MUSCLE_HI} strokeWidth="0.8" fill="none" opacity="0.5" />

            {/* skull */}
            <path
              d="M4 -6 Q16 -6 19 2 Q21 9 15 13 Q6 14 2 10 Q-2 3 0 -3 Z"
              fill={HIDE_LIGHT}
              stroke={HIDE_DARK}
              strokeWidth="0.6"
            />
            <path
              d="M5 -5 Q14 -5 18 1"
              stroke={RIM}
              strokeWidth="1.1"
              fill="none"
              opacity="0.6"
              strokeLinecap="round"
            />

            {/* broad flat muzzle */}
            <path
              d="M14 3 Q26 3 28 9 Q28 14 22 15 Q14 15 10 12 Q8 8 14 3 Z"
              fill={HIDE_MID}
              stroke={HIDE_DARK}
              strokeWidth="0.6"
            />
            <path
              d="M15 4 Q24 4 27 8"
              stroke={RIM}
              strokeWidth="0.8"
              fill="none"
              opacity="0.45"
              strokeLinecap="round"
            />
            <ellipse cx="24" cy="9" rx="4" ry="3.2" fill={NOSE} />
            <ellipse cx="24" cy="9" rx="3.2" ry="2.4" fill={HIDE_DARK} opacity="0.7" />

            {/* wide-set nostrils */}
            <ellipse cx="22" cy="9" rx="1.3" ry="1" fill={NOSE} />
            <ellipse cx="26" cy="9" rx="1.3" ry="1" fill={NOSE} />

            {/* steam */}
            <circle cx="22" cy="8" r="1.2" fill={STEAM}>
              <animate attributeName="opacity" values="0;0.55;0" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="cy" values="8;3;-1" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="r" values="0.8;1.6;2.2" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="26" cy="8" r="1.2" fill={STEAM}>
              <animate attributeName="opacity" values="0;0.5;0" dur="1.4s" begin="0.35s" repeatCount="indefinite" />
              <animate attributeName="cy" values="8;3;-2" dur="1.4s" begin="0.35s" repeatCount="indefinite" />
              <animate attributeName="r" values="0.7;1.5;2" dur="1.4s" begin="0.35s" repeatCount="indefinite" />
            </circle>

            {/* slobber */}
            <path
              d="M17 14 Q17 17 16.5 19"
              stroke={SLOBBER}
              strokeWidth="0.9"
              fill="none"
              opacity="0.7"
              strokeLinecap="round"
            >
              <animate attributeName="opacity" values="0;0.7;0" dur="1.8s" repeatCount="indefinite" />
            </path>

            {/* eye */}
            <circle cx="9" cy="3" r="3.2" fill={EYE_GLOW}>
              <animate attributeName="r" values="3;3.6;3" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="9" cy="3" r="1.4" fill={EYE} />
            <circle cx="9.4" cy="2.6" r="0.5" fill="#ffffff" opacity="0.9" />
            <path d="M5 0 L13 1.5" stroke={HIDE_DARK} strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />

            {/* horns — wide-set, curving up and out */}
            <path d="M4 -5 Q0 -12 -8 -15" stroke={HORN} strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M4 -5 Q1 -11 -6 -14" stroke={HORN_SHADOW} strokeWidth="0.8" fill="none" opacity="0.55" strokeLinecap="round" />
            <circle cx="-8" cy="-15" r="1.8" fill={HORN_TIP} />

            <path d="M15 -5 Q20 -12 28 -15" stroke={HORN} strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M15 -5 Q19 -11 26 -14" stroke={HORN_SHADOW} strokeWidth="0.8" fill="none" opacity="0.55" strokeLinecap="round" />
            <circle cx="28" cy="-15" r="1.8" fill={HORN_TIP} />

            {/* ears */}
            <ellipse cx="3" cy="-2" rx="2.6" ry="1.4" fill={HIDE_DARK} transform="rotate(-35 3 -2)" />
            <ellipse cx="16" cy="-2" rx="2.6" ry="1.4" fill={HIDE_DARK} transform="rotate(35 16 -2)" />
          </g>
        </g>

        {/* FRONT LEGS (near side) */}
        <g transform="translate(34, 38)">
          <g style={{ transformOrigin: '0px 0px', animation: `bullFrontThigh ${C} ${EASE} infinite` }}>
            <ellipse cx="0" cy="-2" rx="3.6" ry="4.2" fill={HIDE_MID} />
            <line x1="0" y1="0" x2="0" y2="8" stroke={HIDE_MID} strokeWidth="5.6" strokeLinecap="round" />
            <g transform="translate(0, 8)">
              <g style={{ transformOrigin: '0px 0px', animation: `bullFrontShin ${C} ${EASE} infinite` }}>
                <line x1="0" y1="0" x2="0" y2="8" stroke={HIDE_MID} strokeWidth="4.6" strokeLinecap="round" />
                <ellipse cx="1" cy="9" rx="3.2" ry="1.7" fill={HOOF} />
              </g>
            </g>
          </g>
        </g>
        <g transform="translate(72, 38)">
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

        {/* hoof dust */}
        <g transform="translate(34, 48)">
          <g style={{ animation: `hoofDust ${C} ${EASE} infinite` }}>
            <circle cx="0" cy="0" r="2.6" fill="rgba(200,180,150,0.4)" />
          </g>
        </g>
        <g transform="translate(72, 48)">
          <g style={{ animation: `hoofDust ${C} ${EASE} infinite`, animationDelay: '-0.21s' }}>
            <circle cx="0" cy="0" r="2.6" fill="rgba(200,180,150,0.4)" />
          </g>
        </g>
      </g>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   BULL LOGO — proper bull head: wide-set curved horns, broad muzzle,
   angry brow, square jaw. Reads clean at 26px.
   ═══════════════════════════════════════════════════════════════════ */
/* /* ═══════════════════════════════════════════════════════════════════
   BULL LOGO — charging bull, muscular build, tight stomach,
   massive front quarter, head-down aggressive stance.
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

    {/* ── BODY — tight stomach, tucked waist, big front ── */}
    <path
      d="
        M5 19
        Q4 15 7 12
        Q11 9 17 9
        Q23 9 26 12
        Q28 15 27 19
        Q26 21.5 23 22.5
        L17 23
        L12 22.5
        Q7 22 5.5 20
        Q5 19.5 5 19
        Z
      "
      fill="url(#bullLogoGrad)"
    />

    {/* ── SHOULDER HUMP — exaggerated, sits high above front legs ── */}
    <path
      d="M15 9 Q21 7.5 25 10 Q26 13 24 15 Q20 16 17 14.5 Q14 12 15 9 Z"
      fill="url(#bullLogoGrad)"
      opacity="0.9"
    />

    {/* ── CHEST MASS — big rounded pec, drops below the belly line ── */}
    <path
      d="M23 13 Q27 15 27 19 Q26 22 22 22.5 Q24 18 23 13 Z"
      fill="url(#bullLogoGrad)"
      opacity="0.85"
    />

    {/* ── HAUNCH — narrow rear hip, tight ── */}
    <path
      d="M6 15 Q9 14 11 17 Q11 21 8 22 Q6 20 6 15 Z"
      fill="url(#bullLogoGrad)"
      opacity="0.7"
    />

    {/* ── HEAD — lowered, forward-thrust, compact ── */}
    <path
      d="
        M21 17
        Q27 17 29 20
        Q30 23 27 24
        Q24 24 22 22
        Q20 20 21 17
        Z
      "
      fill="url(#bullLogoGrad)"
    />

    {/* ── HORNS — wide-set, one forward one back ── */}
    <path d="M25 17 Q28 14 31 13 Q29 16 27 18 Z" fill="url(#bullLogoGrad)" opacity="0.95" />
    <path d="M23 16 Q24 13 27 11 Q26 14 25 16 Z" fill="url(#bullLogoGrad)" opacity="0.75" />

    {/* ── FRONT LEG — extended forward mid-stride ── */}
    <path
      d="M21 22.5 L19 28 Q18.5 29.5 19 30.5 L21 30.5 Q21.5 29.5 22 27.5 L23 22.5 Z"
      fill="url(#bullLogoGrad)"
    />
    {/* ── BACK LEG — planted, driving ── */}
    <path
      d="M9 22.5 L8 28 Q7.5 29.5 8 30.5 L10 30.5 Q10.5 29.5 11 27.5 L12 22.5 Z"
      fill="url(#bullLogoGrad)"
    />
    {/* ── SECOND FRONT LEG — tucked back ── */}
    <path
      d="M24 22 L24 27 Q23.5 28.5 24 29.5 L26 29.5 Q26.5 28.5 26.5 26.5 L26 22 Z"
      fill="url(#bullLogoGrad)"
      opacity="0.7"
    />

    {/* ── TAIL — whipping up and back ── */}
    <path
      d="M5 17 Q3 14 2 11 Q4 13 6 14"
      fill="none"
      stroke="url(#bullLogoGrad)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    {/* ── NEGATIVE-SPACE DETAILS ── */}
    {/* angry eye slit on the lowered head */}
    <path d="M25 19 L27 19.5 L27 20 L25 19.7 Z" fill="#0a0a0b" opacity="0.95" />
    {/* muzzle shadow */}
    <path d="M28 21 Q29 22 28.5 23" stroke="#0a0a0b" strokeWidth="0.8" fill="none" opacity="0.6" strokeLinecap="round" />
    {/* rib striations on the flank — sells the muscle */}
    <path d="M13 13 Q15 14 15 16" stroke="#0a0a0b" strokeWidth="0.5" fill="none" opacity="0.35" strokeLinecap="round" />
    <path d="M15 12.5 Q17 13.5 17 15.5" stroke="#0a0a0b" strokeWidth="0.5" fill="none" opacity="0.3" strokeLinecap="round" />
  </svg>
);