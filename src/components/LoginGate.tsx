import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'checking' | 'in' | 'out'>('checking');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/check')
      .then((r) => setState(r.ok ? 'in' : 'out'))
      .catch(() => setState('out'));
  }, []);

  useEffect(() => {
    if (state === 'out') inputRef.current?.focus();
  }, [state]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !key) return;
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: key }),
      });
      if (r.ok) {
        setState('in');
      } else if (r.status === 401) {
        setErr('Invalid access key');
        setKey('');
        inputRef.current?.focus();
      } else {
        setErr('Something went wrong. Try again.');
      }
    } catch {
      setErr('Network error — check your connection.');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'checking') {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#7c5cff] animate-spin" />
      </div>
    );
  }

  if (state === 'in') return <>{children}</>;

  return (
    <div className="relative min-h-screen bg-[#08080a] text-[#f5f5f7] flex items-center justify-center p-4 overflow-hidden">
      {/* ═══════════════════════════════════════════
          SVG FILTER — the Rorschach inkblot engine
          ═══════════════════════════════════════════ */}
      <svg aria-hidden className="pointer-events-none absolute w-0 h-0" focusable="false">
        <defs>
          <filter id="inkblot" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.007"
              numOctaves="2"
              seed="3"
              result="noise"
            >
              {!reducedMotion && (
                <animate
                  attributeName="baseFrequency"
                  dur="32s"
                  values="0.007;0.012;0.007"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                />
              )}
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="180"
              xChannelSelector="R"
              yChannelSelector="G"
            >
              {!reducedMotion && (
                <animate
                  attributeName="scale"
                  dur="22s"
                  values="150;220;150"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                />
              )}
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>

      {/* ═══════════════════════════════════════════
          BACKDROP — the color layer is filtered
          ═══════════════════════════════════════════ */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#08080a]" />

        <div className="absolute inset-0 will-change-[filter]" style={{ filter: 'url(#inkblot)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0a14] via-[#08080a] to-[#050507]" />

          {/* Orb 1 — violet */}
          <div
            className="absolute w-[700px] h-[700px] rounded-full"
            style={{
              top: '-15%',
              left: '-12%',
              background:
                'radial-gradient(circle, rgba(124,92,255,0.9) 0%, rgba(124,92,255,0.4) 35%, rgba(124,92,255,0) 70%)',
              filter: 'blur(40px)',
            }}
          />
          {/* Orb 2 — pink */}
          <div
            className="absolute w-[700px] h-[700px] rounded-full"
            style={{
              bottom: '-18%',
              right: '-14%',
              background:
                'radial-gradient(circle, rgba(255,107,157,0.85) 0%, rgba(255,107,157,0.35) 35%, rgba(255,107,157,0) 70%)',
              filter: 'blur(40px)',
            }}
          />
          {/* Orb 3 — teal */}
          <div
            className="absolute w-[550px] h-[550px] rounded-full"
            style={{
              top: '30%',
              left: '55%',
              background:
                'radial-gradient(circle, rgba(94,234,212,0.7) 0%, rgba(94,234,212,0.25) 35%, rgba(94,234,212,0) 70%)',
              filter: 'blur(50px)',
            }}
          />
          {/* Orb 4 — deep purple */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              bottom: '5%',
              left: '5%',
              background:
                'radial-gradient(circle, rgba(90,50,200,0.85) 0%, rgba(90,50,200,0.3) 35%, rgba(90,50,200,0) 70%)',
              filter: 'blur(45px)',
            }}
          />
          {/* Orb 5 — magenta */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              top: '12%',
              right: '8%',
              background:
                'radial-gradient(circle, rgba(214,58,140,0.8) 0%, rgba(214,58,140,0.3) 35%, rgba(214,58,140,0) 70%)',
              filter: 'blur(50px)',
            }}
          />
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 30%, transparent 30%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════
          CARD
          ═══════════════════════════════════════════ */}
      <div className="relative w-full max-w-sm animate-[gateIn_800ms_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* Monogram */}
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="monoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9b8ff" />
                  <stop offset="50%" stopColor="#b8a4ff" />
                  <stop offset="100%" stopColor="#ff6b9d" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="38" fill="none" stroke="url(#monoGrad)" strokeWidth="0.75" opacity="0.5" />
              <circle cx="40" cy="40" r="33" fill="none" stroke="url(#monoGrad)" strokeWidth="0.5" opacity="0.25" />
              <circle cx="40" cy="4" r="1" fill="url(#monoGrad)" opacity="0.7" />
              <circle cx="40" cy="76" r="1" fill="url(#monoGrad)" opacity="0.7" />
            </svg>
            <span
              className="text-[34px] leading-none bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}
            >
              C
            </span>
          </div>
        </div>

        {/* Wordmark */}
        <h1
          className="text-center text-[40px] leading-none bg-gradient-to-b from-white via-white/95 to-white/40 bg-clip-text text-transparent"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          Chalachitra
        </h1>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-3 mt-4 mb-3">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/30" />
          <span className="w-1 h-1 rotate-45 bg-white/40" />
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/30" />
        </div>

        {/* Sub-tagline */}
        <p className="text-center text-[9.5px] uppercase tracking-[0.35em] text-white/40 mb-10">
          Private Access
        </p>

        {/* Form */}
        <form
          onSubmit={submit}
          className="relative overflow-hidden rounded-2xl
                     bg-black/30
                     backdrop-blur-[40px] backdrop-saturate-150
                     border border-white/[0.09]
                     p-7
                     shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.08)]
                     space-y-5"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />

          <div>
            <label
              htmlFor="access-key"
              className="block text-[9.5px] font-medium uppercase tracking-[0.3em] text-white/45 mb-3"
            >
              Access Key
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="access-key"
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  if (err) setErr('');
                }}
                placeholder="••••••••••••"
                autoComplete="off"
                spellCheck={false}
                className="w-full px-4 py-3 pr-16 rounded-lg
                           bg-white/[0.03] border border-white/[0.09]
                           text-[15px] text-white text-center
                           placeholder-white/20
                           font-mono tracking-[0.3em]
                           focus:outline-none focus:border-[#7c5cff]/60 focus:bg-white/[0.04]
                           focus:ring-1 focus:ring-[#7c5cff]/20
                           transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-[8.5px] uppercase tracking-[0.15em] font-medium
                           text-white/35 hover:text-white/70 transition-colors cursor-pointer
                           px-1.5 py-1"
                aria-label={showKey ? 'Hide access key' : 'Show access key'}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            {err && (
              <p className="mt-2.5 text-[10.5px] tracking-wider text-red-400/90 text-center animate-[shake_300ms_ease-out]">
                {err}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy || !key}
            className="relative w-full py-3 rounded-lg
                       bg-gradient-to-b from-white/[0.06] to-white/[0.02]
                       border border-white/[0.12]
                       text-[10.5px] uppercase tracking-[0.3em] font-medium text-white/90
                       hover:from-[#8f72ff]/30 hover:to-[#7c5cff]/20 hover:border-[#8f72ff]/50 hover:text-white
                       active:scale-[0.99]
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all
                       flex items-center justify-center gap-2
                       cursor-pointer"
          >
            {busy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying</span>
              </>
            ) : (
              <span>Unlock</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[8.5px] uppercase tracking-[0.3em] text-white/25">
            By Invitation Only
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span className="w-1 h-1 rounded-full bg-white/15" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gateIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); filter: blur(10px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-4px); }
          75%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}