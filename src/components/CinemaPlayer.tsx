import React, { useEffect, useRef, useCallback } from 'react';
import { X, CheckCircle2, Minimize2, CircleCheck, Loader2, MonitorPlay } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { MoviePlayer } from './MoviePlayer';
import { toast } from 'sonner';

export const CinemaPlayer: React.FC = () => {
  const { playerModal, closePlayer, saveProgress } = useUIStore();
  const { isOpen, id, type, title, season, episode } = playerModal;
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const isTv = type === 'tv';
  const episodeLabel = isTv
    ? `S${String(season ?? 1).padStart(2, '0')} · E${String(episode ?? 1).padStart(2, '0')}`
    : 'Feature Film';

  const handleClose = useCallback(() => {
    closePlayer();
  }, [closePlayer]);

  /* Escape to close */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  /* Body scroll lock + restore focus */
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Focus the dialog on open
    const raf = requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  /* Simple focus trap */
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen || !id) return null;

  const handleMarkFinished = () => {
    saveProgress({
      id,
      type,
      title,
      posterPath: null,
      backdropPath: null,
      progress: 100,
      season,
      episode,
    });
    toast.success(`Marked "${title}" as watched`, {
      icon: <CircleCheck className="w-4 h-4 text-emerald-400" />,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — Video Player`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 animate-[fadeIn_200ms_ease-out]"
      style={{
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl flex flex-col rounded-2xl bg-[#0a0a0b] border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-[scaleIn_240ms_cubic-bezier(0.16,1,0.3,1)] outline-none focus:outline-none"
      >
        {/* Ambient top glow line */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-20"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(124,92,255,0.6) 25%, rgba(255,107,157,0.7) 50%, rgba(124,92,255,0.6) 75%, transparent 100%)',
          }}
        />

        {/* Header bar */}
        <header className="relative flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#111113] via-[#131316] to-[#111113] border-b border-white/[0.06] z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Live status dot */}
            <span
              className="relative flex items-center justify-center w-2 h-2 shrink-0"
              aria-hidden="true"
            >
              <span className="absolute inset-0 rounded-full bg-[#7c5cff] animate-ping opacity-60" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-[#7c5cff]" />
            </span>

            {/* Icon */}
            <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] shrink-0">
              <MonitorPlay className="w-3.5 h-3.5 text-[#7c5cff]" />
            </div>

            <div className="min-w-0">
              <h3
                className="text-[14px] font-semibold text-[#f5f5f7] tracking-[-0.01em] truncate"
                title={title}
              >
                {title}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[rgba(245,245,247,0.4)] font-mono truncate">
                {episodeLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mark Watched */}
            <button
              type="button"
              onClick={handleMarkFinished}
              aria-label="Mark as watched"
              className="group px-3 h-8 text-[11px] font-medium text-[rgba(245,245,247,0.65)] hover:text-white border border-white/[0.08] hover:border-emerald-400/40 hover:bg-emerald-400/[0.06] rounded-lg transition-all duration-200 hidden sm:flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              <span>Mark Watched</span>
            </button>

            {/* Minimize */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Minimize"
              className="hidden sm:flex items-center justify-center w-8 h-8 text-[rgba(245,245,247,0.55)] hover:text-white rounded-lg border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close player"
              className="group flex items-center justify-center w-8 h-8 text-[rgba(245,245,247,0.65)] hover:text-white rounded-lg border border-white/[0.08] hover:border-[rgba(255,107,157,0.5)] hover:bg-[rgba(255,107,157,0.08)] transition-all duration-200 cursor-pointer"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </header>

        {/* Player */}
        <MoviePlayer
          id={id}
          type={type}
          title={title}
          season={season}
          episode={episode}
        />

        {/* Bottom hint bar */}
        <footer className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2 bg-[#0a0a0b] border-t border-white/[0.06] text-[10px] font-mono uppercase tracking-[0.1em] text-[rgba(245,245,247,0.35)]">
          <span className="flex items-center gap-1.5">
            <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 h-4 min-w-[1.5rem] text-[9px] font-sans font-semibold text-white/60 bg-white/[0.06] border border-white/[0.1] rounded">
              ESC
            </kbd>
            <span>to close</span>
          </span>
          <span className="truncate">
            {isTv ? 'Episodic Stream' : 'Feature Stream'}
          </span>
        </footer>
      </div>

      {/* Local keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-["] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};