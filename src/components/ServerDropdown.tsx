import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { PROVIDERS } from '../lib/embedProviders';

interface ServerDropdownProps {
  value: string;
  onChange: (providerId: string) => void;
}

const TILE_BASE_W = 52;
const TILE_BASE_H = 60;
const TILE_GAP = 6;

export const ServerDropdown: React.FC<ServerDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentIndex = useMemo(
    () => Math.max(0, PROVIDERS.findIndex((p) => p.id === value)),
    [value]
  );
  const current = PROVIDERS[currentIndex] ?? PROVIDERS[0];

  /* ---------- responsive tile sizing ---------- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const tileW = isMobile ? 44 : TILE_BASE_W;
  const tileH = isMobile ? 52 : TILE_BASE_H;
  const tileGap = isMobile ? 5 : TILE_GAP;

  /* ---------- outside click ---------- */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setOpen(false);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const start = prev ?? currentIndex;
          const next =
            e.key === 'ArrowRight'
              ? (start + 1) % PROVIDERS.length
              : (start - 1 + PROVIDERS.length) % PROVIDERS.length;
          return next;
        });
      }
      if (e.key === 'Enter' && focusedIndex !== null) {
        onChange(PROVIDERS[focusedIndex].id);
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, currentIndex, focusedIndex, onChange]);

  /* ---------- auto-center ---------- */
  useEffect(() => {
    if (!open) return;
    const container = scrollRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(
      `[data-index="${focusedIndex ?? currentIndex}"]`
    );
    if (!target) return;
    const cRect = container.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const offset = tRect.left - cRect.left - cRect.width / 2 + tRect.width / 2;
    container.scrollTo({ left: container.scrollLeft + offset, behavior: 'smooth' });
  }, [open, currentIndex, focusedIndex, isMobile]);

  /* ---------- wheel → horizontal ---------- */
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  /* ---------- magnification (gentle) ---------- */
  const getTileMotion = (i: number) => {
    const active = hoveredIndex ?? focusedIndex;
    if (active === null) return { scale: 1, y: 0 };

    const d = Math.abs(i - active);
    const sigma = isMobile ? 0.85 : 1.05;
    const magnitude = Math.exp(-(d * d) / (2 * sigma * sigma));

    return {
      scale: 1 + 0.22 * magnitude,
      y: -7 * magnitude,
    };
  };

  return (
    <div ref={ref} className="relative inline-flex">
      {/* ============ Trigger ============ */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="
          group relative inline-flex items-center gap-2 h-8 pl-2.5 pr-2.5 rounded-lg
          border border-white/[0.08]
          bg-white/[0.03] hover:bg-white/[0.06]
          hover:border-[rgba(124,92,255,0.35)]
          text-[13px] text-[#f5f5f7]
          backdrop-blur-xl
          transition-[background,border-color,box-shadow] duration-300
          cursor-pointer
          hover:shadow-[0_6px_20px_-6px_rgba(124,92,255,0.25)]
        "
      >
        <span className="relative flex items-center justify-center w-2 h-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/50 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
        </span>

        <span className="font-medium tracking-[-0.01em]">{current.name}</span>

        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-3 h-3 text-white/45 group-hover:text-white/70 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      {/* ============ Dock ============ */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[3px]"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 30,
                mass: 0.7,
                opacity: { duration: 0.16, ease: 'easeOut' },
              }}
              className="
                absolute left-0 bottom-full mb-3 z-40
                max-w-[min(90vw,520px)]
                rounded-2xl
                border border-white/[0.1]
                bg-gradient-to-b from-[#15151a]/92 to-[#0c0c10]/92
                backdrop-blur-3xl backdrop-saturate-150
                shadow-[0_20px_60px_-14px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.06)]
                will-change-transform
              "
              style={{ WebkitBackdropFilter: 'blur(28px) saturate(150%)' }}
            >
              {/* Top rim glow */}
              <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-20 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(124,92,255,0.4), rgba(255,107,157,0.14) 50%, transparent 75%)',
                  filter: 'blur(16px)',
                }}
              />

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.22 }}
                className="flex items-center justify-between px-3 pt-2.5 pb-1"
              >
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[rgba(245,245,247,0.42)]">
                  Playback Source
                </span>
                <span className="text-[9px] font-mono text-[rgba(245,245,247,0.28)] tabular-nums">
                  {currentIndex + 1} / {PROVIDERS.length}
                </span>
              </motion.div>

              <div className="relative">
                {/* Reflective floor */}
                <div
                  aria-hidden
                  className="absolute left-0 right-0 bottom-0 h-5 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent, rgba(124,92,255,0.05))',
                  }}
                />

                {/* Scroll strip */}
                <div
                  ref={scrollRef}
                  role="listbox"
                  onWheel={onWheel}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="
                    flex items-end
                    px-3 pt-2 pb-3
                    overflow-x-auto overflow-y-visible
                    scroll-smooth snap-x snap-proximity
                    no-scrollbar
                  "
                  style={{ gap: tileGap }}
                >
                  {PROVIDERS.map((p, i) => {
                    const isActive = p.id === value;
                    const isFocused = focusedIndex === i;
                    const { scale, y } = getTileMotion(i);

                    return (
                      <motion.button
                        key={p.id}
                        data-index={i}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onFocus={() => setFocusedIndex(i)}
                        onBlur={() => setFocusedIndex(null)}
                        onClick={() => {
                          onChange(p.id);
                          setOpen(false);
                        }}
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{
                          opacity: 1,
                          y,
                          scale,
                          transition: {
                            type: 'spring',
                            stiffness: 460,
                            damping: 26,
                            mass: 0.55,
                            delay: 0.04 + i * 0.03,
                          },
                        }}
                        exit={{
                          opacity: 0,
                          y: 4,
                          scale: 0.94,
                          transition: { duration: 0.12, delay: i * 0.02 },
                        }}
                        whileTap={{ scale: scale * 0.94 }}
                        style={{
                          transformOrigin: 'bottom center',
                          width: tileW,
                          height: tileH,
                          willChange: 'transform',
                        }}
                        className={`
                          group/item relative shrink-0 snap-center
                          flex flex-col items-center justify-center gap-0.5
                          rounded-xl
                          transition-colors duration-200
                          cursor-pointer
                          ${
                            isActive
                              ? 'bg-gradient-to-b from-[rgba(124,92,255,0.2)] to-[rgba(124,92,255,0.06)] border border-[rgba(124,92,255,0.45)]'
                              : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12]'
                          }
                        `}
                      >
                        {/* Active halo */}
                        {isActive && (
                          <motion.div
                            aria-hidden
                            layoutId="tile-halo"
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                              boxShadow:
                                '0 0 20px rgba(124,92,255,0.45), inset 0 0 12px rgba(124,92,255,0.15)',
                            }}
                          />
                        )}

                        {/* Focus ring */}
                        {isFocused && (
                          <span className="absolute inset-0 rounded-xl ring-2 ring-[rgba(124,92,255,0.7)] pointer-events-none" />
                        )}

                        {/* Number */}
                        <span
                          className={`relative font-bold leading-none tracking-[-0.03em] tabular-nums ${
                            isMobile ? 'text-[16px]' : 'text-[18px]'
                          } ${isActive ? 'text-[#c4b5ff]' : 'text-[#f5f5f7]'}`}
                        >
                          {i + 1}
                        </span>

                        {/* Label */}
                        <span
                          className={`relative font-semibold uppercase transition-colors ${
                            isMobile
                              ? 'text-[7px] tracking-[0.06em]'
                              : 'text-[8px] tracking-[0.08em]'
                          } ${
                            isActive
                              ? 'text-[#c4b5ff]/85'
                              : 'text-[rgba(245,245,247,0.5)] group-hover/item:text-[rgba(245,245,247,0.85)]'
                          }`}
                        >
                          {p.name.replace(/^server\s*/i, 'srv ')}
                        </span>

                        {/* Active check */}
                        {isActive && (
                          <motion.span
                            initial={{ scale: 0, rotate: -90, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 520,
                              damping: 22,
                              delay: 0.06,
                            }}
                            className="absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center bg-[#7c5cff] shadow-[0_0_8px_rgba(124,92,255,0.9)]"
                          >
                            <Check className="w-2 h-2 text-white" strokeWidth={3.5} />
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom hairline */}
              <div
                aria-hidden
                className="absolute bottom-0 left-5 right-5 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(124,92,255,0.4), rgba(255,107,157,0.25), rgba(124,92,255,0.4), transparent)',
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};