import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'checking' | 'in' | 'out'>('checking');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/check')
      .then((r) => setState(r.ok ? 'in' : 'out'))
      .catch(() => setState('out'));
  }, []);

  useEffect(() => {
    if (state === 'out') inputRef.current?.focus();
  }, [state]);

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
          MOVING BLUR BACKDROP
          - No `filter: blur()` on orbs (expensive per-frame)
          - Soft radial-gradients do the blur for free
          - Only `transform` animates → GPU compositor
          - 5 orbs, each drifting a different direction
          ═══════════════════════════════════════════ */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#08080a]" />

        {/* Orb 1 — violet, drifts UP-LEFT */}
        <div
          className="absolute top-[-15%] left-[-10%] w-[720px] h-[720px] rounded-full
                     animate-[driftUpLeft_22s_ease-in-out_infinite]
                     will-change-transform"
          style={{
            background:
              'radial-gradient(circle, rgba(124,92,255,0.85) 0%, rgba(124,92,255,0.35) 30%, rgba(124,92,255,0.08) 55%, rgba(124,92,255,0) 75%)',
          }}
        />

        {/* Orb 2 — pink, drifts DOWN-RIGHT */}
        <div
          className="absolute bottom-[-18%] right-[-12%] w-[720px] h-[720px] rounded-full
                     animate-[driftDownRight_26s_ease-in-out_infinite]
                     will-change-transform"
          style={{
            background:
              'radial-gradient(circle, rgba(255,107,157,0.8) 0%, rgba(255,107,157,0.3) 30%, rgba(255,107,157,0.07) 55%, rgba(255,107,157,0) 75%)',
          }}
        />

        {/* Orb 3 — teal, drifts RIGHT */}
        <div
          className="absolute top-[30%] left-[45%] w-[560px] h-[560px] rounded-full
                     animate-[driftRight_30s_ease-in-out_infinite]
                     will-change-transform"
          style={{
            background:
              'radial-gradient(circle, rgba(94,234,212,0.65) 0%, rgba(94,234,212,0.22) 30%, rgba(94,234,212,0.05) 55%, rgba(94,234,212,0) 75%)',
          }}
        />

        {/* Orb 4 — deep violet, drifts LEFT */}
        <div
          className="absolute bottom-[5%] left-[10%] w-[620px] h-[620px] rounded-full
                     animate-[driftLeft_24s_ease-in-out_infinite]
                     will-change-transform"
          style={{
            background:
              'radial-gradient(circle, rgba(90,50,200,0.8) 0%, rgba(90,50,200,0.28) 30%, rgba(90,50,200,0.06) 55%, rgba(90,50,200,0) 75%)',
          }}
        />

        {/* Orb 5 — magenta, drifts DOWN */}
        <div
          className="absolute top-[10%] right-[6%] w-[520px] h-[520px] rounded-full
                     animate-[driftDown_28s_ease-in-out_infinite]
                     will-change-transform"
          style={{
            background:
              'radial-gradient(circle, rgba(214,58,140,0.75) 0%, rgba(214,58,140,0.25) 30%, rgba(214,58,140,0.06) 55%, rgba(214,58,140,0) 75%)',
          }}
        />

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
          CARD — blurred glass, moving colors show through
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

        <p className="text-center text-[9.5px] uppercase tracking-[0.35em] text-white/40 mb-10">
          Private Access
        </p>

        {/* Glass form card */}
        <form
          onSubmit={submit}
          className="relative overflow-hidden rounded-2xl
                     bg-white/[0.02]
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

        /* ── TRANSFORM-ONLY DRIFT (144Hz safe) ── */
        @keyframes driftUpLeft {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(-90px, -120px, 0) scale(1.15); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes driftDownRight {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(110px, 130px, 0) scale(1.12); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes driftRight {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(160px, 0, 0) scale(1.2); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes driftLeft {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(-150px, 0, 0) scale(1.18); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes driftDown {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(0, 140px, 0) scale(1.14); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          [class*="animate-["] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}