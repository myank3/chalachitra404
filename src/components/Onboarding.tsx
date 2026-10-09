import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, Play } from 'lucide-react';

const ONBOARDED_KEY = 'chalachitra:onboarded';

type Slide = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  backdrop: string;
  accent: string;
  cta: string;
};

const SLIDES: Slide[] = [
  {
    id: 'welcome',
    eyebrow: 'WELCOME',
    title: 'Every frame matters.',
    subtitle:
      'A streaming experience built around taste — not algorithms. Watch films the way they were meant to be seen.',
    backdrop:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2400&auto=format&fit=crop',
    accent: '#7c5cff',
    cta: 'Continue',
  },
  {
    id: 'discover',
    eyebrow: 'FOR FILM LOVERS',
    title: 'Built for film lovers.',
    subtitle:
      'Deep metadata. Multi-server playback. No clutter, no noise — just cinema.',
    backdrop:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2400&auto=format&fit=crop',
    accent: '#ff6b9d',
    cta: 'Continue',
  },
  {
    id: 'ready',
    eyebrow: 'READY',
    title: 'Let\'s begin.',
    subtitle:
      'Your library is empty. Start exploring — recommendations will sharpen as you watch.',
    backdrop:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2400&auto=format&fit=crop',
    accent: '#7c5cff',
    cta: 'Enter',
  },
];

export const Onboarding: React.FC = () => {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !localStorage.getItem(ONBOARDED_KEY);
    } catch {
      return false;
    }
  });
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    timerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(ONBOARDED_KEY, 'true');
      } catch {
        /* ignore */
      }
      setShow(false);
      setExiting(false);
    }, 600);
  }, []);

  const goNext = useCallback(() => {
    if (step >= SLIDES.length - 1) {
      handleDismiss();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, handleDismiss]);

  const goBack = useCallback(() => {
    if (step === 0) return;
    setStep((s) => s - 1);
  }, [step]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
      else if (e.key === 'ArrowLeft') goBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, handleDismiss, goNext, goBack]);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!show) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      className="fixed inset-0 z-[100] overflow-hidden bg-black"
      style={{
        opacity: exiting ? 0 : 1,
        transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Full-bleed backdrop with crossfade */}
      <div className="absolute inset-0">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            aria-hidden={i !== step}
            className="absolute inset-0 transition-opacity duration-[900ms] ease-out"
            style={{
              opacity: i === step ? 1 : 0,
              backgroundImage: `url(${s.backdrop})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </div>

      {/* Cinematic gradient overlays */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse at 20% 80%, ${slide.accent}22 0%, transparent 55%)`,
        }}
      />

      {/* Top bar — minimal: brand mark + skip */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <div
          className="h-1.5 w-8 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${slide.accent}, #ffffff)`,
            boxShadow: `0 0 20px ${slide.accent}66`,
            transition: 'background 700ms ease',
          }}
          aria-hidden="true"
        />
        {!isLast && (
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[13px] font-medium text-white/70 hover:text-white transition-colors px-4 py-2 rounded-md hover:bg-white/5 cursor-pointer"
          >
            Skip
          </button>
        )}
      </header>

      {/* Main content — bottom-left anchored */}
      <main className="relative z-10 h-full flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl">
          {slide.eyebrow && (
            <div
              key={`eyebrow-${slide.id}`}
              className="flex items-center gap-2 mb-4"
              style={{
                animation:
                  'slideFadeUp 600ms 80ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
              }}
            >
              <span
                className="text-[11px] md:text-[12px] font-bold tracking-[0.28em] uppercase"
                style={{
                  color: slide.accent,
                  textShadow: `0 0 24px ${slide.accent}66`,
                }}
              >
                {slide.eyebrow}
              </span>
            </div>
          )}

          <h1
            key={`title-${slide.id}`}
            className="text-[44px] md:text-[72px] lg:text-[88px] font-black leading-[0.95] tracking-[-0.03em] text-white mb-5"
            style={{
              textShadow: '0 4px 32px rgba(0,0,0,0.8)',
              animation:
                'slideFadeUp 700ms 140ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
            }}
          >
            {slide.title}
          </h1>

          <p
            key={`sub-${slide.id}`}
            className="text-[15px] md:text-[18px] leading-relaxed text-white/80 max-w-xl mb-8"
            style={{
              textShadow: '0 2px 12px rgba(0,0,0,0.7)',
              animation:
                'slideFadeUp 700ms 220ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
            }}
          >
            {slide.subtitle}
          </p>

          <div
            key={`cta-${slide.id}`}
            className="flex items-center gap-4"
            style={{
              animation:
                'slideFadeUp 700ms 300ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
            }}
          >
            <button
              type="button"
              onClick={goNext}
              className="group relative inline-flex items-center gap-2 h-12 md:h-14 px-7 md:px-9 rounded-md font-semibold text-[15px] md:text-[17px] text-black bg-white hover:bg-white/90 transition-all duration-200 active:scale-[0.98] cursor-pointer"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
            >
              <Play className="w-5 h-5 fill-black" strokeWidth={0} />
              {slide.cta}
              <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>

            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 h-12 md:h-14 px-6 rounded-md font-semibold text-[15px] md:text-[17px] text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                Back
              </button>
            )}
          </div>

          {/* Segmented progress bar */}
          <div className="flex items-center gap-2 mt-10 max-w-xs">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setStep(i)}
                className="relative h-[3px] flex-1 rounded-full overflow-hidden cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: i <= step ? '100%' : '0%',
                    background: `linear-gradient(90deg, ${slide.accent}, #ffffff)`,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </main>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
        }}
      />

      <style>{`
        @keyframes slideFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;