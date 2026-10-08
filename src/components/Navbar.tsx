import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore, NavTab } from '../stores/useUIStore';

interface NavLink {
  id: NavTab;
  label: string;
}

/* ---------------- Scramble text ---------------- */
const ScrambleText: React.FC<{ text: string }> = ({ text }) => {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<number | null>(null);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const scramble = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const totalFrames = 12;
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
    }, 30);
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

/* ---------------- Logo — IMAX camera style ---------------- */
const Logo: React.FC = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
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

    <rect
      x="4"
      y="10"
      width="32"
      height="22"
      rx="3"
      stroke="url(#logoGradient)"
      strokeWidth="1.5"
      fill="none"
    />

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

    <circle cx="20" cy="21" r="1.6" fill="#ffffff" filter="url(#logoGlow)" />

    <path
      d="M 15.5 18 A 6 6 0 0 1 20 15"
      stroke="#ffffff"
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />
  </svg>
);

/* ---------------- Navbar ---------------- */
export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, setCommandPaletteOpen } = useUIStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState('');

  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const navLinks: NavLink[] = [
    { id: 'home', label: 'HOME' },
    { id: 'movies', label: 'MOVIES' },
    { id: 'tv', label: 'TV' },
    { id: 'genres', label: 'GENRES' },
    { id: 'watchlist', label: 'MY LIST' },
    { id: 'recommend', label: 'FOR YOU' },
  ];

  const activeIndex = navLinks.findIndex((l) => l.id === activeTab);

  /* Clock — 12h */
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

  /* Scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Escape + body lock */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  /* Sliding pill */
  useEffect(() => {
    const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
    const el = linkRefs.current[targetIndex];
    const nav = navRef.current;
    if (!el || !nav) return;
    const elRect = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    setPill({
      left: elRect.left - navRect.left,
      width: elRect.width,
      ready: true,
    });
  }, [hoveredIndex, activeIndex, navLinks.length]);

  const handleNavClick = (id: NavTab) => {
    setActiveTab(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const routes: Record<NavTab, string> = {
      home: '/',
      movies: '/movies',
      tv: '/tv',
      genres: '/genres',
      watchlist: '/my-list',
      recommend: '/recommend',
    };
    navigate(routes[id]);
  };

  return (
    <>
      {/* Top gradient sweep line */}
      <div className="fixed top-0 left-0 right-0 h-[1px] z-[60] pointer-events-none overflow-hidden">
        <div
          className="h-full w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #7c5cff 25%, #ff6b9d 50%, #7c5cff 75%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'sweep 6s linear infinite',
            opacity: scrolled ? 0.9 : 0.5,
          }}
        />
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          scrolled ? 'h-[58px]' : 'h-[80px]'
        }`}
        style={{
          background: scrolled ? 'rgba(10,10,11,0.55)' : 'rgba(10,10,11,0.35)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderBottom: scrolled
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid transparent',
        }}
      >
        <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT — Logo */}
          <button
            onClick={() => handleNavClick('home')}
            aria-label="Home"
            className="group relative shrink-0 cursor-pointer z-10 flex items-center justify-center transition-transform duration-300 hover:scale-110"
            style={{ filter: 'drop-shadow(0 0 8px rgba(124,92,255,0.4))' }}
          >
            <Logo />
          </button>

          {/* CENTER — Pill nav */}
          <nav
            ref={navRef}
            onMouseLeave={() => setHoveredIndex(null)}
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-11 rounded-full border border-white/[0.08] bg-white/[0.02] px-1"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {pill.ready && (
              <span
                className="absolute top-1 bottom-1 rounded-full pointer-events-none transition-all"
                style={{
                  left: pill.left + 4,
                  width: pill.width - 8,
                  background:
                    hoveredIndex !== null
                      ? 'rgba(255,255,255,0.06)'
                      : 'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(255,107,157,0.18))',
                  border: '1px solid rgba(124,92,255,0.4)',
                  boxShadow:
                    hoveredIndex !== null
                      ? 'none'
                      : '0 0 20px rgba(124,92,255,0.35), inset 0 0 12px rgba(124,92,255,0.15)',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDuration: '450ms',
                }}
              />
            )}

            {navLinks.map((link, i) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onClick={() => handleNavClick(link.id)}
                  className="relative px-3.5 py-2 text-[11px] font-semibold tracking-[0.12em] transition-colors duration-300 cursor-pointer z-10"
                  style={{
                    color: isActive
                      ? '#ffffff'
                      : hoveredIndex === i
                      ? 'rgba(245,245,247,0.9)'
                      : 'rgba(245,245,247,0.5)',
                  }}
                >
                  <ScrambleText text={link.label} />
                </button>
              );
            })}
          </nav>

          {/* RIGHT — Clock + Search */}
          <div className="flex items-center gap-3 shrink-0 z-10">
            <span className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-[rgba(245,245,247,0.4)]">
              <span className="w-1 h-1 rounded-full bg-[#5eead4] animate-pulse" />
              {time} IST
            </span>

            {/* Search — desktop pill */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Search"
              className="hidden sm:flex items-center gap-2 h-9 pl-3 pr-3 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-[rgba(124,92,255,0.4)] transition-all duration-300 cursor-pointer group"
            >
              <Search className="w-3.5 h-3.5 stroke-[1.75] text-[rgba(245,245,247,0.6)] group-hover:text-[#7c5cff] transition-colors" />
              <span className="text-[12px] text-[rgba(245,245,247,0.55)] group-hover:text-[#f5f5f7] transition-colors">
                Search
              </span>
            </button>

            {/* Search — mobile icon */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Search"
              className="sm:hidden relative flex items-center justify-center w-9 h-9 rounded-full border border-white/[0.08] bg-white/[0.02] hover:border-[rgba(124,92,255,0.4)] transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(124,92,255,0.3), transparent 70%)',
                }}
              />
              <Search className="relative w-3.5 h-3.5 stroke-[2] text-[rgba(245,245,247,0.7)] group-hover:text-[#7c5cff] transition-colors" />
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/[0.06] transition-colors cursor-pointer group"
            >
              <span className="relative w-[18px] h-[14px] flex flex-col justify-between">
                <span
                  className="h-[1.5px] bg-[#f5f5f7] rounded-full transition-all duration-300 origin-center group-hover:bg-[#7c5cff]"
                  style={{
                    transform: mobileOpen
                      ? 'translateY(6.25px) rotate(45deg)'
                      : 'none',
                  }}
                />
                <span
                  className="h-[1.5px] bg-[#f5f5f7] rounded-full transition-all duration-300 group-hover:bg-[#7c5cff]"
                  style={{
                    opacity: mobileOpen ? 0 : 1,
                    transform: mobileOpen ? 'scaleX(0)' : 'none',
                  }}
                />
                <span
                  className="h-[1.5px] bg-[#f5f5f7] rounded-full transition-all duration-300 origin-center group-hover:bg-[#7c5cff]"
                  style={{
                    transform: mobileOpen
                      ? 'translateY(-6.25px) rotate(-45deg)'
                      : 'none',
                  }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
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
          className={`absolute left-4 right-4 top-[72px] rounded-2xl border border-white/[0.08] overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
          style={{
            background: 'rgba(10,10,11,0.96)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          <nav className="flex flex-col p-2">
            {navLinks.map((link, i) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative text-left text-[13px] font-semibold tracking-[0.12em] py-4 px-4 rounded-xl flex items-center justify-between transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-[#f5f5f7] bg-white/[0.05]'
                      : 'text-[rgba(245,245,247,0.6)] hover:text-[#f5f5f7] hover:bg-white/[0.03]'
                  }`}
                  style={{
                    transitionDelay: mobileOpen ? `${i * 40}ms` : '0ms',
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen ? 'translateY(0)' : 'translateY(8px)',
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

          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono tracking-wider text-[rgba(245,245,247,0.4)]">
            <span>CHALACHITRA</span>
            <span>{time} IST</span>
          </div>
        </div>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="spin"], [style*="sweep"] {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

export { Navbar as Header };