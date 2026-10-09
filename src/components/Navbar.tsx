import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore, NavTab } from '../stores/useUIStore';

interface NavLink {
  id: NavTab;
  label: string;
}

const ROUTES: Record<NavTab, string> = {
  home: '/',
  movies: '/movies',
  tv: '/tv',
  genres: '/genres',
  watchlist: '/my-list',
  recommend: '/recommend',
};

const NAV_LINKS: NavLink[] = [
  { id: 'home', label: 'HOME' },
  { id: 'movies', label: 'MOVIES' },
  { id: 'tv', label: 'TV' },
  { id: 'genres', label: 'GENRES' },
  { id: 'recommend', label: 'FOR YOU' },
];

/* ---------- Scramble text ---------- */
const ScrambleText: React.FC<{ text: string }> = ({ text }) => {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<number | null>(null);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const scramble = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const totalFrames = 10;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      frame++;
      setDisplay(
        text
          .split('')
          .map((ch, i) => {
            if (ch === ' ') return ' ';
            if (frame / totalFrames > i / text.length) return ch;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      if (frame >= totalFrames) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        setDisplay(text);
      }
    }, 28);
  }, [text]);

  useEffect(
    () => () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    },
    []
  );

  return (
    <span onMouseEnter={scramble} className="inline-block">
      {display}
    </span>
  );
};

/* ---------- Logo ---------- */
const Logo: React.FC = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="nc-logo"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c5cff" />
        <stop offset="100%" stopColor="#ff6b9d" />
      </linearGradient>
      <linearGradient id="lensGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5eead4" />
        <stop offset="100%" stopColor="#7c5cff" />
      </linearGradient>
      <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <rect x="4" y="10" width="32" height="22" rx="3" stroke="url(#logoGradient)" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="10" r="3.5" stroke="url(#logoGradient)" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="10" r="1.2" fill="url(#logoGradient)" />
    <circle cx="28" cy="10" r="3.5" stroke="url(#logoGradient)" strokeWidth="1.5" fill="none" />
    <circle cx="28" cy="10" r="1.2" fill="url(#logoGradient)" />

    <circle
      cx="20"
      cy="21"
      r="7"
      stroke="url(#lensGradient)"
      strokeWidth="1.5"
      fill="none"
      filter="url(#logoGlow)"
      className="nc-lens"
    />
    <circle
      cx="20"
      cy="21"
      r="4"
      stroke="url(#lensGradient)"
      strokeWidth="1"
      fill="none"
      opacity="0.8"
    />
    <circle
      cx="20"
      cy="21"
      r="1.6"
      fill="#ffffff"
      filter="url(#logoGlow)"
      className="nc-lens-core"
    />
    <path d="M 15.5 18 A 6 6 0 0 1 20 15" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
  </svg>
);

/* ---------- Navbar ---------- */
export const Navbar: React.FC = () => {
  const { setCommandPaletteOpen } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab: NavTab = (() => {
    const p = location.pathname;
    if (p === '/' || p === '') return 'home';
    if (p.startsWith('/movies')) return 'movies';
    if (p.startsWith('/tv')) return 'tv';
    if (p.startsWith('/genres')) return 'genres';
    if (p.startsWith('/my-list') || p.startsWith('/watchlist')) return 'watchlist';
    if (p.startsWith('/recommend')) return 'recommend';
    return 'home';
  })();

  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState('');
  const [mouseX, setMouseX] = useState(0.5);

  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mouseRafRef = useRef<number | null>(null);

  const activeIndex = NAV_LINKS.findIndex((l) => l.id === activeTab);

  /* Clock */
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = d.getHours();
      const mm = d.getMinutes().toString().padStart(2, '0');
      const period = hh >= 12 ? 'PM' : 'AM';
      const h12 = hh % 12 === 0 ? 12 : hh % 12;
      setTime(`${h12.toString().padStart(2, '0')}:${mm} ${period}`);
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  /* Scroll state */
  useEffect(() => {
    let raf = 0;
    let last = false;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const next = window.scrollY > 12;
        if (next !== last) {
          last = next;
          setScrolled(next);
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Mouse position */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (mouseRafRef.current) return;
      mouseRafRef.current = requestAnimationFrame(() => {
        mouseRafRef.current = null;
        if (e.clientY > 120) return;
        const ratio = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
        setMouseX(ratio);
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (mouseRafRef.current) cancelAnimationFrame(mouseRafRef.current);
    };
  }, []);

  /* Escape + body lock */
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  /* Close mobile on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* Sliding pill */
  useEffect(() => {
    const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
    const el = linkRefs.current[targetIndex];
    const nav = navRef.current;
    if (!el || !nav) return;

    const raf = requestAnimationFrame(() => {
      const elRect = el.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      setPill({
        left: elRect.left - navRect.left,
        width: elRect.width,
        ready: true,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [hoveredIndex, activeIndex]);

  /* Nav click — non-blocking */
  const handleNavClick = useCallback(
    (id: NavTab) => {
      setMobileOpen(false);
      const target = ROUTES[id];
      if (location.pathname === target) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      navigate(target);
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });
    },
    [navigate, location.pathname]
  );

  return (
    <>
      <header
        className={`nc-header fixed top-0 left-0 right-0 z-50 transition-[height] duration-300 ease-out ${
          scrolled ? 'h-[56px]' : 'h-[76px]'
        }`}
        style={{
          background: scrolled
            ? 'linear-gradient(180deg, rgba(10,10,11,0.82) 0%, rgba(10,10,11,0.55) 70%, rgba(10,10,11,0) 100%)'
            : 'linear-gradient(180deg, rgba(10,10,11,0.55) 0%, rgba(10,10,11,0.28) 70%, rgba(10,10,11,0) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: 'none',
          WebkitMaskImage:
            'linear-gradient(180deg, black 0%, black 70%, transparent 100%)',
          maskImage:
            'linear-gradient(180deg, black 0%, black 70%, transparent 100%)',
        }}
      >
        {/* Ambient aurora blobs */}
        <div
          aria-hidden
          className="nc-ambient pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="nc-blob-a"
            style={{
              position: 'absolute',
              top: '-120%',
              left: `${mouseX * 100 - 30}%`,
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(124,92,255,0.32) 0%, rgba(124,92,255,0) 65%)',
              filter: 'blur(60px)',
              transition: 'left 600ms cubic-bezier(0.22,1,0.36,1)',
              willChange: 'transform',
            }}
          />
          <div
            className="nc-blob-b"
            style={{
              position: 'absolute',
              top: '-120%',
              right: `${(1 - mouseX) * 100 - 30}%`,
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255,107,157,0.22) 0%, rgba(255,107,157,0) 65%)',
              filter: 'blur(60px)',
              transition: 'right 800ms cubic-bezier(0.22,1,0.36,1)',
              willChange: 'transform',
            }}
          />
        </div>

        <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT — Logo + wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            aria-label="Home"
            className="group relative shrink-0 cursor-pointer z-10 flex items-center gap-2.5"
          >
            <span className="flex items-center justify-center transition-transform duration-300 group-hover:scale-105 nc-logo-wrap">
              <Logo />
            </span>
            <span
              className="hidden sm:block text-[15px] font-semibold tracking-[-0.01em]"
              style={{
                background: 'linear-gradient(135deg, #f5f5f7 0%, #b8b8c4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              
            </span>
          </button>

          {/* CENTER — Pill nav (MY LIST removed) */}
          <nav
            ref={navRef}
            onMouseLeave={() => setHoveredIndex(null)}
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-10 rounded-full border border-white/[0.08] bg-white/[0.02] px-1 overflow-hidden"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <span
              aria-hidden
              className="nc-pill-shimmer"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(124,92,255,0.06) 30%, rgba(255,107,157,0.05) 60%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'ncPillShimmer 9s ease-in-out infinite',
              }}
            />

            {pill.ready && (
              <span
                aria-hidden
                className="nc-pill absolute top-1 bottom-1 rounded-full pointer-events-none"
                style={{
                  left: pill.left + 4,
                  width: pill.width - 8,
                  background:
                    hoveredIndex !== null
                      ? 'rgba(255,255,255,0.06)'
                      : 'linear-gradient(135deg, rgba(124,92,255,0.28), rgba(255,107,157,0.18))',
                  border: '1px solid rgba(124,92,255,0.4)',
                  boxShadow:
                    hoveredIndex !== null
                      ? 'none'
                      : '0 0 20px rgba(124,92,255,0.35), inset 0 0 12px rgba(124,92,255,0.15)',
                  transition:
                    'left 420ms cubic-bezier(0.34,1.56,0.64,1), width 420ms cubic-bezier(0.34,1.56,0.64,1), background 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                }}
              />
            )}

            {NAV_LINKS.map((link, i) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onClick={() => handleNavClick(link.id)}
                  className="nc-link relative px-3.5 py-2 text-[11px] font-semibold tracking-[0.12em] transition-colors duration-200 cursor-pointer z-10"
                  style={{
                    color: isActive
                      ? '#ffffff'
                      : hoveredIndex === i
                      ? 'rgba(245,245,247,0.9)'
                      : 'rgba(245,245,247,0.5)',
                  }}
                >
                  <ScrambleText text={link.label} />
                  {isActive && (
                    <span
                      aria-hidden
                      className="nc-active-dot"
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c5cff, #ff6b9d)',
                        boxShadow: '0 0 8px rgba(124,92,255,0.9)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT — Clock + Search + Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
            <span className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-[rgba(245,245,247,0.4)]">
              <span className="w-1 h-1 rounded-full bg-[#5eead4] animate-pulse" />
              {time} IST
            </span>

            <button
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Search"
              className="nc-search hidden sm:flex items-center gap-2 h-9 pl-3 pr-3 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-[rgba(124,92,255,0.4)] transition-all duration-200 cursor-pointer group relative overflow-hidden"
            >
              <span
                aria-hidden
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 30% 50%, rgba(124,92,255,0.28), transparent 70%)',
                }}
              />
              <Search className="relative w-3.5 h-3.5 stroke-[1.75] text-[rgba(245,245,247,0.6)] group-hover:text-[#7c5cff] transition-colors" />
              <span className="relative text-[12px] text-[rgba(245,245,247,0.55)] group-hover:text-[#f5f5f7] transition-colors">
                Search
              </span>
              <kbd className="relative hidden lg:inline-flex items-center justify-center min-w-[20px] h-5 px-1 ml-1 text-[10px] font-mono text-white/40 bg-white/[0.06] border border-white/[0.08] rounded">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Search"
              className="sm:hidden relative flex items-center justify-center w-9 h-9 rounded-full border border-white/[0.08] bg-white/[0.02] hover:border-[rgba(124,92,255,0.4)] transition-all duration-200 cursor-pointer overflow-hidden group"
            >
              <span
                aria-hidden
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(124,92,255,0.3), transparent 70%)',
                }}
              />
              <Search className="relative w-3.5 h-3.5 stroke-[2] text-[rgba(245,245,247,0.7)] group-hover:text-[#7c5cff] transition-colors" />
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="md:hidden relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              {mobileOpen ? (
                <X className="w-4 h-4 text-[#f5f5f7]" strokeWidth={2} />
              ) : (
                <Menu className="w-4 h-4 text-[#f5f5f7]" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu (MY LIST removed) */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-black/70"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`absolute left-4 right-4 top-[68px] rounded-2xl border border-white/[0.08] overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
          style={{
            background: 'rgba(10,10,11,0.96)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 40% at 20% 0%, rgba(124,92,255,0.14) 0%, transparent 70%), radial-gradient(60% 40% at 80% 100%, rgba(255,107,157,0.10) 0%, transparent 70%)',
            }}
          />

          <nav className="relative flex flex-col p-2">
            {NAV_LINKS.map((link, i) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative text-left text-[13px] font-semibold tracking-[0.12em] py-3.5 px-4 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-[#f5f5f7] bg-white/[0.05]'
                      : 'text-[rgba(245,245,247,0.6)] hover:text-[#f5f5f7] hover:bg-white/[0.03]'
                  }`}
                  style={{
                    transitionDelay: mobileOpen ? `${i * 30}ms` : '0ms',
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen ? 'translateY(0)' : 'translateY(6px)',
                  }}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #7c5cff, #ff6b9d)',
                        boxShadow: '0 0 8px rgba(124,92,255,0.9)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="relative px-4 py-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono tracking-wider text-[rgba(245,245,247,0.4)]">
            <span>CHALACHITRA</span>
            <span>{time} IST</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ncPillShimmer {
          0%   { background-position: 200% 0; }
          50%  { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ncLensPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.75; transform: scale(1.06); }
        }
        @keyframes ncLensCorePulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.6; }
        }
        @keyframes ncDotPulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50%      { transform: translateX(-50%) scale(1.4); opacity: 0.7; }
        }
        @keyframes ncBlobBreathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }

        .nc-logo .nc-lens {
          transform-origin: 20px 21px;
          animation: ncLensPulse 3.6s ease-in-out infinite;
        }
        .nc-logo .nc-lens-core {
          animation: ncLensCorePulse 3.6s ease-in-out infinite;
        }
        .nc-logo-wrap {
          filter: drop-shadow(0 0 10px rgba(124,92,255,0.45));
        }
        .nc-active-dot {
          animation: ncDotPulse 2.4s ease-in-out infinite;
        }
        .nc-blob-a, .nc-blob-b {
          animation: ncBlobBreathe 7s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nc-logo .nc-lens,
          .nc-logo .nc-lens-core,
          .nc-active-dot,
          .nc-blob-a,
          .nc-blob-b,
          .nc-pill-shimmer {
            animation: none !important;
          }
          .nc-logo-wrap { filter: none !important; }
        }
      `}</style>
    </>
  );
};

export { Navbar as Header };