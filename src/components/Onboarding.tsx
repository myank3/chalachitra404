import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Mascot } from './Mascot';

const ONBOARDED_KEY = 'chalachitra:onboarded';

export const Onboarding: React.FC = () => {
  /* Synchronous initial state — no delayed mount, no click race */
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

  const handleDismiss = useCallback(() => {
    setExiting(true);
    window.setTimeout(() => {
      try {
        localStorage.setItem(ONBOARDED_KEY, 'true');
      } catch {
        // ignore
      }
      setShow(false);
      setExiting(false);
    }, 280);
  }, []);

  /* Escape to dismiss */
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, handleDismiss]);

  /* Body scroll lock while visible */
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!show) return null;

  const steps = [
    {
      eyebrow: 'WELCOME',
      title: 'Meet Chitra',
      body: 'Your cinematic companion. I learn what you love and surface titles you didn\'t know you needed.',
      cta: 'Continue',
    },
    {
      eyebrow: 'DISCOVER',
      title: 'Built for film lovers',
      body: 'Curated rows, deep metadata, multi-server playback. No clutter, no noise.',
      cta: 'Continue',
    },
    {
      eyebrow: 'READY',
      title: 'Let\'s begin',
      body: 'Your library is empty. Start exploring — I\'ll pick up your taste as you go.',
      cta: 'Enter Chalachitra',
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleDismiss();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Chalachitra"
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85"
        style={{
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        }}
        onClick={handleDismiss}
      />

      {/* Ambient orbs behind the card */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(124,92,255,0.35) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'onboardingFloatA 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(255,107,157,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'onboardingFloatB 10s ease-in-out infinite',
          }}
        />
      </div>

      {/* Card */}
      <div
        className={`relative w-full max-w-md rounded-3xl overflow-hidden transition-all duration-500 ${
          exiting
            ? 'opacity-0 scale-95 translate-y-2'
            : 'opacity-100 scale-100 translate-y-0'
        }`}
        style={{
          background: 'rgba(17,17,19,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top gradient hairline */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(124,92,255,0.6), rgba(255,107,157,0.6), transparent)',
          }}
        />

        {/* Card body */}
        <div className="px-8 pt-10 pb-8 text-center">
          <div
            className="flex justify-center mb-6"
            style={{ animation: 'onboardingMascot 4s ease-in-out infinite' }}
          >
            <Mascot state="idle" size={110} />
          </div>

          <div
            key={`eyebrow-${step}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] mb-4"
            style={{ animation: 'onboardingFadeUp 400ms ease-out' }}
          >
            <Sparkles className="w-3 h-3 text-[#7c5cff]" strokeWidth={2} />
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(245,245,247,0.6)]">
              {current.eyebrow}
            </span>
          </div>

          <h2
            key={`title-${step}`}
            className="text-[26px] font-semibold tracking-[-0.02em] text-[#f5f5f7] mb-3"
            style={{ animation: 'onboardingFadeUp 400ms 60ms ease-out backwards' }}
          >
            {current.title}
          </h2>

          <p
            key={`body-${step}`}
            className="text-[14px] leading-relaxed text-[rgba(245,245,247,0.62)] max-w-[320px] mx-auto mb-8"
            style={{ animation: 'onboardingFadeUp 400ms 120ms ease-out backwards' }}
          >
            {current.body}
          </p>

          <div className="flex items-center justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  background:
                    i === step
                      ? 'linear-gradient(90deg, #7c5cff, #ff6b9d)'
                      : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="group relative w-full h-12 rounded-xl overflow-hidden font-semibold text-[14px] text-white transition-all duration-300 active:scale-[0.98] cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #7c5cff 0%, #ff6b9d 100%)',
              boxShadow: '0 8px 32px rgba(124,92,255,0.35)',
            }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                animation: 'onboardingSheen 1.2s ease-out',
              }}
            />
            <span className="relative flex items-center justify-center gap-2">
              {current.cta}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </button>

          {!isLast && (
            <button
              type="button"
              onClick={handleDismiss}
              className="mt-4 text-[12px] text-[rgba(245,245,247,0.4)] hover:text-[rgba(245,245,247,0.75)] transition-colors cursor-pointer"
            >
              Skip intro
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes onboardingFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes onboardingMascot {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-4px) scale(1.02); }
        }
        @keyframes onboardingFloatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(30px, 20px) scale(1.1); }
        }
        @keyframes onboardingFloatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-30px, -20px) scale(1.08); }
        }
        @keyframes onboardingSheen {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animation"], [style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;